// @ts-nocheck
import { mapCaseProcedure } from '#lib/mappers/data/appeal/submappers/case-procedure.mapper.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

describe('case-proceudre.mapper', () => {
	let params;

	beforeEach(() => {
		params = {
			appealDetails: {
				startedAt: new Date('2025-01-01'),
				procedureType: APPEAL_CASE_PROCEDURE.HEARING,
				appealTimetable: {}
			},
			currentRoute: '/appeal-questionnaire',
			request: { originalUrl: '/original-url' }
		};
	});

	it('Should not display case procedure type if no timetable', () => {
		params.appealDetails.appealTimetable = undefined;
		const result = mapCaseProcedure(params);
		expect(result.id).toEqual('case-procedure');
		expect(result.display.summaryListItem).toEqual(undefined);
	});

	it('Should display case procedure type if timetable exists', () => {
		const result = mapCaseProcedure(params);
		expect(result.id).toEqual('case-procedure');
		expect(result.display.summaryListItem).not.toEqual(undefined);

		expect(result).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: []
					},
					classes: 'appeal-case-procedure',
					key: {
						text: 'Appeal procedure'
					},
					value: {
						text: 'hearing'
					}
				}
			},
			id: 'case-procedure'
		});
	});
});
