import { mapCaseReferenceForStorageUrl } from '#endpoints/documents/documents.mapper.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';

const guid = '27d0fda4-8a9a-4f5a-a158-68eaea676158';
const version = 1;
const originalFileName = 'mydoc.pdf';
const fileName = 'mydoc.pdf';
const folderId = 23;
const blobStoreUrl = `appeal/${mapCaseReferenceForStorageUrl(
	householdAppeal.reference
)}/${guid}/v1/${fileName}`;

export const documentVersion = {
	documentId: guid,
	version: 1,
	fileName,
	originalFilename: fileName,
	dateReceived: '2024-06-11T19:42:22.713Z',
	redactionStatus: 'Unredacted',
	virusCheckStatus: 'scanned',
	size: 4688,
	mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	isLateEntry: false,
	isDeleted: false,
	documentType: 'decision',
	blobStorageContainer: 'document-service-uploads',
	blobStoragePath: 'appeal/6000210/d9720f12-daf9-4f47-a842-00b9313491b8/v1/preview_renamed.xlsx'
};

export const folder = {
	folderId: 23,
	path: 'appellant-case/appealStatement',
	caseId: householdAppeal.reference,
	documents: []
};

export const documentDetails = {
	guid: guid,
	name: fileName,
	folderId: 3779,
	createdAt: '2024-08-17T15:22:20.827Z',
	isDeleted: false,
	caseId: 492,
	latestDocumentVersion: [documentVersion],
	versionAudit: []
};

export const addDocumentsRequest = {
	blobStorageHost: 'host',
	blobStorageContainer: 'document-service-uploads',
	documents: [
		{
			caseId: householdAppeal.id,
			documentName: originalFileName,
			documentType: 'application/pdf',
			documentSize: 14699,
			fileRowId: `file_row_1685470289030_16995`,
			folderId
		}
	]
};

export const addDocumentVersionRequest = {
	blobStorageHost: 'host',
	blobStorageContainer: 'document-service-uploads',
	document: {
		caseId: householdAppeal.id,
		documentName: originalFileName,
		documentType: 'application/pdf',
		documentSize: 14699,
		fileRowId: `file_row_1685470289030_16995`,
		folderId
	}
};

export const documentCreated = {
	guid,
	name: fileName,
	case: { reference: householdAppeal.reference },
	latestDocumentVersion: {
		version: 1,
		redactionStatus: {
			id: 1,
			name: 'Redacted'
		}
	},
	createdAt: new Date()
};

export const documentUpdated = {
	guid,
	name: fileName,
	latestVersionId: version,
	case: { reference: householdAppeal.reference }
};

export const documentVersionUpdated = {
	guid,
	name: fileName,
	latestVersionId: 2
};

export const documentVersionCreated = {
	documentGuid: guid,
	fileName,
	version
};

export const documentVersionRetrieved = {
	documentGuid: guid,
	fileName,
	version,
	parentDocument: documentUpdated
};

export const blobInfo = {
	caseType: 'appeal',
	caseReference: folder.caseId,
	GUID: guid,
	documentName: fileName,
	versionId: 1,
	blobStoreUrl: blobStoreUrl
};

export const savedFolder = {
	id: folderId,
	path: 'costs/appellantApplication',
	caseId: 1,
	documents: [
		{
			id: '27d0fda4-8a9a-4f5a-a158-68eaea676158',
			caseId: householdAppeal.id,
			folderId,
			guid,
			name: originalFileName,
			isDeleted: false,
			createdAt: new Date(),
			latestDocumentVersion: {
				version: 1,
				documentId: '27d0fda4-8a9a-4f5a-a158-68eaea676158',
				documentType: 'appellantCostApplication',
				blobStoragePath: 'appeal/6000001/27d0fda4-8a9a-4f5a-a158-68eaea676158/v1/mydoc.pdf',
				mime: 'application/pdf',
				size: 14699,
				receivedDate: '2024-06-11T19:42:22.713Z',
				redactionStatusId: 1,
				avScan: []
			}
		}
	]
};

