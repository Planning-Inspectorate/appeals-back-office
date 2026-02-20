import { mapEnforcementAppealGrounds } from './map-appeal-grounds.js';
import { mapEnforcementAppealOtherAppellants } from './map-appeal-other-appellants.js';
import { mapEnforcementAppellantCase } from './map-appellant-case.js';
import { mapEnforcementListedLpaQuestionnaire } from './map-lpa-questionnaire.js';

export const apiEnforcementListedMappers = {
	appellantCase: mapEnforcementAppellantCase,
	otherAppellants: mapEnforcementAppealOtherAppellants,
	appealGrounds: mapEnforcementAppealGrounds,
	lpaQuestionnaire: mapEnforcementListedLpaQuestionnaire
};
