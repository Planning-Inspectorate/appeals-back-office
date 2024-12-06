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
	localPlanningDepartment: string;
	dueDate: string;
	lpaQuestionnaireId?: number | null;
	dueDate: Date | null;
	appellantCaseStatus: string;
	lpaQuestionnaireStatus: string;
	documentationSummary: DocumentationSummary;
	isParentAppeal: boolean;
	isChildAppeal: boolean;
	commentCounts?: Record<string, number>;
}

export interface AppealList {
	itemCount: number;
	items: AppealSummary[];
	statuses: string[];
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
