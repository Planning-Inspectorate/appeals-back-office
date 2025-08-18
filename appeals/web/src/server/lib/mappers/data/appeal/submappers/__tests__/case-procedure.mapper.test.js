// @ts-nocheck
import { mapCaseProcedure } from '#lib/mappers/data/appeal/submappers/case-procedure.mapper.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { jest } from '@jest/globals';
import { DOCUMENT_STATUS_RECEIVED } from '@pins/appeals/constants/support.js';

describe('case-procedure.mapper', () => {
	let params;

	beforeEach(() => {
		params = {
			appealDetails: {
				startedAt: new Date('2025-01-01'),
				procedureType: APPEAL_CASE_PROCEDURE.HEARING,
				appealTimetable: {},
				appealType: APPEAL_TYPE.S78,
				documentationSummary: {
					lpaStatement: {
						status: DOCUMENT_STATUS_RECEIVED
					}
				}
			},
			userHasUpdateCasePermission: true,
			currentRoute: '/appeal-questionnaire',
			request: { originalUrl: '/original-url' }
		};
	});
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('Should not display case procedure type if no timetable', () => {
		params.appealDetails.appealTimetable = undefined;
		const result = mapCaseProcedure(params);
		expect(result.id).toEqual('case-procedure');
		expect(result.display.summaryListItem).toEqual(undefined);
	});

	it('Should display case procedure type if timetable exists', () => {
		const result = mapCaseProcedure(params);
		expect(result).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-case-procedure'
								},
								href: '/appeal-questionnaire/change-appeal-details/procedure-type',
								text: 'Change',
								visuallyHiddenText: 'Appeal procedure'
							}
						]
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
