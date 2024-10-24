import { request } from '#tests/../app-test.js';
import { jest } from '@jest/globals';
import {
	ERROR_INVALID_APPELLANT_CASE_DATA,
	ERROR_INVALID_LPAQ_DATA
} from '#endpoints/constants.js';
import {
	validAppellantCase,
	validLpaQuestionnaire,
	appealIngestionInput,
	docIngestionInput
} from '#tests/integrations/mocks.js';
import { APPEAL_CASE_STATUS, APPEAL_CASE_TYPE, APPEAL_REDACTED_STATUS } from 'pins-data-model';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('/appeals/case-submission', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('POST invalid appellant case submission', () => {
		test('invalid appellant case payload: no appeal', async () => {
			const { casedata, ...invalidPayload } = validAppellantCase;
			const response = await request.post('/appeals/case-submission').send(invalidPayload);

			expect(casedata).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/: must have required property 'casedata'"],
					integration: ERROR_INVALID_APPELLANT_CASE_DATA
				}
			});
		});

		test('POST invalid appellant case payload: no LPA', async () => {
			const { lpaCode, ...invalidPayload } = validAppellantCase.casedata;
			const payload = { casedata: { ...invalidPayload }, users: [], documents: [] };
			const response = await request.post('/appeals/case-submission').send(payload);

			expect(lpaCode).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/casedata: must have required property 'lpaCode'"],
					integration: ERROR_INVALID_APPELLANT_CASE_DATA
				}
			});
		});

		test('POST invalid appellant case payload: no appeal type', async () => {
			const { caseType, ...invalidPayload } = validAppellantCase.casedata;
			const payload = { casedata: { ...invalidPayload }, users: [], documents: [] };
			const response = await request.post('/appeals/case-submission').send(payload);

			expect(caseType).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/casedata: must have required property 'caseType'"],
					integration: ERROR_INVALID_APPELLANT_CASE_DATA
				}
			});
		});

		test('POST invalid appellant case payload: unsupported appeal type', async () => {
			// eslint-disable-next-line no-unused-vars
			const { caseType, ...validPayload } = validAppellantCase.casedata;
			const payload = {
				casedata: {
					...validPayload,
					caseType: APPEAL_CASE_TYPE.Y
				},
				users: validAppellantCase.users,
				documents: []
			};

			const response = await request.post('/appeals/case-submission').send(payload);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: `Error validating case types: ${APPEAL_CASE_TYPE.Y} not currently supported`,
					integration: ERROR_INVALID_APPELLANT_CASE_DATA
				}
			});
		});

		test('POST invalid appellant case payload: no application reference', async () => {
			const { applicationReference, ...invalidPayload } = validAppellantCase.casedata;
			const payload = { casedata: { ...invalidPayload }, users: [], documents: [] };
			const response = await request.post('/appeals/case-submission').send(payload);

			expect(applicationReference).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/casedata: must have required property 'applicationReference'"],
					integration: ERROR_INVALID_APPELLANT_CASE_DATA
				}
			});
		});
	});

	describe('POST successful appeal gets ingested', () => {
		test('POST valid appellant case payload and create appeal', async () => {
			const result = createIntegrationMocks(appealIngestionInput);
			const payload = validAppellantCase;
			const response = await request.post('/appeals/case-submission').send(payload);

			expect(databaseConnector.appeal.create).toHaveBeenCalledWith({
				data: {
					reference: expect.any(String),
					submissionId: expect.any(String),
					...appealIngestionInput
				}
			});
			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				where: { id: 100 },
				data: {
					reference: expect.any(String),
					appealStatus: {
						create: {
							status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
							createdAt: expect.any(String)
						}
					}
				}
			});

			expect(databaseConnector.document.createMany).toHaveBeenCalled();
			expect(databaseConnector.documentVersion.createMany).toHaveBeenCalled();
			expect(databaseConnector.documentVersion.findMany).toHaveBeenCalled();

			expect(databaseConnector.appeal.findUnique).toHaveBeenCalled();
			expect(response.status).toEqual(200);
			expect(response.body).toEqual(result);
		});
	});
});

