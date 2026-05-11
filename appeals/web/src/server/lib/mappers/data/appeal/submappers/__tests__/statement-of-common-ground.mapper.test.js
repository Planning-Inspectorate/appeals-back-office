// @ts-nocheck
import { mapStatementOfCommonGroundDueDate } from '#lib/mappers/data/appeal/submappers/statement-of-common-ground-due-date.mapper.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common';

describe('S78 expedited appeal - statement-of-common-ground-due-date.mapper', () => {
	let data;
	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				validAt: '2026-04-01',
				appealTimetable: { statementOfCommonGroundDueDate: '' },
				appealType: APPEAL_TYPE.S78
			},
			appellantCase: {
				applicationDate: '2026-04-01',
				applicationDecision: 'refused',
				typeOfPlanningApplication: 'full-appeal'
			},
			userHasUpdateCasePermission: true
		};
	});

	it('should not display Statement of Common Ground due date for S78 expedited appeal', () => {
		const mappedData = mapStatementOfCommonGroundDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'statement-of-common-ground-due-date'
		});
	});
});
