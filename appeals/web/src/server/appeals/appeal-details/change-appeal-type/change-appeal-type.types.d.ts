export interface ChangeAppealTypeRequest {
	appealTypeId: number;
	resubmit?: boolean;
	appealTypeFinalDate?: Date | null;
	transferredAppealHorizonReference?: string;
	day?: string;
	month?: string;
	year?: string;
}
