import { mapAppellantCase } from './map-appellant-case.js';
import { mapCaseDates } from './map-case-dates.js';
import { mapLpaQuestionnaire } from './map-lpa-questionnaire.js';

export const integrationS78Mappers = {
	appellantCase: mapAppellantCase,
	lpaQuestionnaire: mapLpaQuestionnaire,
	caseDates: mapCaseDates
};
