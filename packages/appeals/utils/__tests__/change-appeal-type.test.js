import { APPEAL_TYPE_CHANGE_APPEALS } from '../../constants/common.js';
import { formatAppealTypeForNotify } from '../change-appeal-type.js';

describe('change-appeal-type', () => {
	describe('formatAppealTypeForNotify', () => {
		test('should return an empty string for null, undefined, or empty string input', () => {
			expect(formatAppealTypeForNotify(null)).toBe('');
			expect(formatAppealTypeForNotify(undefined)).toBe('');
			expect(formatAppealTypeForNotify('')).toBe('');
		});

		test('should correctly format all values from APPEAL_TYPE_CHANGE_APPEALS', () => {
			const testCases = [
				{ input: APPEAL_TYPE_CHANGE_APPEALS.HOUSEHOLDER, expected: 'householder appeal' },
				{ input: APPEAL_TYPE_CHANGE_APPEALS.S78, expected: 'planning appeal' },
				{
					input: APPEAL_TYPE_CHANGE_APPEALS.ENFORCEMENT_NOTICE,
					expected: 'enforcement notice appeal'
				},
				{ input: APPEAL_TYPE_CHANGE_APPEALS.ADVERTISEMENT, expected: 'advertisement appeal' },
				{
					input: APPEAL_TYPE_CHANGE_APPEALS.CAS_PLANNING,
					expected: 'commercial planning (CAS) appeal'
				},
				{
					input: APPEAL_TYPE_CHANGE_APPEALS.AFFORDABLE_HOUSING_OBLIGATION,
					expected: 'affordable housing obligation appeal'
				}
			];

			testCases.forEach(({ input, expected }) => {
				expect(formatAppealTypeForNotify(input)).toBe(expected);
			});
		});
	});
});
