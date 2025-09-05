// @ts-nocheck
import config from '#config/config.js';
import notify from '#notify/notify-send.js';
import { jest } from '@jest/globals';
import { NODE_ENV_PRODUCTION } from '@pins/appeals/constants/support.js';

const mockValidateBlob = jest.fn().mockResolvedValue(true);
const mockRepGetById = jest.fn().mockResolvedValue({});
const mockRepUpdateById = jest.fn().mockResolvedValue({});
const mockRepGroupBy = jest.fn().mockResolvedValue([]);
const mockRepFindMany = jest.fn().mockResolvedValue({});
const mockRepUpdateMany = jest.fn().mockResolvedValue({});
const mockAppealRelationshipAdd = jest.fn().mockResolvedValue({});
const mockAppealRelationshipRemove = jest.fn().mockResolvedValue({});
const mockAppealRelationshipFindMany = jest.fn().mockResolvedValue({});
const mockAppealRelationshipFindFirst = jest.fn().mockResolvedValue({});
const mockAppealRelationshipCreateMany = jest.fn().mockResolvedValue({});
const mockAppealDecision = jest.fn().mockResolvedValue({});
const mockAppealFindUnique = jest.fn().mockResolvedValue({});
const mockAppealCreate = jest.fn().mockResolvedValue({});
const mocklPAQuestionnaireCreate = jest.fn().mockResolvedValue({});
const mocklPAQuestionnaireUpdate = jest.fn().mockResolvedValue({});
const mockAppealStatusFindMany = jest.fn().mockResolvedValue([]);
const mockAppealStatusUpdateMany = jest.fn().mockResolvedValue({});
const mockAppealStatusCreate = jest.fn().mockResolvedValue({});
const mockAppealStatusFindFirst = jest.fn().mockResolvedValue({});
const mockAppealStatusDeleteMany = jest.fn().mockResolvedValue({});
const mockAppealStatusUpdate = jest.fn().mockResolvedValue({});
const mockAppealUpdate = jest.fn().mockResolvedValue({});
const mockAppealStatusCreateMany = jest.fn().mockResolvedValue({});
const mockAppealFindMany = jest.fn().mockResolvedValue({});
const mockAppealCount = jest.fn().mockResolvedValue(0);
const mockAppealTimetableUpsert = jest.fn().mockResolvedValue(0);
const mockAppealTimetableUpdate = jest.fn().mockResolvedValue(0);
const mockFolderCreate = jest.fn().mockResolvedValue({});
const mockFolderUpdateMany = jest.fn().mockResolvedValue({});
const mockDocumentFindUnique = jest.fn().mockResolvedValue({});
const mockDocumentUpdate = jest.fn().mockResolvedValue({});
const mockFolderFindUnique = jest.fn().mockResolvedValue({});
const mockFolderFindFirst = jest.fn().mockResolvedValue({});
const mockDocumentUpsert = jest.fn().mockResolvedValue({});
const mockFolderFindMany = jest.fn().mockResolvedValue([]);
const mockDocumentFindMany = jest.fn().mockResolvedValue({});
const mockDocumentCount = jest.fn().mockResolvedValue({});
const mockDocumentFindFirst = jest.fn().mockResolvedValue({});
const mockDocumentDelete = jest.fn().mockResolvedValue({});
const mockDocumentCreate = jest.fn().mockResolvedValue({});
const mockDocumentCreateMany = jest.fn().mockResolvedValue({});
const mockDocumentVersionCreate = jest.fn().mockResolvedValue({});
const mockDocumentVersionCreateMany = jest.fn().mockResolvedValue({});
const mockDocumentVersionFindMany = jest.fn().mockResolvedValue({});
const mockDocumentMetdataFindFirst = jest.fn().mockResolvedValue({});
const mockDocumentMetdataFindUnique = jest.fn().mockResolvedValue({});
const mockDocumentMetdataUpsert = jest.fn().mockResolvedValue({});
const mockDocumentMetdataUpdate = jest.fn().mockResolvedValue({});
const mockDocumentAvScanFindFirst = jest.fn().mockResolvedValue({});
const mockDocumentAvScanUpsert = jest.fn().mockResolvedValue({});
const mockAddressCreate = jest.fn().mockResolvedValue({});
const mockAddressDelete = jest.fn().mockResolvedValue({});
const mockAddressUpdate = jest.fn().mockResolvedValue({});
const mockAppellantCaseIncompleteReasonFindMany = jest.fn().mockResolvedValue({});
const mockAppellantCaseIncompleteReasonsSelectedDeleteMany = jest.fn().mockResolvedValue({});
const mockAppellantCaseIncompleteReasonsSelectedCreateMany = jest.fn().mockResolvedValue({});
const mockAppellantCaseInvalidReasonFindMany = jest.fn().mockResolvedValue({});
const mockAppellantCaseInvalidReasonsSelectedDeleteMany = jest.fn().mockResolvedValue({});
const mockAppellantCaseInvalidReasonsSelectedCreateMany = jest.fn().mockResolvedValue({});
const mockAppellantCaseValidationOutcomeFindMany = jest.fn().mockResolvedValue({});
const mockAppellantCaseValidationOutcomeFindUnique = jest.fn().mockResolvedValue({});
const mockAppellantCaseUpdate = jest.fn().mockResolvedValue({});
const mockLPAQuestionnaireValidationOutcomeFindMany = jest.fn().mockResolvedValue({});
const mockLPAQuestionnaireValidationOutcomeFindUnique = jest.fn().mockResolvedValue({});
const mockLPAQuestionnaireIncompleteReasonFindUnique = jest.fn().mockResolvedValue({});
const mockLPAQuestionnaireIncompleteReasonFindMany = jest.fn().mockResolvedValue({});
const mockLPAQuestionnaireIncompleteReasonsSelectedDeleteMany = jest.fn().mockResolvedValue({});
const mockLPAQuestionnaireIncompleteReasonsSelectedCreateMany = jest.fn().mockResolvedValue({});
const mockLPAQuestionnaireIncompleteReasonsSelectedUpdate = jest.fn().mockResolvedValue({});
const mockSiteVisitCreate = jest.fn().mockResolvedValue({});
const mockSiteVisitUpdate = jest.fn().mockResolvedValue({});
const mockSiteVisitFindUnique = jest.fn().mockResolvedValue({});
const mockHearingCreate = jest.fn().mockResolvedValue({});
const mockHearingUpdate = jest.fn().mockResolvedValue({});
const mockHearingFindUnique = jest.fn().mockResolvedValue({});
const mockHearingDelete = jest.fn().mockResolvedValue({});
const mockHearingEstimateCreate = jest.fn().mockResolvedValue({});
const mockHearingEstimateUpdate = jest.fn().mockResolvedValue({});
const mockHearingEstimateFindUnique = jest.fn().mockResolvedValue({});
const mockHearingEstimateDelete = jest.fn().mockResolvedValue({});
const mockInquiryCreate = jest.fn().mockResolvedValue({});
const mockInquiryUpdate = jest.fn().mockResolvedValue({});
const mockInquiryFindUnique = jest.fn().mockResolvedValue({});
const mockInquiryDelete = jest.fn().mockResolvedValue({});
const mockInquiryEstimateCreate = jest.fn().mockResolvedValue({});
const mockInquiryEstimateUpdate = jest.fn().mockResolvedValue({});
const mockInquiryEstimateFindUnique = jest.fn().mockResolvedValue({});
const mockInquiryEstimateDelete = jest.fn().mockResolvedValue({});
const mockSiteVisitTypeFindUnique = jest.fn().mockResolvedValue({});
const mockSiteVisitTypeFindMany = jest.fn().mockResolvedValue({});
const mockSpecialismsFindUnique = jest.fn().mockResolvedValue({});
const mockAppealAllocationUpsert = jest.fn().mockResolvedValue({});
const mockAppealSpecialismDeleteMany = jest.fn().mockResolvedValue({});
const mockAppealSpecialismCreateMany = jest.fn().mockResolvedValue({});
const mockKnowledgeOfOtherLandownersFindMany = jest.fn().mockResolvedValue({});
const mockLPANotificationMethodsFindMany = jest.fn().mockResolvedValue({});
const mockLPADesignatedSitesFindMany = jest.fn().mockResolvedValue({});
const mockProcedureTypeFindMany = jest.fn().mockResolvedValue({});
const mockAppellantUpdate = jest.fn().mockResolvedValue({});
const mockUserFindMany = jest.fn().mockResolvedValue({});
const mockUserUpsert = jest.fn().mockResolvedValue({});
const mockAppellantCaseIncompleteReasonTextDeleteMany = jest.fn().mockResolvedValue({});
const mockAppellantCaseIncompleteReasonTextCreateMany = jest.fn().mockResolvedValue({});
const mockAppellantCaseInvalidReasonTextDeleteMany = jest.fn().mockResolvedValue({});
const mockAppellantCaseInvalidReasonTextCreateMany = jest.fn().mockResolvedValue({});
const mockLPAQuestionnaireIncompleteReasonTextDeleteMany = jest.fn().mockResolvedValue({});
const mockLPAQuestionnaireIncompleteReasonTextCreateMany = jest.fn().mockResolvedValue({});
const mockDocumentRedactionStatusFindMany = jest.fn().mockResolvedValue({});
const mockAuditTrailFindMany = jest.fn().mockResolvedValue({});
const mockAuditTrailCreate = jest.fn().mockResolvedValue({});
const mockDocumentVersionAuditCreate = jest.fn().mockResolvedValue({});
const mockAppealTypes = jest.fn().mockResolvedValue({});
const mockNeighbouringSites = jest.fn().mockResolvedValue({});
const mockListedBuildingSelected = jest.fn().mockResolvedValue({});
const mockServiceUserUpdate = jest.fn().mockResolvedValue({});
const mockServiceUserDelete = jest.fn().mockResolvedValue({});
const mockServiceUserFindUnique = jest.fn().mockResolvedValue({});
const mockServiceUserCreate = jest.fn().mockResolvedValue({});
const mockCaseNotesFindMany = jest.fn().mockResolvedValue({});
const mockCaseNotesFindUnique = jest.fn().mockResolvedValue({});
const mockCaseNotesCreate = jest.fn().mockResolvedValue({});
const mockRepresentationRejectionReasonFindMany = jest.fn().mockResolvedValue({});
const mockRepresentationCreate = jest.fn().mockResolvedValue({});
const mockRepresentationAttachmentCreateMany = jest.fn().mockResolvedValue({});
const mockRepresentationCount = jest.fn().mockResolvedValue({});
const mockLpaFindMany = jest.fn().mockResolvedValue({});
const mockLpaFindUnique = jest.fn().mockResolvedValue({});
const mockTeamFindUnique = jest.fn().mockResolvedValue({});
const mockTeamFindFirst = jest.fn().mockResolvedValue({});
const mockTeamFindMany = jest.fn().mockResolvedValue({});
const mockBlobStorageCopyFile = jest.fn().mockResolvedValue({});

