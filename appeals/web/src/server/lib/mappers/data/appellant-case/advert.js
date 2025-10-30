import { submaps as casAdvertSubmaps } from './cas-advert.js';
import { mapInquiryNumberOfWitnesses } from './submappers/inquiry-number-of-witnesses.js';
import { mapProcedurePreferenceDetails } from './submappers/procedure-preference-details.js';
import { mapProcedurePreferenceDuration } from './submappers/procedure-preference-duration.js';
import { mapProcedurePreference } from './submappers/procedure-preference.js';

export const submaps = {
	...casAdvertSubmaps,
	procedurePreferenceDuration: mapProcedurePreferenceDuration,
	procedurePreference: mapProcedurePreference,
	procedurePreferenceDetails: mapProcedurePreferenceDetails,
	inquiryNumberOfWitnesses: mapInquiryNumberOfWitnesses
};
