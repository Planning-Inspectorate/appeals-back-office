// @ts-nocheck
import { householdAppeal as appeal } from '#tests/appeals/mocks.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

import { checkAppealsStatusBeforeLPAQ } from '../link-appeals.service.js';

import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_APPEAL_LINK_ADDED,
	AUDIT_TRAIL_APPEAL_LINK_REMOVED,
	AUDIT_TRAIL_APPEAL_RELATION_ADDED,
	AUDIT_TRAIL_APPEAL_RELATION_REMOVED
} from '@pins/appeals/constants/support.js';

describe('Link Appeals Service', () => {
	describe('checkAppealsStatusBeforeLPAQ', () => {
		it('should return true where the linked appeal is the parent and it already has linked children and has status before LPA Questionnaire', () => {
			const linkedAppeal = structuredClone({
				...appeal,
				id: 2,
				childAppeals: [{ appeal: { id: 3 } }]
			});
			const isCurrentAppealParent = false;

			const result = checkAppealsStatusBeforeLPAQ(appeal, linkedAppeal, isCurrentAppealParent);
			expect(result).toBe(true);
		});

		it('should return false where the linked appeal is the parent and it already has linked children and has status LPA Questionnaire', () => {
			const linkedAppeal = structuredClone({
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
			const linkedAppeal = structuredClone({ ...appeal, id: 2 });
			const isCurrentAppealParent = false;

			const result = checkAppealsStatusBeforeLPAQ(appeal, linkedAppeal, isCurrentAppealParent);
			expect(result).toBe(true);
		});

		it('should return false where the linked appeal is the parent but has no children and the current appeal has status LPA Questionnaire', () => {
			const appealAtLPAQ = structuredClone({
				...appeal,
				appealStatus: [{ status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, valid: true }]
			});
			const linkedAppeal = structuredClone({ ...appeal, id: 2 });
			const isCurrentAppealParent = false;

			const result = checkAppealsStatusBeforeLPAQ(
				appealAtLPAQ,
				linkedAppeal,
				isCurrentAppealParent
			);
			expect(result).toBe(false);
		});

		it('should return true where the current appeal is the parent and it has status before LPA Questionnaire', () => {
			const linkedAppeal = structuredClone({ ...appeal, id: 2 });
			const isCurrentAppealParent = true;

			const result = checkAppealsStatusBeforeLPAQ(appeal, linkedAppeal, isCurrentAppealParent);
			expect(result).toBe(true);
		});

		it('should return false where the current appeal is the parent and it has status LPA Questionnaire', () => {
			const appealAtLPAQ = structuredClone({
				...appeal,
				appealStatus: [{ status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, valid: true }]
			});
			const linkedAppeal = structuredClone({ ...appeal, id: 2 });
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

describe('Audit Trail Content Verification', () => {
	const mockAppealReference = 'APP/Q9999/D/21/1234567';

	test('should correctly format "Linked appeal added" with reference', () => {
		const result = stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_ADDED, [mockAppealReference]);
		expect(result).toBe(`Linked appeal ${mockAppealReference} added`);
	});

	test('should correctly format "Linked appeal removed" with reference', () => {
		const result = stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_REMOVED, [mockAppealReference]);
		expect(result).toBe(`Linked appeal ${mockAppealReference} removed`);
	});

	test('should correctly format "Related appeal added" with reference', () => {
		const result = stringTokenReplacement(AUDIT_TRAIL_APPEAL_RELATION_ADDED, [mockAppealReference]);
		expect(result).toBe(`Related appeal ${mockAppealReference} added`);
	});

	test('should correctly format "Related appeal removed" with reference', () => {
		const result = stringTokenReplacement(AUDIT_TRAIL_APPEAL_RELATION_REMOVED, [
			mockAppealReference
		]);
		expect(result).toBe(`Related appeal ${mockAppealReference} removed`);
	});
});
