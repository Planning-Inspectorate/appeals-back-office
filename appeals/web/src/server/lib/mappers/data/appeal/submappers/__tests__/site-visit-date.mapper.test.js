// @ts-nocheck
import { mapSiteVisitDate } from '#lib/mappers/data/appeal/submappers/site-visit-datetime.mapper.js';

const data = {
	currentRoute: '/test',
	appealDetails: {
		appealId: 1,
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
		const mappedData = mapSiteVisitDate({
			...data,
			request: { originalUrl: data.currentRoute }
		});
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-site-visit-date'
								},
								href: '/appeals-service/appeal-details/1/site-visit-v2/schedule/schedule-visit-date?backUrl=%2Ftest',
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
