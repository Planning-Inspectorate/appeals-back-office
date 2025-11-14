// @ts-nocheck
import { request } from '#server/app-test.js';
import {
	advertisementAppeal,
	casAdvertAppeal,
	casPlanningAppeal,
	fullPlanningAppeal,
	householdAppeal,
	listedBuildingAppeal
} from '#tests/appeals/mocks.js';
import { appellantCaseValidationOutcomes, azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import {
	ERROR_CANNOT_BE_EMPTY_STRING,
	ERROR_INVALID_APPEAL_STATE,
	ERROR_MUST_BE_STRING,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

const { databaseConnector } = await import('#utils/database-connector.js');

const appealTypes = [
	{
		id: 1,
		type: 'Householder',
		key: 'D',
		processCode: 'HAS',
		enabled: true,
		changeAppealType: 'Householder'
	},
	{
		id: 2,
		type: 'Enforcement notice appeal',
		key: 'C',
		processCode: null,
		enabled: false
	},
	{
		id: 3,
		type: 'Enforcement listed building and conservation area appeal',
		key: 'F',
		processCode: null,
		enabled: false
	},
	{
		id: 4,
		type: 'Discontinuance notice appeal',
		key: 'G',
		processCode: null,
		enabled: false
	},
	{
		id: 5,
		type: 'Advertisement appeal',
		key: 'H',
		processCode: null,
		enabled: false
	},
	{
		id: 6,
		type: 'Community infrastructure levy',
		key: 'L',
		processCode: null,
		enabled: false
	},
	{
		id: 7,
		type: 'Planning obligation appeal',
		key: 'Q',
		processCode: null,
		enabled: false
	},
	{
		id: 8,
		type: 'Affordable housing obligation appeal',
		key: 'S',
		processCode: null,
		enabled: false
	},
	{
		id: 9,
		type: 'Call-in application',
		key: 'V',
		processCode: null,
		enabled: false
	},
	{
		id: 10,
		type: 'Planning appeal',
		key: 'W',
		processCode: null,
		enabled: false,
		changeAppealType: 'Planning'
	},
	{
		id: 11,
		type: 'Lawful development certificate appeal',
		key: 'X',
		processCode: null,
		enabled: false
	},
	{
		id: 12,
		type: 'Planning listed building and conservation area appeal',
		key: 'Y',
		processCode: null,
		enabled: false
	},
	{
		id: 13,
		type: 'CAS planning',
		key: 'ZP',
		processCode: null,
		enabled: false,
		changeAppealType: 'Commercial planning (CAS)'
	}
];
const appealsWithValidStatus = [
	{
		...householdAppeal,
		appealStatus: [
			{
				status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				valid: true
			}
		]
	},
	{
		...householdAppeal,
		appealStatus: [
			{
				status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				valid: true
			}
		]
	}
];
const appealsWithInvalidStatus = [
	{
		...householdAppeal,
		appealStatus: [
			{
				status: APPEAL_CASE_STATUS.CLOSED,
				valid: true
			}
		]
	}
];
const mockInvalidReason = {
	id: 5,
	name: 'Wrong appeal type',
	hasText: false
};

describe('appeal change type resubmit routes', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('POST', () => {
		test('returns 400 when date is in the past', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealsWithValidStatus[0]);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-change-request`)
				.send({
					newAppealTypeId: 1,
					newAppealTypeFinalDate: '2023-02-02'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});
		test('returns 400 when appeal type is not matched', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealsWithValidStatus[1]);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-change-request`)
				.send({
					newAppealTypeId: 16,
					newAppealTypeFinalDate: '2026-02-16T11:43:27.096Z'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealTypeId: ERROR_NOT_FOUND
				}
			});
		});
		test('returns 400 when appeal status is incorrect', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealsWithInvalidStatus[0]);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-change-request`)
				.send({
					newAppealTypeId: 1,
					newAppealTypeFinalDate: '2024-02-02'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					appealStatus: ERROR_INVALID_APPEAL_STATE
				}
			});
		});
		test.each([
			['household', householdAppeal, 13],
			['advertisement', advertisementAppeal, 5],
			['casPlanning', casPlanningAppeal, 1],
			['casAdvert', casAdvertAppeal, 1],
			['fullPlanning', fullPlanningAppeal, 1],
			['listedBuilding', listedBuildingAppeal, 1]
		])('returns 200 when appeal status is correct: %s', async (_, appeal, newType) => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${appeal.id}/appeal-change-request`)
				.send({
					newAppealTypeId: newType,
					newAppealTypeFinalDate: '3000-02-05T00:00:00.000Z'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				data: {
					caseResubmittedTypeId: newType,
					caseUpdatedDate: expect.any(Date)
				},
				where: {
					id: appeal.id
				}
			});

			expect(databaseConnector.appealTimetable.upsert).toHaveBeenCalledWith({
				create: {
					appealId: appeal.id,
					caseResubmissionDueDate: new Date('3000-02-05T23:59:00.000Z')
				},
				update: {
					caseResubmissionDueDate: new Date('3000-02-05T23:59:00.000Z')
				},
				where: {
					appealId: appeal.id
				},
				include: {
					appeal: true
				}
			});

			expect(mockNotifySend).toHaveBeenCalledTimes(1);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.anything(),
				personalisation: {
					existing_appeal_type: appeal.appealType.type,
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					appeal_type: appealTypes[newType - 1].type.toLowerCase(),
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					due_date: formatDate(new Date('3000-02-05'), false),
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: 'test@136s7.com',
				templateName: 'appeal-type-change-non-has'
			});

			expect(response.status).toEqual(200);
		});
	});
});

