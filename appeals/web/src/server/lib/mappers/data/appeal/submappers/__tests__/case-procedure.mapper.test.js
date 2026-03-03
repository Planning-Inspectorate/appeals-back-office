// @ts-nocheck
import { mapCaseProcedure } from '#lib/mappers/data/appeal/submappers/case-procedure.mapper.js';
import { jest } from '@jest/globals';
import config from '@pins/appeals.web/environment/config.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { DOCUMENT_STATUS_RECEIVED } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

describe('case-procedure.mapper', () => {
	let params;
	const originalFeatureFlags = { ...config.featureFlags };

	beforeEach(() => {
		Object.assign(config.featureFlags, {
			featureFlagEnforcementNotice: true,
			featureFlagS78Written: true,
			featureFlagEnforcementNoticeHearing: true,
			featureFlagEnforcementNoticeInquiry: true
		});

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
		Object.assign(config.featureFlags, originalFeatureFlags);
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
								href: '/appeal-questionnaire/change-appeal-procedure-type/change-selected-procedure-type',
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

	it('Should display change link for enforcement notice appeal type when editable', () => {
		params.appealDetails.appealType = APPEAL_TYPE.ENFORCEMENT_NOTICE;

		const result = mapCaseProcedure(params);

		expect(result?.display?.summaryListItem?.actions?.items).toEqual([
			{
				attributes: {
					'data-cy': 'change-case-procedure'
				},
				href: '/appeal-questionnaire/change-appeal-procedure-type/change-selected-procedure-type',
				text: 'Change',
				visuallyHiddenText: 'Appeal procedure'
			}
		]);
	});

	it('Should not display change link for enforcement notice appeal type when enforcement hearing and inquiry flags are off', () => {
		Object.assign(config.featureFlags, {
			featureFlagEnforcementNoticeHearing: false,
			featureFlagEnforcementNoticeInquiry: false
		});
		params.appealDetails.appealType = APPEAL_TYPE.ENFORCEMENT_NOTICE;

		const result = mapCaseProcedure(params);

		expect(result?.display?.summaryListItem?.actions?.items).toEqual([]);
	});

	it('Should not display change link if linked child appeal', () => {
		params.appealDetails.isChildAppeal = true;
		const result = mapCaseProcedure(params);
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

	it('Should not display change link if linked lead appeal', () => {
		params.appealDetails.isParentAppeal = true;
		const result = mapCaseProcedure(params);
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
