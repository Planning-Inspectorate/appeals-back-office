// @ts-nocheck

import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { findStatusDate } from '#utils/mapping/map-dates.js';
import { isCaseInvalid } from '#utils/case-invalid.js';
import { mapDesignatedSiteNames } from '../shared/s20s78/questionnaire-fields.js';
import { fullPlanningAppeal } from '#tests/appeals/mocks.js';
import { mapCaseDates } from '../shared/s20s78/map-case-dates.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';

describe('appeals generic mappers', () => {
	test('map case validation date on invalid appeal', async () => {
		const input = {
			appeal: {
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
						valid: false,
						createdAt: new Date('2025-03-16T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.VALIDATION,
						valid: false,
						createdAt: new Date('2025-03-17T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.READY_TO_START,
						valid: false,
						createdAt: new Date('2025-03-18T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
						valid: false,
						createdAt: new Date('2025-03-19T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
						valid: false,
						createdAt: new Date('2025-03-20T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.INVALID,
						valid: true,
						createdAt: new Date('2025-03-21T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					}
				]
			}
		};

		const { appeal } = input;
		const output = isCaseInvalid(appeal.appealStatus)
			? findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START)
			: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.INVALID) ??
			  findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START);

		console.log(output);
		expect(output).toBe('2025-03-18T09:12:33.334Z');
	});

	test('map case validation date on invalid appellant case', async () => {
		const input = {
			appeal: {
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
						valid: false,
						createdAt: new Date('2025-03-16T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.VALIDATION,
						valid: false,
						createdAt: new Date('2025-03-17T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.READY_TO_START,
						valid: false,
						createdAt: new Date('2025-03-18T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.INVALID,
						valid: true,
						createdAt: new Date('2025-03-19T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					}
				]
			}
		};

		const { appeal } = input;
		const output = isCaseInvalid(appeal.appealStatus)
			? findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START)
			: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.INVALID) ??
			  findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START);

		expect(output).toBe('2025-03-19T09:12:33.334Z');
	});
});

describe('mapDesignatedSiteNames', () => {
	test('mapDesignatedSiteNames should connect predefined sites and manually insert a single custom answer', async () => {
		/**
		 * @type {import('@planning-inspectorate/data-model').Schemas.LPAQS78SubmissionProperties}
		 */
		const input = {
			caseReference: '',
			lpaQuestionnaireSubmittedDate: '',
			siteAccessDetails: [],
			siteSafetyDetails: [],
			nearbyCaseReferences: [],
			neighbouringSiteAddresses: [],
			designatedSitesNames: ['expected', 'first, custom', 'second custom']
		};
		const expected = [
			{ key: 'expected', name: 'Expected', id: 1 },
			{ key: 'expected2', name: 'Expected 2', id: 2 }
		];

		const result = mapDesignatedSiteNames(input, expected);

		expect(result).toEqual({
			designatedSiteNames: {
				create: [{ designatedSite: { connect: { key: 'expected' } } }]
			},
			designatedSiteNameCustom: 'first, custom'
		});
	});
});

describe('mapCaseDates', () => {
	test('mapCaseDates should return the correct dates', async () => {
		const input = {
			appeal: {
				...fullPlanningAppeal,
				appealTimetable: {
					...fullPlanningAppeal.appealTimetable,
					finalCommentsDueDate: new Date('2025-03-03T09:12:33.334Z'),
					ipCommentsDueDate: new Date('2025-03-04T09:12:33.334Z'),
					lpaProofsSubmittedDate: new Date('2025-03-06T09:12:33.334Z'),
					lpaQuestionnairePublishedDate: new Date('2025-03-07T09:12:33.334Z'),
					lpaQuestionnaireValidationOutcomeDate: new Date('2025-03-08T09:12:33.334Z'),
					proofsOfEvidenceDueDate: new Date('2025-03-10T09:12:33.334Z'),
					siteNoticesSentDate: new Date('2025-03-11T09:12:33.334Z'),
					lpaStatementDueDate: new Date('2025-03-12T09:12:33.334Z'),
					statementOfCommonGroundDueDate: new Date('2025-03-13T09:12:33.334Z'),
					planningObligationDueDate: new Date('2025-03-14T09:12:33.334Z')
				},
				representations: [
					{
						representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT,
						dateCreated: new Date('2025-03-15T09:12:33.334Z')
					},
					{
						representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
						dateCreated: new Date('2025-03-16T09:12:33.334Z')
					},
					{
						representationType: APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
						dateCreated: new Date('2025-03-17T09:12:33.334Z')
					},
					{
						representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
						dateCreated: new Date('2025-03-18T09:12:33.334Z')
					},
					{
						representationType: APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
						dateCreated: new Date('2025-03-19T09:12:33.334Z')
					}
				],
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.STATEMENTS,
						createdAt: new Date('2025-03-20T09:12:33.334Z')
					}
				]
			}
		};

		const result = mapCaseDates(input);

		expect(result).toEqual({
			appellantCommentsSubmittedDate: '2025-03-15T09:12:33.334Z',
			appellantStatementSubmittedDate: '2025-03-16T09:12:33.334Z',
			finalCommentsDueDate: '2025-03-03T09:12:33.334Z',
			interestedPartyRepsDueDate: '2025-03-04T09:12:33.334Z',
			lpaCommentsSubmittedDate: '2025-03-17T09:12:33.334Z',
			lpaQuestionnairePublishedDate: '2025-03-20T09:12:33.334Z',
			lpaQuestionnaireValidationOutcomeDate: '2025-03-20T09:12:33.334Z',
			lpaStatementSubmittedDate: '2025-03-18T09:12:33.334Z',
			statementDueDate: '2025-03-12T09:12:33.334Z',
			statementOfCommonGroundDueDate: '2025-03-13T09:12:33.334Z',
			planningObligationDueDate: '2025-03-14T09:12:33.334Z',
			proofsOfEvidenceDueDate: null,
			siteNoticesSentDate: null,
			lpaProofsSubmittedDate: null
		});
	});
});
