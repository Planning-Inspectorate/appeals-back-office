// @ts-nocheck
import { mapLpaContactDetails } from '#lib/mappers/data/appeal/submappers/lpa-contact-details.mapper.js';

describe('lpa-contact-details.mapper', () => {
	it('should display Add link when appeal is generic and localPlanningDepartment is missing', () => {
		const mapped = mapLpaContactDetails({
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
		const mapped = mapLpaContactDetails({
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
		const mapped = mapLpaContactDetails({
			appealDetails: {
				appealId: 1,
				appealType: 'Planning appeal',
				localPlanningDepartment: 'Wiltshire Council',
				lpaEmailAddress: 'planning@wiltshire.gov.uk'
			},
			currentRoute: '/appeals-service/appeal-details/1',
			userHasUpdateCasePermission: true
		});
		expect(mapped.display.summaryListItem.actions.items[0].text).toBe('Change');
	});
});
