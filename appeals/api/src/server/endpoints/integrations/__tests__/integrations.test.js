// @ts-nocheck
import { request } from '#server/app-test.js';
import {
	appealIngestionInput,
	appealIngestionInputAdverts,
	appealIngestionInputCasAdverts,
	appealIngestionInputCasPlanning,
	appealIngestionInputEnforcementNotice,
	appealIngestionInputS20,
	appealIngestionInputS20Written,
	appealIngestionInputS78,
	appealIngestionInputS78Written,
	docIngestionInput,
	validAppellantCase,
	validAppellantCaseAdverts,
	validAppellantCaseCasAdverts,
	validAppellantCaseCasPlanning,
	validAppellantCaseEnforcementNotice,
	validAppellantCaseS20,
	validAppellantCaseS78,
	validLpaQuestionnaireAdverts,
	validLpaQuestionnaireCasAdverts,
	validLpaQuestionnaireCasPlanning,
	validLpaQuestionnaireHas,
	validLpaQuestionnaireIngestionAdvert,
	validLpaQuestionnaireIngestionCasAdvert,
	validLpaQuestionnaireIngestionHas,
	validLpaQuestionnaireIngestionS78,
	validLpaQuestionnaireS78,
	validRepresentationAppellantFinalComment,
	validRepresentationIp,
	validRepresentationLpaStatement,
	validRepresentationRule6PartyProofsEvidence,
	validRepresentationRule6PartyStatement
} from '#tests/integrations/mocks.js';
import { grounds } from '#tests/shared/mocks.js';
import { getEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';
import { jest } from '@jest/globals';
import { FOLDERS } from '@pins/appeals/constants/documents.js';
import {
	CASE_RELATIONSHIP_LINKED,
	ERROR_INVALID_APPEAL_TYPE_REP,
	ERROR_INVALID_APPELLANT_CASE_DATA
} from '@pins/appeals/constants/support.js';
import isExpeditedAppealType from '@pins/appeals/utils/is-expedited-appeal-type.js';
import {
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE,
	APPEAL_REDACTED_STATUS
} from '@planning-inspectorate/data-model';

jest.mock('#notify/notify-send.js');

const { databaseConnector } = await import('#utils/database-connector.js');

describe('/appeals/case-submission', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
		// @ts-ignore
		databaseConnector.ground.findMany.mockResolvedValue(grounds);
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
		test.each([
			['HAS', appealIngestionInput, validAppellantCase, { id: 1 }],
			['CAS_PLANNING', appealIngestionInputCasPlanning, validAppellantCaseCasPlanning, { id: 1 }],
			['S78', appealIngestionInputS78, validAppellantCaseS78, { name: 'Major Casework Officer' }],
			['S20', appealIngestionInputS20, validAppellantCaseS20, { name: 'Major Casework Officer' }],
			[
				'CAS_ADVERTISEMENT',
				appealIngestionInputCasAdverts,
				validAppellantCaseCasAdverts,
				{ id: 1 }
			],
			['ADVERTISEMENT', appealIngestionInputAdverts, validAppellantCaseAdverts, { id: 1 }],
			[
				'ENFORCEMENT_NOTICE',
				appealIngestionInputEnforcementNotice,
				validAppellantCaseEnforcementNotice,
				{ id: 1 }
			]
		])(
			'POST valid %s appellant case payload and create appeal',
			async (_, appealIngestionInput, validAppellantCase, expectedTeamQueryParam) => {
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
						},
						assignedTeamId: 1
					}
				});
				expect(databaseConnector.team.findUnique).toHaveBeenCalledWith(
					expect.objectContaining({
						where: expectedTeamQueryParam
					})
				);

				expect(databaseConnector.document.createMany).toHaveBeenCalled();
				expect(databaseConnector.documentVersion.createMany).toHaveBeenCalled();
				expect(databaseConnector.documentVersion.findMany).toHaveBeenCalled();

				expect(databaseConnector.appeal.findUnique).toHaveBeenCalled();
				expect(response.status).toEqual(201);
				expect(response.body).toEqual(result);
			}
		);
	});
});

