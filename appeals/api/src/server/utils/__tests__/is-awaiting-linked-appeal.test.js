// @ts-nocheck
import { isAwaitingLinkedAppeal } from '#utils/is-awaiting-linked-appeal.js';

describe('isAwaitingLinkedAppeal', () => {
	let appeal;

	describe('when appeal status is validation', () => {
		beforeEach(() => {
			appeal = {
				appellantCase: { appellantCaseValidationOutcome: { name: 'valid' } },
				appealStatus: [{ status: 'validation', valid: true }]
			};
		});

		test('returns true when appeal is awaiting linked appeal appellant case validation', () => {
			expect(
				isAwaitingLinkedAppeal(appeal, [
					{
						currentStatus: 'lpa_questionnaire',
						completedStateList: ['validation'],
						appellantCase: { appellantCaseValidationOutcome: { name: 'valid' } }
					},
					{
						currentStatus: 'validation',
						completedStateList: [],
						appellantCase: { appellantCaseValidationOutcome: { name: '' } }
					}
				])
			).toBe(true);
		});

		test('returns false when appeal is not awaiting linked appeal appellant case validation', () => {
			expect(
				isAwaitingLinkedAppeal(appeal, [
					{
						currentStatus: 'lpa_questionnaire',
						completedStateList: ['validation'],
						appellantCase: { appellantCaseValidationOutcome: { name: 'valid' } }
					},
					{
						currentStatus: 'validation',
						completedStateList: [],
						appellantCase: { appellantCaseValidationOutcome: { name: 'valid' } }
					}
				])
			).toBe(false);
		});
	});

	describe('when appeal status is lpa_questionnaire', () => {
		beforeEach(() => {
			appeal = {
				lpaQuestionnaire: { lpaQuestionnaireValidationOutcome: { name: 'complete' } },
				appealStatus: [{ status: 'lpa_questionnaire', valid: true }]
			};
		});

		test('returns true when appeal is awaiting linked appeal appellant case validation', () => {
			expect(
				isAwaitingLinkedAppeal(appeal, [
					{
						currentStatus: 'statements',
						completedStateList: ['validation', 'lpa_questionnaire'],
						lpaQuestionnaire: { lpaQuestionnaireValidationOutcome: { name: 'complete' } }
					},
					{
						currentStatus: 'lpa_questionnaire',
						completedStateList: ['validation'],
						lpaQuestionnaire: { lpaQuestionnaireValidationOutcome: { name: '' } }
					}
				])
			).toBe(true);
		});

		test('returns false when appeal is not awaiting linked appeal appellant case validation', () => {
			expect(
				isAwaitingLinkedAppeal(appeal, [
					{
						currentStatus: 'statements',
						completedStateList: ['validation', 'lpa_questionnaire'],
						lpaQuestionnaire: { lpaQuestionnaireValidationOutcome: { name: 'complete' } }
					},
					{
						currentStatus: 'lpa_questionnaire',
						completedStateList: ['validation'],
						lpaQuestionnaire: { lpaQuestionnaireValidationOutcome: { name: 'complete' } }
					}
				])
			).toBe(false);
		});
	});
});
