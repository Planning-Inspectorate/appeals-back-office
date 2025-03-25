// @ts-nocheck
import { mapS106ObligationDue } from '#lib/mappers/data/appeal/submappers/s106-obligation-due-date.mapper.js';

describe('s106-obligation-due-date.mapper', () => {
	let data;
	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				validAt: '2025-01-01',
				appealTimetable: { s106ObligationDueDate: '2025-01-10' }
			},
			userHasUpdateCasePermission: true
		};
	});

	it('should not display S106 Obligation due date', () => {
		const mappedData = mapS106ObligationDue(data);
		expect(mappedData).toEqual({
			display: {},
			id: 's106-obligation-due-date'
		});
	});

	it('should display S106 Obligation due date with Change action link', () => {
		data.appealDetails.startedAt = '2025-01-01';
		const mappedData = mapS106ObligationDue(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-s106-obligation-due-date'
								},
								href: '/test/appeal-timetables/s106-obligation',
								text: 'Change',
								visuallyHiddenText: 'S106 obligation due'
							}
						]
					},
					classes: 's106-obligation-due-date',
					key: {
						text: 'S106 obligation due'
					},
					value: {
						text: '10 January 2025'
					}
				}
			},
			id: 's106-obligation-due-date'
		});
	});
});
