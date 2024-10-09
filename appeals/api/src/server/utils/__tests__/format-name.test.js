import { formatName } from '../format-name.js';

describe('formatName function', () => {
	it('Should return names as a string separated by spaces', () => {
		expect(formatName({ firstName: 'first', middleName: 'middle', lastName: 'last' })).toEqual(
			'first middle last'
		);
	});

	it('Should return an empty string when all names are null', () => {
		expect(formatName({ firstName: null, middleName: null, lastName: null })).toEqual('');
	});

	it('Should return only first and last name if the middle name is missing', () => {
		expect(formatName({ firstName: 'first', middleName: null, lastName: 'last' })).toEqual(
			'first last'
		);
	});
});
