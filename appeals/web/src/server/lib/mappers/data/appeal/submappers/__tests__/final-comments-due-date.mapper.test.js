// @ts-nocheck
import { mapFinalCommentDueDate } from '#lib/mappers/data/appeal/submappers/final-comment-due-date.mapper.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common';

describe.each([
	['S78', APPEAL_TYPE.S78],
	['S20', APPEAL_TYPE.PLANNED_LISTED_BUILDING],
	['Full advertisement', APPEAL_TYPE.ADVERTISEMENT]
])('final-comments-due-date.mapper - %s', (_, appealType) => {
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

	it(`should not display Final Comments due date`, () => {
		const mappedData = mapFinalCommentDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'final-comments-due-date'
		});
	});

	it(`should display Final Comments due date with new Change action link`, () => {
		data.appealDetails.startedAt = '2025-01-01';
		data.appealDetails.procedureType = 'written';
		data.appealDetails.appealType = appealType;
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
								href: '/test/timetable/edit',
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