export const decisionFolder = {
	id: folderId,
	path: 'appeal-decision/caseDecisionLetter',
	caseId: 1,
	documents: []
};

export const documentMeta = {
	documentGuid: guid,
	caseRef: householdAppeal.reference,
	version: 1,
	documentType: 'applicationForm',
	published: false,
	sourceSystem: 'back-office-appeals',
	origin: null,
	originalFilename: originalFileName,
	filename: fileName,
	representative: null,
	description: null,
	owner: null,
	author: null,
	securityClassification: null,
	mime: 'application/pdf',
	horizonDataID: null,
	fileMD5: null,
	path: null,
	virusCheckStatus: null,
	size: 146995,
	stage: 'appellant_case',
	filter1: null,
	blobStorageContainer: 'document-service-uploads',
	blobStoragePath: blobStoreUrl,
	dateCreated: '2024-08-17T15:22:20.827Z',
	isDeleted: false,
	examinationRefNo: null,
	filter2: null,
	publishedStatus: 'awaiting_upload',
	publishedStatusPrev: null,
	redactedStatus: null,
	redacted: false,
	documentURI: `https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploads/${blobStoreUrl}`
};

export const documentVersionDetails = {
	documentGuid: guid,
	version: 1,
	lastModified: null,
	documentType: 'applicationForm',
	published: false,
	sourceSystem: 'back-office-appeals',
	origin: null,
	originalFilename: fileName,
	fileName: originalFileName,
	representative: null,
	description: null,
	owner: null,
	author: null,
	securityClassification: null,
	mime: 'application/pdf',
	horizonDataID: null,
	fileMD5: null,
	path: null,
	virusCheckStatus: null,
	size: 146995,
	stage: 'appellant_case',
	filter1: null,
	blobStorageContainer: 'document-service-uploads',
	blobStoragePath: blobStoreUrl,
	dateCreated: '2024-08-17T15:22:20.827Z',
	datePublished: null,
	isDeleted: false,
	isLateEntry: false,
	examinationRefNo: null,
	filter2: null,
	publishedStatus: 'awaiting_upload',
	publishedStatusPrev: null,
	redactionStatusId: null,
	redacted: false,
	documentURI: `https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploads/${blobStoreUrl}`,
	dateReceived: null
};

export const auditTrailUserInfo = {
	id: 1,
	azureAdUserId: azureAdUserId,
	sapId: ''
};

export const documentVersionAuditEntry = {
	id: 1,
	documentGuid: guid,
	version: 1,
	auditTrailId: 1,
	action: 'Create',
	auditTrail: {
		id: 1,
		appealId: 1,
		userId: 1,
		loggedAt: '2024-11-10',
		details: '',
		user: auditTrailUserInfo
	}
};

export const folderWithDocs = {
	folderId: 1,
	path: 'path/to/document/folder',
	documents: [
		{
			id: 'fdadc281-f686-40ee-97cf-9bafdd02b1cb',
			name: 'an appeal related document.pdf',
			folderId: 1,
			caseId: 2
		}
	]
};

export const documentInfoResponse = {
	caseId: 1,
	folderId: 23,
	id: '27d0fda4-8a9a-4f5a-a158-68eaea676158',
	name: 'mydoc.pdf',
	isDeleted: false,
	createdAt: '2024-06-12T09:15:50.120Z',
	versionAudit: [],
	latestDocumentVersion: {
		documentId: undefined,
		version: undefined,
		fileName: '',
		originalFilename: '',
		dateReceived: '',
		redactionStatus: undefined,
		virusCheckStatus: '',
		size: '',
		mime: '',
		isLateEntry: undefined,
		isDeleted: undefined,
		documentType: 'appellantCostApplication',
		stage: '',
		blobStorageContainer: '',
		blobStoragePath: '',
		documentURI: ''
	}
};

export const folderInfoResponse = {
	caseId: '1',
	documents: [documentInfoResponse],
	folderId: 23,
	path: 'costs/appellantApplication'
};
