import { LPANotificationMethods, LPAQuestionnaire } from '#utils/db-client';
import { Schema } from 'index';

declare global {
	namespace Express {
		interface Request {
			appeal: Schema.Appeal;
			appealTypes: Schema.AppealType[];
			document: Schema.Document;
			notifyClient: NotifyClient;
			visitType: SiteVisitType;
			validationOutcome: ValidationOutcome;
			documentRedactionStatusIds: number[];
		}
	}
}

interface NotifyClient {
	sendEmail: (
		template: NotifyTemplate,
		recipientEmail?: string,
		personalisation: { [key: string]: string | string[] }
	) => void;
}

interface NotifyTemplate {
	id: string;
}

interface SingleAppealDetailsResponse {
	allocationDetails: AppealAllocation | null;
	appealId: number;
	appealReference: string;
	appealSite: AppealSite;
	appealStatus: string;
	transferStatus?: {
		transferredAppealType: string;
		transferredAppealReference: string;
	} | null;
	appealTimetable: AppealTimetable | null;
	appealType?: string | null;
	resubmitTypeId?: number | null;
	appellantCaseId: number;
	appellant?: ServiceUserResponse | null;
	agent?: ServiceUserResponse | null;
	caseOfficer?: string | null;
	costs: {
		appellantApplicationFolder?: FolderInfo | null;
		appellantWithdrawalFolder?: FolderInfo | null;
		appellantCorrespondenceFolder?: FolderInfo | null;
		lpaApplicationFolder?: FolderInfo | null;
		lpaWithdrawalFolder?: FolderInfo | null;
		lpaCorrespondenceFolder?: FolderInfo | null;
		decisionFolder?: FolderInfo | null;
	};
	decision: {
		folderId: number;
		outcome?: string | null;
		documentId?: string | null;
		letterDate?: Date | null;
		virusCheckStatus?: string | null;
	};
	internalCorrespondence: {
		crossTeam?: FolderInfo | null;
		inspector?: FolderInfo | null;
	};
	documentationSummary: DocumentationSummary;
	healthAndSafety: {
		appellantCase: {
			details?: string | null;
			hasIssues: boolean;
		};
		lpaQuestionnaire: {
			details?: string | null;
			hasIssues: boolean;
		};
	};
	inspector?: string | null;
	inspectorAccess: {
		appellantCase: {
			details?: string | null;
			isRequired: boolean;
		};
		lpaQuestionnaire: {
			details?: string | null;
			isRequired: boolean;
		};
	};
	isParentAppeal?: boolean | null;
	isChildAppeal?: boolean | null;
	linkedAppeals: LinkedAppeal[];
	otherAppeals: RelatedAppeal[];
	localPlanningDepartment: string;
	lpaQuestionnaireId?: number | null;
	neighbouringSites: NeighbouringSite[];
	planningApplicationReference: string;
	procedureType?: string | null;
	siteVisit?: {
		siteVisitId: number;
		visitDate: Date;
		visitStartTime: string;
		visitEndTime?: string | null;
		visitType: string;
	} | null;
	createdAt: Date;
	startedAt?: Date | null;
	validAt?: Date | null;
	internalCorrespondence: {
		crossTeam?: FolderInfo | null;
		inspector?: FolderInfo | null;
	};
	withdrawal: {
		withdrawalFolder?: FolderInfo | null;
		withdrawalRequestDate: Date | null;
	};
	isAffectingNeighbouringSites?: boolean | null;
}

interface UpdateAppealRequest {
	caseExtensionDate?: string;
	caseStartedDate?: string;
	caseValidDate?: string;
	applicationReference?: string;
	caseOfficer?: number | null;
	inspector?: number | null;
}

