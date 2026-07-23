export interface CostsDecision {
	awaitingAppellantCostsDecision: boolean;
	awaitingLpaCostsDecision: boolean;
}

export interface Address {
	addressId?: number;
	addressLine1?: string;
	addressLine2?: string;
	town?: string;
	county?: string;
	postCode: string;
}

export interface ContactAddress {
	addressId?: number;
	addressLine1?: string;
	addressLine2?: string;
	addressTown?: string;
	addressCounty?: string;
	addressCountry?: string;
	postCode: string;
}

export interface AppealSummary {
	appealId: number;
	appealReference: string;
	appealStatus: string;
	appealSiteId: number;
	appealSite: Address;
	appealType: string;
	procedureType?: string | undefined;
	localPlanningDepartment: string;
	dueDate: string;
	lpaQuestionnaireId?: number | null;
	dueDate: Date | null;
	appellantCaseStatus: string;
	lpaQuestionnaireStatus: string;
	documentationSummary: DocumentationSummary;
	isParentAppeal: boolean;
	isChildAppeal: boolean;
	planningApplicationReference: string | null;
	enforcementReference?: string | null;
	numberOfResidencesNetChange?: number | null;
	isS78Expedited?: boolean;
}

export interface AppealList {
	itemCount: number;
	items: AppealListItem[];
	statuses: string[];
	statusesInNationalList: string[];
	lpas: { name: string; lpaCode: string }[];
	inspectors: { azureAdUserId: string; id: number }[];
	caseOfficers: { azureAdUserId: string; id: number }[];
	padsInspectors: { sapId: string; id: number; name: string }[];
	page: number;
	pageCount: number;
	pageSize: number;
}

export interface AppealListItem {
	appealId: number;
	appealReference: string;
	appealSite: Address;
	appealStatus: string;
	appealType?: string;
	procedureType?: string;
	createdAt: Date;
	localPlanningDepartment: string;
	appealTimetable?: AppealTimetable;
	documentationSummary: DocumentationSummary;
	planningApplicationReference: string | null;
	isHearingSetup: boolean | null;
	hasHearingAddress: boolean | null;
	numberOfResidencesNetChange: number | null;
	isInquirySetup: boolean | null;
	hasInquiryAddress: boolean | null;
	enforcementReference?: string | null;
	isS78Expedited?: boolean;
}

export interface PersonalList {
	itemCount: number;
	items: PersonalListItem[];
	statuses: string[];
	page: number;
	pageCount: number;
	pageSize: number;
}

export interface PersonalListItem {
	appealId: number;
	appealReference: string;
	appealStatus: string;
	completedStateList: string[];
	appealType?: string;
	procedureType?: string;
	lpaQuestionnaireId?: number | null;
	documentationSummary: DocumentationSummary;
	dueDate?: string | null;
	appealTimetable?: AppealTimetable;
	isParentAppeal: boolean | null;
	isChildAppeal: boolean | null;
	isHearingSetup: boolean | null;
	hasHearingAddress: boolean | null;
	awaitingLinkedAppeal: boolean | null;
	costsDecision?: CostsDecision | null;
	numberOfResidencesNetChange: number | null;
	isInquirySetup: boolean | null;
	hasInquiryAddress: boolean | null;
	enforcementNoticeInvalid?: string | null;
	isS78Expedited?: boolean;
}

export interface DocumentationSummary {
	appellantCase?: DocumentationSummaryEntry;
	lpaQuestionnaire?: DocumentationSummaryEntry;
	ipComments?: DocumentationSummaryEntry;
	lpaStatement?: DocumentationSummaryEntry;
	rule6PartyStatements?: { [serviceUserId: string]: DocumentationSummaryEntry };
	lpaFinalComments?: DocumentationSummaryEntry;
	appellantFinalComments?: DocumentationSummaryEntry;
	lpaProofOfEvidence?: DocumentationSummaryEntry;
	appellantProofOfEvidence?: DocumentationSummaryEntry;
	rule6PartyProofs?: { [serviceUserId: string]: DocumentationSummaryEntry };
	appellantStatement?: DocumentationSummaryEntry;
}

export interface DocumentationSummaryEntry {
	status: string;
	dueDate?: string | undefined | null;
	receivedAt?: string | undefined | null;
	representationStatus?: string | undefined | null;
	counts?: Record<string, number>;
	isRedacted?: boolean;
	organisationName?: string;
	rule6PartyId?: number;
}

export interface AppealTimetable {
	appealTimetableId?: number | null;
	caseResubmissionDueDate?: string | null;
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
}

export interface PaginationItem {
	number?: number;
	href?: string;
	current?: boolean;
	ellipsis?: boolean;
}

export interface Pagination {
	items: PaginationItem[];
	previous: PaginationItem;
	next: PaginationItem;
}

export type BankHolidayFeedDivisions =
	| 'england-and-wales'
	| 'northern-ireland'
	| 'scotland'
	| 'united-kingdom';

interface BankHolidayFeedEvent {
	title: string;
	date: string;
	notes: string;
}

export interface BankHolidayFeedEvents extends Array<BankHolidayFeedEvent> {}

export interface TimetableDeadlineDate {
	[key: string]: Date;
}
