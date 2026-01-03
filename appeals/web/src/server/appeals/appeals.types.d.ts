import { CurrentPermissionSet } from '#environment/permissions';
import { Representation } from './appeal-details/representations/types';

export interface CheckboxRadioConditionalHtmlParameter {
	html?: string;
}

export interface CheckboxItemParameter {
	value: string;
	text: string;
	conditional?: CheckboxRadioConditionalHtmlParameter;
	checked?: boolean;
	error?: object;
}

export interface SelectItemParameter {
	value: string;
	text: string;
	checked?: boolean;
}

export interface DayMonthYearHourMinute {
	day?: number | string;
	month?: number | string; // 1-based, i.e. January === 1 (Date stores this as 0-based value, eg. Date.getMonth() called on a date in January will return 0)
	year?: number | string;
	hour?: number | string;
	minute?: number | string;
}

export type DocumentVirusCheckStatus = 'not_scanned' | 'scanned' | 'affected';
export type DocumentRowDisplayMode = 'none' | 'number' | 'list';

export interface RepresentationTypesAwaitingReview {
	ipComments: boolean;
	appellantFinalComments: boolean;
	lpaFinalComments: boolean;
	lpaStatement: boolean;
}

export interface AppealType {
	id: number;
	type: string;
	key: string;
	processCode: string | null;
	changeAppealType: string;
}

export interface AppealProcedureType {
	id: number;
	name: string;
	key: string;
}

declare global {
	namespace Express {
		interface Request {
			currentFolder: Schema.Folder;
			currentAppeal: Appeal;
			currentRepresentation: Representation;
			currentRule6Party: import('./appeal-details/appeal-details.types').AppealRule6Party;
			apiClient: import('got').Got;
			permissions: CurrentPermissionSet;
		}
	}
}