describe('appeal resubmit mark invalid type routes', () => {
	describe('POST', () => {
		test('returns 200 when an appeal requiring resubmission is marked as invalid', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);
			// @ts-ignore
			databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue(
				appellantCaseValidationOutcomes[0]
			);
			// @ts-ignore
			databaseConnector.appellantCaseInvalidReason.findUnique.mockResolvedValue(mockInvalidReason);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-resubmit-mark-invalid`)
				.send({
					newAppealTypeId: 13,
					newAppealTypeFinalDate: '3000-02-05T00:00:00.000Z',
					appellantCaseId: 1
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				data: {
					caseResubmittedTypeId: 13,
					caseUpdatedDate: expect.any(Date)
				},
				where: {
					id: householdAppeal.id
				}
			});

			expect(databaseConnector.appealTimetable.upsert).toHaveBeenCalledWith({
				create: {
					appealId: householdAppeal.id,
					caseResubmissionDueDate: new Date('3000-02-05T23:59:00.000Z')
				},
				update: {
					caseResubmissionDueDate: new Date('3000-02-05T23:59:00.000Z')
				},
				where: {
					appealId: householdAppeal.id
				},
				include: {
					appeal: true
				}
			});

			expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: {
					appellantCaseValidationOutcomeId: appellantCaseValidationOutcomes[0].id
				}
			});

			expect(mockNotifySend).toHaveBeenCalledTimes(1);

			expect(mockNotifySend).toHaveBeenCalledWith({
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.anything(),
				personalisation: {
					appeal_reference_number: householdAppeal.reference,
					lpa_reference: householdAppeal.applicationReference,
					site_address: `${householdAppeal.address.addressLine1}, ${householdAppeal.address.addressLine2}, ${householdAppeal.address.addressTown}, ${householdAppeal.address.addressCounty}, ${householdAppeal.address.postcode}, ${householdAppeal.address.addressCountry}`,
					existing_appeal_type: `householder appeal`,
					appeal_type: 'commercial planning (CAS) appeal',
					due_date: '5 February 3000',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: householdAppeal.agent.email,
				templateName: 'appeal-type-change-non-has'
			});

			expect(response.status).toEqual(200);
		});
	});
});

describe('appeal change type transfer routes', () => {
	describe('POST', () => {
		test('returns 400 when appeal type is not matched', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealsWithValidStatus[0]);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-request`)
				.send({
					newAppealTypeId: 16
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealTypeId: ERROR_NOT_FOUND
				}
			});
		});

		test('returns 400 when appeal status is incorrect', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealsWithInvalidStatus[0]);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-request`)
				.send({
					newAppealTypeId: 1
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					appealStatus: ERROR_INVALID_APPEAL_STATE
				}
			});
		});

		test('returns 200 when the appeal is marked as awaiting transfer', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.appeal.update.mockResolvedValue();
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-request`)
				.send({
					newAppealTypeId: 1
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual(true);
			expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(householdAppeal.id);
		});
	});
});

