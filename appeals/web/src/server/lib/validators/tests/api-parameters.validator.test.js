import {
	ApiParameterValidationError,
	assertValidGuids,
	assertValidIds,
	assertValidNumericIds,
	assertValidProofOfEvidenceType,
	isValidGuid,
	isValidNumericId
} from '../api-parameters.validator.js';

describe('api-parameters.validator', () => {
	describe('isValidNumericId', () => {
		it.each([['1'], ['123'], [0], [42], ['007']])('returns true for %p', (value) => {
			expect(isValidNumericId(value)).toBe(true);
		});

		it.each([
			[''],
			['abc'],
			['1.5'],
			['-1'],
			['1a'],
			[' 1'],
			[null],
			[undefined],
			['APP/Q9999/W/1']
		])('returns false for %p', (value) => {
			expect(isValidNumericId(value)).toBe(false);
		});
	});

	describe('isValidGuid', () => {
		it('returns true for a valid GUID', () => {
			expect(isValidGuid('434bff4e-8191-4ce0-9a0a-91e5d6cdd882')).toBe(true);
		});

		it.each([[''], ['not-a-guid'], ['123'], [null], [undefined]])(
			'returns false for %p',
			(value) => {
				expect(isValidGuid(value)).toBe(false);
			}
		);
	});

	describe('assertValidNumericIds', () => {
		it('does not throw when all values are valid', () => {
			expect(() => assertValidNumericIds({ appealId: '1', lpaQuestionnaireId: 2 })).not.toThrow();
		});

		it('throws an ApiParameterValidationError naming the invalid parameter', () => {
			expect(() => assertValidNumericIds({ appealId: 'abc' })).toThrow(ApiParameterValidationError);
			expect(() => assertValidNumericIds({ appealId: 'abc' })).toThrow(/Invalid appealId/);
		});
	});

	describe('assertValidGuids', () => {
		it('does not throw when all values are valid', () => {
			expect(() =>
				assertValidGuids({ documentId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882' })
			).not.toThrow();
		});

		it('throws an ApiParameterValidationError naming the invalid parameter', () => {
			expect(() => assertValidGuids({ documentId: '123' })).toThrow(ApiParameterValidationError);
			expect(() => assertValidGuids({ documentId: '123' })).toThrow(/Invalid documentId/);
		});
	});

	describe('assertValidIds', () => {
		it('does not throw when all values are valid', () => {
			expect(() =>
				assertValidIds({ documentId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882', anotherId: 1 })
			).not.toThrow();
		});

		it('throws an ApiParameterValidationError naming the invalid parameter', () => {
			expect(() => assertValidIds({ anotherId: null })).toThrow(ApiParameterValidationError);
			expect(() => assertValidIds({ documentId: 'A1' })).toThrow(/Invalid documentId/);
		});
	});

	describe('assertValidProofOfEvidenceType', () => {
		it('does not throw when all values are valid', () => {
			expect(() =>
				assertValidProofOfEvidenceType({
					poe: 'abc-123-b',
					anotherOne: 'aaaa'
				})
			).not.toThrow();
		});

		it('throws an ApiParameterValidationError naming the invalid parameter', () => {
			expect(() => assertValidProofOfEvidenceType({ anotherId: null })).toThrow(
				ApiParameterValidationError
			);
			expect(() => assertValidProofOfEvidenceType({ poe: 'a1&shdn' })).toThrow(/Invalid poe/);
		});
	});
});
