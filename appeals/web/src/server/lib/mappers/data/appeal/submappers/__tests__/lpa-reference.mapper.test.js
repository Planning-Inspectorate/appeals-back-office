// @ts-nocheck
import { mapLpaReference } from '#lib/mappers/data/appeal/submappers/lpa-reference.mapper.js';

describe('lpa-reference.mapper', () => {
	it('should display Add link when appeal is generic and planningApplicationReference is missing', () => {
		const mapped = mapLpaReference({
			appealDetails: {
				appealId: 1,
				appealType: 'Tree preservation order',
				planningApplicationReference: null
			},
			currentRoute: '/appeals-service/appeal-details/1',
			userHasUpdateCasePermission: true
		});
		expect(mapped.display.summaryListItem.actions.items[0].text).toBe('Add');
	});

	it('should display Change link (not Add) when appeal is non-generic and planningApplicationReference is missing', () => {
		const mapped = mapLpaReference({
			appealDetails: {
				appealId: 1,
				appealType: 'Householder',
				planningApplicationReference: null
			},
			currentRoute: '/appeals-service/appeal-details/1',
			userHasUpdateCasePermission: true
		});
		expect(mapped.display.summaryListItem.actions.items[0].text).toBe('Change');
	});

	it('should display Change link when appeal has planningApplicationReference populated', () => {
		const mapped = mapLpaReference({
			appealDetails: {
				appealId: 1,
				appealType: 'Planning appeal',
				planningApplicationReference: 'PLAN/123'
			},
			currentRoute: '/appeals-service/appeal-details/1',
			userHasUpdateCasePermission: true
		});
		expect(mapped.display.summaryListItem.actions.items[0].text).toBe('Change');
	});
});
