// @ts-nocheck
import { cloneDeep } from 'lodash-es';
import { checkAppealsStatusBeforeLPAQ } from '../link-appeals.service.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { householdAppeal as appeal } from '#tests/appeals/mocks.js';

describe('Link Appeals Service', () => {
	describe('checkAppealsStatusBeforeLPAQ', () => {
		it('should return true where the linked appeal is the parent and it already has linked children and has status before LPA Questionnaire', () => {
			const linkedAppeal = cloneDeep({
				...appeal,
				id: 2,
				childAppeals: [{ appeal: { id: 3 } }]
			});
			const isCurrentAppealParent = false;

			const result = checkAppealsStatusBeforeLPAQ(appeal, linkedAppeal, isCurrentAppealParent);
			expect(result).toBe(true);
		});

		it('should return false where the linked appeal is the parent and it already has linked children and has status LPA Questionnaire', () => {
			const linkedAppeal = cloneDeep({
				...appeal,
				id: 2,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
						valid: true
					}
				],
				childAppeals: [{ appeal: { id: 3 } }]
			});
			const isCurrentAppealParent = false;

			const result = checkAppealsStatusBeforeLPAQ(appeal, linkedAppeal, isCurrentAppealParent);
			expect(result).toBe(false);
		});

		it('should return true where the linked appeal is the parent but has no children and the current appeal has status before LPA Questionnaire', () => {
			const linkedAppeal = cloneDeep({ ...appeal, id: 2 });
			const isCurrentAppealParent = false;

			const result = checkAppealsStatusBeforeLPAQ(appeal, linkedAppeal, isCurrentAppealParent);
			expect(result).toBe(true);
		});

		it('should return false where the linked appeal is the parent but has no children and the current appeal has status LPA Questionnaire', () => {
			const appealAtLPAQ = cloneDeep({
				...appeal,
				appealStatus: [{ status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, valid: true }]
			});
			const linkedAppeal = cloneDeep({ ...appeal, id: 2 });
			const isCurrentAppealParent = false;

			const result = checkAppealsStatusBeforeLPAQ(
				appealAtLPAQ,
				linkedAppeal,
				isCurrentAppealParent
			);
			expect(result).toBe(false);
		});

		it('should return true where the current appeal is the parent and it has status before LPA Questionnaire', () => {
			const linkedAppeal = cloneDeep({ ...appeal, id: 2 });
			const isCurrentAppealParent = true;

			const result = checkAppealsStatusBeforeLPAQ(appeal, linkedAppeal, isCurrentAppealParent);
			expect(result).toBe(true);
		});

		it('should return false where the current appeal is the parent and it has status LPA Questionnaire', () => {
			const appealAtLPAQ = cloneDeep({
				...appeal,
				appealStatus: [{ status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, valid: true }]
			});
			const linkedAppeal = cloneDeep({ ...appeal, id: 2 });
			const isCurrentAppealParent = true;

			const result = checkAppealsStatusBeforeLPAQ(
				appealAtLPAQ,
				linkedAppeal,
				isCurrentAppealParent
			);
			expect(result).toBe(false);
		});
	});
});
