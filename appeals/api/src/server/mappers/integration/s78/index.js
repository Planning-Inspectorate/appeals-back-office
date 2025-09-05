import { mapCaseDates } from '../shared/s20s78/map-case-dates.js';
import { mapAppellantCase } from './map-appellant-case.js';
import { mapLpaQuestionnaire } from './map-lpa-questionnaire.js';

export const integrationS78Mappers = {
	appellantCase: mapAppellantCase,
	lpaQuestionnaire: mapLpaQuestionnaire,
	caseDates: mapCaseDates
};
