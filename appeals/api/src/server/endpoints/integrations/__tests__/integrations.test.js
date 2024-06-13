import { request } from '#tests/../app-test.js';
import { jest } from '@jest/globals';
import { ERROR_INVALID_APPELLANT_CASE_DATA } from '#endpoints/constants.js';
import { validAppellantCase } from '#tests/integrations/mocks.js';

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
