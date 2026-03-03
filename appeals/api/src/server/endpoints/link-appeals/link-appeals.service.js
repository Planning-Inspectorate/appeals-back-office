/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

import {
	addDocumentsToAppeal,
	getFoldersForAppeal
} from '#endpoints/documents/documents.service.js';
import appealRepository from '#repositories/appeal.repository.js';
import appellantCaseRepository from '#repositories/appellant-case.repository.js';
import transitionState from '#state/transition-state.js';
import { copyBlobs } from '#utils/blob-copy.js';
import { currentStatus } from '#utils/current-status.js';
import { databaseConnector } from '#utils/database-connector.js';
import { getChildAppeals } from '#utils/link-appeals.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import {
	CASE_RELATIONSHIP_LINKED,
	VALIDATION_OUTCOME_COMPLETE
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STAGE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { omit } from 'lodash-es';
import rhea from 'rhea';

const { generate_uuid } = rhea;

/**
 * Checks if an appeal is linked to other appeals as a parent.
 * @param {{ childAppeals?: any[] }} appeal The appeal to check for linked appeals.
 * @param {string} type The linkable type to check for.
 * @returns {boolean}
 */
const isAppealLead = (appeal, type) =>
	Boolean(appeal.childAppeals?.some((childAppeal) => childAppeal.type === type));

/**
 * Checks if an appeal is linked to other appeals as a child.
 * @param {{ parentAppeals?: any[] }} appeal The appeal to check for linked appeals.
 * @param {string} type The linkable type to check for.
 * @returns {boolean}
 */
const isAppealChild = (appeal, type) =>
	Boolean(appeal.parentAppeals?.some((parentAppeal) => parentAppeal.type === type));

/**
 * Checks if an appeal can be linked, with a specific relationship type (parent/child).
 * @param {{ childAppeals?: unknown[], parentAppeals?: unknown[] }} appeal The appeal to check for linked appeals.
 * @param {string} type The linkable type to check for.
 * @param {'lead'|'child'} relationship The relationship to check for.
 * @returns {boolean}
 */
export const canLinkAppeals = (appeal, type, relationship) => {
	const isLead = isAppealLead(appeal, type);
	const isChild = isAppealChild(appeal, type);

	return relationship === 'lead' ? !isChild : !isChild && !isLead;
};

/**
 * Checks if an appeals status is before LPA Questionnaire.
 *
 * If the lead already has other Children, it checks against the lead,
 * else it uses the current appeal.
 *
 *
 * @param {Appeal} appeal
 * @param {Appeal} linkedAppeal
 * @param {Boolean} isCurrentAppealParent
 * @returns {Boolean}
 */
export const checkAppealsStatusBeforeLPAQ = (appeal, linkedAppeal, isCurrentAppealParent) => {
	if (!isCurrentAppealParent && linkedAppeal.childAppeals?.length) {
		const appealStatus = linkedAppeal.appealStatus?.[linkedAppeal.appealStatus.length - 1];
		return appealStatus?.status !== 'lpa_questionnaire';
	}
	const appealStatus = appeal.appealStatus?.[appeal.appealStatus.length - 1];
	return appealStatus?.status !== 'lpa_questionnaire';
};

/**
 *
 * @param {Appeal} currentLead
 * @param {Appeal} appealToReplaceLead
 * @returns {Promise<*>}
 */
export const replaceLeadAppeal = async (currentLead, appealToReplaceLead) => {
	const { childAppeals } = currentLead;
	const relationships =
		childAppeals
			?.filter((childAppeal) => childAppeal.type === CASE_RELATIONSHIP_LINKED)
			.map((childAppeal) => {
				const { childId, childRef, type } = childAppeal;
				const { id: parentId, reference: parentRef } = appealToReplaceLead;
				if (parentId === childId) {
					return {
						parentId,
						parentRef,
						childId: currentLead.id,
						childRef: currentLead.reference,
						type
					};
				} else {
					return { parentId, parentRef, childId, childRef, type };
				}
			}) || [];

	await databaseConnector.$transaction(async (tx) => {
		await tx.appealRelationship.deleteMany({ where: { parentId: currentLead.id } });
		await Promise.all(
			relationships.map(async (relationship) => {
				await tx.appealRelationship.create({
					data: relationship
				});
			})
		);

		// The current lead is now the child of the new lead. If it has no agent, it needs to be the agent of the new lead.
		if (!currentLead.agent) {
			// eslint-disable-next-line no-unused-vars
			const data = omit(appealToReplaceLead.agent, 'id', 'addressId', 'address');
			const { id: agentId } = await tx.serviceUser.create({ data });
			await tx.appeal.update({
				where: { id: currentLead.id },
				data: { agentId }
			});
		}
	});
};

