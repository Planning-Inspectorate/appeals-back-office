import { mapEnforcementAppealGrounds } from './map-appeal-grounds.js';
import { mapEnforcementAppealOtherAppellants } from './map-appeal-other-appellants.js';
import { mapEnforcementAppellantCase } from './map-appellant-case.js';
import { mapEnforcementLpaQuestionnaire } from './map-lpa-questionnaire.js';

export const apiEnforcementMappers = {
	appellantCase: mapEnforcementAppellantCase,
	otherAppellants: mapEnforcementAppealOtherAppellants,
	appealGrounds: mapEnforcementAppealGrounds,
	lpaQuestionnaire: mapEnforcementLpaQuestionnaire
};
