import { request } from '#tests/../app-test.js';
import { jest } from '@jest/globals';
import {
	ERROR_INVALID_APPEAL_TYPE_REP,
	ERROR_INVALID_APPELLANT_CASE_DATA
} from '@pins/appeals/constants/support.js';
import {
	validAppellantCase,
	validAppellantCaseS78,
	validLpaQuestionnaire,
	validRepresentationIp,
	validRepresentationAppellantFinalComment,
	validRepresentationLpaStatement,
	appealIngestionInput,
	appealIngestionInputS78,
	docIngestionInput
} from '#tests/integrations/mocks.js';
import {
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE,
	APPEAL_REDACTED_STATUS
} from '@planning-inspectorate/data-model';
import { FOLDERS } from '@pins/appeals/constants/documents.js';

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
		});

		test('POST invalid appellant case payload: no LPA', async () => {
			const { lpaCode, ...invalidPayload } = validAppellantCase.casedata;
			const payload = { casedata: { ...invalidPayload }, users: [], documents: [] };
			const response = await request.post('/appeals/case-submission').send(payload);

			expect(lpaCode).not.toBeUndefined();
			expect(response.status).toEqual(400);
		});

		test('POST invalid appellant case payload: no appeal type', async () => {
			const { caseType, ...invalidPayload } = validAppellantCase.casedata;
			const payload = { casedata: { ...invalidPayload }, users: [], documents: [] };
			const response = await request.post('/appeals/case-submission').send(payload);

			expect(caseType).not.toBeUndefined();
			expect(response.status).toEqual(400);
		});

		test('POST invalid appellant case payload: unsupported appeal type', async () => {
			// eslint-disable-next-line no-unused-vars
			const { caseType, ...validPayload } = validAppellantCase.casedata;
			const payload = {
				casedata: {
					...validPayload,
					caseType: APPEAL_CASE_TYPE.Q
				},
				users: validAppellantCase.users,
				documents: []
			};

			const response = await request.post('/appeals/case-submission').send(payload);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: `Error validating case types: ${payload.casedata.caseType} not currently supported`,
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
			expect(response.status).toEqual(201);
			expect(response.body).toEqual(result);
		});

		test('POST valid s78 appellant case payload and create appeal', async () => {
			const result = createIntegrationMocks(appealIngestionInputS78);
			const payload = validAppellantCaseS78;
			const response = await request.post('/appeals/case-submission').send(payload);

			expect(databaseConnector.appeal.create).toHaveBeenCalledWith({
				data: {
					reference: expect.any(String),
					submissionId: expect.any(String),
					...appealIngestionInputS78
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
			expect(response.status).toEqual(201);
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
		});

		test('invalid LPA response payload: no caseReference', async () => {
			const { caseReference, ...invalidPayload } = validLpaQuestionnaire.casedata;
			const payload = { casedata: { ...invalidPayload }, documents: [] };
			const response = await request.post('/appeals/lpaq-submission').send(payload);

			expect(caseReference).not.toBeUndefined();
			expect(response.status).toEqual(400);
		});

		test('invalid LPA response payload: no lpaCostsAppliedFor', async () => {
			const { lpaCostsAppliedFor, ...invalidPayload } = validLpaQuestionnaire.casedata;
			const payload = { casedata: { ...invalidPayload }, documents: [] };
			const response = await request.post('/appeals/lpaq-submission').send(payload);

			expect(lpaCostsAppliedFor).not.toBeUndefined();
			expect(response.status).toEqual(400);
		});

		test('invalid LPA response payload: no isGreenBelt', async () => {
			const { isGreenBelt, ...invalidPayload } = validLpaQuestionnaire.casedata;
			const payload = { casedata: { ...invalidPayload }, documents: [] };
			const response = await request.post('/appeals/lpaq-submission').send(payload);

			expect(isGreenBelt).not.toBeUndefined();
			expect(response.status).toEqual(400);
		});
	});
});