describe('appeal change type transfer confirmation routes', () => {
	describe('POST', () => {
		test.each([
			['awaiting event', APPEAL_CASE_STATUS.AWAITING_EVENT],
			['closed', APPEAL_CASE_STATUS.CLOSED],
			['complete', APPEAL_CASE_STATUS.COMPLETE],
			['event', APPEAL_CASE_STATUS.EVENT],
			['evidence', APPEAL_CASE_STATUS.EVIDENCE],
			['final comments', APPEAL_CASE_STATUS.FINAL_COMMENTS],
			['invalid', APPEAL_CASE_STATUS.INVALID],
			['issue determination', APPEAL_CASE_STATUS.ISSUE_DETERMINATION],
			['lpa questionnaire', APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE],
			['ready to start', APPEAL_CASE_STATUS.READY_TO_START],
			['statements', APPEAL_CASE_STATUS.STATEMENTS],
			['withdrawn', APPEAL_CASE_STATUS.WITHDRAWN],
			['witnesses', APPEAL_CASE_STATUS.WITNESSES]
		])('returns 400 when appeal status is invalid: %s', async (_, caseStatus) => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{
						status: caseStatus,
						valid: true
					}
				]
			});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-confirmation`)
				.send({
					newAppealReference: 'A string'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					appealStatus: ERROR_INVALID_APPEAL_STATE
				}
			});
		});

		test('returns 400 when newAppealReference is null', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.AWAITING_TRANSFER,
						valid: true
					}
				]
			});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-confirmation`)
				.send({
					newAppealReference: null
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealReference: ERROR_MUST_BE_STRING
				}
			});
		});

		test('returns 400 when newAppealReference is empty', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.AWAITING_TRANSFER,
						valid: true
					}
				]
			});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-confirmation`)
				.send({
					newAppealReference: ''
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealReference: ERROR_CANNOT_BE_EMPTY_STRING
				}
			});
		});

		test('returns 400 when newAppealReference is not a string', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.AWAITING_TRANSFER,
						valid: true
					}
				]
			});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-confirmation`)
				.send({
					newAppealReference: 320
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealReference: ERROR_MUST_BE_STRING
				}
			});
		});

		test.each([
			['transfer', 'awaiting transfer', APPEAL_CASE_STATUS.AWAITING_TRANSFER],
			['update of horizon reference', 'transferred', APPEAL_CASE_STATUS.TRANSFERRED]
		])('returns 200 on %s of appeal with current status status: %s', async (_, __, caseStatus) => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{
						status: caseStatus,
						valid: true
					}
				]
			});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-confirmation`)
				.send({
					newAppealReference: '1000000'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual(true);
			expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(householdAppeal.id);
		});
	});
});

describe('appeal change update routes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('POST', () => {
		test('returns 404 if the appeal does not exist', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue();

			const response = await request
				.post(`/appeals/${6}/appeal-update-request`)
				.send({
					newAppealTypeId: 16
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
			expect(response.body).toEqual({
				errors: {
					appealId: ERROR_NOT_FOUND
				}
			});
		});

		test('returns 400 if the appeal type is not valid', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
						valid: true
					}
				]
			});
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-update-request`)
				.send({
					newAppealTypeId: 9
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealTypeId: ERROR_NOT_FOUND
				}
			});
		});

		test.each([
			['awaiting event', APPEAL_CASE_STATUS.AWAITING_EVENT],
			['awaiting transfer', APPEAL_CASE_STATUS.AWAITING_TRANSFER],
			['closed', APPEAL_CASE_STATUS.CLOSED],
			['complete', APPEAL_CASE_STATUS.COMPLETE],
			['event', APPEAL_CASE_STATUS.EVENT],
			['evidence', APPEAL_CASE_STATUS.EVIDENCE],
			['final comments', APPEAL_CASE_STATUS.FINAL_COMMENTS],
			['invalid', APPEAL_CASE_STATUS.INVALID],
			['issue determination', APPEAL_CASE_STATUS.ISSUE_DETERMINATION],
			['lpa questionnaire', APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE],
			['ready to start', APPEAL_CASE_STATUS.READY_TO_START],
			['statements', APPEAL_CASE_STATUS.STATEMENTS],
			['transferred', APPEAL_CASE_STATUS.TRANSFERRED],
			['withdrawn', APPEAL_CASE_STATUS.WITHDRAWN],
			['witnesses', APPEAL_CASE_STATUS.WITNESSES]
		])('returns 400 for invalid appeal case status: %s', async (_, caseStatus) => {
			const appealWithInvalidCaseStatus = {
				...householdAppeal,
				appealStatus: [
					{
						status: caseStatus,
						valid: true
					}
				]
			};

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithInvalidCaseStatus);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-update-request`)
				.send({
					newAppealTypeId: 10
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					appealStatus: ERROR_INVALID_APPEAL_STATE
				}
			});
		});

		test.each([
			['assign case officer', APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER],
			['validation', APPEAL_CASE_STATUS.VALIDATION]
		])('successfully updates appeal type for valid case status: %s', async (_, caseStatus) => {
			const appealWithValidCaseStatus = {
				...householdAppeal,
				appealStatus: [
					{
						status: caseStatus,
						valid: true
					}
				]
			};

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithValidCaseStatus);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-update-request`)
				.send({
					newAppealTypeId: 10
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				where: { id: householdAppeal.id },
				data: {
					appealTypeId: 10
				}
			});

			expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(appealWithValidCaseStatus.id);

			expect(mockNotifySend).toHaveBeenCalledTimes(2);
			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.anything(),
				personalisation: {
					appeal_reference_number: appealWithValidCaseStatus.reference,
					lpa_reference: appealWithValidCaseStatus.applicationReference,
					site_address: `${appealWithValidCaseStatus.address.addressLine1}, ${appealWithValidCaseStatus.address.addressLine2}, ${appealWithValidCaseStatus.address.addressTown}, ${appealWithValidCaseStatus.address.addressCounty}, ${appealWithValidCaseStatus.address.postcode}, ${appealWithValidCaseStatus.address.addressCountry}`,
					team_email_address: 'caseofficers@planninginspectorate.gov.uk',
					existing_appeal_type: 'householder appeal',
					new_appeal_type: 'planning appeal'
				},
				recipientEmail: appealWithValidCaseStatus.agent.email,
				templateName: 'appeal-type-change-in-manage-appeals-appellant'
			});

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.anything(),
				personalisation: {
					appeal_reference_number: appealWithValidCaseStatus.reference,
					lpa_reference: appealWithValidCaseStatus.applicationReference,
					site_address: `${appealWithValidCaseStatus.address.addressLine1}, ${appealWithValidCaseStatus.address.addressLine2}, ${appealWithValidCaseStatus.address.addressTown}, ${appealWithValidCaseStatus.address.addressCounty}, ${appealWithValidCaseStatus.address.postcode}, ${appealWithValidCaseStatus.address.addressCountry}`,
					team_email_address: 'caseofficers@planninginspectorate.gov.uk',
					existing_appeal_type: 'householder appeal',
					new_appeal_type: 'planning appeal'
				},
				recipientEmail: appealWithValidCaseStatus.lpa.email,
				templateName: 'appeal-type-change-in-manage-appeals-lpa'
			});

			expect(response.status).toEqual(200);
		});

		test('successfully deletes surplus appellant documents when type is changed from planning appeal to householder appeal', async () => {
			const appealWithValidCaseStatus = {
				...fullPlanningAppeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER
					},
					{
						status: APPEAL_CASE_STATUS.VALIDATION,
						valid: true
					}
				]
			};

			const folders = [
				{
					id: '1',
					appealId: fullPlanningAppeal.id,
					path: 'appellant-case/applicationDecisionLetter',
					documents: [{ id: '1', guid: 'guid-1', name: 'required.pdf' }]
				},
				{
					id: '2',
					appealId: fullPlanningAppeal.id,
					path: 'appellant-case/surplusDocumentsA',
					documents: [{ id: '2', guid: 'guid-A', name: 'surplus-a.pdf' }]
				},
				{
					id: '3',
					appealId: fullPlanningAppeal.id,
					path: 'appellant-case/surplusDocumentsB',
					documents: [{ id: '3', guid: 'guid-B', name: 'surplus-b.pdf' }]
				}
			];

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithValidCaseStatus);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);
			// @ts-ignore
			databaseConnector.folder.findMany.mockResolvedValue(folders);

			const response = await request
				.post(`/appeals/${fullPlanningAppeal.id}/appeal-update-request`)
				.send({
					newAppealTypeId: 1
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.document.update).toHaveBeenCalledTimes(2);

			expect(databaseConnector.document.update).toHaveBeenNthCalledWith(1, {
				where: { guid: 'guid-A' },
				data: expect.objectContaining({
					isDeleted: true
				})
			});

			expect(databaseConnector.document.update).toHaveBeenNthCalledWith(2, {
				where: { guid: 'guid-B' },
				data: expect.objectContaining({
					isDeleted: true
				})
			});

			expect(databaseConnector.documentVersion.updateMany).toHaveBeenCalledTimes(2);

			expect(databaseConnector.documentVersion.updateMany).toHaveBeenNthCalledWith(1, {
				where: { documentGuid: 'guid-A' },
				data: expect.objectContaining({
					isDeleted: true
				})
			});

			expect(databaseConnector.documentVersion.updateMany).toHaveBeenNthCalledWith(2, {
				where: { documentGuid: 'guid-B' },
				data: expect.objectContaining({
					isDeleted: true
				})
			});

			expect(response.status).toEqual(200);
		});

		test('sends a notify to appellant where agent email does not exist', async () => {
			const appealWithValidCaseStatus = {
				...householdAppeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
						valid: true
					}
				],
				agent: { email: null }
			};
			const recipientEmail = appealWithValidCaseStatus.appellant.email;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithValidCaseStatus);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-update-request`)
				.send({
					newAppealTypeId: 10
				})
				.set('azureAdUserId', azureAdUserId);

			expect(mockNotifySend).toHaveBeenCalledTimes(2);
			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.anything(),
				personalisation: {
					appeal_reference_number: appealWithValidCaseStatus.reference,
					lpa_reference: appealWithValidCaseStatus.applicationReference,
					site_address: `${appealWithValidCaseStatus.address.addressLine1}, ${appealWithValidCaseStatus.address.addressLine2}, ${appealWithValidCaseStatus.address.addressTown}, ${appealWithValidCaseStatus.address.addressCounty}, ${appealWithValidCaseStatus.address.postcode}, ${appealWithValidCaseStatus.address.addressCountry}`,
					team_email_address: 'caseofficers@planninginspectorate.gov.uk',
					existing_appeal_type: 'householder appeal',
					new_appeal_type: 'planning appeal'
				},
				recipientEmail,
				templateName: 'appeal-type-change-in-manage-appeals-appellant'
			});

			expect(response.status).toEqual(200);
		});
	});
});
