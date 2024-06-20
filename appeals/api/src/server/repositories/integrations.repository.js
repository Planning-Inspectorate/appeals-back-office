// @ts-nocheck
import { databaseConnector } from '#utils/database-connector.js';
import { mapBlobPath } from '#endpoints/documents/documents.mapper.js';
import { getDefaultRedactionStatus } from './document-metadata.repository.js';
import { createAppealReference } from '#utils/appeal-reference.js';
import { STATUSES } from '@pins/appeals/constants/state.js';
import { STAGE, DOCTYPE } from '@pins/appeals/constants/documents.js';

import config from '#config/config.js';

/**
 *
 * @param {*} data
 * @param {*} documents
 * @param {string[]} relatedReferences
 * @returns
 */
export const createAppeal = async (data, documents, relatedReferences) => {
	const transaction = await databaseConnector.$transaction(async (tx) => {
		let appeal = await tx.appeal.create({ data });
		const reference = createAppealReference(appeal.id).toString();

		appeal = await tx.appeal.update({
			where: { id: appeal.id },
			data: {
				reference,
				appealStatus: {
					create: {
						status: STATUSES.ASSIGN_CASE_OFFICER,
						createdAt: new Date().toISOString()
					}
				}
			}
		});

		const documentVersions = await setDocumentVersions(tx, appeal.id, appeal.reference, documents);
		await setAppealRelationships(tx, appeal.id, appeal.reference, relatedReferences);

		appeal = await tx.appeal.findUnique({
			where: { id: appeal.id }
		});

		return {
			appeal,
			documentVersions
		};
	});

	return transaction;
};

/**
 *
 * @param {string} caseReference
 * @param {*} data
 * @param {*} documents
 * @param {string[]} relatedReferences
 * @returns
 */
export const createOrUpdateLpaQuestionnaire = async (
	caseReference,
	data,
	documents,
	relatedReferences
) => {
	const transaction = await databaseConnector.$transaction(async (tx) => {
		let appeal = await tx.appeal.findUnique({
			where: { reference: caseReference }
		});

		if (!appeal) {
			return null;
		}

		const { neighbouringSites, ...metadata } = data;
		appeal = await tx.appeal.update({
			where: { id: appeal.id },
			data: {
				lpaQuestionnaire: {
					connectOrCreate: {
						where: { appealId: appeal.id },
						create: metadata
					}
				},
				neighbouringSites
			}
		});

		const documentVersions = await setDocumentVersions(tx, appeal.id, appeal.reference, documents);
		await setAppealRelationships(tx, appeal.id, appeal.reference, relatedReferences);

		appeal = await tx.appeal.findUnique({
			where: { id: appeal.id }
		});

		return {
			appeal,
			documentVersions
		};
	});

	return transaction;
};

/**
 *
 * @param {*} tx
 * @param {number} appealId
 * @param {string} caseReference
 * @param {string[]} relatedReferences
 */
const setAppealRelationships = async (tx, appealId, caseReference, relatedReferences) => {
	if (relatedReferences.length > 0) {
		const relatedAppeals = await tx.appeal.findMany({
			where: {
				reference: { in: relatedReferences }
			}
		});

		const existingRelationships = await tx.appealRelationship.findMany({
			where: {
				parentId: appealId
			}
		});

		const appealRelationships = relatedReferences
			.map((ref) => {
				if (!existingRelationships.find((a) => a.childRef === ref)) {
					const foundAppeal = relatedAppeals.find((a) => a.reference === ref);
					const item = {
						type: 'related',
						parentRef: caseReference,
						childRef: ref,
						parentId: appealId,
						childId: foundAppeal?.id || null,
						externalSource: foundAppeal?.reference ? false : true,
						externaAppealType: null
					};

					return item;
				}
			})
			.filter((r) => r !== null);

		if (appealRelationships.length > 0) {
			await tx.appealRelationship.createMany({
				data: appealRelationships
			});
		}
	}
};

/**
 *
 * @param {*} tx
 * @param {number} appealId
 * @param {string} caseReference
 * @param {*} documents
 * @returns
 */
const setDocumentVersions = async (tx, appealId, caseReference, documents) => {
	const unredactedStatus = await getDefaultRedactionStatus();
	let documentVersions = [];
	if (documents) {
		const caseFolders = await tx.folder.findMany({ where: { caseId: appealId } });

		await tx.document.createMany({
			data: documents.map((document) => {
				return {
					guid: document.documentGuid,
					caseId: appealId,
					folderId: getFolderIdFromDocumentType(caseFolders, document.documentType, document.stage),
					name: document.fileName
				};
			})
		});

		await tx.documentVersion.createMany({
			data: documents.map((document) => {
				const blobStoragePath = mapBlobPath(
					document.documentGuid,
					caseReference,
					document.fileName
				);
				const documentURI = `${config.BO_BLOB_STORAGE_ACCOUNT.replace(/\/$/, '')}/${
					config.BO_BLOB_CONTAINER
				}/${blobStoragePath}`;

				return {
					version: 1,
					...document,
					documentURI,
					blobStoragePath,
					dateReceived: new Date().toISOString(),
					draft: false,
					redactionStatusId: unredactedStatus?.id
				};
			})
		});

		for (const doc of documents) {
			await tx.document.update({
				data: { latestVersionId: 1 },
				where: { guid: doc.documentGuid }
			});
		}

		documentVersions = await tx.documentVersion.findMany({
			where: {
				documentGuid: {
					in: documents.map((d) => d.documentGuid)
				}
			}
		});

		return documentVersions;
	}
};

/**
 *
 * @param {{ path: string, id: number }[]} caseFolders
 * @param {string} documentType
 * @param {string} stage
 * @returns
 */
const getFolderIdFromDocumentType = (caseFolders, documentType, stage) => {
	const caseFolder = caseFolders.find(
		(caseFolder) => caseFolder.path.indexOf(`/${documentType}`) > 0
	);

	if (caseFolder) {
		return caseFolder.id;
	}

	if (stage && stage === STAGE.APPELLANT_CASE) {
		if (documentType.indexOf('appellantCosts') > -1) {
			const appellantCosts = caseFolders.find(
				(caseFolder) => caseFolder.path === `${STAGE.COSTS}/appellant`
			);

			if (appellantCosts) {
				return appellantCosts.id;
			}
		}
		const appellantCorrespondence = caseFolders.find(
			(caseFolder) => caseFolder.path === `${stage}/${DOCTYPE.APPELLANT_CASE_CORRESPONDENCE}`
		);
		if (appellantCorrespondence) {
			return appellantCorrespondence.id;
		}
	}

	if (stage && stage === STAGE.LPA_QUESTIONNAIRE) {
		if (documentType.indexOf('lpaCosts') > -1) {
			const lpaCosts = caseFolders.find((caseFolder) => caseFolder.path === `${STAGE.COSTS}/lpa`);

			if (lpaCosts) {
				return lpaCosts.id;
			}
		}

		const lpaCorrespondence = caseFolders.find(
			(caseFolder) => caseFolder.path === `${stage}/${DOCTYPE.LPA_CASE_CORRESPONDENCE}`
		);

		if (lpaCorrespondence) {
			return lpaCorrespondence.id;
		}
	}

	return caseFolders.find(
		(caseFolder) => caseFolder.path === `${STAGE.INTERNAL}/${DOCTYPE.DROPBOX}`
	)?.id;
};