const mockNotifySend = jest.fn().mockImplementation(async (params) => {
	const { doNotMockNotifySend = false, ...options } = params || {};
	if (doNotMockNotifySend) {
		return notify.notifySend(options);
	} else {
		return Promise.resolve();
	}
});

class MockPrismaClient {
	get representation() {
		return {
			update: mockRepUpdateById,
			findUnique: mockRepGetById,
			findMany: mockRepFindMany,
			updateMany: mockRepUpdateMany,
			groupBy: mockRepGroupBy,
			create: mockRepresentationCreate,
			count: mockRepresentationCount
		};
	}
	get representationAttachment() {
		return {
			create: mockRepresentationCreate,
			createMany: mockRepresentationAttachmentCreateMany
		};
	}

	get caseNote() {
		return {
			findMany: mockCaseNotesFindMany,
			findUnique: mockCaseNotesFindUnique,
			create: mockCaseNotesCreate
		};
	}

	get address() {
		return {
			delete: mockAddressDelete,
			update: mockAddressUpdate,
			create: mockAddressCreate
		};
	}

	get appeal() {
		return {
			findUnique: mockAppealFindUnique,
			update: mockAppealUpdate,
			findMany: mockAppealFindMany,
			count: mockAppealCount,
			create: mockAppealCreate
		};
	}

