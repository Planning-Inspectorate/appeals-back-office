// @ts-nocheck
import { mapAppealSubmittedDate } from '#lib/mappers/data/appeal/submappers/appeal-submitted-date.mapper.js';

describe('appeal-submitted-date.mapper', () => {
	it('should contain formatted date when createdAt is present', () => {
		const mappedData = mapAppealSubmittedDate({
			appealDetails: {
				createdAt: '2026-09-19T00:00:00.000Z'
			}
		});

		expect(mappedData).toEqual({
			id: 'appeal-submitted-date',
			display: {
				summaryListItem: {
					key: {
						text: 'Appeal submitted date'
					},
					value: {
						text: '19 September 2026'
					},
					actions: {
						items: []
					},
					classes: 'appeal-submitted-date'
				}
			}
		});
	});

	it('should return "No date" when createdAt is not present', () => {
		const mappedData = mapAppealSubmittedDate({
			appealDetails: {}
		});

		expect(mappedData.display.summaryListItem.value.text).toBe('No date');
	});
});