describe('/appeals/lpaq-submission', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('POST invalid LPA submission', () => {
		test('invalid LPA response payload: no appeal', async () => {
			const { casedata, ...invalidPayload } = validLpaQuestionnaire;
			const response = await request.post('/appeals/lpaq-submission').send(invalidPayload);

			expect(casedata).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/: must have required property 'casedata'"],
					integration: ERROR_INVALID_LPAQ_DATA
				}
			});
		});

		test('invalid LPA response payload: no caseReference', async () => {
			const { caseReference, ...invalidPayload } = validLpaQuestionnaire.casedata;
			const payload = { casedata: { ...invalidPayload }, documents: [] };
			const response = await request.post('/appeals/lpaq-submission').send(payload);

			expect(caseReference).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/casedata: must have required property 'caseReference'"],
					integration: ERROR_INVALID_LPAQ_DATA
				}
			});
		});

		test('invalid LPA response payload: no lpaCostsAppliedFor', async () => {
			const { lpaCostsAppliedFor, ...invalidPayload } = validLpaQuestionnaire.casedata;
			const payload = { casedata: { ...invalidPayload }, documents: [] };
			const response = await request.post('/appeals/lpaq-submission').send(payload);

			expect(lpaCostsAppliedFor).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/casedata: must have required property 'lpaCostsAppliedFor'"],
					integration: ERROR_INVALID_LPAQ_DATA
				}
			});
		});

		test('invalid LPA response payload: no isGreenBelt', async () => {
			const { isGreenBelt, ...invalidPayload } = validLpaQuestionnaire.casedata;
			const payload = { casedata: { ...invalidPayload }, documents: [] };
			const response = await request.post('/appeals/lpaq-submission').send(payload);

			expect(isGreenBelt).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/casedata: must have required property 'isGreenBelt'"],
					integration: ERROR_INVALID_LPAQ_DATA
				}
			});
		});
	});
});

// @ts-ignore
const createIntegrationMocks = (appealIngestionInput) => {
	const appealCreatedResult = { id: 100, reference: '6000100' };
	// @ts-ignore
	databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	// @ts-ignore
	databaseConnector.appealRelationship.createMany.mockResolvedValue([]);
	// @ts-ignore
	databaseConnector.serviceUser.findUnique.mockResolvedValue(null);
	// @ts-ignore
	databaseConnector.appeal.findMany.mockResolvedValue([]);
	// @ts-ignore
	databaseConnector.appeal.create.mockResolvedValue({ id: appealCreatedResult.id });
	// @ts-ignore
	databaseConnector.appeal.update.mockResolvedValue(appealCreatedResult);
	// @ts-ignore
	databaseConnector.appeal.findUnique.mockResolvedValue(appealCreatedResult);
	// @ts-ignore
	databaseConnector.document.createMany.mockResolvedValue([docIngestionInput]);
	// @ts-ignore
	databaseConnector.documentVersion.findMany.mockResolvedValue([
		{
			version: 1,
			...docIngestionInput,
			documentURI: expect.any(String),
			blobStoragePath: expect.any(String),
			dateReceived: expect.any(String),
			draft: false,
			redactionStatusId: expect.any(Number)
		}
	]);
	// @ts-ignore
	databaseConnector.auditTrail.create.mockResolvedValue({});
	// @ts-ignore
	databaseConnector.folder.findMany.mockResolvedValue(
		appealIngestionInput.folders.create.map((/** @type {any} */ o, /** @type {number} */ ix) => {
			return { ...o, id: ix + 1 };
		})
	);

	// @ts-ignore
	databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
		{ key: APPEAL_REDACTED_STATUS.NOT_REDACTED }
	]);

	return appealCreatedResult;
};
