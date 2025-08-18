import { submaps as hasSubmaps } from './has.js';
import { mapDesignAccessStatement } from './submappers/design-access-statement.js';
import { mapSupportingDocuments } from './submappers/supporting-documents.js';

export const submaps = {
	...hasSubmaps,
	supportingDocuments: mapSupportingDocuments,
	designAndAccessStatement: mapDesignAccessStatement
};
