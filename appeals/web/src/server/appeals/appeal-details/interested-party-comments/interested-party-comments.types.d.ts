import { Address } from '@pins/appeals';
import { NotValidReasonOption, NotValidReasonResponse } from '../appeal-details.types';

export type RepresentationStatus = 'awaiting_review' | 'valid' | 'invalid';

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
