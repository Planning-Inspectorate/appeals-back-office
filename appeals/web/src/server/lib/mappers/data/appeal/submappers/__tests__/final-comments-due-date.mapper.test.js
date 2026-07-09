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

	it(`should not display Final Comments due date when appeal has not started yet`, () => {
		data.appealDetails.procedureType = 'written';
		data.appealDetails.appealType = appealType;
		const mappedData = mapFinalCommentDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'final-comments-due-date'
		});
	});

	it(`should display Final Comments due date with Change action link when appeal has started with written procedure`, () => {
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

	it(`should not display Final Comments due date when procedure type is hearing`, () => {
		// Final comments are only available for hearing procedure for LDC, discontinuance, enforcement and ELB case types
		data.appealDetails.startedAt = '2025-01-01';
		data.appealDetails.procedureType = 'hearing';
		data.appealDetails.appealType = appealType;
		const mappedData = mapFinalCommentDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'final-comments-due-date'
		});
	});

	it(`should not display Final Comments due date when procedure type is inquiry`, () => {
		// Final comments are only available for inquiry procedure for LDC, discontinuance, enforcement and ELB case types
		data.appealDetails.startedAt = '2025-01-01';
		data.appealDetails.procedureType = 'inquiry';
		data.appealDetails.appealType = appealType;
		const mappedData = mapFinalCommentDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'final-comments-due-date'
		});
	});
});

// Test coverage for case types which have final comments for hearing/inquiry procedures
describe.each([
	['LDC', APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE],
	['discontinuance', APPEAL_TYPE.DISCONTINUANCE_NOTICE],
	['enforcement notice', APPEAL_TYPE.ENFORCEMENT_NOTICE],
	['enforcement listed building', APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING]
])('final-comments-due-date.mapper - %s', (label, appealType) => {
	let data;
	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				validAt: '2025-01-01',
				appealTimetable: { finalCommentsDueDate: '2025-01-10' },
				documentationSummary: { finalComments: { representationStatus: 'published' } },
				startedAt: '2025-01-01'
			},
			userHasUpdateCasePermission: true
		};
	});

	it.each(['written', 'hearing', 'inquiry'])(
		`should display Final Comments due date with Change action link - %s`,
		(procedureType) => {
			data.appealDetails.procedureType = procedureType;
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
		}
	);
});
