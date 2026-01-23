import { submaps as advertSubmaps } from './advert.js';
import { mapNewPlansDrawings } from './submappers/new-plans-drawings.js';
import { mapOtherNewDocuments } from './submappers/other-new-documents.js';
import { mapPlanningObligation } from './submappers/planning-obligation.js';
import { mapStatusPlanningObligation } from './submappers/status-planning-obligation.js';

const keysToRemove = [
	'highwayLand',
	'advertisementInPosition',
	'siteOwnership',
	'ownersKnown',
	'landownerPermission',
	'advertisementDescription',
	'changedAdvertisementDescriptionDocument'
];

const advertLdcSubmaps = Object.fromEntries(
	Object.entries(advertSubmaps).filter(([key]) => !keysToRemove.includes(key))
);

export const submaps = {
	...advertLdcSubmaps,
	planningObligation: mapPlanningObligation,
	statusPlanningObligation: mapStatusPlanningObligation,
	newPlansDrawings: mapNewPlansDrawings,
	otherNewDocuments: mapOtherNewDocuments
};
