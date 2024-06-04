import { LPAQuestionnaire } from '#utils/db-client';
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
		appellantFolder?: FolderInfo | null;
		lpaFolder?: FolderInfo | null;
		decisionFolder?: FolderInfo | null;
	};
	decision: {
		folderId: number;
		outcome?: string | null;
		documentId?: string | null;
		letterDate?: Date | null;
		virusCheckStatus?: string | null;
	};
	documentationSummary: DocumentationSummary;
	healthAndSafety: {
		appellantCase: {
			details?: string | null;
			hasIssues?: boolean | null;
		};
		lpaQuestionnaire: {
			details?: string | null;
			hasIssues?: boolean | null;
		};
	};
	inspector?: string | null;
	inspectorAccess: {
		appellantCase: {
			details?: string | null;
			isRequired?: boolean | null;
		};
		lpaQuestionnaire: {
			details?: string | null;
			isRequired?: boolean | null;
		};
	};
	isParentAppeal?: boolean | null;
	isChildAppeal?: boolean | null;
	linkedAppeals: LinkedAppeal[];
	otherAppeals: RelatedAppeal[];
	localPlanningDepartment: string;
	lpaQuestionnaireId?: number | null;
	isAffectingNeighbouringSites?: boolean | null;
	neighbouringSites: Schema.NeighbouringSite[];
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
}

interface UpdateAppealRequest {
	caseExtensionDate?: string;
	caseStartedDate?: string;
	caseValidDate?: string;
	applicationReference?: string;
	caseOfficer?: number | null;
	inspector?: number | null;
}

/*
appealId: appeal.id,
	appealReference: appeal.reference,
	appealSite: {
		addressId: appeal.address?.id,
		addressLine1: appeal.address?.addressLine1 || '',
		addressLine2: appeal.address?.addressLine2 || '',
		town: appeal.address?.addressTown || '',
		county: appeal.address?.addressCounty || '',
		postCode: appeal.address?.postcode
	},
	appellantCaseId: appeal.appellantCase?.id,
	appellant: {
		firstName: appeal.appellant?.firstName,
		surname: appeal.appellant?.lastName
	},
	applicant: {
		firstName: appeal.appellant?.firstName,
		surname: appeal.appellant?.lastName
	},
	documents: {
		appellantCaseCorrespondence: {},
		appellantCaseWithdrawalLetter: {},
		appellantStatement: {},
		applicationDecisionLetter: {},
		changedDescription: {},
		originalApplicationForm: {}
	},
	hasAdvertisedAppeal: appeal.appellantCase?.hasAdvertisedAppeal,
	healthAndSafety: {
		details: appeal.appellantCase?.siteSafetyDetails,
		hasIssues: true
	},
	localPlanningDepartment: appeal.lpa.name,
	planningApplicationReference: appeal.applicationReference,
	procedureType: appeal.procedureType?.name,
	siteOwnership: {
		areAllOwnersKnown: appeal.appellantCase?.knowsAllOwners,
		changedDevelopmentDescription: appeal.appellantCase?.changedDevelopmentDescription,
		originalDevelopmentDescription: appeal.appellantCase?.originalDevelopmentDescription,
		isFullyOwned: appeal.appellantCase?.ownsAllLand,
		isPartiallyOwned: appeal.appellantCase?.ownsSomeLand,
		knowsAllLandowners: appeal.appellantCase?.knowsOtherOwners?.name,
		knowsOtherLandowners: appeal.appellantCase?.knowsOtherOwners?.name
	},
	validation: formatValidationOutcomeResponse(
		appeal.appellantCase?.appellantCaseValidationOutcome?.name || null,
		appeal.appellantCase?.appellantCaseIncompleteReasonsSelected,
		appeal.appellantCase?.appellantCaseInvalidReasonsSelected
	)
*/

interface SingleAppellantCaseResponse {
	appealId: number;
	appealReference: string;
	appealSite: AppealSite;
	appellantCaseId: number;
	applicant: {
		firstName: string | null;
		surname: string | null;
	};
	isAppellantNamedOnApplication: boolean | null;
	planningApplicationReference: string;
	hasAdvertisedAppeal: boolean | null;
	healthAndSafety: {
		details: string | null;
		hasIssues: boolean | null;
	};
	localPlanningDepartment: string;
	procedureType?: string;
	siteOwnership: {
		areAllOwnersKnown: string | null;
		knowsOtherLandowners: string | null;
		isFullyOwned: boolean | null;
		isPartiallyOwned: boolean | null;
		floorSpaceSquareMetres: decimal | null;
		siteAreaSquareMetres: decimal | null;
	};
	developmentDescription?: {
		details: string | null;
		isCorrect: boolean | null;
	};
	documents: {
		appellantCaseCorrespondence?: FolderInfo | null;
		appellantCaseWithdrawalLetter?: FolderInfo | null;
		appellantStatement?: FolderInfo | null;
		applicationDecisionLetter?: FolderInfo | null;
		changedDescription?: FolderInfo | null;
		originalApplicationForm?: FolderInfo | null;
	};
	validation: ValidationOutcomeResponse | null;
}

