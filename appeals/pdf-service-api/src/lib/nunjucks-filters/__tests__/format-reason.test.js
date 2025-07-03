// @ts-nocheck

import { formatReason } from '../format-reason.js';

describe('format-list', () => {
	it('should format undefined as an empty string', () => {
		const result = formatReason();
		expect(result).toEqual('');
	});

	it('should format an empty list as an empty string', () => {
		const result = formatReason({ name: 'Reason A' });
		expect(result).toEqual('Reason A');
	});

	it('should format a list as a line break seperated list when there is more than one item', () => {
		const result = formatReason({ name: 'Custom reason', text: ['reason 1', 'reason 2'] });
		expect(result).toEqual('Custom reason: reason 1<br>Custom reason: reason 2');
	});
});