	get appealNotification() {
		return {
			findUnique: mockAppealFindUnique,
			createMany: mockAppealCreate
		};
	}

	get appealRelationship() {
		return {
			findMany: mockAppealRelationshipFindMany,
			findFirst: mockAppealRelationshipFindFirst,
			delete: mockAppealRelationshipRemove,
			create: mockAppealRelationshipAdd,
			createMany: mockAppealRelationshipCreateMany
		};
	}

	get appealType() {
		return {
			findMany: mockAppealTypes
		};
	}

	get appealStatus() {
		return {
			updateMany: mockAppealStatusUpdateMany,
			create: mockAppealStatusCreate,
			createMany: mockAppealStatusCreateMany,
			findMany: mockAppealStatusFindMany,
			findFirst: mockAppealStatusFindFirst,
			deleteMany: mockAppealStatusDeleteMany,
			update: mockAppealStatusUpdate
		};
	}

	get appealTimetable() {
		return {
			upsert: mockAppealTimetableUpsert,
			update: mockAppealTimetableUpdate
		};
	}

	get lPAQuestionnaire() {
		return {
			create: mocklPAQuestionnaireCreate,
			update: mocklPAQuestionnaireUpdate
		};
	}

	get document() {
		return {
			delete: mockDocumentDelete,
			findFirst: mockDocumentFindFirst,
			count: mockDocumentCount,
			findUnique: mockDocumentFindUnique,
			findMany: mockDocumentFindMany,
			update: mockDocumentUpdate,
			upsert: mockDocumentUpsert,
			createMany: mockDocumentCreateMany,
			create: mockDocumentCreate
		};
	}

