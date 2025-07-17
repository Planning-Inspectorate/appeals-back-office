import { mapAppellantCase } from './map-appellant-case.js';
import { mapLpaQuestionnaire } from './map-lpa-questionnaire.js';
import { mapCaseDates } from '../shared/s20s78/map-case-dates.js';

export const integrationS20Mappers = {
	appellantCase: mapAppellantCase,
	lpaQuestionnaire: mapLpaQuestionnaire,
	caseDates: mapCaseDates
};
