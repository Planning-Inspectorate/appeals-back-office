import { APPEAL_REPRESENTATION_TYPE } from '../../constants/common.js';
import { isValidRepresentationTypes } from '../representation-selector.js';

describe('isValidRepresentationTypes', () => {
	it.each(Object.values(APPEAL_REPRESENTATION_TYPE))('returns true for %s', (type) => {
		expect(isValidRepresentationTypes([type])).toBe(true);
	});

	it('returns true when all types are valid', () => {
		expect(isValidRepresentationTypes(Object.values(APPEAL_REPRESENTATION_TYPE))).toBe(true);
	});

	it.each([
		undefined,
		null,
		'comment',
		{},
		[],
		['unknown'],
		[APPEAL_REPRESENTATION_TYPE.COMMENT, 'unknown']
	])('returns false for invalid types: %j', (types) => {
		expect(isValidRepresentationTypes(types)).toBe(false);
	});
});
