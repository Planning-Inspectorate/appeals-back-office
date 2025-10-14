// @ts-nocheck
import { mapAppealType } from '#lib/mappers/data/appeal/submappers/appeal-type.mapper.js';
import { jest } from '@jest/globals';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { DOCUMENT_STATUS_RECEIVED } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

describe('appeal-type.mapper', () => {
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

	it('Should display appeal type when not a linked appeal', () => {
		const result = mapAppealType(params);
		expect(result).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-appeal-type'
								},
								href: '/appeal-questionnaire/change-appeal-type/appeal-type',
								text: 'Change',
								visuallyHiddenText: 'Appeal type'
							}
						]
					},
					classes: 'appeal-appeal-type',
					key: {
						text: 'Appeal type'
					},
					value: {
						text: 'Planning appeal'
					}
				}
			},
			id: 'appeal-type'
		});
	});

	it('Should not display appeal type when a linked appeal', () => {
		params.appealDetails.isParentAppeal = true;
		const result = mapAppealType(params);
		expect(result).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: []
					},
					classes: 'appeal-appeal-type',
					key: {
						text: 'Appeal type'
					},
					value: {
						text: 'Planning appeal'
					}
				}
			},
			id: 'appeal-type'
		});
	});
});
