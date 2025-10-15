import { submaps as casPlanningSubMaps } from './cas-planning.js';
import { mapEmergingPlan } from './submappers/map-emerging-plan.js';
import { mapPlansDrawings } from './submappers/map-plans-drawings.js';

export const submaps = {
	...casPlanningSubMaps,
	plansDrawings: mapPlansDrawings,
	emergingPlan: mapEmergingPlan
};
