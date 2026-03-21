/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals/index.js').MappedDocument} MappedDocument */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */

import {
	addDocumentsToAppeal,
	getFoldersForAppeal
} from '#endpoints/documents/documents.service.js';
import addressRepository from '#repositories/address.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import { getDocumentsInFolder } from '#repositories/document.repository.js';
import representationRepository from '#repositories/representation.repository.js';
import serviceUserRepository from '#repositories/service-user.repository.js';
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
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
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
 * Moves representations from the source appeal to the destination appeal.
 * @param {Appeal | {id: number, reference: string}} sourceAppeal
 * @param {Appeal | {id: number, reference: string}} destinationAppeal
 * @returns {Promise<*>}
 */
export const moveRepresentations = async (sourceAppeal, destinationAppeal) => {
	return representationRepository.updateRepresentations(
		[Number(sourceAppeal.id)],
		{},
		{
			appealId: destinationAppeal.id
		}
	);
};

/**
 * Copies representations from the source appeal to the destination appeal.
 * @param {Appeal | {id: number, reference: string}} sourceAppeal
 * @param {Appeal | {id: number, reference: string}} destinationAppeal
 * @returns {Promise<*>}
 */
export const copyRepresentations = async (sourceAppeal, destinationAppeal) => {
	const { comments: representations } = await representationRepository.getRepresentations([
		Number(sourceAppeal.id)
	]);
	const stage = 'representation';
	const sourceFolders = await getFoldersForAppeal(sourceAppeal.id, stage);
	const destinationFolders = await getFoldersForAppeal(destinationAppeal.id, stage);
	if (sourceFolders.length === 0 || destinationFolders.length === 0) {
		return;
	}
	const documents = await getDocumentsInFolder({ folderId: sourceFolders[0].id });
	const attachmentsByRepresentedId = {};
	const copiedRepresentations = await Promise.all(
		representations.map(async (representation) => {
			const copyList = representation.attachments.map((attachment) => {
				const document = documents.find((doc) => {
					return doc.guid === attachment.documentGuid;
				});
				return buildFileCopyDetails(
					// @ts-ignore
					document,
					destinationAppeal,
					destinationFolders[0].id,
					sourceAppeal
				);
			});
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
			const address =
				representation?.represented?.address &&
				// @ts-ignore
				(await addressRepository.createAddress(omit(representation.represented.address, 'id')));
			const represented =
				representation?.represented &&
				(await serviceUserRepository.createServiceUser({
					...omit(representation.represented, 'id', 'address'),
					addressId: address?.id ?? null
				}));
			const attachments = copyList.map(({ destinationGuid, version }) => ({
				documentGuid: destinationGuid,
				version
			}));
			if (represented?.id) {
				// @ts-ignore
				attachmentsByRepresentedId[represented.id] = attachments;
			}
			return {
				appealId: destinationAppeal.id,
				representedId: represented?.id ?? null,
				representationType: representation?.representationType ?? null,
				source: representation.source ?? null,
				dateCreated: representation.dateCreated ?? null,
				status: representation.status ?? null,
				lpaCode: representation.lpa?.lpaCode ?? null,
				originalRepresentation: representation.originalRepresentation ?? null
			};
		})
	);
	// @ts-ignore
	await representationRepository.createRepresentations(copiedRepresentations);
	const { comments: representationsInDestinationAppeal } =
		await representationRepository.getRepresentations([Number(destinationAppeal.id)]);
	await Promise.allSettled(
		representationsInDestinationAppeal.map(async (representation) => {
			if (!representation.represented?.id) return;
			// @ts-ignore
			const attachments = attachmentsByRepresentedId[representation.represented.id];
			if (attachments)
				await representationRepository.addAttachments(representation.id, attachments);
		})
	);
};

/**
 * Duplicates the files from the source appeal to the destination appeal for all stages.
 * @param {Appeal} sourceAppeal
 * @param {Appeal} destinationAppeal
 * @param {{omitFolders: string[]}} [options]
 * @returns {Promise<*>}
 */
