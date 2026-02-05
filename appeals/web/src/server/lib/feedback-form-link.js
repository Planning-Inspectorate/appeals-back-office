import { APPEAL_TYPE, FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';

/**
 * @param {string} appealName
 * @returns {string}
 */
export function getFeedbackLinkFromAppealTypeName(appealName) {
	switch (appealName) {
		case APPEAL_TYPE.S78: // S78
			return FEEDBACK_FORM_LINKS.S78;

		case APPEAL_TYPE.HOUSEHOLDER: // HAS householder
			return FEEDBACK_FORM_LINKS.HAS;

		case APPEAL_TYPE.PLANNED_LISTED_BUILDING: // S20 listed building
			return FEEDBACK_FORM_LINKS.S20;

		case APPEAL_TYPE.CAS_PLANNING: // CAS Planning
			return FEEDBACK_FORM_LINKS.CAS_PLANNING;

		case APPEAL_TYPE.CAS_ADVERTISEMENT: // CAS Adverts
			return FEEDBACK_FORM_LINKS.CAS_ADVERTS;

		case APPEAL_TYPE.ADVERTISEMENT: // Full Adverts
			return FEEDBACK_FORM_LINKS.FULL_ADVERTS;

		case APPEAL_TYPE.ENFORCEMENT_NOTICE: // Enforcement notice
			return FEEDBACK_FORM_LINKS.ENFORCEMENT_NOTICE;

		case APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE: // Lawful development certificate
			return FEEDBACK_FORM_LINKS.LAWFUL_DEVELOPMENT_CERTIFICATE;

		default:
			return FEEDBACK_FORM_LINKS.ALL;
	}
}
