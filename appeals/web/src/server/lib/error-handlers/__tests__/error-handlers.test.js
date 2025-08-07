import {
	errorAddressLine1,
	errorPostcode,
	errorTown,
	getErrorByFieldname
} from '../change-screen-error-handlers.js';

describe('Address', () => {
	describe('First line error', () => {
		it('should return undefined if addressLine1 does not exist', () => {
			/** @type {import("@pins/express").ValidationErrors | undefined} */
			const errors = {
				town: { value: '', msg: 'Enter the town', path: 'town', location: 'body', type: 'field' },
				postCode: {
					value: '',
					msg: 'Enter a full UK postcode',
					path: 'postCode',
					location: 'body',
					type: 'field'
				}
			};
			expect(errorAddressLine1(errors)).toEqual(undefined);
		});
		it('should return error text if addressLine1 does exist', () => {
			/** @type {import("@pins/express").ValidationErrors | undefined} */
			const errors = {
				addressLine1: {
					value: '',
					msg: 'Enter address line 1',
					path: 'town',
					location: 'body',
					type: 'field'
				}
			};
			expect(errorAddressLine1(errors)).toEqual({
				text: 'Enter address line 1'
			});
		});
	});
	describe('Town error', () => {
		it('should return undefined if town does not exist', () => {
			/** @type {import("@pins/express").ValidationErrors | undefined} */
			const errors = {
				addressLine1: {
					value: '',
					msg: 'Enter the address',
					path: 'town',
					location: 'body',
					type: 'field'
				}
			};
			expect(errorTown(errors)).toEqual(undefined);
		});
		it('should return error text if town does exist', () => {
			/** @type {import("@pins/express").ValidationErrors | undefined} */
			const errors = {
				town: {
					value: '',
					msg: 'Enter town or city',
					path: 'town',
					location: 'body',
					type: 'field'
				}
			};
			expect(errorTown(errors)).toEqual({
				text: 'Enter town or city'
			});
		});
	});
	describe('Postcode error', () => {
		it('should return undefined if postCode does not exist', () => {
			/** @type {import("@pins/express").ValidationErrors | undefined} */
			const errors = {
				addressLine1: {
					value: '',
					msg: 'Enter the address',
					path: 'town',
					location: 'body',
					type: 'field'
				}
			};
			expect(errorPostcode(errors)).toEqual(undefined);
		});
		it('should return error text if postCode does exist', () => {
			/** @type {import("@pins/express").ValidationErrors | undefined} */
			const errors = {
				town: { value: '', msg: 'Enter the town', path: 'town', location: 'body', type: 'field' },
				postCode: {
					value: '',
					msg: 'Enter a full UK postcode',
					path: 'postCode',
					location: 'body',
					type: 'field'
				}
			};
			expect(errorPostcode(errors)).toEqual({
				text: 'Enter a full UK postcode'
			});
		});
	});
});

describe('getErrorByFieldname', () => {
	it('should return undefined if errors is undefined', () => {
		const result = getErrorByFieldname(undefined, 'fieldName');
		expect(result).toBeUndefined();
	});

	it('should return undefined if errors is null', () => {
		// @ts-ignore
		const result = getErrorByFieldname(null, 'fieldName');
		expect(result).toBeUndefined();
	});

	it('should return undefined if fieldName does not exist in errors', () => {
		/** @type {import("@pins/express").ValidationErrors} */
		const errors = {};
		const result = getErrorByFieldname(errors, 'fieldName');
		expect(result).toBeUndefined();
	});

	it('should return undefined if msg does not exist for fieldName in errors', () => {
		/** @type {import("@pins/express").ValidationErrors} */ // @ts-ignore
		const errors = { fieldName: {} };
		const result = getErrorByFieldname(errors, 'fieldName');
		expect(result).toBeUndefined();
	});

	it('should return undefined if msg doesnt use matching fieldname', () => {
		/** @type {import("@pins/express").ValidationErrors} */ // @ts-ignore
		const errors = { fieldName: {} };
		const result = getErrorByFieldname(errors, 'fieldName2');
		expect(result).toBeUndefined();
	});

	it('should return the error message if msg exists for fieldName in errors', () => {
		/** @type {import("@pins/express").ValidationErrors} */ // @ts-ignore
		const errors = { fieldName: { msg: 'Error message' } };
		const result = getErrorByFieldname(errors, 'fieldName');
		expect(result).toEqual({ text: 'Error message' });
	});
});
