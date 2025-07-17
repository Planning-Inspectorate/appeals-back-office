import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { findStatusDate } from '#utils/mapping/map-dates.js';
import { isCaseInvalid } from '#utils/case-invalid.js';

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
