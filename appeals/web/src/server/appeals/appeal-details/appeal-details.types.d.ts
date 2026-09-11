import { Address } from '@pins/appeals';
import { SiteVisit } from '@pins/appeals.api/src/database/schema';
import {
	AppealTimetable,
	DocumentationSummary,
	DocumentationSummaryEntry,
	FolderInfo,
	SingleAppealDetailsResponse
} from '@pins/appeals.api/src/server/endpoints/appeals';

export interface AppealHealthAndSafetyEntry {
	details: string | null;
	hasIssues: boolean | null;
}

export interface AppealHealthAndSafety {
	appellantCase: AppealHealthAndSafetyEntry;
	lpaQuestionnaire: AppealHealthAndSafetyEntry;
}

export interface AppealAllocationDetails {
	level: string;
	band: number;
	specialisms: string[];
}

export type Contact = {
	name: string;
	email: string;
	phone: string;
};

export type AppealLink = {
	appealId: number;
	appealReference: string;
};

export type AppealTimetable = {
	finalCommentReviewDate: string | null;
	lpaQuestionnaireDueDate: string | null;
	statementReviewDate: string | null;
	issueDeterminationDate: string | null;
	completeDate: string | null;
};

export type AppealSiteVisit = {
	siteVisitId: number | null;
	visitType: string | null;
	visitDate: string | null;
	visitStartTime?: string | null;
	visitEndTime?: string | null;
};

export type DocumentStatus = 'received' | 'not_received' | 'incomplete' | 'invalid' | 'valid';

export type AppealDocumentationSummaryItem = {
	status: DocumentStatus;
	dueDate: string | null;
};

export type AppealDocumentationSummary = {
	appellantCase: AppealDocumentationSummaryItem;
	lpaQuestionnaire: AppealDocumentationSummaryItem;
};

export type AppealInspectorAccessEntry = {
	details: string | null;
	isRequired: boolean | null;
};

export type AppealInspectorAccess = {
	appellantCase: AppealInspectorAccessEntry;
	lpaQuestionnaire: AppealInspectorAccessEntry;
};

export type AppealHealthAndSafetyEntry = {
	details: string | null;
	hasIssues: boolean | null;
};

export type AppealHealthAndSafety = {
	appellantCase: AppealHealthAndSafetyEntry;
	lpaQuestionnaire: AppealHealthAndSafetyEntry;
};

export interface LpaQuestionnaire {
	constraints: LpaQuestionnaireFullAppealConstraints;
	environmentalImpact: LpaQuestionnaireFullAppealEnvironmentalImpact;
	notifyingPeople: LpaQuestionnaireFullAppealNotifyingPeople;
	consultationResponse: LpaQuestionnaireFullAppealConsultationResponses;
	planningOfficerReportAndPolicies: LpaQuestionnaireFullAppealReportAndPolicies;
	siteAccess: LpaQuestionnaireFullAppealSiteAccess;
	appealProcess: LpaQuestionnaireFullAppealProcess;
}

export type LpaQuestionnaireFullAppealConstraints = {
	isListedBuilding: boolean;
	// listedBuilding: Yes
	listedBuildingDetails?: ListedBuildingDetail;
	affectsListedBuilding: boolean;
	// affectsListedBuilding: Yes
	affectsListedBuildingDetails?: ListedBuildingDetail;
	affectsScheduledMonument: boolean;
	inConservationArea: ConservationAreaOption;
	// inConservationArea: In a conservation area || Next to a conservation area
	conservationAreaMapAndGuidanceDocument?: AppealDocument;
	protectedSpecies: boolean;
	greenBelt: boolean;
	areaOfOutstandingBeauty: boolean;
	designatedSites: DesignatedSite[] | string[];
	treePreservationOrder: boolean;
	// treePreservationOrder: Yes
	treePreservationOrderDocument?: AppealDocument;
	gypsyOrTraveller: boolean;
	publicRightOfWay: boolean;
	// publicRightOfWay: Yes
	definitiveMapAndStatementDocument?: AppealDocument;
};

export type LpaQuestionnaireFullAppealEnvironmentalImpact = {
	scheduleType: ScheduleTypeOption;
	// ScheduleType 1 or environmentStatementNeeded: Yes
	environmentalStatementComplete?:
		| 'Yes, we did the environmental statement'
		| 'No, we have a negative screening direction';
	// Yes
	environmentStatementDocument?: AppealDocument;
	// No
	screeningDirectionDocument?: AppealDocument;
	// No or schedule 2
	issuedScreeningOpinion?: boolean;
	// Yes
	screeningOpinionDocument?: AppealDocument;
	environmentStatementNeeded?: boolean;
	// No -> No more questions
	// No
	applicantDidEnvironmentalStatement?: boolean;
	// No -> No more questions
	// Yes or environmentalStatementComplete: Yes
	responsesForEnvironmentalStatement?: AppealDocument;
	whoNotifiedSiteNotice?: AppealDocument;
	// ScheduleType 2
	developmentDescription?: DevelopmentDescription;
	affectSensitiveArea?: {
		answer: boolean;
		// Yes
		details?: string; //free form
	};
	meetsOrExceedsColumn2?: boolean;
};

