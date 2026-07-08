import { submaps as s78Submaps } from './s78.js';
import { mapAnySignificantChangesLpa } from './submappers/map-any-significant-changes-lpa.js';
import { mapListOfDocumentsBeforeDecision } from './submappers/map-list-of-documents-before-decision.js';

export const submaps = {
	...s78Submaps,
	listOfDocumentsBeforeDecision: mapListOfDocumentsBeforeDecision,
	anySignificantChangesLpa: mapAnySignificantChangesLpa
};
