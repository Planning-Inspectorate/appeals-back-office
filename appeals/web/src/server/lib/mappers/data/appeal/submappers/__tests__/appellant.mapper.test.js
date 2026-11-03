// @ts-nocheck
import { mapAppellant } from '#lib/mappers/data/appeal/submappers/appellant.mapper.js';

describe('appellant.mapper', () => {
	it('should display Add link when appeal is generic and appellant is missing', () => {
		const mapped = mapAppellant({
			appealDetails: {
				appealId: 1,
				appealType: 'Tree preservation order',
				appellant: null
			},
			currentRoute: '/appeals-service/appeal-details/1',
			userHasUpdateCasePermission: true
		});
		expect(mapped.display.summaryListItem.actions.items[0].text).toBe('Add');
		expect(mapped.display.summaryListItem.actions.items[0].href).toBe(
			'/appeals-service/appeal-details/1/service-user/add/appellant'
		);
	});

	it('should display Change link (not Add) when appeal is non-generic and appellant is missing', () => {
		const mapped = mapAppellant({
			appealDetails: {
				appealId: 1,
				appealType: 'Householder',
				appellant: null
			},
			currentRoute: '/appeals-service/appeal-details/1',
			userHasUpdateCasePermission: true
		});
		expect(mapped.display.summaryListItem.actions.items[0].text).toBe('Change');
		expect(mapped.display.summaryListItem.actions.items[0].href).toBe(
			'/appeals-service/appeal-details/1/service-user/change/appellant'
		);
	});

	it('should display Change link when appeal has appellant populated', () => {
		const mapped = mapAppellant({
			appealDetails: {
				appealId: 1,
				appealType: 'Planning appeal',
				appellant: {
					firstName: 'John',
					lastName: 'Doe',
					email: 'john@example.com'
				}
			},
			currentRoute: '/appeals-service/appeal-details/1',
			userHasUpdateCasePermission: true
		});
		expect(mapped.display.summaryListItem.actions.items[0].text).toBe('Change');
		expect(mapped.display.summaryListItem.actions.items[0].href).toBe(
			'/appeals-service/appeal-details/1/service-user/change/appellant'
		);
	});
});