interface SingleAppellantCaseResponse {
	appealId: number;
	appealReference: string;
	appealSite: AppealSite;
	appellantCaseId: number;
	applicant: {
		firstName: string | null;
		surname: string | null;
	};
	applicationDate: Date;
	applicationDecisionDate: Date | null;
	caseSubmissionDueDate: Date | null;
	caseSubmittedDate: Date | null;
	isAppellantNamedOnApplication: boolean | null;
	planningApplicationReference: string;
	hasAdvertisedAppeal: boolean | null;
	healthAndSafety: {
		details: string | null;
		hasIssues: boolean | null;
	};
	localPlanningDepartment: string;
	procedureType?: string;
	enforcementNotice?: boolean | null;
	siteOwnership: {
		areAllOwnersKnown: string | null;
		knowsOtherLandowners: string | null;
		ownersInformed: boolean | null;
		ownsAllLand: boolean | null;
		ownsSomeLand: boolean | null;
	};
	floorSpaceSquareMetres: decimal | null;
	siteAreaSquareMetres: decimal | null;
	developmentDescription?: {
		details: string | null;
		isChanged: boolean | null;
	};
	applicationDecisionDate: string | null;
	applicationDate: string | null;
	applicationDecision: string | null;
	enforcementNotice: null;
	appellantCostsAppliedFor: boolean | null;
	appellantProcedurePreference: string | null;
	appellantProcedurePreferenceDetails: string | null;
	appellantProcedurePreferenceDuration: number | null;
	inquiryHowManyWitnesses: number | null;
	documents: {
		appellantCaseCorrespondence?: FolderInfo | null;
		appellantCaseWithdrawalLetter?: FolderInfo | null;
		appellantStatement?: FolderInfo | null;
		applicationDecisionLetter?: FolderInfo | null;
		changedDescription?: FolderInfo | null;
		originalApplicationForm?: FolderInfo | null;
		designAccessStatement?: FolderInfo | null;
		plansDrawings?: FolderInfo | null;
		newPlansDrawings?: FolderInfo | null;
		planningObligation?: FolderInfo | null;
		ownershipCertificate?: FolderInfo | null;
		otherNewDocuments?: FolderInfo | null;
	};
	validation: ValidationOutcomeResponse | null;
	isGreenBelt?: boolean | null;
	planningObligation?: {
		hasObligation: boolean | null;
		status: string | null;
	};
	agriculturalHolding: {
		isPartOfAgriculturalHolding: boolean | null;
		isTenant: boolean | null;
		hasOtherTenants: boolean | null;
	};
	ownershipCertificateSubmitted?: boolean | null;
}

interface UpdateAppellantCaseRequest {
	appellantCaseValidationOutcomeId?: number;
	applicantFirstName?: string;
	applicantSurname?: string;
	areAllOwnersKnown?: boolean;
	knowsOtherOwners?: string | null;
	hasAdvertisedAppeal?: boolean;
	siteAccessDetails?: string;
	hasAttemptedToIdentifyOwners?: boolean;
	siteSafetyDetails?: string;
	ownsAllLand?: boolean;
	ownsSomeLand?: boolean;
	siteAreaSquareMetres?: string;
	applicationDate?: string;
	applicationDecisionDate?: string;
	isGreenBelt?: boolean;
	applicationDecision?: string;
	changedDevelopmentDescription?: boolean;
	originalDevelopmentDescription?: string;
	doesSiteRequireInspectorAccess?: boolean;
	inspectorAccessDetails?: string;
	hasHealthAndSafetyIssues?: boolean;
	healthAndSafetyIssues?: string;
	isSiteFullyOwned?: boolean;
	isSitePartiallyOwned?: boolean;
	isSiteVisibleFromPublicRoad?: boolean;
	visibilityRestrictions?: string;
	planningObligation?: boolean | null;
	statusPlanningObligation?: string | null;
	agriculturalHolding?: boolean | null;
	tenantAgriculturalHolding?: boolean | null;
	otherTenantsAgriculturalHolding?: boolean | null;
	ownershipCertificateSubmitted?: boolean | null;
}

interface UpdateAppellantCaseValidationOutcome {
	appellantCaseId: number;
	validationOutcomeId: number;
	incompleteReasons?: IncompleteInvalidReasons;
	invalidReasons?: IncompleteInvalidReasons;
	appealId?: number;
	validAt?: Date;
	appealDueDate?: Date;
}