export type LpaQuestionnaireFullAppealNotifyingPeople = {
	notificationMethod: NotificationMethodOptions;
	whoNotifiedSiteNotice?: AppealDocument;
	whoNotifiedLetterToNeighbours?: AppealDocument;
	whoNotifiedPressAdvert?: AppealDocument;
};

export type LpaQuestionnaireFullAppealConsultationResponses = {
	statutoryConsultees: {
		answer: boolean;
		details?: string;
	};
	responsesOrAdviceToUpload: boolean;
	responsesOrAdviceDocuments?: AppealDocument[];
	representationsFromOtherParties: boolean;
	representationsFromOtherPartiesDocuments?: AppealDocument[];
};

export type LpaQuestionnaireFullAppealReportAndPolicies = {
	officerReportDocument: AppealDocument;
	policiesDocuments: AppealDocument[];
	emergingPlan: boolean;
	//Yes
	emergingPlanDocuments?: AppealDocument[];
	otherPoliciesDocuments: AppealDocument[];
	hasSupplimentaryPlanningDocuments: boolean;
	//Yes
	supplimentaryPlanningDocuments?: AppealDocument[];
	communityInfrastructureLevy: boolean;
	//Yes
	communityInfrastructureLevyDocument?: AppealDocument;
	communityInfrastructureLevyAdopted?: boolean;
	communityInfrastructureLevyToBeAdoptedDate?: string;
};

export type LpaQuestionnaireFullAppealSiteAccess = {
	siteVisibility: boolean;
	inspectorAccess: {
		answer: boolean;
		details: string;
	};
	healthAndSafetyIssues: {
		answer: boolean;
		details?: string;
	};
};

export type LpaQuestionnaireFullAppealProcess = {
	procedureType: {
		type: ProcedureType;
		inquiryDays?: number;
	};
	otherAppeals: {
		answer: boolean;
		appealReferences?: string; // free form: more than one seperated by comma -> maybe converted to array??
	};
	statementOfCase: boolean;
};

export type ProcedureType = 'Written representations' | 'Hearing' | 'Inquiry';

export type NotificationMethodOptions =
	| 'A site notice'
	| 'Letter/email to interested parties'
	| 'A press advert';

export type DevelopmentDescription =
	| 'Agriculture and aquaculture'
	| 'Changes and extensions'
	| 'Chemical industry (unless included in Schedule 1)'
	| 'Energy industry'
	| 'Extractive industry'
	| 'Food industry'
	| 'Infrastructure projects'
	| 'Mineral industry'
	| 'Other projects'
	| 'Production and processing of metals'
	| 'Rubber industry'
	| 'Textile, leather, wood and paper industries'
	| 'Tourism and leisure';

export type ListedBuildingDetail = {
	grade: ListedBuildingGrade;
	description: string;
};

export type ListedBuildingGrade = 'Grade I';

export interface AppealDocument {
	Type: DocumentType;
	Filename: string;
	URL: string;
}

export type DocumentType =
	| 'plans used to reach decision'
	| 'statutory development plan policy'
	| 'other relevant policy'
	| 'supplementary planning document'
	| 'conservation area guidance'
	| 'listed building description'
	| 'application notification'
	| 'application publicity'
	| 'representation'
	| 'planning officers report'
	| 'appeal notification'
	| 'appeal statement'
	| 'decision letter'
	| 'planning application form'
	| 'supporting document';

export type ConservationAreaOption =
	| 'In a conservation area'
	| 'Next to a conservation area'
	| 'No, it is not in or next to a conservation area';

export type DesignatedSite =
	| 'SSSI (site of special scientific interest)'
	| 'cSAC (candidate special area of conservation)'
	| 'SAC (special area of conservation)'
	| 'pSPA (potential special protection area)'
	| 'SPA Ramsar (Ramsar special protection area)'
	| '	No, it is not in, near or likely to affect any designated sites';

export type ScheduleTypeOption = 'Yes, schedule 1' | 'Yes, schedule 2' | 'No';