describe('/appeals/representation-submission', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('POST invalid representation', () => {
		test('invalid rep payload: no appeal ref', async () => {
			const { caseReference, ...invalidPayload } = validRepresentationIp;
			const response = await request
				.post('/appeals/representation-submission')
				.send(invalidPayload);

			expect(caseReference).not.toBeUndefined();
			expect(response.status).toEqual(400);
		});

		test('invalid rep payload: no appellant origin', async () => {
			const { serviceUserId, ...invalidPayload } = validRepresentationAppellantFinalComment;
			const response = await request
				.post('/appeals/representation-submission')
				.send(invalidPayload);

			expect(serviceUserId).not.toBeUndefined();
			expect(response.status).toEqual(400);
		});

		test('invalid rep payload: no lpa origin', async () => {
			const { lpaCode, ...invalidPayload } = validRepresentationLpaStatement;
			const response = await request
				.post('/appeals/representation-submission')
				.send(invalidPayload);

			expect(lpaCode).not.toBeUndefined();
			expect(response.status).toEqual(400);
		});

		test('invalid rep payload: no matching appeal', async () => {
			const { caseReference, ...invalidPayload } = validRepresentationLpaStatement;
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await request
				.post('/appeals/representation-submission')
				.send({ caseReference: 'ABCDE', ...invalidPayload });

			expect(caseReference).not.toBeUndefined();
			expect(response.status).toEqual(404);
		});

		test('invalid rep payload: incorrect appeal type', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				id: 1,
				reference: validRepresentationLpaStatement.caseReference,
				appealType: {
					key: 'D'
				}
			});

			const response = await request
				.post('/appeals/representation-submission')
				.send(validRepresentationLpaStatement);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({ errors: { appeal: ERROR_INVALID_APPEAL_TYPE_REP } });
		});

		test('valid rep payload: LPA statement', async () => {
			const validRepresentation = {
				...validRepresentationLpaStatement,
				lpaCode: 'Q9999'
			};

			// @ts-ignore
			databaseConnector.folder.findMany.mockResolvedValue(
				FOLDERS.map((/** @type {string} */ folder, /** @type {number} */ ix) => {
					return {
						id: ix + 1,
						path: folder
					};
				})
			);

			// @ts-ignore
			databaseConnector.documentVersion.findMany.mockResolvedValue([
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentGuid: '001',
					documentType: 'lpaStatement',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: 'img3.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
					size: 10293
				}
			]);

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				id: 2,
				reference: validRepresentationLpaStatement.caseReference,
				appealType: {
					key: 'W'
				},
				appealStatus: [
					{
						id: 1,
						status: 'lpa_questionnaire',
						createdAt: new Date('2024-05-27T14:08:50.414Z'),
						valid: true,
						appealId: 2
					}
				],
				lpa: {
					lpaCode: 'Q9999'
				}
			});

			const response = await request
				.post('/appeals/representation-submission')
				.send(validRepresentation);

			expect(databaseConnector.representation.create).toHaveBeenCalled();
			expect(databaseConnector.document.createMany).toHaveBeenCalled();
			expect(databaseConnector.documentVersion.createMany).toHaveBeenCalled();
			expect(databaseConnector.documentVersion.findMany).toHaveBeenCalled();
			expect(databaseConnector.representationAttachment.createMany).toHaveBeenCalled();
			expect(response.status).toEqual(201);
		});

		test('valid rep payload: Appellant final comments', async () => {
			const validRepresentation = {
				...validRepresentationAppellantFinalComment,
				serviceUserId: (200000000 + 1).toString()
			};

			// @ts-ignore
			databaseConnector.serviceUser.findUnique.mockResolvedValue({ id: 1 });

			// @ts-ignore
			databaseConnector.folder.findMany.mockResolvedValue(
				FOLDERS.map((/** @type {string} */ folder, /** @type {number} */ ix) => {
					return {
						id: ix + 1,
						path: folder
					};
				})
			);

			// @ts-ignore
			databaseConnector.documentVersion.findMany.mockResolvedValue([
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentGuid: '001',
					documentType: 'appellantFinalComment',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: 'img3.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
					size: 10293
				}
			]);

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				id: 2,
				reference: validRepresentationLpaStatement.caseReference,
				appealType: {
					key: 'W'
				},
				appealStatus: [
					{
						id: 1,
						status: 'lpa_questionnaire',
						createdAt: new Date('2024-05-27T14:08:50.414Z'),
						valid: true,
						appealId: 2
					}
				],
				lpa: {
					lpaCode: 'Q9999'
				}
			});

			const response = await request
				.post('/appeals/representation-submission')
				.send(validRepresentation);

			expect(databaseConnector.representation.create).toHaveBeenCalled();
			expect(databaseConnector.document.createMany).toHaveBeenCalled();
			expect(databaseConnector.documentVersion.createMany).toHaveBeenCalled();
			expect(databaseConnector.documentVersion.findMany).toHaveBeenCalled();
			expect(databaseConnector.representationAttachment.createMany).toHaveBeenCalled();
			expect(response.status).toEqual(201);
		});
	});
});

const createIntegrationMocks = (/** @type {*} */ appealIngestionInput) => {
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