interface UpdateAppellantCaseValidationOutcomeParams {
	appeal: {
		appealStatus: AppealStatus[];
		appealType: AppealType;
		appellant: Appellant;
		agent: Agent;
		id: number;
		reference: string;
	};
	appellantCaseId: number;
	azureAdUserId: string;
	data: {
		appealDueDate: Date;
		incompleteReasons: IncompleteInvalidReasons;
		invalidReasons: IncompleteInvalidReasons;
	};
	validationOutcome: ValidationOutcome;
	validAt: Date;
	siteAddress: string;
}

interface SingleLPAQuestionnaireResponse {
	lpaQuestionnaireId: number;
	appealId: number;
	appealReference: string;
	appealSite: AppealSite;
	localPlanningDepartment?: string;
	procedureType?: string;
	documents: {
		whoNotified?: FolderInfo | null;
		whoNotifiedSiteNotice?: FolderInfo | null;
		whoNotifiedLetterToNeighbours?: FolderInfo | null;
		whoNotifiedPressAdvert?: FolderInfo | null;
		conservationMap?: FolderInfo | null;
		lpaCaseCorrespondence?: FolderInfo | null;
		otherPartyRepresentations?: FolderInfo | null;
		planningOfficerReport?: FolderInfo | null;
	};
	validation: ValidationOutcomeResponse | null;
	lpaNotificationMethods?: LPANotificationMethodDetails[] | null;
	listedBuildingDetails?: ListedBuildingDetailsResponse[] | null;
	healthAndSafetyDetails?: string | null;
	doesSiteHaveHealthAndSafetyIssues?: boolean | null;
	inspectorAccessDetails?: string | null;
	doesSiteRequireInspectorAccess?: boolean | null;
	isConservationArea?: boolean | null;
	isGreenBelt?: boolean | null;
	isCorrectAppealType?: boolean | null;
	submittedAt?: Date | null;
	receivedAt: Date;
	otherAppeals?: RelatedAppeal[] | null;
	costsAppliedFor?: boolean | null;
	lpaStatement?: string | null;
	extraConditions?: string | null;
	hasExtraConditions?: boolean | null;
}

interface UpdateLPAQuestionnaireRequest {
	appealId?: number;
	lpaStatement?: string;
	siteAccessDetails?: string;
	siteSafetyDetails?: string;
	isGreenBelt?: boolean;
	extraConditions?: string;
	lpaCostsAppliedFor?: boolean;
	isConservationArea?: boolean;
	isCorrectAppealType?: boolean;
	incompleteReasons?: IncompleteInvalidReasons;
	validationOutcomeId?: number;
	lpaNotificationMethods?: LPANotificationMethodsSelectedUncheckedUpdateManyWithoutLpaQuestionnaireNestedInput;
	isAffectingNeighbouringSites?: boolean;
}

interface UpdateLPAQuestionnaireValidationOutcomeParams {
	appeal: {
		id: number;
		appealStatus: AppealStatus[];
		appealType?: AppealType | null;
		lpa?: LPA | null;
		reference: string;
		applicationReference?: string | null;
	};
	azureAdUserId: string;
	data: {
		lpaQuestionnaireDueDate: string;
		incompleteReasons: IncompleteInvalidReasons;
	};
	lpaQuestionnaireId: number;
	validationOutcome: ValidationOutcome;
}

interface TimetableDeadlineDate {
	[key: string]: Date;
}

interface RelatedAppeal {
	externalId: string | null;
	appealReference: string;
	linkingDate: Date;
	appealType?: string | null;
	relationshipId: number;
	externalSource: boolean;
	externalAppealType?: string | null;
	appealId: number | null;
}

interface LinkedAppeal {
	appealId: number | null;
	appealReference: string;
	isParentAppeal: boolean;
	linkingDate: Date;
	appealType?: string | null;
	relationshipId: number;
	externalSource: boolean;
	externalAppealType?: string | null;
	externalId?: string | null;
}