interface UpdateAppellantCaseRequest {
	appellantCaseValidationOutcomeId?: number;
	applicantFirstName?: string;
	applicantSurname?: string;
	areAllOwnersKnown?: boolean;
	hasAdvertisedAppeal?: boolean;
	doesSiteRequireInspectorAccess?: boolean;
	inspectorAccessDetails?: string;
	hasAttemptedToIdentifyOwners?: boolean;
	hasHealthAndSafetyIssues?: boolean;
	healthAndSafetyIssues?: string;
	isSiteFullyOwned?: boolean;
	isSitePartiallyOwned?: boolean;
	isSiteVisibleFromPublicRoad?: boolean;
	visibilityRestrictions?: string;
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
	affectsListedBuildingDetails: ListedBuildingDetailsResponse | null;
	appealId: number;
	appealReference: string;
	appealSite: AppealSite;
	communityInfrastructureLevyAdoptionDate?: Date | null;
	designatedSites?: DesignatedSiteDetails[] | null;
	developmentDescription?: string | null;
	documents: {
		whoNotified?: FolderInfo | null;
		conservationMap?: FolderInfo | null;
		lpaCaseCorrespondence?: FolderInfo | null;
		otherPartyRepresentations?: FolderInfo | null;
		planningOfficerReport?: FolderInfo | null;
	};
	doesAffectAListedBuilding?: boolean | null;
	doesAffectAScheduledMonument?: boolean | null;
	doesSiteHaveHealthAndSafetyIssues?: boolean | null;
	doesSiteRequireInspectorAccess?: boolean | null;
	extraConditions?: string | null;
	hasCommunityInfrastructureLevy?: boolean | null;
	hasCompletedAnEnvironmentalStatement?: boolean | null;
	hasEmergingPlan?: boolean | null;
	hasExtraConditions?: boolean | null;
	hasOtherAppeals?: boolean | null;
	hasProtectedSpecies?: boolean | null;
	hasRepresentationsFromOtherParties?: boolean | null;
	hasResponsesOrStandingAdviceToUpload?: boolean | null;
	hasStatementOfCase?: boolean | null;
	hasStatutoryConsultees?: boolean | null;
	hasSupplementaryPlanningDocuments?: boolean | null;
	hasTreePreservationOrder?: boolean | null;
	healthAndSafetyDetails?: string | null;
	inCAOrrelatesToCA?: boolean | null;
	includesScreeningOption?: boolean | null;
	inquiryDays?: number | null;
	inspectorAccessDetails?: string | null;
	isAffectingNeighbouringSites?: boolean | null;
	isCommunityInfrastructureLevyFormallyAdopted?: boolean | null;
	isConservationArea?: boolean | null;
	isCorrectAppealType: boolean | null;
	isEnvironmentalStatementRequired?: boolean | null;
	isGypsyOrTravellerSite?: boolean | null;
	isListedBuilding?: boolean | null;
	isPublicRightOfWay?: boolean | null;
	isSensitiveArea?: boolean | null;
	isSiteVisible?: boolean | null;
	isTheSiteWithinAnAONB?: boolean | null;
	listedBuildingDetails: ListedBuildingDetailsResponse | null;
	localPlanningDepartment: string | null;
	lpaNotificationMethods?: LPANotificationMethodDetails[] | null;
	lpaQuestionnaireId?: number;
	meetsOrExceedsThresholdOrCriteriaInColumn2?: boolean | null;
	otherAppeals: string[];
	procedureType?: string;
	receivedAt: Date;
	scheduleType?: string;
	sensitiveAreaDetails?: string | null;
	siteWithinGreenBelt?: boolean | null;
	statutoryConsulteesDetails?: string | null;
	validation: ValidationOutcomeResponse | null;
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

interface UpdateLPAQuestionaireValidationOutcomeParams {
	appeal: {
		id: number;
		appealStatus: AppealStatus[];
		appealType: AppealType;
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
	appealId: number | null;
	appealReference: string;
	linkingDate: Date;
	appealType?: string;
	relationshipId: number;
	externalSource: boolean;
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
	addressId?: number;
	addressLine1?: string;
	addressLine2?: string | null;
	town?: string;
	county?: string | null;
	postCode?: string | null;
}

interface AppealTimetable {
	appealTimetableId: number;
	finalCommentReviewDate?: Date | null;
	lpaQuestionnaireDueDate: Date | null;
	statementReviewDate?: Date | null;
	issueDeterminationDate?: Date | null;
	completeDate?: Date | null;
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

interface UpdateAppellantCaseRequest {
	appellantCaseValidationOutcomeId?: number;
	applicantFirstName?: string;
	applicantSurname?: string;
	areAllOwnersKnown?: boolean;
	hasAdvertisedAppeal?: boolean;
	doesSiteRequireInspectorAccess?: boolean;
	inspectorAccessDetails?: string;
	hasAttemptedToIdentifyOwners?: boolean;
	hasHealthAndSafetyIssues?: boolean;
	healthAndSafetyIssues?: string;
	isSiteFullyOwned?: boolean;
	isSitePartiallyOwned?: boolean;
	isSiteVisibleFromPublicRoad?: boolean;
	visibilityRestrictions?: string;
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

interface UpdateLPAQuestionaireValidationOutcomeParams {
	appeal: {
		id: number;
		appealStatus: AppealStatus[];
		appealType: AppealType;
		reference: string;
		lpa: LPA;
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

type UpdateDocumentsAvCheckRequest = {
	id: string;
	virusCheckStatus: string;
	version: number;
}[];

type ListedBuildingDetailsResponse = Pick<ListedBuildingDetails, 'listEntry'>[];

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
	UpdateLPAQuestionaireValidationOutcomeParams,
	UpdateLPAQuestionnaireRequest,
	UpdateTimetableRequest,
	UsersToAssign,
	ValidationOutcomeResponse,
	SetAppealDecisionRequest,
	SetInvalidAppealDecisionRequest,
	AppealRelationshipRequest,
	ServiceUserResponse
};
