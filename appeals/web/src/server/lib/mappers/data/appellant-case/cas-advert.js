import { submaps as hasSubmaps } from './has.js';
import { mapAdvertisementDescription } from './submappers/advertisement-description.js';
import { mapChangedAdvertisementDescriptionDocument } from './submappers/changed-advertisement-description-document.js';
import { mapDesignAccessStatement } from './submappers/design-access-statement.js';
import { mapSupportingDocuments } from './submappers/supporting-documents.js';

export const submaps = {
	...hasSubmaps,
	supportingDocuments: mapSupportingDocuments,
	designAndAccessStatement: mapDesignAccessStatement,
	changedAdvertisementDescriptionDocument: mapChangedAdvertisementDescriptionDocument,
	advertisementDescription: mapAdvertisementDescription
};