	get documentVersion() {
		return {
			create: mockDocumentVersionCreate,
			createMany: mockDocumentVersionCreateMany,
			findMany: mockDocumentVersionFindMany,
			findFirst: mockDocumentMetdataFindFirst,
			findUnique: mockDocumentMetdataFindUnique,
			upsert: mockDocumentMetdataUpsert,
			update: mockDocumentMetdataUpdate
		};
	}

	get documentVersionAudit() {
		return {
			create: mockDocumentVersionAuditCreate
		};
	}

	get documentVersionAvScan() {
		return {
			upsert: mockDocumentAvScanUpsert,
			findUnique: mockDocumentAvScanFindFirst
		};
	}

	get folder() {
		return {
			findUnique: mockFolderFindUnique,
			findMany: mockFolderFindMany,
			create: mockFolderCreate,
			updateMany: mockFolderUpdateMany,
			findFirst: mockFolderFindFirst
		};
	}

	get appellantCaseIncompleteReason() {
		return {
			findMany: mockAppellantCaseIncompleteReasonFindMany
		};
	}

	get appellantCaseInvalidReason() {
		return {
			findMany: mockAppellantCaseInvalidReasonFindMany
		};
	}

	get appellantCaseValidationOutcome() {
		return {
			findMany: mockAppellantCaseValidationOutcomeFindMany,
			findUnique: mockAppellantCaseValidationOutcomeFindUnique
		};
	}

	get appellantCase() {
		return {
			update: mockAppellantCaseUpdate
		};
	}

	get appellantCaseIncompleteReasonsSelected() {
		return {
			deleteMany: mockAppellantCaseIncompleteReasonsSelectedDeleteMany,
			createMany: mockAppellantCaseIncompleteReasonsSelectedCreateMany
		};
	}

	get appellantCaseInvalidReasonsSelected() {
		return {
			deleteMany: mockAppellantCaseInvalidReasonsSelectedDeleteMany,
			createMany: mockAppellantCaseInvalidReasonsSelectedCreateMany
		};
	}

