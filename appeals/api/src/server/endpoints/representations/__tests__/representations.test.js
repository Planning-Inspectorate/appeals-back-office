// @ts-nocheck
import { ERROR_NOT_FOUND } from '#endpoints/constants.js';
import { request } from '#tests/../app-test.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import { jest } from '@jest/globals';
import config from '#config/config.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('/appeals/:id/representations', () => {
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
			// @ts-ignore
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
			// @ts-ignore
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
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
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
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.patch('/appeals/1/reps/1/status')
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
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.patch('/appeals/1/reps/1/status')
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
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.patch('/appeals/1/reps/1/redaction')
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

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			// @ts-ignore
			databaseConnector.representation.update.mockResolvedValue(mockRepresentation);

			const response = await request
				.patch('/appeals/1/reps/1/status')
				.send({
					status: 'valid',
					notes: 'Some notes',
					allowResubmit: false
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);

			// eslint-disable-next-line no-undef
			expect(mockSendEmail).toHaveBeenCalledTimes(1);

			// eslint-disable-next-line no-undef
			expect(mockSendEmail).toHaveBeenCalledWith(
				config.govNotify.template.commentRejected.id,
				'test@136s7.com',
				{
					emailReplyToId: null,
					personalisation: {
						appeal_reference_number: '1345264',
						lpa_reference: '48269/APP/2021/1482',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						deadline_date: '',
						reasons: ['Invalid submission'],
						url: 'https://www.gov.uk/appeal-planning-inspectorate'
					},
					reference: null
				}
			);
		});

		test('200 when representation status is successfully updated with extended deadline template selected', async () => {
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
					},
					{
						representationRejectionReason: {
							id: 7,
							name: 'Other',
							hasText: true
						},
						representationRejectionReasonText: ['Provided documents were incomplete']
					}
				]
			};

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			// @ts-ignore
			databaseConnector.representation.update.mockResolvedValue(mockRepresentation);

			const response = await request
				.patch('/appeals/1/reps/1/status')
				.send({
					status: 'valid',
					notes: 'Some notes',
					allowResubmit: true,
					extendedDeadline: true
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);

			// eslint-disable-next-line no-undef
			expect(mockSendEmail).toHaveBeenCalledTimes(1);

			// eslint-disable-next-line no-undef
			expect(mockSendEmail).toHaveBeenCalledWith(
				config.govNotify.template.commentRejectedDeadlineExtended.id,
				'test@136s7.com',
				{
					emailReplyToId: null,
					personalisation: {
						appeal_reference_number: '1345264',
						lpa_reference: '48269/APP/2021/1482',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						deadline_date: '17 December 2024',
						reasons: ['Invalid submission', 'Other: Provided documents were incomplete'],
						url: 'https://www.gov.uk/appeal-planning-inspectorate'
					},
					reference: null
				}
			);
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
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
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
			// @ts-ignore
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
});