/**
 * Unlinks the child appeal.
 * @param {Appeal} appeal
 * @returns {Promise<*>}
 */
export const unlinkChildAppeal = async (appeal) => {
	await databaseConnector.appealRelationship.deleteMany({ where: { childId: appeal.id } });
};

/**
 * Duplicates the files from the source appeal to the destination appeal for all stages.
 * @param {Appeal} sourceAppeal
 * @param {Appeal} destinationAppeal
 * @param {{omitFolders: string[]}} [options]
 * @returns {Promise<*>}
 */
export const duplicateAllFiles = async (sourceAppeal, destinationAppeal, options) => {
	return Promise.allSettled(
		Object.values(APPEAL_CASE_STAGE).map((stage) =>
			duplicateFiles(sourceAppeal, destinationAppeal, stage, options)
		)
	);
};

/**
 * Duplicates the files from the source appeal to the destination appeal for a particular stage.
 * @param {Appeal} sourceAppeal
 * @param {Appeal} destinationAppeal
 * @param {string} stage
 * @param {{omitFolders?: string[]}} [options]
 * @returns {Promise<{sourceAppealRef: string, destinationAppealRef: string, stage: string}>}
 */
export const duplicateFiles = async (sourceAppeal, destinationAppeal, stage, options) => {
	const { omitFolders = [] } = options || {};
	const sourceFolders = await getFoldersForAppeal(sourceAppeal.id, stage);
	const destinationFolders = await getFoldersForAppeal(destinationAppeal.id, stage);
	const copyList = sourceFolders
		.filter((sourceFolder) => !omitFolders.includes(sourceFolder.path))
		.map((sourceFolder) => {
			const { id: destinationFolderId = null, documents: destinationDocuments = [] } =
				destinationFolders.find(
					(destinationFolder) => destinationFolder.path === sourceFolder.path
				) || {};
			const existingDocuments = destinationDocuments.map((documents) => documents.name);

			return sourceFolder.documents
				.filter((document) => {
					return !document.isDeleted && document.latestDocumentVersion?.blobStoragePath;
				})
				.map((sourceDocument) => {
					const destinationGuid = generate_uuid();
					const fileExtension = '.' + sourceDocument.name.split('.').pop();
					const destinationFileName = existingDocuments.includes(sourceDocument.name)
						? sourceDocument.name.replace(
								fileExtension,
								`-${sourceAppeal.reference}${fileExtension}`
							)
						: sourceDocument.name;

					const sourceBlobName = sourceDocument.latestDocumentVersion?.blobStoragePath;
					const destinationBlobName = `appeal/${destinationAppeal.reference}/${destinationGuid}/v1/${destinationFileName}`;

					const destinationDocument = {
						GUID: destinationGuid,
						caseId: destinationAppeal.id,
						documentName: destinationFileName,
						folderId: destinationFolderId,
						mimeType: sourceDocument.latestDocumentVersion?.mime,
						documentType: sourceDocument.latestDocumentVersion?.documentType,
						documentSize: sourceDocument.latestDocumentVersion?.size,
						stage,
						blobStoragePath: destinationBlobName,
						virusCheckStatus: sourceDocument.latestDocumentVersion?.virusCheckStatus,
						redactionStatusId: sourceDocument.latestDocumentVersion?.redactionStatusId,
						receivedDate: sourceDocument.latestDocumentVersion?.dateReceived
					};

					return {
						sourceBlobName,
						destinationBlobName,
						destinationDocument
					};
				});
		})
		.flat();
	const copyBlobList = copyList.map(({ sourceBlobName, destinationBlobName }) => ({
		sourceBlobName,
		destinationBlobName
	}));
	await Promise.allSettled([
		copyBlobs(copyBlobList),
		addDocumentsToAppeal(
			{
				// @ts-ignore
				documents: copyList.map((copyDetails) => copyDetails.destinationDocument)
			},
			destinationAppeal,
			true
		)
	]);
	return {
		sourceAppealRef: sourceAppeal.reference,
		destinationAppealRef: destinationAppeal.reference,
		stage
	};
};

