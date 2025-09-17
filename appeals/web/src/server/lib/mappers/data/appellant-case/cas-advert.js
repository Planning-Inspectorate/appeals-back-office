import { submaps as hasSubmaps } from './has.js';
import { mapAdvertisementDescription } from './submappers/advertisement-description.js';
import { mapAdvertisementInPosition } from './submappers/advertisement-in-position.js';
import { mapChangedAdvertisementDescriptionDocument } from './submappers/changed-advertisement-description-document.js';
import { mapDesignAccessStatement } from './submappers/design-access-statement.js';
import { mapHighwayLand } from './submappers/highway-land.js';
import { mapSupportingDocuments } from './submappers/supporting-documents.js';

export const submaps = {
	...hasSubmaps,
	highwayLand: mapHighwayLand,
	supportingDocuments: mapSupportingDocuments,
	designAndAccessStatement: mapDesignAccessStatement,
	changedAdvertisementDescriptionDocument: mapChangedAdvertisementDescriptionDocument,
	advertisementDescription: mapAdvertisementDescription,
	advertisementInPosition: mapAdvertisementInPosition
};
