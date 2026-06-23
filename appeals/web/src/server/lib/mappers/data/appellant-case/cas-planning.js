import { submaps as hasSubmaps } from './has.js';
import { mapSupportingDocuments } from './submappers/supporting-documents.js';

export const submaps = {
	...hasSubmaps,
	supportingDocuments: mapSupportingDocuments
};
