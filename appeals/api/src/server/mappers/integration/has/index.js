import { mapAppellantCase } from './map-appellant-case.js';
import { mapLpaQuestionnaire } from './map-lpa-questionnaire.js';

export const integrationHasMappers = {
	appellantCase: mapAppellantCase,
	lpaQuestionnaire: mapLpaQuestionnaire
};
