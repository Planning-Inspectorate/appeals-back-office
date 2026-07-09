// @ts-nocheck
import { isEqual } from 'lodash-es';
import { mapPagination } from '../pagination.mapper.js';

describe('pagination mapper', () => {
	const testAdditionalQuery = { 'test-additional-query-string': true };

	describe('mapPagination', () => {
		it('should return an empty Pagination object if pageCount is less than 2', () => {
			const result = mapPagination(1, 1, 10, 'test-base-url', testAdditionalQuery);

			expect(result.previous).toEqual({});
			expect(result.next).toEqual({});
			expect(result.items).toEqual([]);
		});
		it('should return a Pagination object with the expected properties if pageCount is 2 or greater', () => {
			const testBaseUrl = 'test-base-url';

			const result = mapPagination(3, 5, 10, testBaseUrl, testAdditionalQuery);

			const testAdditionalQueryString = '&test-additional-query-string=true';

			expect(result.previous?.href).toEqual(
				`${testBaseUrl}?pageSize=10&pageNumber=2${testAdditionalQueryString}`
			);
			expect(result.next?.href).toEqual(
				`${testBaseUrl}?pageSize=10&pageNumber=4${testAdditionalQueryString}`
			);
			expect(result.items?.length).toBe(5);
			expect(result.items?.[4]?.number).toEqual(5);
			expect(result.items?.[4]?.href).toEqual(
				`${testBaseUrl}?pageSize=10&pageNumber=5${testAdditionalQueryString}`
			);
		});

		it('renders an ellipsis element before the final page marker and no ellipsis element after the first page marker when page count is greater than 10 and current page is 2', () => {
			const testBaseUrl = 'test-base-url';
			const result = mapPagination(2, 15, 30, testBaseUrl, testAdditionalQuery);

			const containsEllipsisElementAfterFirstPageMarker = isEqual(result.items[1], {
				ellipsis: true
			});
			const containsEllipsisElementBeforeLastPageMarker = isEqual(result.items[3], {
				ellipsis: true
			});
			const containsBlankEllipsisElement =
				result.items.filter((item) => isEqual(item, { ellipsis: false })).length > 0;

			expect(containsEllipsisElementAfterFirstPageMarker).toBeFalsy();
			expect(containsEllipsisElementBeforeLastPageMarker).toBeTruthy();
			expect(containsBlankEllipsisElement).toBeFalsy();
		});

		it('renders an ellipsis element after the first page marker and no ellipsis element before the last page marker when page count is greater than 10 and current page is 17', () => {
			const testBaseUrl = 'test-base-url';
			const result = mapPagination(17, 15, 30, testBaseUrl, testAdditionalQuery);

			const containsEllipsisElementAfterFirstPageMarker = isEqual(result.items[1], {
				ellipsis: true
			});
			const containsEllipsisElementBeforeLastPageMarker = isEqual(result.items[3], {
				ellipsis: true
			});
			const containsBlankEllipsisElement =
				result.items.filter((item) => isEqual(item, { ellipsis: false })).length > 0;

			expect(containsEllipsisElementAfterFirstPageMarker).toBeTruthy();
			expect(containsEllipsisElementBeforeLastPageMarker).toBeFalsy();
			expect(containsBlankEllipsisElement).toBeFalsy();
		});

		it('removes pageSize from generated links when includePageSize is false', () => {
			expect(mapPagination(2, 3, 25, '/appeals', { filter: 'open' }, false)).toEqual({
				previous: {
					href: '/appeals?pageNumber=1&filter=open'
				},
				next: {
					href: '/appeals?pageNumber=3&filter=open'
				},
				items: [
					{
						number: 1,
						href: '/appeals?pageNumber=1&filter=open',
						current: false
					},
					{
						number: 2,
						href: '/appeals?pageNumber=2&filter=open',
						current: true
					},
					{
						number: 3,
						href: '/appeals?pageNumber=3&filter=open',
						current: false
					}
				]
			});
		});
	});
});