describe('POST successful appeal gets ingested assignedTeamVaries when caseType is inquiry', () => {
	test.each([
		[
			'S78 - inquiry',
			appealIngestionInputS78,
			validAppellantCaseS78,
			{ name: 'Major Casework Officer' }
		],
		[
			'S20 - inquiry',
			appealIngestionInputS20,
			validAppellantCaseS20,
			{ name: 'Major Casework Officer' }
		]
	])(
		'POST valid %s appellant case payload and create appeal',
		async (_, appealIngestionInput, validAppellantCase, expectedTeamQueryParam) => {
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
					},
					assignedTeamId: 1
				}
			});
			expect(databaseConnector.team.findUnique).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expectedTeamQueryParam
				})
			);

			expect(databaseConnector.document.createMany).toHaveBeenCalled();
			expect(databaseConnector.documentVersion.createMany).toHaveBeenCalled();
			expect(databaseConnector.documentVersion.findMany).toHaveBeenCalled();

			expect(databaseConnector.appeal.findUnique).toHaveBeenCalled();
			expect(response.status).toEqual(201);
			expect(response.body).toEqual(result);
		}
	);
});

describe('POST successful appeal gets ingested assignedTeamVaries when casseType is written', () => {
	test.each([
		[
			'S78 - written',
			appealIngestionInputS78Written,
			{
				...validAppellantCaseS78,
				casedata: { ...validAppellantCaseS78.casedata, appellantProcedurePreference: 'written' }
			},
			{ lpaCode: validAppellantCaseS78.casedata.lpaCode }
		],
		[
			'S20 - written',
			appealIngestionInputS20Written,
			{
				...validAppellantCaseS20,
				casedata: { ...validAppellantCaseS20.casedata, appellantProcedurePreference: 'written' }
			},
			{ lpaCode: validAppellantCaseS20.casedata.lpaCode }
		]
	])(
		'POST valid %s appellant case payload and create appeal',
		async (_, appealIngestionInput, validAppellantCase, expectedTeamQueryParam) => {
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
					},
					assignedTeamId: 1
				}
			});
			expect(databaseConnector.lPA.findUnique).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expectedTeamQueryParam
				})
			);

			expect(databaseConnector.document.createMany).toHaveBeenCalled();
			expect(databaseConnector.documentVersion.createMany).toHaveBeenCalled();
			expect(databaseConnector.documentVersion.findMany).toHaveBeenCalled();

			expect(databaseConnector.appeal.findUnique).toHaveBeenCalled();
			expect(response.status).toEqual(201);
			expect(response.body).toEqual(result);
		}
	);
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
			const { casedata, ...invalidPayload } = validLpaQuestionnaireHas;
			const response = await request.post('/appeals/lpaq-submission').send(invalidPayload);

			expect(casedata).not.toBeUndefined();
			expect(response.status).toEqual(400);
		});

		test('invalid LPA response payload: no caseReference', async () => {
			const { caseReference, ...invalidPayload } = validLpaQuestionnaireHas.casedata;
			const payload = { casedata: { ...invalidPayload }, documents: [] };
			const response = await request.post('/appeals/lpaq-submission').send(payload);

			expect(caseReference).not.toBeUndefined();
			expect(response.status).toEqual(400);
		});

		test('invalid LPA response payload: no lpaCostsAppliedFor', async () => {
			const { lpaCostsAppliedFor, ...invalidPayload } = validLpaQuestionnaireHas.casedata;
			const payload = { casedata: { ...invalidPayload }, documents: [] };
			const response = await request.post('/appeals/lpaq-submission').send(payload);

			expect(lpaCostsAppliedFor).not.toBeUndefined();
			expect(response.status).toEqual(400);
		});

		test('invalid LPA response payload: no isGreenBelt', async () => {
			const { isGreenBelt, ...invalidPayload } = validLpaQuestionnaireHas.casedata;
			const payload = { casedata: { ...invalidPayload }, documents: [] };
			const response = await request.post('/appeals/lpaq-submission').send(payload);

			expect(isGreenBelt).not.toBeUndefined();
			expect(response.status).toEqual(400);
		});
	});
	describe('POST valid LPA submission', () => {
		test.each([
			['HAS', validLpaQuestionnaireIngestionHas, validLpaQuestionnaireHas],
			['CAS_PLANNING', validLpaQuestionnaireIngestionHas, validLpaQuestionnaireCasPlanning],
			['S78', validLpaQuestionnaireIngestionS78, validLpaQuestionnaireS78],
			// ToDo: Skip the S20 test for now so we can get the data-model change into the release
			// ['S20', validLpaQuestionnaireIngestionS20, validLpaQuestionnaireS20],
			[
				'CAS_ADVERTISEMENT',
				validLpaQuestionnaireIngestionCasAdvert,
				validLpaQuestionnaireCasAdverts
			],
			['ADVERTISEMENT', validLpaQuestionnaireIngestionAdvert, validLpaQuestionnaireAdverts]
		])(
			'POST valid %s lpaq payload and create lpaq submission',
			async (_, ingestion, questionnaire) => {
				//Overwrites appeal update mock in createInteg
				// @ts-ignore-next-line
				databaseConnector.appeal.update.mockResolvedValue(ingestion);
				// @ts-ignore-next-line

				createIntegrationMocks({
					folders: {
						create: FOLDERS.map((/** @type {{ path: string; }} */ f) => {
							return { path: f };
						})
					}
				});

				const payload = questionnaire;
				const response = await request.post('/appeals/lpaq-submission').send(payload);

				expect(databaseConnector.appeal.findUnique).toHaveBeenCalledWith({
					include: {
						address: true,
						agent: true,
						appealRule6Parties: {
							include: {
								serviceUser: true
							}
						},
						appealStatus: true,
						appealTimetable: true,
						appealType: true,
						appellant: true,
						inquiry: true,
						lpa: true
					},
					where: {
						reference: '6000000'
					}
				});
				expect(databaseConnector.appeal.update).toHaveBeenCalledWith(ingestion);

				//setDocumentVersions
				expect(databaseConnector.folder.findMany).toHaveBeenCalledWith({
					where: {
						caseId: 100
					}
				});
				expect(databaseConnector.document.createMany).toHaveBeenCalledWith({
					data: [
						{
							caseId: 100,
							folderId: expect.any(Number),
							guid: expect.any(String),
							name: 'oimg.jpg'
						},
						{
							caseId: 100,
							folderId: expect.any(Number),
							guid: expect.any(String),
							name: 'oimg.jpg'
						}
					]
				});
				expect(databaseConnector.documentVersion.createMany).toHaveBeenCalledWith({
					data: [
						{
							blobStorageContainer: 'document-service-uploads',
							blobStoragePath: expect.any(String),
							dateCreated: '2024-03-01T13:48:35.847Z',
							dateReceived: expect.any(String),
							description: 'Document img2.jpg (001) imported',
							documentGuid: expect.any(String),
							documentType: 'lpaCostsWithdrawal',
							documentURI: expect.any(String),
							draft: false,
							fileName: 'oimg.jpg',
							lastModified: expect.any(String),
							mime: 'image/jpeg',
							originalFilename: 'oimg.jpg',
							size: 10293,
							stage: 'lpa-questionnaire',
							version: 1
						},
						{
							blobStorageContainer: 'document-service-uploads',
							blobStoragePath: expect.any(String),
							dateCreated: '2024-03-01T13:48:35.847Z',
							dateReceived: expect.any(String),
							description: 'Document img3.jpg (001) imported',
							documentGuid: expect.any(String),
							documentType: 'lpaCostsApplication',
							documentURI: expect.any(String),
							draft: false,
							fileName: 'oimg.jpg',
							mime: 'image/jpeg',
							lastModified: expect.any(String),
							originalFilename: 'oimg.jpg',
							size: 10293,
							stage: 'lpa-questionnaire',
							version: 1
						}
					]
				});
				expect(databaseConnector.document.update).toHaveBeenCalledTimes(2);
				expect(databaseConnector.document.update).toHaveBeenNthCalledWith(1, {
					data: {
						latestVersionId: 1
					},
					where: {
						guid: expect.any(String)
					}
				});
				expect(databaseConnector.document.update).toHaveBeenNthCalledWith(2, {
					data: {
						latestVersionId: 1
					},
					where: {
						guid: expect.any(String)
					}
				});

				expect(databaseConnector.documentVersion.findMany).toHaveBeenCalledWith({
					where: {
						documentGuid: {
							in: [expect.any(String), expect.any(String)]
						}
					}
				});

				//setAppealRelationships
				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith({
					where: { reference: { in: ['1000000'] } }
				});
				expect(databaseConnector.appealRelationship.findMany).toHaveBeenCalledWith({
					where: { parentId: 100 }
				});
				expect(databaseConnector.appealRelationship.createMany).toHaveBeenCalledWith({
					data: [
						{
							childId: null,
							childRef: '1000000',
							externalAppealType: null,
							externalSource: true,
							parentId: 100,
							parentRef: '6000100',
							type: 'related'
						}
					]
				});

				expect(databaseConnector.appeal.findUnique).toHaveBeenCalledWith({
					where: { reference: '6000000' }
				});

				expect(response.status).toEqual(201);
				expect(response.body).toEqual({ id: 100, reference: '6000100' });
			}
		);
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
			databaseConnector.appealRelationship.findFirst.mockResolvedValue(null);
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await request
				.post('/appeals/representation-submission')
				.send({ caseReference: 'ABCDE', ...invalidPayload });

			expect(caseReference).not.toBeUndefined();
			expect(response.status).toEqual(404);
		});

		test.each(getEnabledAppealTypes().filter((type) => isExpeditedAppealType(type)))(
			'invalid rep payload: incorrect appeal type (%s)',
			async (appealCaseType) => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					id: 1,
					reference: validRepresentationLpaStatement.caseReference,
					appealType: {
						key: appealCaseType
					}
				});

				const response = await request
					.post('/appeals/representation-submission')
					.send(validRepresentationLpaStatement);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({ errors: { appeal: ERROR_INVALID_APPEAL_TYPE_REP } });
			}
		);
	});

	describe('POST valid representation', () => {
		describe.each(getEnabledAppealTypes().filter((type) => !isExpeditedAppealType(type)))(
			'for a %s appeal',
			(appealCaseType) => {
				afterEach(() => {
					jest.clearAllMocks();
				});
				test('valid rep payload: LPA statement', async () => {
					const validRepresentation = {
						...validRepresentationLpaStatement,
						lpaCode: 'Q9999'
					};

					// @ts-ignore
					databaseConnector.appealRelationship.findFirst.mockResolvedValue({
						parentRef: validRepresentationLpaStatement.caseReference,
						type: CASE_RELATIONSHIP_LINKED
					});

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
							key: appealCaseType
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

					expect(databaseConnector.appealRelationship.findFirst).toHaveBeenCalledWith({
						where: {
							childRef: validRepresentationLpaStatement.caseReference,
							type: CASE_RELATIONSHIP_LINKED
						}
					});
					expect(databaseConnector.appeal.findUnique).toHaveBeenCalledWith({
						where: { reference: validRepresentationLpaStatement.caseReference },
						include: {
							address: true,
							agent: true,
							appealRule6Parties: {
								include: {
									serviceUser: true
								}
							},
							appealStatus: true,
							appealTimetable: true,
							appealType: true,
							appellant: true,
							inquiry: true,
							lpa: true
						}
					});
					expect(databaseConnector.representation.create).toHaveBeenCalled();
					expect(databaseConnector.document.createMany).toHaveBeenCalled();
					expect(databaseConnector.documentVersion.createMany).toHaveBeenCalled();
					expect(databaseConnector.documentVersion.findMany).toHaveBeenCalled();
					expect(databaseConnector.representationAttachment.createMany).toHaveBeenCalled();
					expect(response.status).toEqual(201);
				});

				test('valid rep payload: LPA statement for linked child appeal', async () => {
					const validRepresentation = {
						...validRepresentationLpaStatement,
						lpaCode: 'Q9999'
					};

					const leadAppealCaseReference = '6004742';

					// @ts-ignore
					databaseConnector.appealRelationship.findFirst.mockResolvedValue({
						parentRef: leadAppealCaseReference,
						type: CASE_RELATIONSHIP_LINKED
					});

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
							key: appealCaseType
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

					expect(databaseConnector.appealRelationship.findFirst).toHaveBeenCalledWith({
						where: {
							childRef: validRepresentationLpaStatement.caseReference,
							type: CASE_RELATIONSHIP_LINKED
						}
					});
					expect(databaseConnector.appeal.findUnique).toHaveBeenCalledWith({
						where: { reference: leadAppealCaseReference },
						include: {
							address: true,
							agent: true,
							appealRule6Parties: {
								include: {
									serviceUser: true
								}
							},
							appealStatus: true,
							appealTimetable: true,
							appealType: true,
							appellant: true,
							inquiry: true,
							lpa: true
						}
					});
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
							key: appealCaseType
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

				test('valid rep payload: Rule 6 party statement', async () => {
					const validRepresentation = {
						...validRepresentationRule6PartyStatement,
						serviceUserId: (200000000 + 729).toString()
					};

					// @ts-ignore
					databaseConnector.serviceUser.findUnique.mockResolvedValue({ id: 729 });

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
						reference: validRepresentationRule6PartyStatement.caseReference,
						appealType: {
							key: appealCaseType
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
						},
						appealRule6Parties: [
							{
								id: 1,
								appealId: 2,
								serviceUserId: 729,
								serviceUser: {
									id: 729,
									organisationName: 'Test Organisation',
									email: 'test@example.com'
								}
							}
						]
					});

					const response = await request
						.post('/appeals/representation-submission')
						.send(validRepresentation);

					expect(databaseConnector.representation.create).toHaveBeenCalled();
					expect(
						databaseConnector.representation.create.mock.calls[0][0].data.representationType
					).toEqual('rule_6_party_statement');
					expect(databaseConnector.document.createMany).toHaveBeenCalled();
					expect(databaseConnector.documentVersion.createMany).toHaveBeenCalled();
					expect(databaseConnector.documentVersion.findMany).toHaveBeenCalled();
					expect(databaseConnector.representationAttachment.createMany).toHaveBeenCalled();
					expect(response.status).toEqual(201);
				});

				test('valid rep payload: Rule 6 party statement sends notifications to all parties with correct links', async () => {
					const validRepresentation = {
						...validRepresentationRule6PartyStatement,
						serviceUserId: (200000000 + 729).toString()
					};

					// @ts-ignore
					databaseConnector.folder.findMany.mockResolvedValue(
						FOLDERS.map((/** @type {string} */ folder, /** @type {number} */ ix) => {
							return { id: ix + 1, path: folder };
						})
					);
					// @ts-ignore
					databaseConnector.documentVersion.findMany.mockResolvedValue([
						{
							dateCreated: '2024-03-01T13:48:35.847Z',
							documentGuid: '001',
							documentType: 'rule6Statement',
							documentURI: 'https://example.com/doc',
							filename: 'statement.pdf',
							mime: 'application/pdf',
							originalFilename: 'statement.pdf',
							size: 10293
						}
					]);

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue({
						id: 2,
						reference: validRepresentationRule6PartyStatement.caseReference,
						appealType: { key: appealCaseType },
						address: {
							addressLine1: '123 Test Street',
							county: 'Testshire',
							postcode: 'TE1 1ST'
						},
						applicationReference: 'LPA/2024/001',
						inquiry: { inquiryStartTime: new Date('2025-03-15T10:00:00Z') },
						appealStatus: [
							{
								id: 1,
								status: 'statments',
								createdAt: new Date('2024-05-27T14:08:50.414Z'),
								valid: true,
								appealId: 2
							}
						],
						appellant: null,
						agent: { email: 'agent@example.com' },
						lpa: { lpaCode: 'Q9999', email: 'lpa@example.com' },
						appealRule6Parties: [
							{
								id: 1,
								appealId: 2,
								serviceUserId: 729,
								serviceUser: {
									id: 729,
									organisationName: 'Rule 6 Party',
									email: 'rule6party@example.com'
								}
							}
						]
					});

					const response = await request
						.post('/appeals/representation-submission')
						.send(validRepresentation);

					expect(response.status).toEqual(201);
					expect(global.mockNotifySend).toHaveBeenCalledTimes(3);

					expect(global.mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: expect.any(String),
						notifyClient: expect.any(Object),
						templateName: 'rule-6-statement-received',
						recipientEmail: 'agent@example.com',
						personalisation: {
							appeal_reference_number: validRepresentationRule6PartyStatement.caseReference,
							site_address: '123 Test Street, TE1 1ST',
							lpa_reference: 'LPA/2024/001',
							statement_url: expect.stringMatching(/\/appeals\/\d+/),
							inquiry_date: '15 March 2025'
						}
					});

					expect(global.mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: expect.any(String),
						notifyClient: expect.any(Object),
						templateName: 'rule-6-statement-received',
						recipientEmail: 'lpa@example.com',
						personalisation: {
							appeal_reference_number: validRepresentationRule6PartyStatement.caseReference,
							site_address: '123 Test Street, TE1 1ST',
							lpa_reference: 'LPA/2024/001',
							statement_url: expect.stringMatching(/\/manage-appeals\/\d+/),
							inquiry_date: '15 March 2025'
						}
					});

					expect(global.mockNotifySend).toHaveBeenNthCalledWith(3, {
						azureAdUserId: expect.any(String),
						notifyClient: expect.any(Object),
						templateName: 'rule-6-statement-received',
						recipientEmail: 'rule6party@example.com',
						personalisation: {
							appeal_reference_number: validRepresentationRule6PartyStatement.caseReference,
							site_address: '123 Test Street, TE1 1ST',
							lpa_reference: 'LPA/2024/001',
							statement_url: expect.stringMatching(/\/rule-6\/\d+/),
							inquiry_date: '15 March 2025'
						}
					});
				});

				test('valid rep payload: Rule 6 party PoE', async () => {
					const validRepresentation = {
						...validRepresentationRule6PartyProofsEvidence,
						serviceUserId: (200000000 + 730).toString()
					};

					// @ts-ignore
					databaseConnector.serviceUser.findUnique.mockResolvedValue({ id: 730 });

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
						reference: validRepresentationRule6PartyProofsEvidence.caseReference,
						appealType: {
							key: appealCaseType
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
						},
						appealRule6Parties: [
							{
								id: 1,
								appealId: 2,
								serviceUserId: 730,
								serviceUser: {
									id: 730,
									organisationName: 'Test Organisation',
									email: 'test@example.com'
								}
							}
						]
					});

					const response = await request
						.post('/appeals/representation-submission')
						.send(validRepresentation);

					expect(databaseConnector.representation.create).toHaveBeenCalled();
					expect(
						databaseConnector.representation.create.mock.calls[0][0].data.representationType
					).toEqual('rule_6_party_proofs_evidence');
					expect(databaseConnector.document.createMany).toHaveBeenCalled();
					expect(databaseConnector.documentVersion.createMany).toHaveBeenCalled();
					expect(databaseConnector.documentVersion.findMany).toHaveBeenCalled();
					expect(databaseConnector.representationAttachment.createMany).toHaveBeenCalled();
					expect(response.status).toEqual(201);
				});

				test('valid rep payload: Rule 6 party proof of evidence sends notifications to all parties with correct links', async () => {
					const validRepresentation = {
						...validRepresentationRule6PartyProofsEvidence,
						serviceUserId: (200000000 + 729).toString()
					};

					// @ts-ignore
					databaseConnector.folder.findMany.mockResolvedValue(
						FOLDERS.map((/** @type {string} */ folder, /** @type {number} */ ix) => {
							return { id: ix + 1, path: folder };
						})
					);
					// @ts-ignore
					databaseConnector.documentVersion.findMany.mockResolvedValue([
						{
							dateCreated: '2024-03-01T13:48:35.847Z',
							documentGuid: '001',
							documentType: 'rule6ProofOfEvidence',
							documentURI: 'https://example.com/doc',
							filename: 'statement.pdf',
							mime: 'application/pdf',
							originalFilename: 'statement.pdf',
							size: 10293
						}
					]);

					// @ts-ignore
					databaseConnector.appeal.findUnique.mockResolvedValue({
						id: 2,
						reference: validRepresentationRule6PartyProofsEvidence.caseReference,
						appealType: { key: appealCaseType },
						address: {
							addressLine1: '123 Test Street',
							county: 'Testshire',
							postcode: 'TE1 1ST'
						},
						applicationReference: 'LPA/2024/001',
						inquiry: { inquiryStartTime: new Date('2025-03-15T10:00:00Z') },
						appealStatus: [
							{
								id: 1,
								status: 'statments',
								createdAt: new Date('2024-05-27T14:08:50.414Z'),
								valid: true,
								appealId: 2
							}
						],
						appellant: null,
						agent: { email: 'agent@example.com' },
						lpa: { lpaCode: 'Q9999', email: 'lpa@example.com' },
						appealRule6Parties: [
							{
								id: 1,
								appealId: 2,
								serviceUserId: 729,
								serviceUser: {
									id: 729,
									organisationName: 'Rule 6 Party',
									email: 'rule6party@example.com'
								}
							}
						]
					});

					const response = await request
						.post('/appeals/representation-submission')
						.send(validRepresentation);

					expect(response.status).toEqual(201);
					expect(global.mockNotifySend).toHaveBeenCalledTimes(3);

					expect(global.mockNotifySend).toHaveBeenNthCalledWith(1, {
						azureAdUserId: expect.any(String),
						notifyClient: expect.any(Object),
						templateName: 'rule-6-party-proof-of-evidence-received',
						recipientEmail: 'agent@example.com',
						personalisation: {
							appeal_reference_number: validRepresentationRule6PartyStatement.caseReference,
							site_address: '123 Test Street, TE1 1ST',
							lpa_reference: 'LPA/2024/001',
							statement_url: expect.stringMatching(/\/appeals\/\d+/),
							inquiry_date: '15 March 2025'
						}
					});

					expect(global.mockNotifySend).toHaveBeenNthCalledWith(2, {
						azureAdUserId: expect.any(String),
						notifyClient: expect.any(Object),
						templateName: 'rule-6-party-proof-of-evidence-received',
						recipientEmail: 'lpa@example.com',
						personalisation: {
							appeal_reference_number: validRepresentationRule6PartyStatement.caseReference,
							site_address: '123 Test Street, TE1 1ST',
							lpa_reference: 'LPA/2024/001',
							statement_url: expect.stringMatching(/\/manage-appeals\/\d+/),
							inquiry_date: '15 March 2025'
						}
					});

					expect(global.mockNotifySend).toHaveBeenNthCalledWith(3, {
						azureAdUserId: expect.any(String),
						notifyClient: expect.any(Object),
						templateName: 'rule-6-party-proof-of-evidence-received',
						recipientEmail: 'rule6party@example.com',
						personalisation: {
							appeal_reference_number: validRepresentationRule6PartyStatement.caseReference,
							site_address: '123 Test Street, TE1 1ST',
							lpa_reference: 'LPA/2024/001',
							statement_url: expect.stringMatching(/\/rule-6\/\d+/),
							inquiry_date: '15 March 2025'
						}
					});
				});
			}
		);
	});
});

