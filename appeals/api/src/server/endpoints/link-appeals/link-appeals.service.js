/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

import {
	addDocumentsToAppeal,
	getFoldersForAppeal
} from '#endpoints/documents/documents.service.js';
import rhea from 'rhea';
import { copyBlobs } from '#utils/blob-copy.js';

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
 * Duplicates the files from the source appeal to the destination appeal for a particular stage.
 * @param {Appeal} sourceAppeal
 * @param {Appeal} destinationAppeal
 * @param {string} stage
 * @returns {Promise<*>}
 */
export const duplicateFiles = async (sourceAppeal, destinationAppeal, stage) => {
	const sourceFolders = await getFoldersForAppeal(sourceAppeal.id, stage);
	const destinationFolders = await getFoldersForAppeal(destinationAppeal.id, stage);
	const copyList = sourceFolders
		.map((sourceFolder) => {
			const { id: destinationFolderId = null } =
				destinationFolders.find(
					(destinationFolder) => destinationFolder.path === sourceFolder.path
				) || {};
			return sourceFolder.documents
				.filter((document) => {
					return !document.isDeleted && document.latestDocumentVersion?.blobStoragePath;
				})
				.map((sourceDocument) => {
					const destinationGuid = generate_uuid();
					const fileExtension = '.' + sourceDocument.name.split('.').pop();
					const destinationFileName = sourceDocument.name.replace(
						fileExtension,
						`-${sourceAppeal.reference}${fileExtension}`
					);

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
	await copyBlobs(copyBlobList);
	await addDocumentsToAppeal(
		{
			// @ts-ignore
			documents: copyList.map((copyDetails) => copyDetails.destinationDocument)
		},
		destinationAppeal,
		true
	);
};
