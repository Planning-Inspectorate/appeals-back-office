import { mapEnforcementAppealOtherAppellants } from './map-appeal-other-appellants.js';
import { mapEnforcementAppellantCase } from './map-appellant-case.js';

export const apiEnforcementMappers = {
	appellantCase: mapEnforcementAppellantCase,
	otherAppellants: mapEnforcementAppealOtherAppellants
};