interface LinkableAppealSummary {
	appealId: string | undefined;
	appealReference: string | undefined;
	appealType: string | undefined;
	appealStatus: string;
	siteAddress: AppealSite;
	localPlanningDepartment: string;
	appellantName: string | undefined;
	agentName?: string | undefined | null;
	submissionDate: string;
	source: 'horizon' | 'back-office';
}

interface AppealAllocation {
	level: string;
	band: number;
	specialisms: string[];
}

interface AppealSite {
	addressId?: number | null;
	addressLine1: string;
	addressLine2?: string | null;
	town?: string;
	county?: string | null;
	postCode: string;
}

interface NeighbouringSite {
	siteId: number;
	source: string;
	address: AppealSite;
}

interface AppealTimetable {
	appealTimetableId: number;
	finalCommentReviewDate?: Date | null;
	lpaQuestionnaireDueDate: Date | null;
	statementReviewDate?: Date | null;
	issueDeterminationDate?: Date | null;
	completeDate?: Date | null;
	caseResubmissionDueDate?: Date | null;
}

interface UpdateTimetableRequest {
	finalCommentReviewDate?: Date;
	issueDeterminationDate?: Date;
	lpaQuestionnaireDueDate?: Date;
	statementReviewDate?: Date;
}

interface BankHolidayFeedEvent {
	title: string;
	date: string;
	notes: string;
}

interface BankHolidayFeedEvents extends Array<BankHolidayFeedEvent> {}

interface ValidationOutcomeResponse {
	outcome: string | null;
	incompleteReasons?: IncompleteInvalidReasonsResponse[];
	invalidReasons?: IncompleteInvalidReasonsResponse[];
}

interface AppealListResponse {
	appealId: number;
	appealReference: string;
	appealSite: AppealSite;
	appealStatus: string;
	appealType?: string;
	createdAt: Date;
	localPlanningDepartment: string;
	lpaQuestionnaireId?: number | null;
	appealTimetable?: AppealTimetable;
	appellantCaseStatus: string;
	lpaQuestionnaireStatus: string;
	dueDate: Date | undefined | null;
	isParentAppeal: boolean | null;
	isChildAppeal: boolean | null;
}

interface DocumentationSummary {
	appellantCase?: DocumentationSummaryEntry;
	lpaQuestionnaire?: DocumentationSummaryEntry;
}

interface DocumentationSummaryEntry {
	status: string;
	dueDate: Date | undefined | null;
}

interface FolderInfo {
	folderId: number;
	caseId: string;
	path: string;
	documents: DocumentInfo[];
}

interface DocumentInfo {
	id: string;
	caseId: number;
	folderId: number;
	name: string;
	createdAt: string;
	isDeleted?: boolean | null;
	latestDocumentVersion: DocumentVersionInfo;
	allVersions: DocumentVersionInfo[];
	versionAudit: Schema.DocumentVersionAudit[];
}

interface DocumentVersionInfo {
	documentId: string;
	version: number;
	originalFilename: string;
	fileName: string;
	blobStorageContainer: string;
	blobStoragePath: string;
	documentURI: string;
	dateReceived: string;
	redactionStatus?: string | null;
	virusCheckStatus: string;
	size: string;
	mime: string;
	isLateEntry?: boolean | null;
	isDeleted?: boolean | null;
	stage: string;
	documentType: string;
}

interface SingleSiteVisitDetailsResponse {
	appealId: number;
	visitDate: Date | null;
	siteVisitId: number;
	visitEndTime: string | null;
	visitStartTime: string | null;
	visitType: string;
}

interface SingleAppellantResponse {
	appellantId: number;
	name: string;
}

interface UpdateAppellantRequest {
	name?: string;
}

interface SingleAddressResponse {
	addressId: number;
	addressLine1: string | null;
	addressLine2: string | null;
	country: string | null;
	county: string | null;
	postcode: string | null;
	town: string | null;
}