interface SingleLPAQuestionnaireResponse {
	lpaQuestionnaireId: number;
	appealId: number;
	appealReference: string;
	appealSite: AppealSite;
	localPlanningDepartment?: string;
	procedureType?: string;
	designatedSiteNames?:
		| {
				id: number;
				key?: string;
				name: string;
		  }[]
		| null;
	documents: {
		whoNotified?: FolderInfo | null;
		whoNotifiedSiteNotice?: FolderInfo | null;
		whoNotifiedLetterToNeighbours?: FolderInfo | null;
		whoNotifiedPressAdvert?: FolderInfo | null;
		conservationMap?: FolderInfo | null;
		lpaCaseCorrespondence?: FolderInfo | null;
		otherPartyRepresentations?: FolderInfo | null;
		planningOfficerReport?: FolderInfo | null;
		plansDrawings?: FolderInfo | null;
		additionalDocumentsLPA?: FolderInfo | null;
		designAccessStatementLPA?: FolderInfo | null;
		plansDrawingsLPA?: FolderInfo | null;
		developmentPlanPolicies?: FolderInfo | null;
		treePreservationPlan?: FolderInfo | null;
		definitiveMapStatement?: FolderInfo | null;
		communityInfrastructureLevy?: FolderInfo | null;
		supplementaryPlanning?: FolderInfo | null;
		emergingPlan?: FolderInfo | null;
		consultationResponses?: FolderInfo | null;
		eiaEnvironmentalStatement?: FolderInfo | null;
		eiaScreeningOpinion?: FolderInfo | null;
		eiaScopingOpinion?: FolderInfo | null;
		eiaScreeningDirection?: FolderInfo | null;
		otherRelevantPolicies?: FolderInfo | null;
		appealNotification?: FolderInfo | null;
		historicEnglandConsultation?: FolderInfo | null;
		relatedApplications: FolderInfo | null;
		otherRelevantMatters: FolderInfo | null;
		// Enforcement
		enforcementList?: FolderInfo | null;
		stopNotice?: FolderInfo | null;
		article4Direction?: FolderInfo | null;
		localDevelopmentOrder?: FolderInfo | null;
		planningPermission: FolderInfo | null;
		lpaEnforcementNotice: FolderInfo | null;
		lpaEnforcementNoticePlan: FolderInfo | null;
		planningContraventionNotice: FolderInfo | null;
	};
	validation?: ValidationOutcomeResponse | null;
	lpaNotificationMethods?: LPANotificationMethodDetails[] | null;
	listedBuildingDetails?: ListedBuildingDetailsResponse[] | null;
	healthAndSafety?: {
		hasIssues: boolean;
		details: string | null;
	} | null;
	siteAccessRequired?: {
		isRequired: boolean;
		details: string | null;
	} | null;
	doesSiteHaveHealthAndSafetyIssues?: boolean | null;
	inspectorAccessDetails?: string | null;
	doesSiteRequireInspectorAccess?: boolean | null;
	isConservationArea?: boolean | null;
	isGreenBelt?: boolean | null;
	isCorrectAppealType?: boolean | null;
	submittedAt?: Date | null;
	receivedAt?: string | null;
	otherAppeals?: RelatedAppeal[] | null;
	costsAppliedFor?: boolean | null;
	lpaStatement?: string | null;
	extraConditions?: string | null;
	hasExtraConditions?: boolean | null;
	eiaColumnTwoThreshold?: boolean | null;
	eiaRequiresEnvironmentalStatement?: boolean | null;
	eiaEnvironmentalImpactSchedule?: string | null;
	eiaDevelopmentDescription?: string | null;
	affectsScheduledMonument?: boolean;
	hasProtectedSpecies?: boolean;
	isAonbNationalLandscape?: boolean;
	isGypsyOrTravellerSite?: boolean;
	hasInfrastructureLevy?: boolean;
	isInfrastructureLevyFormallyAdopted?: boolean;
	infrastructureLevyAdoptedDate: string | null;
	infrastructureLevyExpectedDate: string | null;
	lpaProcedurePreference: string | null;
	lpaProcedurePreferenceDetails: string | null;
	lpaProcedurePreferenceDuration: number | null;
	eiaSensitiveAreaDetails: string | null;
	consultedBodiesDetails: string | null;
	reasonForNeighbourVisits: string | null;
	preserveGrantLoan?: boolean;
	isSiteInAreaOfSpecialControlAdverts?: boolean;
	wasApplicationRefusedDueToHighwayOrTraffic?: boolean;
	didAppellantSubmitCompletePhotosAndPlans?: boolean;
	noticeRelatesToBuildingEngineeringMiningOther?: boolean | null;
	changeOfUseRefuseOrWaste?: boolean | null;
	changeOfUseMineralExtraction?: boolean | null;
	changeOfUseMineralStorage?: boolean | null;
	relatesToErectionOfBuildingOrBuildings?: boolean | null;
	relatesToBuildingWithAgriculturalPurpose?: boolean | null;
	relatesToBuildingSingleDwellingHouse?: boolean | null;
	affectedTrunkRoadName?: string | null;
	isSiteOnCrownLand?: boolean | null;
	article4AffectedDevelopmentRights?: string | null;
	siteAreaSquareMetres?: number | null;
	areaOfAllegedBreachInSquareMetres?: number | null;
	floorSpaceCreatedByBreachInSquareMetres?: number | null;
	appealUnderActSection?: string | null;
	lpaConsiderAppealInvalid?: boolean;
	lpaAppealInvalidReasons?: string | null;
	listOfDocumentsBeforeDecision?: string | null;
	anySignificantChangesLpa?: string | null;
	anySignificantChangesLpa_otherSignificantChanges?: string | null;
	anySignificantChangesLpa_localPlanSignificantChanges?: string | null;
	anySignificantChangesLpa_nationalPolicySignificantChanges?: string | null;
	anySignificantChangesLpa_courtJudgementSignificantChanges?: string | null;
}

