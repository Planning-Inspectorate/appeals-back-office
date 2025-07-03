// @ts-nocheck

import { formatItems } from '../format-items.js';

describe('format-items', () => {
	it('should format undefined as an empty array', () => {
		const result = formatItems();
		expect(result).toEqual([]);
	});

	it('should format an empty array as an empty array', () => {
		const result = formatItems([]);
		expect(result).toEqual([]);
	});

	it('should format items as a GDS design system items property correctly', () => {
		const result = formatItems([
			{ key: 'item 1 label', text: 'item 1 value' },
			{ key: 'item 2 label', html: 'item 2 value' }
		]);
		expect(result).toEqual([
			{
				key: {
					text: 'item 1 label'
				},
				value: {
					text: 'item 1 value'
				}
			},
			{
				key: {
					text: 'item 2 label'
				},
				value: {
					html: 'item 2 value'
				}
			}
		]);
	});
});
