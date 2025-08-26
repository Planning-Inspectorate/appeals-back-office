import { databaseConnector } from '#utils/database-connector.js';
import { mapBlobPath } from '#endpoints/documents/documents.mapper.js';
import { createAppealReference } from '#utils/appeal-reference.js';
import config from '#config/config.js';
import { APPEAL_CASE_STATUS, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import { getFolderIdFromDocumentType } from '#endpoints/integrations/integrations.utils.js';
import { CASE_RELATIONSHIP_RELATED } from '@pins/appeals/constants/support.js';
import { getTeamIdFromLpaCode } from './team.repository.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */

/**
 *
 * @param {import('#db-client').Prisma.AppealCreateInput} data
 * @param {import('#db-client').Prisma.DocumentVersionCreateInput[]} documents
 * @param {string[]} relatedReferences
 * @returns {Promise<{appeal: Appeal, documentVersions: DocumentVersion[]}>}
 */
export const createAppeal = async (data, documents, relatedReferences) => {
	const transaction = await databaseConnector.$transaction(async (tx) => {
		let appeal = await tx.appeal.create({ data });
		const reference = createAppealReference(appeal.id).toString();
		const teamId = await getTeamIdFromLpaCode(data.lpa.connect?.lpaCode || '');
		appeal = await tx.appeal.update({
			where: { id: appeal.id },
			data: {
				reference,
				appealStatus: {
					create: {
						status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
						createdAt: new Date().toISOString()
					}
				},
				assignedTeamId: teamId
			}
		});

		const documentVersions = await setDocumentVersions(tx, appeal.id, appeal.reference, documents);
		await setAppealRelationships(tx, appeal.id, appeal.reference, relatedReferences);

		const appealDetails = await tx.appeal.findUnique({
			where: { id: appeal.id }
		});

		return {
			appeal: appealDetails,
			documentVersions
		};
	});

	// @ts-ignore
	return transaction;
};

/**
 *
 * @param {string} caseReference
 * @param {Omit<import('#db-client').Prisma.LPAQuestionnaireCreateInput, 'appeal'>} data
 * @param {import('#db-client').Prisma.DocumentVersionCreateInput[]} documents
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

		// @ts-ignore
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
 * @param {Appeal} appeal
 * @param {Omit<import('#db-client').Prisma.RepresentationCreateInput, 'appeal'>} data
 * @param {import('#db-client').Prisma.DocumentVersionCreateInput[]} attachments
 * @returns {Promise<{rep: Representation, documentVersions: DocumentVersion[]}>}
 */
export const createRepresentation = async (appeal, data, attachments) => {
	const transaction = await databaseConnector.$transaction(async (tx) => {
		const rep = await tx.representation.create({
			data: {
				...data,
				appeal: {
					connect: { id: appeal.id }
				}
			}
		});

		const documentVersions = await setDocumentVersions(
			tx,
			appeal.id,
			appeal.reference,
			attachments
		);
		await attachToRepresentation(tx, rep.id, documentVersions);

		return {
			rep,
			documentVersions
		};
	});

	return transaction;
};

/**
 *
 * @param {import('#db-client').Prisma.TransactionClient} tx
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
				if (
					!existingRelationships.find(
						(/** @type {{ childRef: string; }} */ a) => a.childRef === ref
					)
				) {
					const foundAppeal = relatedAppeals.find(
						(/** @type {{ reference: string; }} */ a) => a.reference === ref
					);
					const item = {
						type: CASE_RELATIONSHIP_RELATED,
						parentRef: caseReference,
						childRef: ref,
						parentId: appealId,
						childId: foundAppeal?.id || null,
						externalSource: foundAppeal?.reference ? false : true,
						externalAppealType: null
					};

					return item;
				}
			})
			.filter((r) => !!r);

		if (appealRelationships.length > 0) {
			await tx.appealRelationship.createMany({
				// @ts-ignore
				data: appealRelationships
			});
		}
	}
};

/**
 *
 * @param {import('#db-client').Prisma.TransactionClient} tx
 * @param {number} appealId
 * @param {string} caseReference
 * @param {import('#db-client').Prisma.DocumentVersionCreateInput[]} documents
 * @returns {Promise<import('#db-client').DocumentVersion[]>}
 */
const setDocumentVersions = async (tx, appealId, caseReference, documents) => {
	if (documents) {
		const caseFolders = await tx.folder.findMany({ where: { caseId: appealId } });

		await tx.document.createMany({
			// @ts-ignore
			data: documents.map((document) => {
				// @ts-ignore
				const { documentGuid, documentType, stage, fileName } = document;

				const folderId = getFolderIdFromDocumentType(
					caseFolders,
					documentType || APPEAL_DOCUMENT_TYPE.UNCATEGORISED,
					stage || null
				);
				if (!folderId) {
					throw new Error(`folder not found for document type: ${documentType}`);
				}
				return {
					caseId: appealId,
					folderId,
					name: fileName,
					guid: documentGuid
				};
			})
		});

		await tx.documentVersion.createMany({
			// @ts-ignore
			data: documents.map((document) => {
				// @ts-ignore
				const { documentGuid, fileName } = document;
				// @ts-ignore
				const blobStoragePath = mapBlobPath(documentGuid, caseReference, fileName);
				const documentURI = `${config.BO_BLOB_STORAGE_ACCOUNT.replace(/\/$/, '')}/${
					config.BO_BLOB_CONTAINER
				}/${blobStoragePath}`;

				return {
					...document,
					documentURI,
					blobStoragePath,
					dateReceived: new Date().toISOString(),
					draft: false
				};
			})
		});

		for (const doc of documents) {
			await tx.document.update({
				data: { latestVersionId: 1 },
				// @ts-ignore
				where: { guid: doc.documentGuid }
			});
		}

		return await tx.documentVersion.findMany({
			where: {
				documentGuid: {
					// @ts-ignore
					in: documents.map((d) => d.documentGuid)
				}
			}
		});
	}
	return [];
};

/**
 *
 * @param {import('#db-client').Prisma.TransactionClient} tx
 * @param {number} repId
 * @param {import('#db-client').DocumentVersion[]} documents
 * @returns
 */
const attachToRepresentation = async (tx, repId, documents) => {
	if (documents) {
		await tx.representationAttachment.createMany({
			data: documents.map((document) => {
				return {
					documentGuid: document.documentGuid,
					version: document.version,
					representationId: repId
				};
			})
		});
	}
};
