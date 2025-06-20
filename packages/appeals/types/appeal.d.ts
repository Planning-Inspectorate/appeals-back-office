export interface Address {
	addressId?: number;
	addressLine1?: string;
	addressLine2?: string;
	town?: string;
	county?: string;
	postCode: string;
}

export interface AppealSummary {
	appealId: number;
	appealReference: string;
	appealStatus: string;
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
}

export interface AppealList {
	itemCount: number;
	items: AppealSummary[];
	statuses: string[];
	statusesInNationalList: string[];
	lpas: { name: string; lpaCode: string }[];
	inspectors: { azureAdUserId: string; id: number }[];
	caseOfficers: { azureAdUserId: string; id: number }[];
	page: number;
	pageCount: number;
	pageSize: number;
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