export const duplicateAllFiles = async (sourceAppeal, destinationAppeal, options) => {
	return duplicateFiles(sourceAppeal, destinationAppeal, null, options);
};

/**
 *
 * @param {Document} sourceDocument
 * @param {Appeal | {id: number, reference: string}} destinationAppeal
 * @param {number} destinationFolderId
 * @param {Appeal | {id: number, reference: string}} sourceAppeal
 * @param {string[]} [existingDocuments]
 * @param {string | null} [stage]
 * @returns {{sourceBlobName: string, destinationBlobName: string, destinationDocument: Partial<Document>, sourceGuid: string, destinationGuid: string, version: number}}
 */
export const buildFileCopyDetails = (
	sourceDocument,
	destinationAppeal,
	destinationFolderId,
	sourceAppeal,
	existingDocuments = [],
	stage = null
) => {
	const destinationGuid = generate_uuid();
	const fileExtension = '.' + sourceDocument.name.split('.').pop();
	const sourceBlobName = sourceDocument.latestDocumentVersion?.blobStoragePath ?? '';
	const documentName = sourceBlobName.split('/').pop() ?? '';
	const destinationFileName = existingDocuments.includes(documentName)
		? documentName.replace(fileExtension, `-${sourceAppeal.reference}${fileExtension}`)
		: documentName;

	const destinationBlobName = `appeal/${destinationAppeal.reference}/${destinationGuid}/v1/${destinationFileName}`;

	/** @type {MappedDocument} */
	const destinationDocument = {
		GUID: destinationGuid,
		caseId: destinationAppeal.id,
		documentName: destinationFileName,
		folderId: destinationFolderId,
		mimeType: sourceDocument.latestDocumentVersion?.mime ?? '',
		documentType: sourceDocument.latestDocumentVersion?.documentType ?? '',
		documentSize: Number(sourceDocument.latestDocumentVersion?.size),
		stage: sourceDocument.latestDocumentVersion?.stage ?? stage ?? '',
		blobStoragePath: destinationBlobName,
		virusCheckStatus: sourceDocument.latestDocumentVersion?.virusCheckStatus,
		redactionStatusId: Number(sourceDocument.latestDocumentVersion?.redactionStatusId),
		// @ts-ignore
		receivedDate: sourceDocument.latestDocumentVersion?.dateReceived ?? ''
	};

	return {
		sourceBlobName,
		destinationBlobName,
		destinationDocument,
		sourceGuid: sourceDocument.guid,
		destinationGuid,
		version: sourceDocument.latestDocumentVersion?.version ?? 1
	};
};

/**
 * Duplicates the files from the source appeal to the destination appeal for a particular stage.
 * @param {Appeal | {id: number, reference: string}} sourceAppeal
 * @param {Appeal | {id: number, reference: string}} destinationAppeal
 * @param {string | null} stage
 * @param {{omitFolders?: string[]}} [options]
 * @returns {Promise<{sourceAppealRef: string, destinationAppealRef: string, stage: string | null}>}
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
					return buildFileCopyDetails(
						sourceDocument,
						destinationAppeal,
						Number(destinationFolderId),
						sourceAppeal,
						existingDocuments,
						stage
					);
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
	// TODO: performance
	// is returning all data, return only needed data
	const leadAppeal = leadAppealId
		? await appealRepository.deprecatedGetAppealById(leadAppealId)
		: null;

	if (!leadAppeal) {
		throw new Error('Lead appeal not found');
	}

	// TODO: performance
	// is returning all data, return only needed data
	const unlinkedAppeal = unlinkedAppealId
		? await appealRepository.deprecatedGetAppealById(unlinkedAppealId)
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
					if (!isEnforcementNotice) {
						// The unlinked appeal has been validated correctly and can roll forward to the next status
						await transitionState(
							unlinkedAppealId,
							azureAdUserId,
							unlinkedAppealAppellantCaseOutcome.name
						);
					}
				}
				if (leadAppealAppellantCaseOutcome) {
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
