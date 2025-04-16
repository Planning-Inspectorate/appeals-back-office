// @ts-nocheck
import { mapSiteVisitDate } from '#lib/mappers/data/appeal/submappers/site-visit-datetime.mapper.js';

const data = {
	currentRoute: '/test',
	appealDetails: {
		validAt: '2025-01-01',
		appealTimetable: { finalCommentsDueDate: '2025-01-10' },
		siteVisit: { visitDate: '2025-01-10' },
		startedAt: '2025-01-01'
	},
	userHasUpdateCasePermission: true,
	session: { permissions: { setEvents: true } }
};

describe('site-visit-date.mapper', () => {
	it('should display Site Visit date with Change action link', () => {
		const mappedData = mapSiteVisitDate(data, null, undefined);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-site-visit-date'
								},
								href: '/appeals-service/appeal-details/undefined/site-visit/visit-booked',
								text: 'Change',
								visuallyHiddenText: 'Date'
							}
						]
					},
					key: {
						text: 'Date'
					},
					value: {
						html: '10 January 2025'
					}
				}
			},
			id: 'site-visit-date'
		});
	});
});
