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
}

export interface RepresentationList {
	itemCount: number;
	items: IPComments[];
	statuses: string[];
	page: number;
	pageCount: number;
	pageSize: number;
}
