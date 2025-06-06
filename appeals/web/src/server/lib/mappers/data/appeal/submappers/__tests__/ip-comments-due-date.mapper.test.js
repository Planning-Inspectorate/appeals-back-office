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

	it('should not display IP Comments due date when no startedAt date', () => {
		const mappedData = mapIpCommentsDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'ip-comments-due-date'
		});
	});

	it('should display IP Comments due date with new Change action link when appeal has started and 0 published IP comments', () => {
		data.appealDetails.startedAt = '2025-01-01';
		data.appealDetails.procedureType = 'written';
		data.appealDetails.appealType = 'Planning appeal';
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
								href: '/test/timetable/edit',
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

	it('should display IP Comments due date with Change action link when appeal has started and undefined published IP commentsin documentation summary', () => {
		data.appealDetails.startedAt = '2025-01-01';
		data.appealDetails.procedureType = 'written';
		data.appealDetails.appealType = 'Planning appeal';

		const mappedData = mapIpCommentsDueDate(data);
		data.appealDetails.documentationSummary.ipComments = {};
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-ip-comments-due-date'
								},
								href: '/test/timetable/edit',
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

	it('should display IP Comments due date with no Change action link when appeal has started and published IP comments', () => {
		data.appealDetails.startedAt = '2025-01-01';
		data.appealDetails.documentationSummary.ipComments.counts.published = 1;
		const mappedData = mapIpCommentsDueDate(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: []
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
