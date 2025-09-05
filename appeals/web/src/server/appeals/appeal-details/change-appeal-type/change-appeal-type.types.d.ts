export interface ChangeAppealTypeRequest {
	appealTypeId: number;
	resubmit?: boolean;
	appealTypeFinalDate?: Date | null;
	transferredAppealHorizonReference?: string;
}
