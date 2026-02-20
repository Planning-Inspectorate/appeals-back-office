import { removeQuestions } from './common.js';
import { submaps as enforcementSubmaps } from './enforcement.js';

// ELB Submappers
import { mapGrantLoanToPreserve } from './submappers/map-grant-loan-preserve-listed-building.js';
import { mapHistoricEnglandConsultation } from './submappers/map-historic-england-consultation.js';

export const submaps = {
	// Enforcement common
	...removeQuestions(
		[
			'withinTrunkRoadDistance',
			'isSiteOnCrownLand',
			'stopNotice',
			'article4Direction',
			'removedPermittedDevelopmentRights',
			'planningContraventionNotice',
			'changeOfUseRefuseOrWaste',
			'changeOfUseMineralExtraction',
			'changeOfUseMineralStorage'
		],
		enforcementSubmaps
	),

	// ELB
	preserveGrantLoan: mapGrantLoanToPreserve,
	consultHistoricEngland: mapHistoricEnglandConsultation
};