interface UpdateAddressRequest {
	addressLine1?: string;
	addressLine2?: string;
	addressCountry?: string;
	addressCounty?: string;
	postcode?: string;
	addressTown?: string;
}

interface UpdateAppellantCaseValidationOutcome {
	appellantCaseId: number;
	validationOutcomeId: number;
	incompleteReasons?: IncompleteInvalidReasons;
	invalidReasons?: IncompleteInvalidReasons;
	appealId?: number;
	validAt?: Date;
}

interface UpdateLPAQuestionnaireRequest {
	appealId?: number;
	designatedSites?: number[];
	doesAffectAListedBuilding?: boolean;
	doesAffectAScheduledMonument?: boolean;
	doesSiteRequireInspectorAccess?: boolean;
	doesSiteHaveHealthAndSafetyIssues?: boolean;
	hasCompletedAnEnvironmentalStatement?: boolean;
	hasProtectedSpecies?: boolean;
	hasTreePreservationOrder?: boolean;
	healthAndSafetyDetails?: string;
	includesScreeningOption?: boolean;
	incompleteReasons?: IncompleteInvalidReasons;
	isAffectingNeighbouringSites?: boolean;
	isConservationArea?: boolean;
	isCorrectAppealType?: boolean;
	isEnvironmentalStatementRequired?: boolean;
	isGypsyOrTravellerSite?: boolean;
	isListedBuilding?: boolean;
	isPublicRightOfWay?: boolean;
	isSensitiveArea?: boolean;
	isTheSiteWithinAnAONB?: boolean;
	inspectorAccessDetails?: string;
	lpaQuestionnaireValidationOutcomeId?: number;
	meetsOrExceedsThresholdOrCriteriaInColumn2?: boolean;
	scheduleTypeId?: number;
	sensitiveAreaDetails?: string;
	timetable?: TimetableDeadlineDate;
	validationOutcomeId?: number;
}

interface UpdateLPAQuestionnaireValidationOutcomeParams {
	appeal: {
		id: number;
		appealStatus: AppealStatus[];
		appealType?: AppealType | null;
		reference: string;
		lpa?: LPA | null;
	};
	azureAdUserId: string;
	data: {
		lpaQuestionnaireDueDate: string;
		incompleteReasons: IncompleteInvalidReasons;
	};
	lpaQuestionnaireId: number;
	validationOutcome: ValidationOutcome;
	siteAddress: string;
}

interface UpdateAppellantCaseValidationOutcomeParams {
	appeal: {
		appealStatus: AppealStatus[];
		appealType: AppealType;
		appellant: Appellant;
		agent: Agent;
		id: number;
		reference: string;
	};
	appellantCaseId: number;
	azureAdUserId: string;
	data: {
		appealDueDate: string;
		incompleteReasons: IncompleteInvalidReasons;
		invalidReasons: IncompleteInvalidReasons;
	};
	validationOutcome: ValidationOutcome;
	validAt: Date;
	siteAddress: string;
}

interface UpdateTimetableRequest {
	finalCommentReviewDate?: Date;
	issueDeterminationDate?: Date;
	lpaQuestionnaireDueDate?: Date;
	statementReviewDate?: Date;
}

interface UpdateAppealRequest {
	dueDate?: string;
	startedAt?: string;
	validAt?: string;
	planningApplicationReference?: string;
	caseOfficer?: number | null;
	inspector?: number | null;
}

interface SetAppealDecisionRequest {
	documentDate: Date;
	documentGuid: string;
	version: number;
	outcome: string;
}

interface SetInvalidAppealDecisionRequest {
	outcome: string;
	invalidDecisionReason: string;
}

interface AppealRelationshipRequest {
	parentRef: string;
	parentId?: number | null;
	childRef: string;
	childId: number | null;
}

interface UsersToAssign {
	caseOfficer?: string | null;
	inspector?: string | null;
}

interface NotValidReasonOption {
	id: number;
	name: string;
	hasText: boolean;
}

