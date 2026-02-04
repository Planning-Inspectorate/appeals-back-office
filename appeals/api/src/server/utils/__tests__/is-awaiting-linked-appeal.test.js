// @ts-nocheck
import {
	allAppellantCaseOutcomesAreComplete,
	allLpaQuestionnaireOutcomesAreComplete,
	isAwaitingLinkedAppeal
} from '#utils/is-awaiting-linked-appeal.js';

describe('isAwaitingLinkedAppeal', () => {
	let appeal;

	describe('when appeal status is validation', () => {
		beforeEach(() => {
			appeal = {
				appellantCase: { appellantCaseValidationOutcome: { name: 'valid', id: 1 } },
				appealStatus: [{ status: 'validation', valid: true }]
			};
		});

		test('returns true when appeal is awaiting linked appeal appellant case validation', () => {
			expect(
				isAwaitingLinkedAppeal(appeal, [
					{
						currentStatus: 'lpa_questionnaire',
						completedStateList: ['validation'],
						appellantCase: { appellantCaseValidationOutcome: { name: 'valid', id: 1 } }
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
						appellantCase: { appellantCaseValidationOutcome: { name: 'valid', id: 1 } }
					},
					{
						currentStatus: 'validation',
						completedStateList: [],
						appellantCase: { appellantCaseValidationOutcome: { name: 'valid', id: 1 } }
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

describe('allLpaQuestionnaireOutcomesAreComplete', () => {
	test('returns true when there are no linked appeals', () => {
		expect(allLpaQuestionnaireOutcomesAreComplete([])).toBe(true);
	});

	test('returns true when all the linked appeals are complete', () => {
		expect(
			allLpaQuestionnaireOutcomesAreComplete([
				{
					id: 1,
					lpaQuestionnaire: { lpaQuestionnaireValidationOutcome: { name: 'complete' } }
				},
				{
					id: 2,
					lpaQuestionnaire: { lpaQuestionnaireValidationOutcome: { name: 'complete' } }
				}
			])
		).toBe(true);
	});

	test('returns false when at least one of the linked appeals is not complete', () => {
		expect(
			allLpaQuestionnaireOutcomesAreComplete([
				{
					id: 1
				},
				{
					id: 2,
					lpaQuestionnaire: { lpaQuestionnaireValidationOutcome: { name: 'complete' } }
				}
			])
		).toBe(false);
	});

	test('returns true when all the linked appeals are complete, making sure the current linked appeal is updated with the latest outcome', () => {
		const linkedAppeals = [
			{
				id: 1
			},
			{
				id: 2,
				lpaQuestionnaire: { lpaQuestionnaireValidationOutcome: { name: 'complete' } }
			}
		];
		expect(allLpaQuestionnaireOutcomesAreComplete(linkedAppeals, 1, { name: 'complete' })).toBe(
			true
		);
		expect(linkedAppeals[0].lpaQuestionnaire.lpaQuestionnaireValidationOutcome.name).toBe(
			'complete'
		);
	});
});

describe('allAppellantCaseOutcomesAreComplete', () => {
	test('returns true when there are no linked appeals', () => {
		expect(allAppellantCaseOutcomesAreComplete([])).toBe(true);
	});

	test('returns true when all the linked appeals are valid', () => {
		expect(
			allAppellantCaseOutcomesAreComplete([
				{
					id: 1,
					appellantCase: { appellantCaseValidationOutcome: { name: 'valid', id: 1 } }
				},
				{
					id: 2,
					appellantCase: { appellantCaseValidationOutcome: { name: 'valid', id: 1 } }
				}
			])
		).toBe(true);
	});

	test('returns false when at least one of the linked appeals is not valid', () => {
		expect(
			allAppellantCaseOutcomesAreComplete([
				{
					id: 1
				},
				{
					id: 2,
					appellantCase: { appellantCaseValidationOutcome: { name: 'valid', id: 1 } }
				}
			])
		).toBe(false);
	});

	test('returns true when all the linked appeals are valid, making sure the current linked appeal is updated with the latest outcome', () => {
		const linkedAppeals = [
			{
				id: 1
			},
			{
				id: 2,
				appellantCase: { appellantCaseValidationOutcome: { name: 'valid', id: 1 } }
			}
		];
		expect(allAppellantCaseOutcomesAreComplete(linkedAppeals, 1, { name: 'valid', id: 1 })).toBe(
			true
		);
		expect(linkedAppeals[0].appellantCase.appellantCaseValidationOutcome.name).toBe('valid');
	});
});