	get lPAQuestionnaireValidationOutcome() {
		return {
			findMany: mockLPAQuestionnaireValidationOutcomeFindMany,
			findUnique: mockLPAQuestionnaireValidationOutcomeFindUnique
		};
	}

	get lPAQuestionnaireIncompleteReason() {
		return {
			findUnique: mockLPAQuestionnaireIncompleteReasonFindUnique,
			findMany: mockLPAQuestionnaireIncompleteReasonFindMany
		};
	}

	get lPAQuestionnaireIncompleteReasonsSelected() {
		return {
			deleteMany: mockLPAQuestionnaireIncompleteReasonsSelectedDeleteMany,
			createMany: mockLPAQuestionnaireIncompleteReasonsSelectedCreateMany,
			update: mockLPAQuestionnaireIncompleteReasonsSelectedUpdate
		};
	}

	get siteVisit() {
		return {
			create: mockSiteVisitCreate,
			update: mockSiteVisitUpdate,
			findUnique: mockSiteVisitFindUnique
		};
	}

	get hearing() {
		return {
			create: mockHearingCreate,
			update: mockHearingUpdate,
			findUnique: mockHearingFindUnique,
			delete: mockHearingDelete
		};
	}

	get hearingEstimate() {
		return {
			create: mockHearingEstimateCreate,
			update: mockHearingEstimateUpdate,
			findUnique: mockHearingEstimateFindUnique,
			delete: mockHearingEstimateDelete
		};
	}

	get inquiry() {
		return {
			create: mockInquiryCreate,
			update: mockInquiryUpdate,
			findUnique: mockInquiryFindUnique,
			delete: mockInquiryDelete
		};
	}

	get inquiryEstimate() {
		return {
			create: mockInquiryEstimateCreate,
			update: mockInquiryEstimateUpdate,
			findUnique: mockInquiryEstimateFindUnique,
			delete: mockInquiryEstimateDelete
		};
	}

	get siteVisitType() {
		return {
			findUnique: mockSiteVisitTypeFindUnique,
			findMany: mockSiteVisitTypeFindMany
		};
	}

	get specialism() {
		return {
			findMany: mockSpecialismsFindUnique
		};
	}

	get appealSpecialism() {
		return {
			deleteMany: mockAppealSpecialismDeleteMany,
			createMany: mockAppealSpecialismCreateMany
		};
	}

	get appealAllocation() {
		return {
			upsert: mockAppealAllocationUpsert
		};
	}

	get knowledgeOfOtherLandowners() {
		return {
			findMany: mockKnowledgeOfOtherLandownersFindMany
		};
	}

	get lPANotificationMethods() {
		return {
			findMany: mockLPANotificationMethodsFindMany
		};
	}

	get designatedSite() {
		return {
			findMany: mockLPADesignatedSitesFindMany
		};
	}

	get procedureType() {
		return {
			findMany: mockProcedureTypeFindMany
		};
	}

	get appellant() {
		return {
			update: mockAppellantUpdate
		};
	}

	get user() {
		return {
			findMany: mockUserFindMany,
			upsert: mockUserUpsert
		};
	}

	get appellantCaseIncompleteReasonText() {
		return {
			deleteMany: mockAppellantCaseIncompleteReasonTextDeleteMany,
			createMany: mockAppellantCaseIncompleteReasonTextCreateMany
		};
	}

	get appellantCaseInvalidReasonText() {
		return {
			deleteMany: mockAppellantCaseInvalidReasonTextDeleteMany,
			createMany: mockAppellantCaseInvalidReasonTextCreateMany
		};
	}

	get lPAQuestionnaireIncompleteReasonText() {
		return {
			deleteMany: mockLPAQuestionnaireIncompleteReasonTextDeleteMany,
			createMany: mockLPAQuestionnaireIncompleteReasonTextCreateMany
		};
	}

	get documentRedactionStatus() {
		return {
			findMany: mockDocumentRedactionStatusFindMany
		};
	}

