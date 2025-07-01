// @ts-nocheck
import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import { request } from '#tests/../app-test.js';
import { householdAppeal, appealS78 } from '#tests/appeals/mocks.js';
import { jest } from '@jest/globals';
import { cloneDeep } from 'lodash-es';
import { APPEAL_REDACTED_STATUS } from 'pins-data-model';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('/appeals/:id/reps', () => {
	beforeEach(() => {});
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('GET representations', () => {
		test('405 when appealId NaN', async () => {
			const response = await request
				.get('/appeals/NaN/reps/1/status')
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(405);
			expect(response.body).toEqual({
				errors: 'Method is not allowed'
			});
		});

		test('404 when appealId not found', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await request.get('/appeals/99999/reps/1').set('azureAdUserId', '732652365');

			expect(response.status).toEqual(404);
			expect(response.body).toEqual({
				errors: {
					appealId: ERROR_NOT_FOUND
				}
			});
		});

		test('405 when repId NaN', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.get('/appeals/1/reps/NaN/status')
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(405);
			expect(response.body).toEqual({
				errors: 'Method is not allowed'
			});
		});

		test('404 when repId not found', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.representation.findUnique.mockResolvedValue(null);

			const response = await request
				.get('/appeals/99999/reps/200')
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(404);
			expect(response.body).toEqual({
				errors: {
					repId: ERROR_NOT_FOUND
				}
			});
		});
	});

	describe('PATCH representations', () => {
		test('400 when invalid representation status', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.patch('/appeals/1/reps/1')
				.send({ status: 'an_invalid_val' })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					status: 'The representation status must be one of awaiting_review, invalid, valid'
				}
			});
		});

		test('400 when invalid type of representation status', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.patch('/appeals/1/reps/1')
				.send({ status: 0 })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					status: 'must be a string'
				}
			});
		});

		test('400 when invalid type of representation redaction', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.patch('/appeals/1/reps/1')
				.send({ redactedRepresentation: false })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					redactedRepresentation: 'must be a string'
				}
			});
		});

		test('200 when representation status is successfully updated', async () => {
			const mockRepresentation = {
				id: 1,
				lpa: false,
				status: 'valid',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: 'Redacted text of the representation',
				dateCreated: new Date('2024-12-06T12:00:00Z'),
				notes: 'Some notes',
				attachments: ['attachment1.pdf', 'attachment2.pdf'],
				representationType: 'typeA',
				siteVisitRequested: true,
				source: 'citizen',
				representationRejectionReasonsSelected: [
					{
						representationRejectionReason: {
							id: 1,
							name: 'Invalid submission',
							hasText: false
						},
						representationRejectionReasonText: []
					}
				]
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'valid',
				notes: 'Some notes'
			});

			const response = await request
				.patch('/appeals/1/reps/1')
				.send({
					status: 'valid',
					notes: 'Some notes',
					allowResubmit: false
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);
		});

		test('200 when final comment representation status is successfully updated with rejection', async () => {
			jest
				.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
				.setSystemTime(new Date('2024-12-11'));

			const mockRepresentation = {
				id: 1,
				lpa: false,
				status: null,
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: 'Redacted text of the representation',
				dateCreated: new Date('2024-12-11T12:00:00Z'),
				notes: 'Some notes',
				attachments: ['attachment1.pdf', 'attachment2.pdf'],
				representationType: 'lpa_final_comment',
				siteVisitRequested: true,
				source: 'citizen',
				representationRejectionReasonsSelected: [
					{
						representationRejectionReason: {
							id: 1,
							name: 'Invalid submission',
							hasText: false
						},
						representationRejectionReasonText: []
					},
					{
						representationRejectionReason: {
							id: 7,
							name: 'Other',
							hasText: true
						},
						representationRejectionReasonText: [{ text: 'Provided documents were incomplete' }]
					}
				]
			};

			const expectedSiteAddress = [
				'addressLine1',
				'addressLine2',
				'addressTown',
				'addressCounty',
				'postcode',
				'addressCountry'
			]
				.map((key) => householdAppeal.address[key])
				.filter((value) => value)
				.join(', ');

			const expectedEmailPayload = {
				lpa_reference: householdAppeal.applicationReference,
				appeal_reference_number: householdAppeal.reference,
				reasons: ['Invalid submission', 'Other: Provided documents were incomplete'],
				site_address: expectedSiteAddress
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'invalid'
			});

			const response = await request
				.patch('/appeals/1/reps/1')
				.send({
					status: 'invalid',
					notes: 'Some notes'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);

			expect(mockNotifySend).toHaveBeenCalledTimes(1);

			expect(mockNotifySend).toHaveBeenCalledWith({
				notifyClient: expect.anything(),
				personalisation: expectedEmailPayload,
				recipientEmail: householdAppeal.lpa.email,
				templateName: 'final-comment-rejected-lpa'
			});
		});

		test('200 when ip comment representation status is successfully updated with rejection', async () => {
			jest
				.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
				.setSystemTime(new Date('2024-12-11'));

			const mockRepresented = { email: 'test123@test.com' };
			const mockAppealS78 = {
				...appealS78,
				appealTimetable: { ...appealS78.appealTimetable, ipCommentsDueDate: new Date() }
			};

			const mockRepresentation = {
				id: 1,
				lpa: false,
				status: null,
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: 'Redacted text of the representation',
				dateCreated: new Date('2024-12-11T12:00:00Z'),
				notes: 'Some notes',
				attachments: ['attachment1.pdf', 'attachment2.pdf'],
				representationType: 'comment',
				siteVisitRequested: true,
				source: 'citizen',
				represented: mockRepresented,
				representationRejectionReasonsSelected: [
					{
						representationRejectionReason: {
							id: 1,
							name: 'Invalid submission',
							hasText: false
						},
						representationRejectionReasonText: []
					},
					{
						representationRejectionReason: {
							id: 7,
							name: 'Other',
							hasText: true
						},
						representationRejectionReasonText: [{ text: 'Provided documents were incomplete' }]
					}
				]
			};

			const expectedSiteAddress = [
				'addressLine1',
				'addressLine2',
				'addressTown',
				'addressCounty',
				'postcode',
				'addressCountry'
			]
				.map((key) => appealS78.address[key])
				.filter((value) => value)
				.join(', ');

			const expectedEmailPayload = {
				lpa_reference: mockAppealS78.applicationReference,
				deadline_date: '20 December 2024',
				appeal_reference_number: mockAppealS78.reference,
				reasons: ['Invalid submission', 'Other: Provided documents were incomplete'],
				site_address: expectedSiteAddress
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(appealS78);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'invalid'
			});

			const response = await request
				.patch('/appeals/1/reps/1')
				.send({
					status: 'invalid',
					allowResubmit: true
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);

			expect(mockNotifySend).toHaveBeenCalledTimes(1);

			expect(mockNotifySend).toHaveBeenCalledWith({
				notifyClient: expect.anything(),
				personalisation: expectedEmailPayload,
				recipientEmail: mockRepresented.email,
				templateName: 'ip-comment-rejected-deadline-extended'
			});
		});
	});

	describe('POST representation/comments', () => {
		test('400 when missing first name', async () => {
			const response = await request
				.post('/appeals/1/reps/comments')
				.send({ ipDetails: { lastName: 'test' }, redactionStatus: 'test' })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					'ipDetails.firstName': 'must be a string'
				}
			});
		});

		test('400 when missing last name', async () => {
			const response = await request
				.post('/appeals/1/reps/comments')
				.send({ ipDetails: { firstName: 'test' }, redactionStatus: 'test' })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					'ipDetails.lastName': 'must be a string'
				}
			});
		});

		test('400 when missing redaction status', async () => {
			const response = await request
				.post('/appeals/1/reps/comments')
				.send({ ipDetails: { firstName: 'test', lastName: 'test' } })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					redactionStatus: 'Invalid value'
				}
			});
		});

		test('400 when email is invalid', async () => {
			const response = await request
				.post('/appeals/1/reps/comments')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'invalid email' },
					redactionStatus: 'test'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					'ipDetails.email': 'must be a valid email'
				}
			});
		});

		test('400 when attachment guids are invalid', async () => {
			const response = await request
				.post('/appeals/1/reps/comments')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test' },
					redactionStatus: 'test',
					attachments: [0]
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					attachments: 'must be an array of strings'
				}
			});
		});

		test('400 when attachment guids are invalid and email is empty', async () => {
			const response = await request
				.post('/appeals/1/reps/comments')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: '' },
					redactionStatus: 'test',
					attachments: [0]
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					attachments: 'must be an array of strings'
				}
			});
		});

		test('200 when representation is successfully created', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.post('/appeals/1/reps/comments')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'test@example.com' },
					ipAddress: { postCode: '', addressLine1: '' },
					redactionStatus: 'unredacted',
					attachments: []
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
		});

		test('200 when representation with address and attachment is successfully created', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.post('/appeals/1/reps/comments')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'test@example.com' },
					ipAddress: { postCode: 'abc 123', addressLine1: 'line 1' },
					redactionStatus: 'unredacted',
					attachments: ['0']
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
		});
	});

	describe('PATCH /appeals/:appealId/reps/:repId/rejection-reasons', () => {
		test('400 when payload id is not a number', async () => {
			const response = await request
				.patch('/appeals/1/reps/1/rejection-reasons')
				.send({
					rejectionReasons: [{ id: 'NaN', text: [] }]
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					'rejectionReasons[0].id': 'id must be a positive integer'
				}
			});
		});
		test('400 when payload is invalid', async () => {
			const response = await request
				.patch('/appeals/1/reps/1/rejection-reasons')
				.send({
					rejectionReasons: [{ id: 1, text: [1] }]
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					'rejectionReasons[0].text': 'must be an array of strings'
				}
			});
		});

		test('404 when repId is not found', async () => {
			// Mocking database responses
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.representation.findUnique.mockResolvedValue(null);

			const response = await request
				.patch('/appeals/1/reps/999/rejection-reasons')
				.send({
					rejectionReasons: [{ id: 1, name: 'Received after deadline', hasText: false, text: [] }]
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(404);
			expect(response.body.errors).toHaveProperty('repId', ERROR_NOT_FOUND);
		});

		test('404 when appealId is not found', async () => {
			// Mocking database responses
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await request
				.patch('/appeals/2/reps/1/rejection-reasons')
				.send({
					rejectionReasons: [{ id: 1, name: 'Received after deadline', hasText: false, text: [] }]
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(404);
			expect(response.body.errors).toHaveProperty('appealId', ERROR_NOT_FOUND);
		});
	});

	describe('PATCH /appeals/:appealId/reps/:repId/attachments', () => {
		test('400 when attachments are not provided', async () => {
			const response = await request
				.patch('/appeals/1/reps/1/attachments')
				.send({})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					attachments: 'must be an array of strings'
				}
			});
		});

		test('400 when attachments are invalid', async () => {
			const response = await request
				.patch('/appeals/1/reps/1/attachments')
				.send({ attachments: [123, null, ''] })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					attachments: 'must be an array of strings'
				}
			});
		});

		test('404 when representation is not found', async () => {
			databaseConnector.representation.findUnique.mockResolvedValue(null);

			const response = await request
				.patch('/appeals/1/reps/999/attachments')
				.send({
					attachments: [
						'39ad6cd8-60ab-43f0-a995-4854db8f12c6',
						'b6f15730-2d7f-4fa0-8752-2d26a62474de'
					]
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(404);
			expect(response.body.errors).toHaveProperty('repId', 'Representation not found');
		});

		test('200 when attachments are successfully updated', async () => {
			const mockRepresentation = {
				id: 1,
				appealId: 1,
				attachments: [{ documentGuid: 'b6f15730-2d7f-4fa0-8752-2d26a62474de', version: 1 }]
			};
			const mockUpdatedRepresentation = {
				id: 1,
				appealId: 1,
				attachments: [
					{ documentGuid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6', version: 1 },
					{ documentGuid: 'b6f15730-2d7f-4fa0-8752-2d26a62474de', version: 1 }
				]
			};
			const mockDocument = {
				guid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				latestDocumentVersion: { version: 1 }
			};

			databaseConnector.document.findUnique.mockResolvedValue(mockDocument);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue(mockUpdatedRepresentation);

			const response = await request
				.patch('/appeals/1/reps/1/attachments')
				.send({ attachments: ['39ad6cd8-60ab-43f0-a995-4854db8f12c6'] })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual(mockUpdatedRepresentation);

			expect(databaseConnector.representation.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: {
					attachments: {
						connect: [
							{
								documentGuid_version: {
									documentGuid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
									version: 1
								}
							}
						]
					}
				}
			});
		});

		test('500 when database operation fails', async () => {
			databaseConnector.representation.findUnique.mockRejectedValue(
				new Error('Internal Server Error')
			);

			const response = await request
				.patch('/appeals/1/reps/1/attachments')
				.send({
					attachments: [
						'39ad6cd8-60ab-43f0-a995-4854db8f12c6',
						'b6f15730-2d7f-4fa0-8752-2d26a62474de'
					]
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(500);
			expect(response.body).toEqual({ errors: 'Internal Server Error' });
		});
	});
});