export type BodyValidationOutcome = Object<string, string | string[]>;

// The following types are required because the corresponding types defined in the API specify Date fields, but the dates are formatted as strings in the API response data

export interface WebAppealTimetable extends AppealTimetable {
	lpaQuestionnaireDueDate?: string | null;
	ipCommentsDueDate?: string | null;
	lpaStatementDueDate?: string | null;
	finalCommentsDueDate?: string | null;
	s106ObligationDueDate?: string | null;
	issueDeterminationDate?: string | null;
	statementOfCommonGroundDueDate?: string | null;
	planningObligationDueDate?: string | null;
	proofOfEvidenceAndWitnessesDueDate?: string | null;
	caseManagementConferenceDueDate?: string | null;
	completeDate?: string | null;
}

export interface WebSiteVisit extends SiteVisit {
	visitDate: string | null;
	siteVisitId: number | null;
	visitEndTime: string | null;
	visitStartTime: string | null;
	visitType: string | null;
}

export interface WebDocumentationSummaryEntry extends DocumentationSummaryEntry {
	status: string;
	dueDate: string | undefined | null;
	receivedAt: string | undefined | null;
	representationStatus: string | undefined | null;
	counts?: Record<string, number>;
	isRedacted?: boolean;
	organisationName?: string;
	rule6PartyId?: number;
}

export interface WebDocumentationSummary extends DocumentationSummary {
	appellantCase?: WebDocumentationSummaryEntry;
	lpaQuestionnaire?: WebDocumentationSummaryEntry;
	ipComments?: Omit<WebDocumentationSummaryEntry, 'dueDate'>;
	appellantFinalComments?: WebDocumentationSummaryEntry;
	lpaFinalComments?: WebDocumentationSummaryEntry;
	appellantProofOfEvidence?: WebDocumentationSummaryEntry;
	lpaProofOfEvidence?: WebDocumentationSummaryEntry;
	appellantStatement?: WebDocumentationSummaryEntry;
	rule6PartyStatements?: Record<string, WebDocumentationSummaryEntry>;
	rule6PartyProofsOfEvidence?: Record<string, WebDocumentationSummaryEntry>;
}

export interface AppealRule6Party {
	id: number;
	serviceUserId: number;
	serviceUser: WebServiceUser;
}

export interface WebAppeal extends SingleAppealDetailsResponse {
	lpaEmailAddress?: string;
	appealTimetable: WebAppealTimetable | null;
	siteAddress?: Address;
	createdAt: string | null;
	startedAt: string | null;
	validAt: string | null;
	documentationSummary: WebDocumentationSummary;
	source?: string;
	siteVisit: {
		siteVisitId: number | null;
		visitDate: string | null;
		visitStartTime: string | null;
		visitEndTime: string | null;
		visitType: string | null;
	};
	withdrawal: {
		withdrawalFolder?: FolderInfo | null;
		withdrawalRequestDate: string | null;
	};
	environmentalAssessment?: FolderInfo | null;
	supportingDocuments?: FolderInfo | null;
	inquiryEventDocuments?: FolderInfo | null;
	eiaEnvironmentalStatementAppellant?: FolderInfo | null;
	procedureType?: string | undefined;
	appealRule6Parties?: AppealRule6Party[] | null;
	isS78Expedited?: boolean;
	inquiryDocuments?: FolderInfo | null;
	hearingDocuments?: FolderIfo | null;
}

export interface WebServiceUser {
	id: number;
	organisationName?: string | null;
	firstName: string;
	middleName?: string | null;
	lastName: string;
	email?: string | null;
	phoneNumber?: string | null;
	addressId?: number | null;
}

export type Lpa = {
	id: number;
	name: string;
	lpaCode: string;
	email: string | null;
};

export type LpaChangeRequest = {
	newLpaId: number;
};
