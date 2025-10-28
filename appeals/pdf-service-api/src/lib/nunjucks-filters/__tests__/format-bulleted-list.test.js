// @ts-nocheck

import { formatBulletedList } from '../format-bulleted-list.js';

describe('format-bulleted-list', () => {
	it('should format an undefined list as an empty string', () => {
		const result = formatBulletedList();
		expect(result).toEqual('');
	});

	it('should format an undefined list as the fallback text', () => {
		const result = formatBulletedList(undefined, 'Not answered');
		expect(result).toEqual('Not answered');
	});

	it('should format an empty list as an empty string', () => {
		const result = formatBulletedList([]);
		expect(result).toEqual('');
	});

	it('should format an empty list as the fallback text', () => {
		const result = formatBulletedList([], 'fallback text');
		expect(result).toEqual('fallback text');
	});

	it('should not format a list as a bulleted list when there is one item', () => {
		const result = formatBulletedList(['item 1']);
		expect(result).toEqual('item 1');
	});

	it('should format a list as a bulleted list when there is more than one item', () => {
		const result = formatBulletedList(['item 1', 'item 2']);
		expect(result).toEqual(
			'<ul class="govuk-list govuk-list--bullet"><li>item 1</li><li>item 2</li></ul>'
		);
	});
});
