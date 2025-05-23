// @ts-nocheck
import { mapFinalCommentDueDate } from '#lib/mappers/data/appeal/submappers/final-comment-due-date.mapper.js';

describe('final-comments-due-date.mapper', () => {
	let data;
	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				validAt: '2025-01-01',
				appealTimetable: { finalCommentsDueDate: '2025-01-10' },
				documentationSummary: { finalComments: { representationStatus: 'published' } }
			},
			userHasUpdateCasePermission: true
		};
	});

	it('should not display Final Comments due date', () => {
		const mappedData = mapFinalCommentDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'final-comments-due-date'
		});
	});

	it('should display Final Comments due date with Change action link', () => {
		data.appealDetails.startedAt = '2025-01-01';
		const mappedData = mapFinalCommentDueDate(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-final-comments-due-date'
								},
								href: '/test/appeal-timetables/final-comments',
								text: 'Change',
								visuallyHiddenText: 'Final comments due'
							}
						]
					},
					classes: 'appeal-final-comments-due-date',
					key: {
						text: 'Final comments due'
					},
					value: {
						text: '10 January 2025'
					}
				}
			},
			id: 'final-comments-due-date'
		});
	});
});
