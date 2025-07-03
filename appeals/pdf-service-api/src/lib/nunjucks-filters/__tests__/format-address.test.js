// @ts-nocheck
import { formatAddress } from '../format-address.js';

describe('format-address', () => {
	it('should format an undefined address as an empty string', () => {
		const result = formatAddress();
		expect(result).toEqual('');
	});

	it('should format an empty address object as an empty string', () => {
		const result = formatAddress();
		expect(result).toEqual('');
	});

	it('should format a complete address as a comma separated string', () => {
		const result = formatAddress({
			addressLine1: 'Flat 2',
			addressLine2: '123 Any street',
			town: 'Toy town',
			county: 'Windyshire',
			postCode: 'TT1 1AA'
		});
		expect(result).toEqual('Flat 2, 123 Any street, Toy town, Windyshire, TT1 1AA');
	});

	it('should format a partial address as a comma separated string', () => {
		const result = formatAddress({
			addressLine1: '123 Any street',
			town: 'Toy town'
		});
		expect(result).toEqual('123 Any street, Toy town');
	});
});
