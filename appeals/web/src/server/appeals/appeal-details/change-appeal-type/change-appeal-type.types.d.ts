export interface ChangeAppealTypeRequest {
	appealId: string;
	appealTypeId: string;
	resubmit?: boolean;
	appealTypeFinalDate?: Date | null;
	appealTypeIdsToFilter?: Array<string>;
}
