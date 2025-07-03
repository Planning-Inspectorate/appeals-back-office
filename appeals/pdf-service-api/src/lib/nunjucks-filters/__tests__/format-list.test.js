// @ts-nocheck

import { formatList } from '../format-list.js';

describe('format-list', () => {
	it('should format undefined as the default fallback string', () => {
		const result = formatList();
		expect(result).toEqual('Not answered');
	});

	it('should format an empty list as the default fallback string', () => {
		const result = formatList([]);
		expect(result).toEqual('Not answered');
	});

	it('should format an empty list as the supplied fallback string', () => {
		const result = formatList([], 'No items');
		expect(result).toEqual('No items');
	});

	it('should format a list as a line break seperated list when there is more than one item', () => {
		const result = formatList(['item 1', 'item 2']);
		expect(result).toEqual('item 1<br>item 2');
	});
});
