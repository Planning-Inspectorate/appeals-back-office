import { submaps as s78Submaps } from './s78.js';
import { mapGrantLoanToPreserve } from './submappers/map-grant-loan-preserve-listed-building.js';
import { mapHistoricEnglandConsultation } from './submappers/map-historic-england-consultation.js';

// listOfDocumentsBeforeDecision is only relevant for S78 expedited cases — exclude it from S20
const s78SubmapsForS20 = Object.fromEntries(
	Object.entries(s78Submaps).filter(([key]) => key !== 'listOfDocumentsBeforeDecision')
);

export const submaps = {
	...s78SubmapsForS20,
	grantLoanToPreserve: mapGrantLoanToPreserve,
	historicEnglandConsultation: mapHistoricEnglandConsultation
};
