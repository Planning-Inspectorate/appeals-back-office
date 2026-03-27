import { mapEnforcementAppealGrounds } from '../enforcement/map-appeal-grounds.js';
import { mapEnforcementAppealOtherAppellants } from '../enforcement/map-appeal-other-appellants.js';
import { mapEnforcementListedAppellantCase } from './map-appellant-case.js';
import { mapEnforcementListedLpaQuestionnaire } from './map-lpa-questionnaire.js';

export const apiEnforcementListedMappers = {
	appellantCase: mapEnforcementListedAppellantCase,
	otherAppellants: mapEnforcementAppealOtherAppellants,
	appealGrounds: mapEnforcementAppealGrounds,
	lpaQuestionnaire: mapEnforcementListedLpaQuestionnaire
};
