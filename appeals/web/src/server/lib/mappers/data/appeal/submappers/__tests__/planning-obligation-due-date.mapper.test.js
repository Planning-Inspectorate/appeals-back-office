// @ts-nocheck
import { mapPlanningObligationDueDate } from '#lib/mappers/data/appeal/submappers/planning-obligation-due-date.mapper.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

describe('mapPlanningObligationDueDate', () => {
	let data;
	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				validAt: '2025-01-01',
				appealTimetable: { planningObligationDueDate: '2025-01-10' },
				startedAt: '2025-01-01',
				procedureType: APPEAL_CASE_PROCEDURE.HEARING
			},
			appellantCase: {
				planningObligation: {
					hasObligation: true
				}
			},
			userHasUpdateCasePermission: true
		};
	});

	it(`should display Planning obligation due date with new Change action link`, () => {
		const mappedData = mapPlanningObligationDueDate(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-planning-obligation-due-date'
								},
								href: '/test/timetable/edit',
								text: 'Change',
								visuallyHiddenText: 'Planning obligation due'
							}
						]
					},
					classes: 'appeal-planning-obligation-due-date',
					key: {
						text: 'Planning obligation due'
					},
					value: {
						text: '10 January 2025'
					}
				}
			},
			id: 'planning-obligation-due-date'
		});
	});

	it(`should display Planning obligation due date for inquiry procedure type`, () => {
		data.appealDetails.procedureType = APPEAL_CASE_PROCEDURE.INQUIRY;
		const mappedData = mapPlanningObligationDueDate(data);
		expect(mappedData).toMatchObject({
			id: 'planning-obligation-due-date'
		});
	});

	it(`should display Planning obligation due date for enforcement written appeals`, () => {
		data.appealDetails.procedureType = APPEAL_CASE_PROCEDURE.WRITTEN;
		data.appealDetails.appealType = APPEAL_TYPE.ENFORCEMENT_NOTICE;
		const mappedData = mapPlanningObligationDueDate(data);
		expect(mappedData).toMatchObject({
			id: 'planning-obligation-due-date'
		});
	});

	it(`should display Planning obligation due date for ELB written appeals`, () => {
		data.appealDetails.procedureType = APPEAL_CASE_PROCEDURE.WRITTEN;
		data.appealDetails.appealType = APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING;
		const mappedData = mapPlanningObligationDueDate(data);
		expect(mappedData).toMatchObject({
			id: 'planning-obligation-due-date'
		});
	});

	it(`should not display Planning obligation due date when appeal not started`, () => {
		delete data.appealDetails.startedAt;
		const mappedData = mapPlanningObligationDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'planning-obligation-due-date'
		});
	});

	it(`should not display Planning obligation due date when appeal not hearing or inquiry`, () => {
		data.appealDetails.procedureType = APPEAL_CASE_PROCEDURE.WRITTEN;
		const mappedData = mapPlanningObligationDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'planning-obligation-due-date'
		});
	});

	it(`should not display Planning obligation due date when appeal does not have appellant case hasObligation`, () => {
		delete data.appellantCase.planningObligation;
		const mappedData = mapPlanningObligationDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'planning-obligation-due-date'
		});
	});
});
