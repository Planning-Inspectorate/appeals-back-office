import { submaps as s78Submaps } from './s78.js';
import { mapGrantLoanToPreserve } from './submappers/map-grant-loan-preserve-listed-building.js';
import { mapHistoricEnglandConsultation } from './submappers/map-historic-england-consultation.js';

export const submaps = {
	...s78Submaps,
	grantLoanToPreserve: mapGrantLoanToPreserve,
	historicEnglandConsultation: mapHistoricEnglandConsultation
};
