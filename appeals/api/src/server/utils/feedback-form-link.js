import { FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

/**
 * @param {string | undefined} appealKey
 * @returns {string}
 */
export function getFeedbackLinkFromAppealTypeKey(appealKey) {
	switch (appealKey) {
		case APPEAL_CASE_TYPE.W: // S78
			return FEEDBACK_FORM_LINKS.S78;

		case APPEAL_CASE_TYPE.D: // HAS householder
			return FEEDBACK_FORM_LINKS.HAS;

		case APPEAL_CASE_TYPE.Y: // S20 listed building
			return FEEDBACK_FORM_LINKS.S20;

		case APPEAL_CASE_TYPE.ZP: // CAS Planning
			return FEEDBACK_FORM_LINKS.CAS_PLANNING;

		case APPEAL_CASE_TYPE.ZA: // CAS Adverts
			return FEEDBACK_FORM_LINKS.CAS_ADVERTS;

		case APPEAL_CASE_TYPE.H: // Full Adverts
			return FEEDBACK_FORM_LINKS.FULL_ADVERTS;

		case APPEAL_CASE_TYPE.C: // Enforcement notice
			return FEEDBACK_FORM_LINKS.ENFORCEMENT_NOTICE;

		case APPEAL_CASE_TYPE.X: // Lawful development certificate
			return FEEDBACK_FORM_LINKS.LAWFUL_DEVELOPMENT_CERTIFICATE;

		default:
			return FEEDBACK_FORM_LINKS.ALL;
	}
}
