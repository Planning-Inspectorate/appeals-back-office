export interface InspectorDecisionRequest {
	outcome?: string;
	letterDate?: Date | null;
	invalidReason?: string;
}

export interface AppellantCostDecisionRequest {
	outcome?: string;
}
