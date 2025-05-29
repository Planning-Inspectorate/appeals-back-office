// @ts-nocheck
import { mapLpaStatementDueDate } from '#lib/mappers/data/appeal/submappers/lpa-statement-due-date.mapper.js';

describe('lpa-statement-due-date.mapper', () => {
	let data;
	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				validAt: '2025-01-01',
				appealTimetable: { lpaStatementDueDate: '2025-01-10' }
			},
			userHasUpdateCasePermission: true
		};
	});

	it('should not display LPA Statement due date', () => {
		const mappedData = mapLpaStatementDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'lpa-statement-due-date'
		});
	});

	// it('should display LPA Statement due date with new Change action link', () => {
	// 	data.appealDetails.startedAt = '2025-01-01';
	// 	data.appealDetails.procedureType = 'written';
	// 	data.appealDetails.appealType = 'Planning appeal';

	// 	const mappedData = mapLpaStatementDueDate(data);
	// 	expect(mappedData).toEqual({
	// 		display: {
	// 			summaryListItem: {
	// 				actions: {
	// 					items: [
	// 						{
	// 							attributes: {
	// 								'data-cy': 'change-lpa-statement-due-date'
	// 							},
	// 							href: '/test/timetable/edit',
	// 							text: 'Change',
	// 							visuallyHiddenText: 'LPA statement due'
	// 						}
	// 					]
	// 				},
	// 				classes: 'appeal-lpa-statement-due-date',
	// 				key: {
	// 					text: 'LPA statement due'
	// 				},
	// 				value: {
	// 					text: '10 January 2025'
	// 				}
	// 			}
	// 		},
	// 		id: 'lpa-statement-due-date'
	// 	});
	// });

	it('should display LPA Statement due date with old Change action link', () => {
		data.appealDetails.startedAt = '2025-01-01';

		const mappedData = mapLpaStatementDueDate(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-lpa-statement-due-date'
								},
								href: '/test/appeal-timetables/lpa-statement',
								text: 'Change',
								visuallyHiddenText: 'LPA statement due'
							}
						]
					},
					classes: 'appeal-lpa-statement-due-date',
					key: {
						text: 'LPA statement due'
					},
					value: {
						text: '10 January 2025'
					}
				}
			},
			id: 'lpa-statement-due-date'
		});
	});
});
