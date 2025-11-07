import { mapCasAdvertLpaQuestionnaire } from '../cas-advert/map-lpa-questionnaire.js';
import { mapAdvertAppellantCase } from './map-appellant-case.js';

export const apiAdvertMappers = {
	appellantCase: mapAdvertAppellantCase,
	lpaQuestionnaire: mapCasAdvertLpaQuestionnaire // no additions, changed listed building handled outside
};
