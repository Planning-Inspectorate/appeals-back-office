export interface InspectorDecisionRequest {
	outcome?: string;
	letterDate?: Date | null;
	invalidReason?: string;
}

export interface AppellantCostsDecisionRequest {
	outcome?: string;
}

export interface LpaCostsDecisionRequest {
	outcome?: string;
}
