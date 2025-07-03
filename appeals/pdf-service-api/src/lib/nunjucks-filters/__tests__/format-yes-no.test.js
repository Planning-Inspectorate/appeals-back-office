// @ts-nocheck
import { formatYesNo } from '../format-yes-no.js';

describe('format-yes-no', () => {
	it('should format undefined as the default fallback', () => {
		const result = formatYesNo();
		expect(result).toEqual('Not answered');
	});

	it('should format undefined as the custom fallback', () => {
		const result = formatYesNo(undefined, 'N/A');
		expect(result).toEqual('N/A');
	});

	it('should format true as Yes', () => {
		const result = formatYesNo(true);
		expect(result).toEqual('Yes');
	});

	it('should format false as No', () => {
		const result = formatYesNo(false);
		expect(result).toEqual('No');
	});
});