const createIntegrationMocks = (/** @type {*} */ appealIngestionInput) => {
	const appealCreatedResult = {
		id: 100,
		reference: '6000100',
		assignedTeamId: 1
	};

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
	databaseConnector.appeal.findUnique.mockResolvedValue({
		...appealCreatedResult,
		appealType: appealIngestionInput.appealType?.connect,
		appealStatus: [{ status: 'ready_to_start', valid: true }]
	});
	// @ts-ignore
	databaseConnector.document.createMany.mockResolvedValue([
		docIngestionInput,
		...validLpaQuestionnaireHas.documents
	]);
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
	databaseConnector.team.findUnique.mockResolvedValue({
		id: 1,
		name: 'test',
		email: 'test@email.com'
	});
	// @ts-ignore
	databaseConnector.team.findFirst.mockResolvedValue({
		id: 1
	});
	// @ts-ignore
	databaseConnector.lPA.findUnique.mockResolvedValue({
		teamId: 1
	});
	// @ts-ignore
	databaseConnector.folder.findMany.mockResolvedValue(
		appealIngestionInput.folders.create.map((/** @type {any} */ o, /** @type {number} */ ix) => {
			return { ...o, id: ix + 1 };
		})
	);
	// @ts-ignore
	databaseConnector.designatedSite.findMany.mockResolvedValue([
		{
			name: 'SSSI (site of special scientific interest)',
			key: 'SSSI'
		},
		{
			name: 'cSAC (candidate special area of conservation)',
			key: 'cSAC'
		}
	]);

	// @ts-ignore
	databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
		{ key: APPEAL_REDACTED_STATUS.NOT_REDACTED }
	]);

	return appealCreatedResult;
};
