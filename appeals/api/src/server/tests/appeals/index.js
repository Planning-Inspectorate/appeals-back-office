import enforcement from './enforcement.js';
import has from './has.js';
import ldc from './ldc.js';
import s20 from './s20.js';
import s78 from './s78.js';

export const mocks = {
	householdAppeal: has,
	s78Appeal: s78,
	s20Appeal: s20,
	enforcementAppeal: enforcement,
	ldcAppeal: ldc
};
