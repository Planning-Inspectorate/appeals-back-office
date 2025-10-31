import { submaps as hasSubmaps } from './has.js';
import { mapDesignAccessStatement } from './submappers/design-access-statement.js';
import { mapSiteArea } from './submappers/site-area.js';
import { mapSupportingDocuments } from './submappers/supporting-documents.js';

export const submaps = {
	...hasSubmaps,
	siteArea: mapSiteArea,
	supportingDocuments: mapSupportingDocuments,
	designAndAccessStatement: mapDesignAccessStatement
};
