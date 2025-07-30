// @ts-nocheck
import { mapCaseProcedure } from '#lib/mappers/data/appeal/submappers/case-procedure.mapper.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { jest } from '@jest/globals';
import {
	DOCUMENT_STATUS_RECEIVED,
	DOCUMENT_STATUS_NOT_RECEIVED
} from '@pins/appeals/constants/support.js';
import config from '#environment/config.js';

jest.mock('#environment/config.js', () => ({
	__esModule: true,
	default: {
		featureFlags: {
			featureFlagS78Written: true,
			featureFlagS78Hearing: true,
			featureFlagS78Inquiry: false
		}
	}
}));

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
								href: '',
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

	it('Should display href link because lpastatement status is not received', () => {
		params.appealDetails.documentationSummary.lpaStatement.status = DOCUMENT_STATUS_NOT_RECEIVED;
		const result = mapCaseProcedure(params);
		expect(result.display.summaryListItem.actions.items[0].href).toEqual(
			'/appeal-questionnaire/change-appeal-details/case-procedure'
		);
	});

	it('Should not display href link because lpastatement status is received', () => {
		const result = mapCaseProcedure(params);
		expect(result.display.summaryListItem.actions.items[0].href).toEqual('');
	});

	it('Should not display href link because appeal type is not S78', () => {
		params.appealDetails.appealType = APPEAL_TYPE.HOUSEHOLDER;
		const result = mapCaseProcedure(params);
		expect(result.display.summaryListItem.actions.items[0].href).toEqual('');
	});

	it('Should display href link because 2 of of 3 procedure type flags are true', () => {
		config.featureFlags.featureFlagS78Written = true;
		config.featureFlags.featureFlagS78Hearing = true;
		config.featureFlags.featureFlagS78Inquiry = false;
		params.appealDetails.documentationSummary.lpaStatement.status = DOCUMENT_STATUS_NOT_RECEIVED;
		const result = mapCaseProcedure(params);
		expect(result.display.summaryListItem.actions.items[0].href).toEqual(
			'/appeal-questionnaire/change-appeal-details/case-procedure'
		);
	});

	it('Should not display href link because only 1 of of 3 procedure type flags are true', () => {
		config.featureFlags.featureFlagS78Written = false;
		config.featureFlags.featureFlagS78Hearing = true;
		config.featureFlags.featureFlagS78Inquiry = false;
		params.appealDetails.documentationSummary.lpaStatement.status = DOCUMENT_STATUS_NOT_RECEIVED;
		const result = mapCaseProcedure(params);
		expect(result.display.summaryListItem.actions.items[0].href).toEqual('');
	});
});
