import { FEEDBACK_FORM_LINKS, getFeedbackLinkFromAppealType } from '#utils/feedback-form-link.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

describe('getFeedbackLinkFromAppealType', () => {
	test('S78', () => {
		expect(getFeedbackLinkFromAppealType(APPEAL_CASE_TYPE.W)).toBe(FEEDBACK_FORM_LINKS.S78);
	});

	test('HAS', () => {
		expect(getFeedbackLinkFromAppealType(APPEAL_CASE_TYPE.D)).toBe(FEEDBACK_FORM_LINKS.HAS);
	});

	test('S20', () => {
		expect(getFeedbackLinkFromAppealType(APPEAL_CASE_TYPE.Y)).toBe(FEEDBACK_FORM_LINKS.S20);
	});

	test('CAS Planning', () => {
		expect(getFeedbackLinkFromAppealType(APPEAL_CASE_TYPE.ZP)).toBe(
			FEEDBACK_FORM_LINKS.CAS_PLANNING
		);
	});

	test('CAS Adverts', () => {
		expect(getFeedbackLinkFromAppealType(APPEAL_CASE_TYPE.ZA)).toBe(
			FEEDBACK_FORM_LINKS.CAS_ADVERTS
		);
	});

	test('Full Adverts', () => {
		expect(getFeedbackLinkFromAppealType(APPEAL_CASE_TYPE.H)).toBe(
			FEEDBACK_FORM_LINKS.FULL_ADVERTS
		);
	});

	test('Fallback', () => {
		expect(getFeedbackLinkFromAppealType('UNKNOWN')).toBe(FEEDBACK_FORM_LINKS.ALL);
	});
});