	get auditTrail() {
		return {
			findMany: mockAuditTrailFindMany,
			create: mockAuditTrailCreate
		};
	}

	get inspectorDecision() {
		return {
			create: mockAppealDecision
		};
	}

	get neighbouringSite() {
		return {
			create: mockNeighbouringSites,
			update: mockNeighbouringSites,
			findUnique: mockNeighbouringSites
		};
	}

	get listedBuildingSelected() {
		return {
			create: mockListedBuildingSelected,
			update: mockListedBuildingSelected,
			delete: mockListedBuildingSelected
		};
	}

	get serviceUser() {
		return {
			create: mockServiceUserCreate,
			update: mockServiceUserUpdate,
			findUnique: mockServiceUserFindUnique,
			delete: mockServiceUserDelete
		};
	}

	get representationRejectionReason() {
		return {
			findMany: mockRepresentationRejectionReasonFindMany,
			deleteMany: mockRepresentationRejectionReasonFindMany
		};
	}

	get lPA() {
		return {
			findMany: mockLpaFindMany,
			findUnique: mockLpaFindUnique
		};
	}
	get team() {
		return {
			findUnique: mockTeamFindUnique,
			findFirst: mockTeamFindFirst,
			findMany: mockTeamFindMany
		};
	}

	$transaction(queries = []) {
		if (typeof queries === 'function') {
			// transactions can be a function, run with an instance of the client
			return queries(this);
		} else {
			// or just an array of queries to run
			return Promise.all(queries);
		}
	}
}

const mockExecuteRawUnsafe = jest.fn().mockResolvedValue({});
const mockPrismaUse = jest.fn().mockResolvedValue();

MockPrismaClient.prototype.$executeRawUnsafe = mockExecuteRawUnsafe;
MockPrismaClient.prototype.$use = mockPrismaUse;

class MockPrisma {}

jest.unstable_mockModule('#db-client', () => ({
	PrismaClient: MockPrismaClient,
	Prisma: MockPrisma,
	default: {
		// PrismaClient: MockPrismaClient,
		// Prisma: MockPrisma
	}
}));

const mockSendEvents = jest.fn();

jest.unstable_mockModule('./src/server/infrastructure/event-client.js', () => ({
	eventClient: {
		sendEvents: mockSendEvents
	}
}));

jest.unstable_mockModule('@pins/blob-storage-client', () => ({
	BlobStorageClient: { fromUrl: jest.fn().mockReturnValue({ copyFile: mockBlobStorageCopyFile }) }
}));

jest.unstable_mockModule('@azure/storage-blob', () => ({ BlobServiceClient: jest.fn() }));

jest.unstable_mockModule('rhea', () => ({
	default: { generate_uuid: jest.fn().mockReturnValue('mock-uuid') }
}));

const mockGotGet = jest.fn();
const mockGotPost = jest.fn();
const mockSendEmail = jest.fn();
global.mockSendEmail = mockSendEmail;
global.mockNotifySend = mockNotifySend;

jest.unstable_mockModule('jsonwebtoken', () => ({
	default: {
		decode: jest.fn(),
		verify: jest.fn()
	}
}));

jest.unstable_mockModule('got', () => ({
	default: {
		get: mockGotGet,
		post: mockGotPost
	}
}));

jest.unstable_mockModule('#notify/notify-send.js', () => ({
	...notify,
	notifySend: mockNotifySend,
	default: notify
}));

jest.unstable_mockModule('notifications-node-client', () => ({
	NotifyClient: class {
		sendEmail = mockSendEmail;
	}
}));

jest.unstable_mockModule('./src/server/utils/blob-validation', () => {
	return {
		validateBlobContents: mockValidateBlob
	};
});

jest.unstable_mockModule('./src/server/config/config.js', () => ({
	default: {
		...config,
		NODE_ENV: NODE_ENV_PRODUCTION,
		govNotify: {
			...config.govNotify,
			testMailbox: '',
			api: {
				key: 'gov-notify-api-key-123'
			}
		}
	}
}));