describe('/appeals/:id/reps/publish', () => {
	let mockAppeal;
	beforeEach(() => {
		mockAppeal = cloneDeep({
			...appealS78,
			representations: appealS78.representations.filter((rep) => rep.status !== 'awaiting_review')
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('publish LPA statements', () => {
		beforeEach(() => {
			mockAppeal.appealStatus[0].status = 'statements';
		});

		test('409 if case is not in STATEMENTS state', async () => {
			mockAppeal.appealStatus[0].status = 'lpa_questionnaire';
			databaseConnector.appeal.findUnique.mockResolvedValue(mockAppeal);

			const response = await request
				.post('/appeals/1/reps/publish')
				.query({ type: 'lpa_statement' })
				.set('azureAdUserId', '732652365');

			console.log(response.body);
			expect(response.status).toEqual(409);
		});

		test('400 if any ip comments or any lpa statements are awaiting review', async () => {
			mockAppeal.representations = appealS78.representations;
			databaseConnector.appeal.findUnique.mockResolvedValue(mockAppeal);

			const response = await request
				.post('/appeals/1/reps/publish')
				.query({ type: 'lpa_statement' })
				.set('azureAdUserId', '732652365');

			console.log(response.body);
			expect(response.status).toEqual(400);
		});

		test('400 if the deadline for ip comments has not passed', async () => {
			mockAppeal.appealTimetable = {
				...mockAppeal.appealTimetable,
				ipCommentsDueDate: new Date('3025-01-01')
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(mockAppeal);

			const response = await request
				.post('/appeals/1/reps/publish')
				.query({ type: 'lpa_statement' })
				.set('azureAdUserId', '732652365');

			console.log(response.body);
			expect(response.status).toEqual(400);
		});

		test('400 if the deadline for lpa statements has not passed', async () => {
			mockAppeal.appealTimetable = {
				...mockAppeal.appealTimetable,
				lpaStatementDueDate: new Date('3025-01-01')
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(mockAppeal);

			const response = await request
				.post('/appeals/1/reps/publish')
				.query({ type: 'lpa_statement' })
				.set('azureAdUserId', '732652365');

			console.log(response.body);
			expect(response.status).toEqual(400);
		});

		test('send notify comments and statements (written)', async () => {
			const expectedSiteAddress = [
				'addressLine1',
				'addressLine2',
				'addressTown',
				'addressCounty',
				'postcode',
				'addressCountry'
			]
				.map((key) => mockAppeal.address[key])
				.filter((value) => value)
				.join(', ');

			const expectedEmailPayload = {
				lpa_reference: mockAppeal.applicationReference,
				appeal_reference_number: mockAppeal.reference,
				has_ip_comments: false,
				has_statement: false,
				final_comments_deadline: '4 December 2024',
				site_address: expectedSiteAddress
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(mockAppeal);
			databaseConnector.appealStatus.create.mockResolvedValue({});
			databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
			databaseConnector.representation.findMany.mockResolvedValue([
				{ representationType: 'lpa_statement' },
				{ representationType: 'appellant_final_comment' }
			]);
			databaseConnector.representation.updateMany.mockResolvedValue([]);
			databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
				{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
			]);
			databaseConnector.documentVersion.findMany.mockResolvedValue([]);

			const response = await request
				.post('/appeals/1/reps/publish')
				.query({ type: 'statements' })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				notifyClient: expect.anything(),
				personalisation: {
					...expectedEmailPayload,
					has_ip_comments: true,
					has_statement: true,
					what_happens_next:
						'You need to [submit your final comments](/mock-front-office-url/manage-appeals/6000002) by 4 December 2024.'
				},
				recipientEmail: appealS78.lpa.email,
				templateName: 'received-statement-and-ip-comments-lpa'
			});

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				notifyClient: expect.anything(),
				personalisation: {
					...expectedEmailPayload,
					what_happens_next:
						'You need to [submit your final comments](/mock-front-office-url/appeals/6000002) by 4 December 2024.'
				},
				recipientEmail: appealS78.appellant.email,
				templateName: 'received-statement-and-ip-comments-appellant'
			});
		});

		test('send notify comments and statements (hearing not yet set up)', async () => {
			const expectedSiteAddress = [
				'addressLine1',
				'addressLine2',
				'addressTown',
				'addressCounty',
				'postcode',
				'addressCountry'
			]
				.map((key) => mockAppeal.address[key])
				.filter((value) => value)
				.join(', ');

			const expectedEmailPayload = {
				lpa_reference: mockAppeal.applicationReference,
				has_ip_comments: false,
				has_statement: false,
				appeal_reference_number: mockAppeal.reference,
				final_comments_deadline: '4 December 2024',
				site_address: expectedSiteAddress
			};

			const appeal = {
				...mockAppeal,
				procedureType: 'hearing'
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
			databaseConnector.appealStatus.create.mockResolvedValue({});
			databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
			databaseConnector.representation.findMany.mockResolvedValue([
				{ representationType: 'lpa_statement' },
				{ representationType: 'appellant_final_comment' }
			]);
			databaseConnector.representation.updateMany.mockResolvedValue([]);
			databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
				{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
			]);
			databaseConnector.documentVersion.findMany.mockResolvedValue([]);

			const response = await request
				.post('/appeals/1/reps/publish')
				.query({ type: 'statements' })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				notifyClient: expect.anything(),
				personalisation: {
					...expectedEmailPayload,
					has_ip_comments: true,
					has_statement: true,
					what_happens_next: 'We will contact you when the hearing has been set up.'
				},
				recipientEmail: appealS78.lpa.email,
				templateName: 'received-statement-and-ip-comments-lpa'
			});

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				notifyClient: expect.anything(),
				personalisation: {
					...expectedEmailPayload,
					what_happens_next: 'We will contact you if we need any more information.'
				},
				recipientEmail: appealS78.appellant.email,
				templateName: 'received-statement-and-ip-comments-appellant'
			});
		});

		test('send notify comments and statements (hearing already set up)', async () => {
			const expectedSiteAddress = [
				'addressLine1',
				'addressLine2',
				'addressTown',
				'addressCounty',
				'postcode',
				'addressCountry'
			]
				.map((key) => mockAppeal.address[key])
				.filter((value) => value)
				.join(', ');

			const expectedEmailPayload = {
				lpa_reference: mockAppeal.applicationReference,
				has_ip_comments: false,
				has_statement: false,
				appeal_reference_number: mockAppeal.reference,
				final_comments_deadline: '4 December 2024',
				site_address: expectedSiteAddress
			};

			const appeal = {
				...mockAppeal,
				procedureType: 'hearing',
				hearing: {
					hearingStartTime: new Date('2025-01-31')
				}
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
			databaseConnector.appealStatus.create.mockResolvedValue({});
			databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
			databaseConnector.representation.findMany.mockResolvedValue([
				{ representationType: 'lpa_statement' },
				{ representationType: 'appellant_final_comment' }
			]);
			databaseConnector.representation.updateMany.mockResolvedValue([]);
			databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
				{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
			]);
			databaseConnector.documentVersion.findMany.mockResolvedValue([]);

			const response = await request
				.post('/appeals/1/reps/publish')
				.query({ type: 'statements' })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				notifyClient: expect.anything(),
				personalisation: {
					...expectedEmailPayload,
					has_ip_comments: true,
					has_statement: true,
					what_happens_next: 'The hearing is on 31 January 2025.'
				},
				recipientEmail: appealS78.lpa.email,
				templateName: 'received-statement-and-ip-comments-lpa'
			});

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				notifyClient: expect.anything(),
				personalisation: {
					...expectedEmailPayload,
					what_happens_next:
						'Your hearing is on 31 January 2025.\n\nWe will contact you if we need any more information.'
				},
				recipientEmail: appealS78.appellant.email,
				templateName: 'received-statement-and-ip-comments-appellant'
			});
		});
	});

	describe('publish final comments', () => {
		beforeEach(() => {
			mockAppeal.appealStatus[0].status = 'final_comments';
		});

		test('409 if case is not in FINAL_COMMENTS state', async () => {
			mockAppeal.appealStatus[0].status = 'lpa_questionnaire';
			databaseConnector.appeal.findUnique.mockResolvedValue(mockAppeal);

			const response = await request
				.post('/appeals/1/reps/publish')
				.query({ type: 'final_comments' })
				.set('azureAdUserId', '732652365');

			console.log(response.body);
			expect(response.status).toEqual(409);
		});

		test('400 if any appellant final comments or any lpa final comments are awaiting review', async () => {
			mockAppeal.representations = appealS78.representations;
			databaseConnector.appeal.findUnique.mockResolvedValue(mockAppeal);

			const response = await request
				.post('/appeals/1/reps/publish')
				.query({ type: 'final_comments' })
				.set('azureAdUserId', '732652365');

			console.log(response.body);
			expect(response.status).toEqual(400);
		});

		test('400 if the deadline for final comments has not passed', async () => {
			mockAppeal.appealTimetable = {
				...mockAppeal.appealTimetable,
				finalCommentsDueDate: new Date('3025-01-01')
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(mockAppeal);

			const response = await request
				.post('/appeals/1/reps/publish')
				.query({ type: 'final_comments' })
				.set('azureAdUserId', '732652365');

			console.log(response.body);
			expect(response.status).toEqual(400);
		});

		test('send notify lpa and appellant final comments', async () => {
			const expectedSiteAddress = [
				'addressLine1',
				'addressLine2',
				'addressTown',
				'addressCounty',
				'postcode',
				'addressCountry'
			]
				.map((key) => mockAppeal.address[key])
				.filter((value) => value)
				.join(', ');

			const expectedEmailPayload = {
				lpa_reference: mockAppeal.applicationReference,
				has_ip_comments: false,
				has_statement: false,
				appeal_reference_number: mockAppeal.reference,
				final_comments_deadline: '',
				site_address: expectedSiteAddress
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(mockAppeal);
			databaseConnector.appealStatus.create.mockResolvedValue({});
			databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
			databaseConnector.representation.findMany.mockResolvedValue([
				{ representationType: 'appellant_final_comment' },
				{ representationType: 'lpa_final_comment' }
			]);
			databaseConnector.representation.updateMany.mockResolvedValue([]);

			const response = await request
				.post('/appeals/1/reps/publish')
				.query({ type: 'final_comments' })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);

			expect(response.status).toEqual(200);

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				notifyClient: expect.anything(),
				personalisation: {
					...expectedEmailPayload,
					what_happens_next: ''
				},
				recipientEmail: appealS78.lpa.email,
				templateName: 'final-comments-done-lpa'
			});

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				notifyClient: expect.anything(),
				personalisation: {
					...expectedEmailPayload,
					what_happens_next: ''
				},
				recipientEmail: appealS78.appellant.email,
				templateName: 'final-comments-done-appellant'
			});
		});
	});
});
