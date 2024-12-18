import { CurrentPermissionSet } from '#environment/permissions';

export interface CheckboxRadioConditionalHtmlParameter {
	html?: string;
}

export interface CheckboxItemParameter {
	value: string;
	text: string;
	conditional?: CheckboxRadioConditionalHtmlParameter;
	checked?: boolean;
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

declare global {
	namespace Express {
		interface Request {
			currentFolder: Schema.Folder;
			currentAppeal: Appeal;
			currentComment: Representation;
			currentRepresentation: Representation;
			apiClient: import('got').Got;
			permissions: CurrentPermissionSet;
		}
	}
}
