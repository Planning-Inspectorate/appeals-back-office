// @ts-nocheck
import { mapLocalPlanningAuthority } from '#lib/mappers/data/appeal/submappers/local-planning-authority.mapper.js';

describe('local-planning-authority.mapper', () => {
	it('should display Add link when appeal is generic and localPlanningDepartment is missing', () => {
		const mapped = mapLocalPlanningAuthority({
			appealDetails: {
				appealId: 1,
				appealType: 'Tree preservation order',
				localPlanningDepartment: ''
			},
			currentRoute: '/appeals-service/appeal-details/1',
			userHasUpdateCasePermission: true
		});
		expect(mapped.display.summaryListItem.actions.items[0].text).toBe('Add');
	});

	it('should display Change link (not Add) when appeal is non-generic and localPlanningDepartment is missing', () => {
		const mapped = mapLocalPlanningAuthority({
			appealDetails: {
				appealId: 1,
				appealType: 'Householder',
				localPlanningDepartment: ''
			},
			currentRoute: '/appeals-service/appeal-details/1',
			userHasUpdateCasePermission: true
		});
		expect(mapped.display.summaryListItem.actions.items[0].text).toBe('Change');
	});

	it('should display Change link when appeal has localPlanningDepartment populated', () => {
		const mapped = mapLocalPlanningAuthority({
			appealDetails: {
				appealId: 1,
				appealType: 'Planning appeal',
				localPlanningDepartment: 'Wiltshire Council'
			},
			currentRoute: '/appeals-service/appeal-details/1',
			userHasUpdateCasePermission: true
		});
		expect(mapped.display.summaryListItem.actions.items[0].text).toBe('Change');
	});
});
