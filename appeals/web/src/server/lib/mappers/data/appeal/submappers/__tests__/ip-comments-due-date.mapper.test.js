// @ts-nocheck
import { mapIpCommentsDueDate } from '#lib/mappers/data/appeal/submappers/ip-comments-due-date.mapper.js';

describe('ip-comments-due-date.mapper', () => {
	let data;
	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				validAt: '2025-01-01',
				appealTimetable: { ipCommentsDueDate: '2025-01-10' },
				documentationSummary: { ipComments: { counts: { published: 0 } } }
			},
			userHasUpdateCasePermission: true
		};
	});

	it('should not display IP Comments due date', () => {
		const mappedData = mapIpCommentsDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'ip-comments-due-date'
		});
	});

	it('should display IP Comments due date with Change action link', () => {
		data.appealDetails.startedAt = '2025-01-01';
		const mappedData = mapIpCommentsDueDate(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-ip-comments-due-date'
								},
								href: '/test/appeal-timetables/ip-comments',
								text: 'Change',
								visuallyHiddenText: 'Interested party comments due'
							}
						]
					},
					classes: 'appeal-ip-comments-due-date',
					key: {
						text: 'Interested party comments due'
					},
					value: {
						text: '10 January 2025'
					}
				}
			},
			id: 'ip-comments-due-date'
		});
	});
});
