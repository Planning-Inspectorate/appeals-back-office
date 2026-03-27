import { NotValidReasonResponse } from '../appeal-details.types';

export type AppellantCaseValidationOutcome = 'valid' | 'invalid' | 'incomplete' | 'continue';

export interface AppellantCaseNotValidReasonRequest {
	id: number;
	text?: string[];
}

export interface AppellantCaseValidationOutcomeRequest {
	validationOutcome: AppellantCaseValidationOutcome;
	invalidReasons?: AppellantCaseNotValidReasonRequest[];
	incompleteReasons?: AppellantCaseNotValidReasonRequest[];
	appealDueDate?: string;
	otherLiveAppeals?: string;
	enforcementNoticeInvalid?: string;
}

export interface AppellantCaseValidationOutcomeResponse {
	outcome: AppellantCaseValidationOutcome;
	invalidReasons?: NotValidReasonResponse[];
	incompleteReasons?: NotValidReasonResponse[];
}

interface DueDate {
	day: string;
	month: string;
	year: string;
}

export interface AppellantCaseSessionValidationOutcome {
	appealId: string;
	validationOutcome: AppellantCaseValidationOutcome;
	reasons?: string | string[];
	reasonsText?: Object<string, string[]>;
	incompleteReasons?: Object<string, string[]>;
	// enforcement fields
	enforcementNoticeInvalid?: string;
	missingDocuments?: string | string[];
	missingDocumentsText?: Object<string, string[]>;
	enforcementGroundsMismatchText?: Array<{ id: number; text: string[]; name: string }>;
	updatedDueDate?: DueDate;
	feeReceiptDueDate?: DueDate;
}
