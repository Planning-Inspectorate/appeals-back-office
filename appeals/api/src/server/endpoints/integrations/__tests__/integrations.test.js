import { request } from '#tests/../app-test.js';
import { jest } from '@jest/globals';
import {
	ERROR_INVALID_APPELLANT_CASE_DATA,
	ERROR_INVALID_LPAQ_DATA
} from '#endpoints/constants.js';
import { validAppellantCase, validLpaQuestionnaire } from '#tests/integrations/mocks.js';
import { APPEAL_CASE_TYPE } from 'pins-data-model';

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

		test('invalid appellant case payload: no LPA', async () => {
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

		test('invalid appellant case payload: no appeal type', async () => {
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

		test('invalid appellant case payload: unsupported appeal type', async () => {
			const { caseType, ...validPayload } = validAppellantCase.casedata;
			console.log(caseType);
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

		test('invalid appellant case payload: no application reference', async () => {
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
