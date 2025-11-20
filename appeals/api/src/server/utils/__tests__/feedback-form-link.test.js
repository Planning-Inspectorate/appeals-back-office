import { getFeedbackLinkFromAppealTypeKey } from '#utils/feedback-form-link.js';
import { FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

describe('getFeedbackLinkFromAppealTypeKey', () => {
	test('S78', () => {
		expect(getFeedbackLinkFromAppealTypeKey(APPEAL_CASE_TYPE.W)).toBe(FEEDBACK_FORM_LINKS.S78);
	});

	test('HAS', () => {
		expect(getFeedbackLinkFromAppealTypeKey(APPEAL_CASE_TYPE.D)).toBe(FEEDBACK_FORM_LINKS.HAS);
	});

	test('S20', () => {
		expect(getFeedbackLinkFromAppealTypeKey(APPEAL_CASE_TYPE.Y)).toBe(FEEDBACK_FORM_LINKS.S20);
	});

	test('CAS Planning', () => {
		expect(getFeedbackLinkFromAppealTypeKey(APPEAL_CASE_TYPE.ZP)).toBe(
			FEEDBACK_FORM_LINKS.CAS_PLANNING
		);
	});

	test('CAS Adverts', () => {
		expect(getFeedbackLinkFromAppealTypeKey(APPEAL_CASE_TYPE.ZA)).toBe(
			FEEDBACK_FORM_LINKS.CAS_ADVERTS
		);
	});

	test('Full Adverts', () => {
		expect(getFeedbackLinkFromAppealTypeKey(APPEAL_CASE_TYPE.H)).toBe(
			FEEDBACK_FORM_LINKS.FULL_ADVERTS
		);
	});

	test('Fallback', () => {
		expect(getFeedbackLinkFromAppealTypeKey('UNKNOWN')).toBe(FEEDBACK_FORM_LINKS.ALL);
	});
});
