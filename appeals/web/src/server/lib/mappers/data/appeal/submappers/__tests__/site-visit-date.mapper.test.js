// @ts-nocheck
import { mapSiteVisitDate } from '#lib/mappers/data/appeal/submappers/site-visit-date.mapper.js';

describe('site-visit-date.mapper', () => {
	let data;
	let session;
	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				validAt: '2025-01-01',
				appealTimetable: { finalCommentsDueDate: '2025-01-10' },
				siteVisit: { visitDate: '2025-01-10' }
			},
			userHasUpdateCasePermission: true,
			session: { permissions: { setEvents: true } }
		};
	});

	it('should not display Site Visit date', () => {
		const mappedData = mapSiteVisitDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'schedule-visit'
		});
	});

	it('should display Site Visit date with Change action link', () => {
		data.appealDetails.startedAt = '2025-01-01';
		const mappedData = mapSiteVisitDate(data, null, session);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-schedule-visit'
								},
								href: '/test/site-visit/manage-visit',
								text: 'Change',
								visuallyHiddenText: 'Site visit'
							}
						]
					},
					classes: 'appeal-site-visit',
					key: {
						text: 'Site visit'
					},
					value: {
						html: '<ul class="govuk-list govuk-!-margin-top-0 govuk-!-padding-left-0"><li>10 January 2025</li></ul>'
					}
				}
			},
			id: 'schedule-visit'
		});
	});
});
