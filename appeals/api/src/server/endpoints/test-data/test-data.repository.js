import { databaseConnector } from '#utils/database-connector.js';

/**
 * @param {string} path
 */
export const findFolderByPath = async (path) =>
	databaseConnector.folder.findFirstOrThrow({ where: { path } });

/**
 * @param {import('#db-client/models.ts').AppealCreateInput} data
 */
export const createAppeal = async (data) => databaseConnector.appeal.create({ data });

/**
 * @param {number} appealId
 * @param {Omit<import('#db-client/models.ts').RepresentationCreateInput, 'appeal'>} data
 */
export const createRepresentation = async (appealId, data) =>
	databaseConnector.representation.create({
		data: { ...data, appeal: { connect: { id: appealId } } }
	});

/**
 * @param {import('#db-client/models.ts').DocumentCreateManyInput[]} documentData
 */
export const createDocuments = async (documentData) =>
	databaseConnector.document.createMany({ data: documentData });

/**
 * @param {import('#db-client/models.ts').DocumentVersionCreateManyInput[]} versionData
 */
export const createDocumentVersions = async (versionData) =>
	databaseConnector.documentVersion.createMany({ data: versionData });

/**
 * @param {import('#db-client/models.ts').RepresentationAttachmentCreateManyInput[]} attachmentData
 */
export const createRepresentationAttachments = async (attachmentData) =>
	databaseConnector.representationAttachment.createMany({ data: attachmentData });

/**
 * @param {number} caseId
 * @param {string} path
 */
export const findFolderByCaseAndPath = async (caseId, path) =>
	databaseConnector.folder.findFirst({ where: { caseId, path } });

/**
 * @param {string} guid
 * @param {number} versionId
 */
export const updateDocumentLatestVersion = async (guid, versionId) =>
	databaseConnector.document.update({
		where: { guid },
		data: { latestVersionId: versionId }
	});
