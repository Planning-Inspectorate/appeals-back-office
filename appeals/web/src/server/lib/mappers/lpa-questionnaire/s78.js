import { submaps as hasSubmaps } from './has.js';
import { mapEiaColumnTwoThreshold } from './submappers/map-eia-column-two-threshold.js';
import { mapEiaRequiresEnvironmentalStatement } from './submappers/map-eia-requires-environmental-statement.js';
import { mapTreePreservationPlan } from './submappers/map-tree-preservation-plan.js';

export const submaps = {
	...hasSubmaps,
	eiaColumnTwoThreshold: mapEiaColumnTwoThreshold,
	eiaRequiresEnvironmentalStatement: mapEiaRequiresEnvironmentalStatement,
	treePreservationPlan: mapTreePreservationPlan
};
