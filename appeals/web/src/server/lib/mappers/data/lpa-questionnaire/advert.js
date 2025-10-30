import { submaps as casAdvertsSubMaps } from './cas-advert.js';
import { mapChangedListedBuildingDetails } from './submappers/map-changed-listed-building-details.js';

export const submaps = {
	...casAdvertsSubMaps,
	changedListedBuildingDetails: mapChangedListedBuildingDetails
};
