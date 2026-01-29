import { getFeedbackLinkFromAppealTypeName } from '#lib/feedback-form-link.js';
import { APPEAL_TYPE, FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';

describe('getFeedbackLinkFromAppealTypeName', () => {
	test('S78', () => {
		expect(getFeedbackLinkFromAppealTypeName(APPEAL_TYPE.S78)).toBe(FEEDBACK_FORM_LINKS.S78);
	});

	test('HAS', () => {
		expect(getFeedbackLinkFromAppealTypeName(APPEAL_TYPE.HOUSEHOLDER)).toBe(
			FEEDBACK_FORM_LINKS.HAS
		);
	});

	test('S20', () => {
		expect(getFeedbackLinkFromAppealTypeName(APPEAL_TYPE.PLANNED_LISTED_BUILDING)).toBe(
			FEEDBACK_FORM_LINKS.S20
		);
	});

	test('CAS Planning', () => {
		expect(getFeedbackLinkFromAppealTypeName(APPEAL_TYPE.CAS_PLANNING)).toBe(
			FEEDBACK_FORM_LINKS.CAS_PLANNING
		);
	});

	test('CAS Adverts', () => {
		expect(getFeedbackLinkFromAppealTypeName(APPEAL_TYPE.CAS_ADVERTISEMENT)).toBe(
			FEEDBACK_FORM_LINKS.CAS_ADVERTS
		);
	});

	test('Full Adverts', () => {
		expect(getFeedbackLinkFromAppealTypeName(APPEAL_TYPE.ADVERTISEMENT)).toBe(
			FEEDBACK_FORM_LINKS.FULL_ADVERTS
		);
	});

	test('Enforcement Notice', () => {
		expect(getFeedbackLinkFromAppealTypeName(APPEAL_TYPE.ENFORCEMENT_NOTICE)).toBe(
			FEEDBACK_FORM_LINKS.ENFORCEMENT_NOTICE
		);
	});

	test('Lawful Development Certificate', () => {
		expect(getFeedbackLinkFromAppealTypeName(APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE)).toBe(
			FEEDBACK_FORM_LINKS.LAWFUL_DEVELOPMENT_CERTIFICATE
		);
	});

	test('Fallback', () => {
		expect(getFeedbackLinkFromAppealTypeName('UNKNOWN')).toBe(FEEDBACK_FORM_LINKS.ALL);
	});
});
