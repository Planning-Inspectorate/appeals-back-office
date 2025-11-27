import { Address } from '@pins/appeals';

export type RepresentationStatus = 'awaiting_review' | 'published' | 'valid' | 'invalid';
export type RedactionStatus = 'redacted' | 'unredacted' | 'not-required';

export interface Represented {
	id: number;
	name: string;
	email: string;
	address: Address;
}

export interface Representation {
	id: number;
	origin: string;
	author: string;
	status: RepresentationStatus;
	originalRepresentation: string;
	redactedRepresentation: string;
	created: string;
	notes: string;
	attachments: any[];
	represented: Represented;
	representationType: string;
	siteVisitRequested: boolean;
	source: string;
	rejectionReasons: RepresentationRejectionReason[];
}

export interface RepresentationList {
	itemCount: number;
	items: IPComments[];
	statuses: string[];
	page: number;
	pageCount: number;
	pageSize: number;
}

export interface RepresentationRejectionReason {
	/** @example 1 */
	id: number;
	/** @example "Illegible or Incomplete Documentation" */
	name: string;
	/** @example true */
	hasText: boolean;
	/** List of selected rejection reasons for a representation */
	text?: string[];
}

export interface RejectionReasonUpdateInput {
	/** @example 1 */
	id: number;
	/** List of selected rejection reasons for a representation */
	text?: string[];
}

export interface RejectionReasons {
	rejectionReason?: string | string[];
	[key: string]: string | string[] | undefined;
}

export interface interestedPartyComment {
	firstName: string;
	lastName: string;
	addressProvided: string;
	emailAddress: string;
	addressLine1: string;
	addressLine2: string;
	town: string;
	county: string;
	postCode: string;
	redactionStatus: boolean;
	'date-day': string;
	'date-month': string;
	'date-year': string;
}

export interface RepresentationRequest {
	ipDetails?: {
		firstName: string;
		lastName: string;
		email: string;
	};
	ipAddress?: Address;
	attachments: any[];
	redactionStatus: string;
	dateCreated: string;
	source: 'citizen' | 'lpa' | ODW_SYSTEM_ID;
	representationText?: string;
}