/**
 *
 * @param {number | undefined} leadAppealId
 * @param {number | undefined} unlinkedAppealId
 * @param {number | undefined} previousLeadAppealId
 * @param {string} azureAdUserId
 */
export const updateAppealStatusIfRequired = async (
	leadAppealId,
	unlinkedAppealId,
	previousLeadAppealId,
	azureAdUserId
) => {
	const leadAppeal = leadAppealId ? await appealRepository.getAppealById(leadAppealId) : null;

	if (!leadAppeal) {
		throw new Error('Lead appeal not found');
	}

	const unlinkedAppeal = unlinkedAppealId
		? await appealRepository.getAppealById(unlinkedAppealId)
		: null;

	const { appellantCaseValidationOutcome: leadAppealAppellantCaseOutcome } =
		leadAppeal?.appellantCase || {};
	const { appellantCaseValidationOutcome: unlinkedAppealAppellantCaseOutcome } =
		unlinkedAppeal?.appellantCase || {};

	const isEnforcementNotice = leadAppeal?.appealType?.type === APPEAL_TYPE.ENFORCEMENT_NOTICE;

	switch (currentStatus(leadAppeal)) {
		case APPEAL_CASE_STATUS.VALIDATION:
			{
				if (unlinkedAppealId && unlinkedAppealAppellantCaseOutcome) {
					if (isEnforcementNotice) {
						// reset enforcement child validation so it can be validated as an unlinked appeal correctly
						if (unlinkedAppeal?.appellantCase?.id) {
							await appellantCaseRepository.updateAppellantCaseById(
								/** @type {number} */ unlinkedAppeal?.appellantCase?.id,
								{
									appellantCaseValidationOutcomeId: null
								}
							);
						}
					} else {
						// The unlinked appeal has been validated correctly and can roll forward to the next status
						await transitionState(
							unlinkedAppealId,
							azureAdUserId,
							unlinkedAppealAppellantCaseOutcome.name
						);
					}
				}
				if (leadAppealAppellantCaseOutcome) {
					if (isEnforcementNotice) {
						// reset enforcement lead validation if lead changed so it can be validated as a lead appeal correctly
						if (
							![leadAppealId, unlinkedAppealId].includes(previousLeadAppealId) &&
							leadAppeal?.appellantCase?.id
						) {
							return appellantCaseRepository.updateAppellantCaseById(
								/** @type {number} */ leadAppeal?.appellantCase?.id,
								{
									appellantCaseValidationOutcomeId: null
								}
							);
						}
					}
					// transition all the linked appeals if they have all been validated
					const linkedAppeals = [leadAppeal, ...getChildAppeals(leadAppeal)];
					const shouldTransition = linkedAppeals.every((linkedAppeal) => {
						const { appellantCaseValidationOutcome } = linkedAppeal?.appellantCase || {};
						return !!appellantCaseValidationOutcome;
					});
					if (shouldTransition) {
						await Promise.all(
							linkedAppeals.map(async (linkedAppeal) => {
								const { appellantCaseValidationOutcome } = linkedAppeal?.appellantCase || {};
								if (linkedAppeal?.id && appellantCaseValidationOutcome?.name) {
									await transitionState(
										linkedAppeal.id,
										azureAdUserId,
										appellantCaseValidationOutcome.name
									);
								}
							})
						);
					}
				}
			}
			break;

		case APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE: {
			// transition all the linked appeals if they have had all had their questionnaires completed
			const linkedAppeals = [leadAppeal, ...getChildAppeals(leadAppeal)];
			const shouldTransition = linkedAppeals.every((linkedAppeal) => {
				const { lpaQuestionnaireValidationOutcome } = linkedAppeal?.lpaQuestionnaire || {};
				return !!lpaQuestionnaireValidationOutcome;
			});
			if (shouldTransition) {
				await Promise.all(
					linkedAppeals.map(async (linkedAppeal) => {
						const { lpaQuestionnaireValidationOutcome } = linkedAppeal?.lpaQuestionnaire || {};
						if (
							linkedAppeal?.id &&
							lpaQuestionnaireValidationOutcome?.name === VALIDATION_OUTCOME_COMPLETE
						) {
							await transitionState(
								linkedAppeal.id,
								azureAdUserId,
								// @ts-ignore
								lpaQuestionnaireValidationOutcome.name
							);
						}
					})
				);
			}
			break;
		}
	}
};