interface IncompleteInvalidReasonsResponse {
	name: NotValidReasonOption;
	text?: string[];
}

interface CreateAuditTrail {
	appealId: number;
	azureAdUserId?: string;
	details: string;
}

interface CreateAuditTrailRequest {
	appealId: number;
	details: string;
	loggedAt: Date;
	userId: number;
}

export interface CreateSiteVisitData {
	appealId: number;
	visitDate?: string;
	visitEndTime?: string;
	visitStartTime?: string;
	visitType?: any;
	appellantEmail: string;
	lpaEmail: string;
	appealReferenceNumber: string;
	lpaReference: string;
	siteAddress: string;
}

export interface UpdateSiteVisitData {
	siteVisitId: number;
	appealId: number;
	visitDate?: string;
	visitEndTime?: string;
	visitStartTime?: string;
	visitType?: any;
	previousVisitType: string;
	appellantEmail: string;
	lpaEmail: string;
	appealReferenceNumber: string;
	lpaReference: string;
	siteAddress: string;
	siteVisitChangeType: string;
}

type GetAuditTrailsResponse = {
	azureAdUserId: string;
	details: string;
	loggedDate: Date;
	doc?:
		| {
				documentGuid: string;
				documentType: string;
				stage: string;
				name: string;
				folderId: number;
		  }
		| undefined;
}[];

type UpdateDocumentsRequest = {
	id: string;
	receivedDate: string;
	redactionStatus: number;
	latestVersion: number;
	published: boolean;
	draft: boolean;
}[];

type UpdateDocumentAvCheckRequest = {
	id: string;
	virusCheckStatus: string;
	version: number;
};

type ListedBuildingDetailsResponse = {
	id: number;
	listEntry: string;
};

type LookupTables = AppellantCaseIncompleteReason | AppellantCaseInvalidReason | ValidationOutcome;

type IncompleteInvalidReasons = {
	id: number;
	text?: string[];
}[];

type ServiceUserResponse = {
	serviceUserId: number;
	firstName: string;
	lastName: string;
	email?: string | null;
	organisationName?: string | null;
	phoneNumber?: string | null;
};

type AssignedUser = 'caseOfficer' | 'inspector';

type BankHolidayFeedDivisions =
	| 'england-and-wales'
	| 'northern-ireland'
	| 'scotland'
	| 'united-kingdom';

export {
	AppealListResponse,
	AppealSite,
	AppealTimetable,
	AssignedUser,
	BankHolidayFeedDivisions,
	BankHolidayFeedEvents,
	CreateAuditTrail,
	CreateAuditTrailRequest,
	DocumentationSummary,
	DocumentInfo,
	DocumentVersionInfo,
	FolderInfo,
	NotValidReasonOption,
	IncompleteInvalidReasons,
	IncompleteInvalidReasonsResponse,
	LinkedAppeal,
	LinkableAppealSummary,
	RelatedAppeal,
	ListedBuildingDetailsResponse,
	LookupTables,
	NotifyClient,
	NotifyTemplate,
	SingleAddressResponse,
	SingleAppealDetailsResponse,
	SingleAppellantCaseResponse,
	SingleAppellantResponse,
	GetAuditTrailsResponse,
	SingleLPAQuestionnaireResponse,
	SingleSiteVisitDetailsResponse,
	TimetableDeadlineDate,
	UpdateAddressRequest,
	UpdateAppealRequest,
	UpdateAppellantCaseRequest,
	UpdateAppellantCaseValidationOutcome,
	UpdateAppellantCaseValidationOutcomeParams,
	UpdateAppellantRequest,
	UpdateDocumentsRequest,
	UpdateDocumentsAvCheckRequest,
	UpdateLPAQuestionnaireValidationOutcomeParams,
	UpdateLPAQuestionnaireRequest,
	UpdateTimetableRequest,
	UsersToAssign,
	ValidationOutcomeResponse,
	SetAppealDecisionRequest,
	SetInvalidAppealDecisionRequest,
	AppealRelationshipRequest,
	ServiceUserResponse
};
