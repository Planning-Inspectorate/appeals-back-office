// @ts-nocheck
import { request } from '#server/app-test.js';
import {
	advertisementAppeal,
	appealAdvert,
	appealS20,
	appealS78,
	fullPlanningAppeal,
	householdAppeal,
	listedBuildingAppeal
} from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import {
	CASE_RELATIONSHIP_LINKED,
	CASE_RELATIONSHIP_RELATED,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import {
	APPEAL_CASE_STATUS,
	APPEAL_REDACTED_STATUS,
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@planning-inspectorate/data-model';
import { addDays } from 'date-fns';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('/appeals/:id/reps', () => {
	beforeAll(() => {
		jest.clearAllMocks();
	});
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

		test.each([
			['Advert', advertisementAppeal],
			['HAS', householdAppeal],
			['S78', fullPlanningAppeal],
			['S20', listedBuildingAppeal]
		])(
			'200 when lpa final comment representation status is successfully updated with rejection for %s appeal',
			async (_, appeal) => {
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
					.map((key) => appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					lpa_reference: appeal.applicationReference,
					appeal_reference_number: appeal.reference,
					reasons: ['Invalid submission', 'Other: Provided documents were incomplete'],
					site_address: expectedSiteAddress,
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: expectedEmailPayload,
					recipientEmail: appeal.lpa.email,
					templateName: 'final-comment-rejected-lpa'
				});
			}
		);
		test.each([
			['HAS', householdAppeal],
			['Advert', advertisementAppeal],
			['S78', fullPlanningAppeal],
			['S20', listedBuildingAppeal]
		])(
			'200 when appellant final comment representation status is successfully updated with rejection for %s appeal',
			async (_, appeal) => {
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
					representationType: 'appellant_final_comment',
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
					.map((key) => appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					lpa_reference: appeal.applicationReference,
					appeal_reference_number: appeal.reference,
					reasons: ['Invalid submission', 'Other: Provided documents were incomplete'],
					site_address: expectedSiteAddress,
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: expectedEmailPayload,
					recipientEmail: appeal.agent.email,
					templateName: 'final-comment-rejected-appellant'
				});
			}
		);

		test.each([
			['full planning', appealS78],
			['listed building', appealS20]
		])(
			'200 when ip comment representation status is successfully updated with rejection and is not allowed resubmission, appeal type %s',
			async (_, appeal) => {
				jest
					.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
					.setSystemTime(new Date('2024-12-11'));

				const mockRepresented = { email: 'test123@test.com' };
				const mockAppeal = {
					...appeal,
					appealTimetable: { ...appeal.appealTimetable, ipCommentsDueDate: new Date() }
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
					.map((key) => appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					lpa_reference: mockAppeal.applicationReference,
					deadline_date: '',
					resubmit_comment_to_fo: true,
					appeal_reference_number: mockAppeal.reference,
					reasons: ['Invalid submission', 'Other: Provided documents were incomplete'],
					site_address: expectedSiteAddress,
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
				databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
				databaseConnector.representation.update.mockResolvedValue({
					...mockRepresentation,
					status: 'invalid'
				});

				const response = await request
					.patch('/appeals/1/reps/1')
					.send({
						status: 'invalid',
						allowResubmit: false
					})
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: expectedEmailPayload,
					recipientEmail: mockRepresented.email,
					templateName: 'ip-comment-rejected'
				});
			}
		);

		test.each([
			['full planning', appealS78],
			['listed building', appealS20]
		])(
			'200 when ip comment representation status is successfully updated with rejection and is allowed resubmission, appeal type %s',
			async (_, appeal) => {
				jest
					.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
					.setSystemTime(new Date('2024-12-11'));

				const mockRepresented = { email: 'test123@test.com' };
				const mockAppeal = {
					...appeal,
					appealTimetable: { ...appeal.appealTimetable, ipCommentsDueDate: new Date() }
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
					.map((key) => appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					lpa_reference: mockAppeal.applicationReference,
					deadline_date: '16 December 2024',
					resubmit_comment_to_fo: false,
					appeal_reference_number: mockAppeal.reference,
					reasons: ['Invalid submission', 'Other: Provided documents were incomplete'],
					site_address: expectedSiteAddress,
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: expectedEmailPayload,
					recipientEmail: mockRepresented.email,
					templateName: 'ip-comment-rejected-deadline-extended'
				});
			}
		);

		test.each([
			['full planning', appealS78],
			['listed building', appealS20],
			['advertisement', appealAdvert]
		])(
			'200 when lpa statement incomplete is successfully updated with rejection, appeal type %s',
			async (_, appeal) => {
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
					representationType: 'lpa_statement',
					siteVisitRequested: true,
					source: 'lpa',
					representationRejectionReasonsSelected: [
						{
							representationRejectionReason: {
								id: 8,
								name: 'Supporting documents missing',
								hasText: false
							},
							representationRejectionReasonText: []
						},
						{
							representationRejectionReason: {
								id: 10,
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
					.map((key) => appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					lpa_reference: appeal.applicationReference,
					deadline_date: '',
					appeal_reference_number: appeal.reference,
					reasons: ['Supporting documents missing', 'Other: Provided documents were incomplete'],
					site_address: expectedSiteAddress,
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
				databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
				databaseConnector.representation.update.mockResolvedValue({
					...mockRepresentation,
					status: 'incomplete'
				});

				const response = await request
					.patch('/appeals/1/reps/1')
					.send({
						status: 'incomplete',
						notes: 'Some notes',
						allowResubmit: false
					})
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: expectedEmailPayload,
					recipientEmail: appeal.lpa.email,
					templateName: 'lpa-statement-incomplete'
				});
			}
		);

		test.each([['full planning', appealS78]])(
			'200 when appellant statement incomplete is successfully updated with rejection, appeal type %s',
			async (_, appeal) => {
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
					representationType: 'appellant_statement',
					siteVisitRequested: true,
					source: 'citizen',
					representationRejectionReasonsSelected: [
						{
							representationRejectionReason: {
								id: 8,
								name: 'Supporting documents missing',
								hasText: false
							},
							representationRejectionReasonText: []
						},
						{
							representationRejectionReason: {
								id: 10,
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
					.map((key) => appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					lpa_reference: appeal.applicationReference,
					deadline_date: '',
					appeal_reference_number: appeal.reference,
					reasons: ['Supporting documents missing', 'Other: Provided documents were incomplete'],
					site_address: expectedSiteAddress,
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
				databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
				databaseConnector.representation.update.mockResolvedValue({
					...mockRepresentation,
					status: 'incomplete'
				});

				const response = await request
					.patch('/appeals/1/reps/1')
					.send({
						status: 'incomplete',
						notes: 'Some notes',
						allowResubmit: false
					})
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: expectedEmailPayload,
					recipientEmail: appeal.lpa.email,
					templateName: 'lpa-statement-incomplete'
				});
			}
		);

		test('200 when lpa proof of evidence incomplete is successfully updated with incomplete, appeal type %s', async () => {
			const appeal = fullPlanningAppeal;
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
				representationType: 'lpa_proofs_evidence',
				siteVisitRequested: true,
				source: 'lpa',
				representationRejectionReasonsSelected: [
					{
						representationRejectionReason: {
							id: 8,
							name: 'Supporting documents missing',
							hasText: false
						},
						representationRejectionReasonText: []
					},
					{
						representationRejectionReason: {
							id: 10,
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
				.map((key) => appeal.address[key])
				.filter((value) => value)
				.join(', ');

			const expectedEmailPayload = {
				lpa_reference: appeal.applicationReference,
				deadline_date: '16 December 2024',
				appeal_reference_number: appeal.reference,
				reasons: ['Supporting documents missing', 'Other: Provided documents were incomplete'],
				site_address: expectedSiteAddress,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'incomplete'
			});

			const response = await request
				.patch('/appeals/1/reps/1')
				.send({
					status: 'incomplete',
					notes: 'Some notes',
					allowResubmit: false
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);

			expect(mockNotifySend).toHaveBeenCalledTimes(1);

			expect(mockNotifySend).toHaveBeenCalledWith({
				azureAdUserId: expect.anything(),
				notifyClient: expect.anything(),
				personalisation: expectedEmailPayload,
				recipientEmail: appeal.lpa.email,
				templateName: 'proof-of-evidence-incomplete'
			});
		});

		test('200 when appellant proof of evidence incomplete is successfully updated with incomplete, appeal type %s', async () => {
			const appeal = fullPlanningAppeal;
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
				representationType: 'appellant_proofs_evidence',
				siteVisitRequested: true,
				source: 'lpa',
				representationRejectionReasonsSelected: [
					{
						representationRejectionReason: {
							id: 8,
							name: 'Supporting documents missing',
							hasText: false
						},
						representationRejectionReasonText: []
					},
					{
						representationRejectionReason: {
							id: 10,
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
				.map((key) => appeal.address[key])
				.filter((value) => value)
				.join(', ');

			const expectedEmailPayload = {
				lpa_reference: appeal.applicationReference,
				deadline_date: '16 December 2024',
				appeal_reference_number: appeal.reference,
				reasons: ['Supporting documents missing', 'Other: Provided documents were incomplete'],
				site_address: expectedSiteAddress,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'incomplete'
			});

			const response = await request
				.patch('/appeals/1/reps/1')
				.send({
					status: 'incomplete',
					notes: 'Some notes',
					allowResubmit: false
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);

			expect(mockNotifySend).toHaveBeenCalledTimes(1);

			expect(mockNotifySend).toHaveBeenCalledWith({
				azureAdUserId: expect.anything(),
				notifyClient: expect.anything(),
				personalisation: expectedEmailPayload,
				recipientEmail: appeal.agent.email,
				templateName: 'proof-of-evidence-incomplete'
			});
		});

		test('200 when rule 6 proof of evidence incomplete is successfully updated with incomplete, appeal type %s', async () => {
			const appealWithRule6 = {
				...fullPlanningAppeal,
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
			};
			jest
				.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
				.setSystemTime(new Date('2024-12-11'));

			const mockRepresentation = {
				id: 1,
				lpa: false,
				status: null,
				representedId: 729,
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: 'Redacted text of the representation',
				dateCreated: new Date('2024-12-11T12:00:00Z'),
				notes: 'Some notes',
				attachments: ['attachment1.pdf', 'attachment2.pdf'],
				representationType: 'rule_6_party_proofs_evidence',
				siteVisitRequested: true,
				source: 'lpa',
				representationRejectionReasonsSelected: [
					{
						representationRejectionReason: {
							id: 8,
							name: 'Supporting documents missing',
							hasText: false
						},
						representationRejectionReasonText: []
					},
					{
						representationRejectionReason: {
							id: 10,
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
				.map((key) => appealWithRule6.address[key])
				.filter((value) => value)
				.join(', ');

			const expectedEmailPayload = {
				lpa_reference: appealWithRule6.applicationReference,
				deadline_date: '16 December 2024',
				appeal_reference_number: appealWithRule6.reference,
				reasons: ['Supporting documents missing', 'Other: Provided documents were incomplete'],
				site_address: expectedSiteAddress,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithRule6);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'incomplete'
			});

			const response = await request
				.patch('/appeals/1/reps/1')
				.send({
					status: 'incomplete',
					notes: 'Some notes',
					allowResubmit: false
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);

			expect(mockNotifySend).toHaveBeenCalledTimes(1);

			expect(mockNotifySend).toHaveBeenCalledWith({
				azureAdUserId: expect.anything(),
				notifyClient: expect.anything(),
				personalisation: expectedEmailPayload,
				recipientEmail: appealWithRule6.appealRule6Parties[0].serviceUser.email,
				templateName: 'proof-of-evidence-incomplete'
			});
		});

		test('200 when rule 6 party statement incomplete is successfully updated with incomplete', async () => {
			const appealWithRule6 = {
				...fullPlanningAppeal,
				appealTimetable: {
					lpaQuestionnaireDueDate: new Date('2024-12-20')
				},
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
			};

			jest
				.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
				.setSystemTime(new Date('2024-12-11'));

			const mockRepresentation = {
				id: 1,
				lpa: false,
				status: null,
				representedId: 729,
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: 'Redacted text of the representation',
				dateCreated: new Date('2024-12-11T12:00:00Z'),
				notes: 'Some notes',
				attachments: ['attachment1.pdf', 'attachment2.pdf'],
				representationType: 'rule_6_party_statement',
				siteVisitRequested: true,
				source: 'citizen',
				representationRejectionReasonsSelected: [
					{
						representationRejectionReason: {
							id: 8,
							name: 'Supporting documents missing',
							hasText: false
						},
						representationRejectionReasonText: []
					},
					{
						representationRejectionReason: {
							id: 10,
							name: 'Other',
							hasText: true
						},
						representationRejectionReasonText: [{ text: 'Provided documents were incomplete' }]
					}
				]
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithRule6);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'incomplete'
			});

			const response = await request
				.patch('/appeals/1/reps/1')
				.send({
					status: 'incomplete',
					notes: 'Some notes',
					allowResubmit: false
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);

			expect(mockNotifySend).toHaveBeenCalledTimes(1);

			expect(mockNotifySend).toHaveBeenCalledWith({
				azureAdUserId: expect.any(String),
				notifyClient: expect.anything(),
				personalisation: {
					appeal_reference_number: appealWithRule6.reference,
					site_address: expect.any(String),
					lpa_reference: appealWithRule6.applicationReference,
					statement_deadline: '20 Dec 2024',
					reasons: ['Supporting documents missing', 'Other: Provided documents were incomplete'],
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: 'rule6party@example.com',
				templateName: 'rule-6-statement-incomplete'
			});
		});
	});

	describe('POST representation/:representationType', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
		});

		test('400 when missing redaction status', async () => {
			const response = await request
				.post('/appeals/1/reps/comment')
				.send({ ipDetails: { firstName: 'test', lastName: 'test' } })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					redactionStatus: 'Invalid value'
				}
			});
		});

		test('400 representationType is invalid', async () => {
			const response = await request
				.post('/appeals/1/reps/notValidRepType')
				.send({
					redactionStatus: 'test'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					representationType:
						'must be one of lpa_statement, appellant_statement, rule_6_party_statement, comment, lpa_final_comment, appellant_final_comment, lpa_proofs_evidence, appellant_proofs_evidence, rule_6_party_proofs_evidence'
				}
			});
		});

		test('400 when IP first name is invalid', async () => {
			const response = await request
				.post('/appeals/1/reps/comment')
				.send({ ipDetails: { firstName: 212433 }, redactionStatus: 'test' })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					'ipDetails.firstName': 'must be a string'
				}
			});
		});

		test('400 when IP last name is invalid', async () => {
			const response = await request
				.post('/appeals/1/reps/comment')
				.send({ ipDetails: { lastName: true }, redactionStatus: 'test' })
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					'ipDetails.lastName': 'must be a string'
				}
			});
		});

		test('400 when IP email is invalid', async () => {
			const response = await request
				.post('/appeals/1/reps/comment')
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
				.post('/appeals/1/reps/comment')
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
				.post('/appeals/1/reps/comment')
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

		test('200 when representation ip comment is successfully created', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.post('/appeals/1/reps/comment')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'test@example.com' },
					ipAddress: { postCode: '', addressLine1: '' },
					redactionStatus: 'unredacted',
					attachments: []
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
		});

		test('200 when IP comment with address and attachment is successfully created', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			const mockDocument = {
				guid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				name: 'test.pdf'
			};

			databaseConnector.document.findUnique.mockResolvedValue(mockDocument);

			const response = await request
				.post('/appeals/1/reps/comment')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'test@example.com' },
					ipAddress: { postCode: 'abc 123', addressLine1: 'line 1' },
					redactionStatus: 'unredacted',
					attachments: ['0']
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(mockBroadcasters.broadcastDocument).toHaveBeenCalledWith(
				'39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				1,
				'Create'
			);
		});

		test('200 when lpa statement representation with attachment is successfully created', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			const mockDocument = {
				guid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				name: 'test.pdf'
			};

			databaseConnector.document.findUnique.mockResolvedValue(mockDocument);

			const response = await request
				.post('/appeals/1/reps/lpa_statement')
				.send({
					redactionStatus: 'unredacted',
					attachments: ['0'],
					lpaCode: 'LPA',
					source: 'lpa',
					representationText: 'added as document'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(mockBroadcasters.broadcastDocument).toHaveBeenCalledWith(
				'39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				1,
				'Create'
			);
		});

		test('200 when lpa final comment representation with attachment is successfully created', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			const mockDocument = {
				guid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				name: 'test.pdf'
			};

			databaseConnector.document.findUnique.mockResolvedValue(mockDocument);

			const response = await request
				.post('/appeals/1/reps/lpa_final_comment')
				.send({
					redactionStatus: 'unredacted',
					attachments: ['0'],
					lpaCode: 'LPA',
					source: 'lpa',
					representationText: 'added as document'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(mockBroadcasters.broadcastDocument).toHaveBeenCalledWith(
				'39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				1,
				'Create'
			);
		});

		test('200 when appellant final comments representation with attachment is successfully created', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			const mockDocument = {
				guid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				name: 'test.pdf'
			};

			databaseConnector.document.findUnique.mockResolvedValue(mockDocument);

			const response = await request
				.post('/appeals/1/reps/appellant_final_comment')
				.send({
					redactionStatus: 'unredacted',
					attachments: ['0'],
					source: 'citizen',
					representationText: 'added as document'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(mockBroadcasters.broadcastDocument).toHaveBeenCalledWith(
				'39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				1,
				'Create'
			);
		});

		test('201 when rule_6_party_statement representation with attachment is successfully created', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			const mockDocument = {
				guid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				name: 'test.pdf'
			};

			databaseConnector.document.findUnique.mockResolvedValue(mockDocument);

			const response = await request
				.post('/appeals/1/reps/rule_6_party_statement')
				.send({
					redactionStatus: 'unredacted',
					attachments: ['0'],
					source: 'citizen',
					representedId: 1
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(mockBroadcasters.broadcastDocument).toHaveBeenCalledWith(
				'39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				1,
				'Create'
			);
		});

		test('201 when rule_6_party_proofs_evidence representation with attachment is successfully created', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...fullPlanningAppeal,
				appealRule6Parties: [
					{
						serviceUser: {
							email: 'test@test.com'
						}
					}
				]
			});
			const mockDocument = {
				guid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				name: 'test.pdf'
			};

			databaseConnector.document.findUnique.mockResolvedValue(mockDocument);

			const response = await request
				.post('/appeals/1/reps/rule_6_party_proofs_evidence')
				.send({
					redactionStatus: 'unredacted',
					attachments: ['0'],
					source: 'citizen',
					representedId: 1
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(mockBroadcasters.broadcastDocument).toHaveBeenCalledWith(
				'39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				1,
				'Create'
			);

			expect(mockNotifySend).toHaveBeenCalledTimes(3);

			expect(mockNotifySend).toHaveBeenNthCalledWith(3, {
				azureAdUserId: '732652365',
				notifyClient: expect.anything(),
				personalisation: {
					appeal_reference_number: fullPlanningAppeal.reference,
					lpa_reference: fullPlanningAppeal.applicationReference,
					site_address: `${fullPlanningAppeal.address.addressLine1}, ${fullPlanningAppeal.address.addressLine2}, ${householdAppeal.address.addressTown}, ${householdAppeal.address.addressCounty}, ${householdAppeal.address.postcode}, ${householdAppeal.address.addressCountry}`,
					inquiry_date: '31 March 2022',
					statement_url: '/mock-front-office-url/rule-6/1345264'
				},
				recipientEmail: 'test@test.com',
				templateName: 'rule-6-party-proof-of-evidence-received'
			});
		});
	});

	describe('POST representation/comments auto-publish', () => {
		test('200 and auto-publishes for comment rep_type when appeal has PASSED statements state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [{ valid: false, status: 'statements' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'published'
			});

			const response = await request
				.post('/appeals/1/reps/comment')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'test@example.com' },
					ipAddress: { postCode: '', addressLine1: '' },
					redactionStatus: 'unredacted',
					attachments: []
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and does not auto-publish for comment rep_type when appeal is NOT in statements state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [{ valid: true, status: 'lpa_questionnaire' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'awaiting_review'
			});

			const response = await request
				.post('/appeals/1/reps/comment')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'test@example.com' },
					ipAddress: { postCode: '', addressLine1: '' },
					redactionStatus: 'unredacted',
					attachments: []
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.not.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and does not auto-publish for comment rep_type when appeal is CURRENTLY in statements state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [{ valid: true, status: 'statements' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'awaiting_review'
			});

			const response = await request
				.post('/appeals/1/reps/comment')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'test@example.com' },
					ipAddress: { postCode: '', addressLine1: '' },
					redactionStatus: 'unredacted',
					attachments: []
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.not.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and auto-publishes for comment rep_type when appeal is in final_comments state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{ valid: true, status: 'final_comments' },
					{ valid: false, status: 'statements' }
				]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'published'
			});

			const response = await request
				.post('/appeals/1/reps/comment')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'test@example.com' },
					ipAddress: { postCode: '', addressLine1: '' },
					redactionStatus: 'unredacted',
					attachments: []
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and auto-publishes for lpa_statement rep_type when appeal has PASSED statements state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [{ valid: false, status: 'statements' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'published'
			});

			const response = await request
				.post('/appeals/1/reps/lpa_statement')
				.send({
					redactionStatus: 'unredacted',
					attachments: [],
					lpaCode: 'LPA',
					source: 'lpa',
					representationText: 'added as document'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and does not auto-publish for lpa_statement rep_type when appeal is NOT yet passed statements state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [{ valid: true, status: 'lpa_questionnaire' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'awaiting_review'
			});

			const response = await request
				.post('/appeals/1/reps/lpa_statement')
				.send({
					redactionStatus: 'unredacted',
					attachments: [],
					lpaCode: 'LPA',
					source: 'lpa',
					representationText: 'added as document'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.not.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and does auto-publish for lpa_statement rep_type when appeal is CURRENTLY in statements state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [{ valid: true, status: 'statements' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'awaiting_review'
			});

			const response = await request
				.post('/appeals/1/reps/lpa_statement')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'test@example.com' },
					ipAddress: { postCode: '', addressLine1: '' },
					redactionStatus: 'unredacted',
					attachments: []
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and auto-publishes for lpa_statement rep_type when appeal is in final_comments state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{ valid: true, status: 'final_comments' },
					{ valid: false, status: 'statements' }
				]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'published'
			});

			const response = await request
				.post('/appeals/1/reps/lpa_statement')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'test@example.com' },
					ipAddress: { postCode: '', addressLine1: '' },
					redactionStatus: 'unredacted',
					attachments: []
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and auto-publishes for lpa_final_comment rep_type when appeal has PASSED final_comments state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [{ valid: false, status: 'final_comments' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'published'
			});

			const response = await request
				.post('/appeals/1/reps/lpa_final_comment')
				.send({
					redactionStatus: 'unredacted',
					attachments: [],
					lpaCode: 'LPA',
					source: 'lpa',
					representationText: 'added as document'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and does not auto-publish for lpa_final_comment rep_type when appeal is NOT yet passed final_comments state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [{ valid: true, status: 'statements' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'awaiting_review'
			});

			const response = await request
				.post('/appeals/1/reps/lpa_final_comment')
				.send({
					redactionStatus: 'unredacted',
					attachments: [],
					lpaCode: 'LPA',
					source: 'lpa',
					representationText: 'added as document'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.not.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and does auto-publish for lpa_final_comment rep_type when appeal is CURRENTLY in final_comments state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [{ valid: true, status: 'final_comments' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'awaiting_review'
			});

			const response = await request
				.post('/appeals/1/reps/lpa_final_comment')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'test@example.com' },
					ipAddress: { postCode: '', addressLine1: '' },
					redactionStatus: 'unredacted',
					attachments: []
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and auto-publishes for lpa_final_comment rep_type when appeal is in final_comments state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{ valid: true, status: 'final_comments' },
					{ valid: false, status: 'statements' }
				]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'published'
			});

			const response = await request
				.post('/appeals/1/reps/lpa_final_comment')
				.send({
					ipDetails: { firstName: 'test', lastName: 'test', email: 'test@example.com' },
					ipAddress: { postCode: '', addressLine1: '' },
					redactionStatus: 'unredacted',
					attachments: []
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and auto-publishes for rule_6_party_statement rep_type when appeal has PASSED statements state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealTimetable: {
					lpaStatementDueDate: new Date('2024-05-23')
				},
				appealStatus: [{ valid: false, status: 'statements' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'published'
			});

			const response = await request
				.post('/appeals/1/reps/rule_6_party_statement')
				.send({
					redactionStatus: 'unredacted',
					attachments: [],
					lpaCode: 'LPA',
					source: 'lpa',
					representationText: 'added as document'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and does not auto-publish for rule_6_party_statement rep_type when appeal has PASSED statements state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealTimetable: {
					lpaStatementDueDate: addDays(new Date(), 7)
				},
				appealStatus: [{ valid: false, status: 'statements' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'published'
			});

			const response = await request
				.post('/appeals/1/reps/rule_6_party_statement')
				.send({
					redactionStatus: 'unredacted',
					attachments: [],
					lpaCode: 'LPA',
					source: 'lpa',
					representationText: 'added as document'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).not.toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and auto-publishes for rule_6_party_proofs_evidence rep_type when appeal has PASSED statements state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealTimetable: {
					proofOfEvidenceAndWitnessesDueDate: new Date('2024-05-23')
				},
				appealStatus: [{ valid: false, status: 'evidence' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'published'
			});

			const response = await request
				.post('/appeals/1/reps/rule_6_party_proofs_evidence')
				.send({
					redactionStatus: 'unredacted',
					attachments: [],
					lpaCode: 'LPA',
					source: 'lpa',
					representationText: 'added as document'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});

		test('200 and does not auto-publish for rule_6_party_proofs_evidence rep_type when appeal has PASSED statements state', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealTimetable: {
					lpaStatementDueDate: addDays(new Date(), 7)
				},
				appealStatus: [{ valid: false, status: 'statements' }]
			});
			databaseConnector.representation.create.mockResolvedValue({
				id: 1,
				status: 'published'
			});

			const response = await request
				.post('/appeals/1/reps/rule_6_party_proofs_evidence')
				.send({
					redactionStatus: 'unredacted',
					attachments: [],
					lpaCode: 'LPA',
					source: 'lpa',
					representationText: 'added as document'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(databaseConnector.representation.create).not.toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: 'published'
					})
				})
			);
			expect(mockBroadcasters.broadcastRepresentation).toHaveBeenCalledWith(
				expect.anything(),
				'Create'
			);
		});
	});

	describe('POST representation/:proofOfEvidenceType/proof-of-evidence', () => {
		beforeEach(() => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
		});

		test('400 when attachment guids is empty', async () => {
			const response = await request
				.post('/appeals/1/reps/lpa/proof-of-evidence')
				.send({
					attachments: []
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					attachments: 'Attachments must be a non-empty array'
				}
			});
		});

		test('400 when attachment guids does not exist', async () => {
			const response = await request
				.post('/appeals/1/reps/lpa/proof-of-evidence')
				.send({})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					attachments: 'Attachments field is required'
				}
			});
		});

		test('400 when proof of evidence type is not valid', async () => {
			const response = await request
				.post('/appeals/1/reps/app/proof-of-evidence')
				.send({
					attachments: ['123-456-789']
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					proofOfEvidenceType: 'must be either appellant or lpa'
				}
			});
		});

		test('200 when representation is successfully created for LPA', async () => {
			const response = await request
				.post('/appeals/1/reps/lpa/proof-of-evidence')
				.send({
					attachments: ['12345-6789-12345']
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
		});

		test('200 when representation is successfully created for appellant', async () => {
			const response = await request
				.post('/appeals/1/reps/appellant/proof-of-evidence')
				.send({
					attachments: ['12345-6789-12345']
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
				name: 'test.pdf',
				caseId: 1,
				latestDocumentVersion: { version: 1 },
				versions: [
					{
						version: 1,
						documentURI: 'http://example.com/test.pdf',
						fileMD5: 'abc123',
						dateCreated: new Date(),
						dateReceived: new Date()
					}
				]
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

			expect(mockBroadcasters.broadcastDocument).toHaveBeenCalledWith(
				'39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				1,
				'Create'
			);
		});

		test('200 with new version updated', async () => {
			const mockRepresentation = {
				id: 1,
				appealId: 1,
				attachments: [{ documentGuid: 'b6f15730-2d7f-4fa0-8752-2d26a62474de', version: 2 }]
			};
			const mockUpdatedRepresentation = {
				id: 1,
				appealId: 1,
				attachments: [{ documentGuid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6', version: 2 }]
			};
			const mockDocument = {
				guid: '39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				name: 'test.pdf',
				caseId: 1,
				latestDocumentVersion: { version: 2 },
				versions: [
					{
						version: 2,
						documentURI: 'http://example.com/test.pdf',
						fileMD5: 'abc123',
						dateCreated: new Date(),
						dateReceived: new Date()
					}
				]
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
									version: 2
								}
							}
						]
					}
				}
			});

			expect(mockBroadcasters.broadcastDocument).toHaveBeenCalledWith(
				'39ad6cd8-60ab-43f0-a995-4854db8f12c6',
				2,
				'Update'
			);
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

	describe('/appeals/:id/reps/publish', () => {
		let mockAdvertAppeal;
		let mockS78Appeal;
		let mockS20Appeal;
		const emailPayload = {
			inquiry_address: '',
			inquiry_date: '',
			inquiry_detail_warning_text: '',
			inquiry_expected_days: '',
			inquiry_time: '',
			inquiry_witnesses_text: '',
			inquiry_subject_line: ''
		};
		beforeEach(() => {
			mockAdvertAppeal = structuredClone({
				...appealAdvert,
				representations: appealAdvert.representations.filter(
					(rep) => rep.status !== 'awaiting_review'
				)
			});
			mockS78Appeal = structuredClone({
				...appealS78,
				representations: appealS78.representations.filter((rep) => rep.status !== 'awaiting_review')
			});
			mockS20Appeal = structuredClone({
				...appealS20,
				representations: appealS20.representations.filter((rep) => rep.status !== 'awaiting_review')
			});
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		describe('publish LPA statements', () => {
			beforeEach(() => {
				mockAdvertAppeal.appealStatus[0].status = 'statements';
				mockS78Appeal.appealStatus[0].status = 'statements';
				mockS20Appeal.appealStatus[0].status = 'statements';
			});

			test('409 if case is not in STATEMENTS state', async () => {
				mockS78Appeal.appealStatus[0].status = 'lpa_questionnaire';
				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'lpa_statement' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(409);
			});

			test('400 if any ip comments or any lpa statements are awaiting review', async () => {
				mockS78Appeal.representations = appealS78.representations;
				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'lpa_statement' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(400);
			});

			test('400 if the deadline for ip comments has not passed', async () => {
				mockS78Appeal.appealTimetable = {
					...mockS78Appeal.appealTimetable,
					ipCommentsDueDate: new Date('3025-01-01')
				};
				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'lpa_statement' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(400);
			});

			test('400 if the deadline for lpa statements has not passed', async () => {
				mockS78Appeal.appealTimetable = {
					...mockS78Appeal.appealTimetable,
					lpaStatementDueDate: new Date('3025-01-01')
				};
				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'lpa_statement' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(400);
			});

			test('send notify comments and statements (written) S78', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS78Appeal.applicationReference,
					appeal_reference_number: mockS78Appeal.reference,
					has_ip_comments: false,
					has_statement: false,
					final_comments_deadline: '4 December 2024',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'lpa_statement' },
					{ representationType: 'comment' }
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'You need to [submit your final comments](/mock-front-office-url/manage-appeals/6000002) by 4 December 2024.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'received-statement-and-ip-comments-lpa'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'You need to [submit your final comments](/mock-front-office-url/appeals/6000002) by 4 December 2024.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'received-statement-and-ip-comments-appellant'
				});
			});

			test('send notify comments and statements (written) advertisement', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockAdvertAppeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockAdvertAppeal.applicationReference,
					appeal_reference_number: mockAdvertAppeal.reference,
					has_ip_comments: false,
					has_statement: false,
					final_comments_deadline: '4 December 2024',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockAdvertAppeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'lpa_statement' },
					{ representationType: 'comment' }
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'You need to [submit your final comments](/mock-front-office-url/manage-appeals/6000002) by 4 December 2024.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'received-statement-and-ip-comments-lpa'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'You need to [submit your final comments](/mock-front-office-url/appeals/6000002) by 4 December 2024.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'received-statement-and-ip-comments-appellant'
				});
			});

			test('send notify comments and statements (written) S78 when appeals linked', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS78Appeal.applicationReference,
					appeal_reference_number: mockS78Appeal.reference,
					has_ip_comments: false,
					has_statement: false,
					final_comments_deadline: '4 December 2024',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				const childAppeals = [
					{
						type: CASE_RELATIONSHIP_LINKED,
						childId: 100,
						child: { appealStatus: mockS78Appeal.appealStatus }
					},
					{
						type: CASE_RELATIONSHIP_RELATED,
						childId: 200,
						child: { appealStatus: mockS78Appeal.appealStatus }
					},
					{
						type: CASE_RELATIONSHIP_LINKED,
						childId: 300,
						child: { appealStatus: mockS78Appeal.appealStatus }
					}
				];

				databaseConnector.appeal.findUnique.mockResolvedValue({
					...mockS78Appeal,
					childAppeals
				});
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'lpa_statement' },
					{ representationType: 'comment' }
				]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);
				databaseConnector.user.upsert.mockResolvedValue({ id: 1, azureAdUserId });

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'statements' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'You need to [submit your final comments](/mock-front-office-url/manage-appeals/6000002) by 4 December 2024.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'received-statement-and-ip-comments-lpa'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'You need to [submit your final comments](/mock-front-office-url/appeals/6000002) by 4 December 2024.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'received-statement-and-ip-comments-appellant'
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(4);

				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
					data: {
						appealId: childAppeals[0].childId,
						details: 'Case progressed to final_comments',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(2, {
					data: {
						appealId: childAppeals[2].childId,
						details: 'Case progressed to final_comments',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(3, {
					data: {
						appealId: mockS78Appeal.id,
						details: 'Case progressed to final_comments',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(4, {
					data: {
						appealId: mockS78Appeal.id,
						details: 'Statements and IP comments shared',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
			});

			test('send notify comments and statements (only comments) S78', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS78Appeal.applicationReference,
					appeal_reference_number: mockS78Appeal.reference,
					has_ip_comments: false,
					has_statement: false,
					final_comments_deadline: '4 December 2024',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'comment' }
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: false,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'You need to [submit your final comments](/mock-front-office-url/manage-appeals/6000002) by 4 December 2024.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'received-statement-and-ip-comments-lpa'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: false,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'You need to [submit your final comments](/mock-front-office-url/appeals/6000002) by 4 December 2024.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'received-statement-and-ip-comments-appellant'
				});
			});

			test('send notify comments and statements (only LPA statement) S78', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS78Appeal.applicationReference,
					appeal_reference_number: mockS78Appeal.reference,
					has_ip_comments: false,
					has_statement: false,
					final_comments_deadline: '4 December 2024',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'lpa_statement' }
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: false,
						has_statement: true,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'The inspector will visit the site and we will contact you when we have made the decision.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'received-statement-and-ip-comments-lpa'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: false,
						has_statement: true,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'You need to [submit your final comments](/mock-front-office-url/appeals/6000002) by 4 December 2024.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'received-statement-and-ip-comments-appellant'
				});
			});

			test('send notify comments and statements (no comments or statements) S78', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS78Appeal.applicationReference,
					appeal_reference_number: mockS78Appeal.reference,
					has_ip_comments: false,
					has_statement: false,
					final_comments_deadline: '4 December 2024',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([]);
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: false,
						has_statement: false,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'The inspector will visit the site and we will contact you when we have made the decision.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'received-statement-and-ip-comments-lpa'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: false,
						has_statement: false,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'You need to [submit your final comments](/mock-front-office-url/appeals/6000002) by 4 December 2024.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'received-statement-and-ip-comments-appellant'
				});
			});

			test('send notify comments and statements (written) S20', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS20Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS20Appeal.applicationReference,
					appeal_reference_number: mockS20Appeal.reference,
					has_ip_comments: false,
					has_statement: false,
					final_comments_deadline: '4 December 2024',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS20Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'lpa_statement' },
					{ representationType: 'appellant_final_comment' },
					{ representationType: 'comment' }
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'You need to [submit your final comments](/mock-front-office-url/manage-appeals/6000002) by 4 December 2024.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: mockS20Appeal.lpa.email,
					templateName: 'received-statement-and-ip-comments-lpa'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: false,
						is_inquiry_procedure: false,
						what_happens_next:
							'You need to [submit your final comments](/mock-front-office-url/appeals/6000002) by 4 December 2024.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: mockS20Appeal.appellant.email,
					templateName: 'received-statement-and-ip-comments-appellant'
				});
			});

			test('send notify comments and statements (hearing not yet set up) S78', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS78Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					appeal_reference_number: mockS78Appeal.reference,
					final_comments_deadline: '4 December 2024',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				const appeal = {
					...mockS78Appeal,
					procedureType: {
						id: 1,
						key: 'hearing',
						name: 'Hearing'
					}
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'lpa_statement' },
					{ representationType: 'comment' }
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: true,
						is_inquiry_procedure: false,
						what_happens_next: 'We will contact you when the hearing has been set up.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'received-statement-and-ip-comments-lpa'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: true,
						is_inquiry_procedure: false,
						what_happens_next: 'We will contact you if we need any more information.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'received-statement-and-ip-comments-appellant'
				});
			});
			test('send notify comments and statements (hearing not yet set up) S20', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS20Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS20Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					appeal_reference_number: mockS20Appeal.reference,
					final_comments_deadline: '4 December 2024',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				const appeal = {
					...mockS20Appeal,
					procedureType: {
						id: 1,
						key: 'hearing',
						name: 'Hearing'
					}
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'lpa_statement' },
					{ representationType: 'comment' }
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: true,
						is_inquiry_procedure: false,
						what_happens_next: 'We will contact you when the hearing has been set up.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'received-statement-and-ip-comments-lpa'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: true,
						is_inquiry_procedure: false,
						what_happens_next: 'We will contact you if we need any more information.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'received-statement-and-ip-comments-appellant'
				});
			});

			test('send notify comments and statements (hearing already set up) S78', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS78Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					appeal_reference_number: mockS78Appeal.reference,
					final_comments_deadline: '4 December 2024',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				const appeal = {
					...mockS78Appeal,
					procedureType: {
						id: 1,
						key: 'hearing',
						name: 'Hearing'
					},
					hearing: {
						hearingStartTime: new Date('2025-01-31')
					}
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'lpa_statement' },
					{ representationType: 'appellant_final_comment' },
					{ representationType: 'comment' }
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: true,
						is_inquiry_procedure: false,
						what_happens_next: 'The hearing is on 31 January 2025.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'received-statement-and-ip-comments-lpa'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: true,
						is_inquiry_procedure: false,
						what_happens_next:
							'Your hearing is on 31 January 2025.\n\nWe will contact you if we need any more information.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'received-statement-and-ip-comments-appellant'
				});
			});
			test('send notify comments and statements (hearing already set up) S20', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS20Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS20Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					appeal_reference_number: mockS20Appeal.reference,
					final_comments_deadline: '4 December 2024',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				const appeal = {
					...mockS20Appeal,
					procedureType: {
						id: 1,
						key: 'hearing',
						name: 'Hearing'
					},
					hearing: {
						hearingStartTime: new Date('2025-01-31')
					}
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'lpa_statement' },
					{ representationType: 'comment' }
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: true,
						is_inquiry_procedure: false,
						what_happens_next: 'The hearing is on 31 January 2025.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'received-statement-and-ip-comments-lpa'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						has_ip_comments: true,
						has_statement: true,
						is_hearing_procedure: true,
						is_inquiry_procedure: false,
						what_happens_next:
							'Your hearing is on 31 January 2025.\n\nWe will contact you if we need any more information.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'received-statement-and-ip-comments-appellant'
				});
			});

			test('sends notify emails to LPA and appellant when ip comments and statements are not received', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS20Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS20Appeal.applicationReference,
					final_comments_deadline: '4 December 2024',
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: true,
					appeal_reference_number: mockS20Appeal.reference,
					site_address: expectedSiteAddress,
					user_type: '',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				databaseConnector.appeal.findUnique.mockResolvedValue({
					...mockS20Appeal,
					procedureType: {
						key: 'inquiry'
					},
					appealTimetable: {
						...mockS20Appeal.appealTimetable,
						...{
							proofOfEvidenceAndWitnessesDueDate: '2025-12-13'
						}
					}
				});
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([]);
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
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						is_inquiry_procedure: true,
						what_happens_next:
							'You need to [submit your proof of evidence and witnesses](/mock-front-office-url/manage-appeals/6000002) by 13 December 2025.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: mockS78Appeal.lpa.email,
					templateName: 'not-received-statement-and-ip-comments'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						is_inquiry_procedure: true,
						what_happens_next:
							'You need to [submit your proof of evidence and witnesses](/mock-front-office-url/appeals/6000002) by 13 December 2025.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS20.appellant.email,
					templateName: 'not-received-statement-and-ip-comments'
				});
			});
		});

		describe('publish final comments', () => {
			beforeEach(() => {
				mockAdvertAppeal.appealStatus[0].status = 'final_comments';
				mockS78Appeal.appealStatus[0].status = 'final_comments';
				mockS20Appeal.appealStatus[0].status = 'final_comments';
			});

			test('409 if case is not in FINAL_COMMENTS state', async () => {
				mockS78Appeal.appealStatus[0].status = 'lpa_questionnaire';
				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'final_comments' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(409);
			});

			test('400 if any appellant final comments or any lpa final comments are awaiting review', async () => {
				mockS78Appeal.representations = appealS78.representations;
				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'final_comments' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(400);
			});

			test('400 if the deadline for final comments has not passed', async () => {
				mockS78Appeal.appealTimetable = {
					...mockS78Appeal.appealTimetable,
					finalCommentsDueDate: new Date('3025-01-01')
				};
				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'final_comments' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(400);
			});

			test('send notify lpa and appellant final comments S78', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS78Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: false,
					appeal_reference_number: mockS78Appeal.reference,
					final_comments_deadline: '',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'appellant_final_comment' },
					{ representationType: 'lpa_final_comment' }
				]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'final_comments' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'final-comments-done-appellant'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'final-comments-done-lpa'
				});
			});

			test('send notify lpa and appellant final comments S78 when linked', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS78Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: false,
					appeal_reference_number: mockS78Appeal.reference,
					final_comments_deadline: '',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				const childAppeals = [
					{
						type: CASE_RELATIONSHIP_LINKED,
						childId: 100,
						child: { appealStatus: mockS78Appeal.appealStatus }
					},
					{
						type: CASE_RELATIONSHIP_RELATED,
						childId: 200,
						child: { appealStatus: mockS78Appeal.appealStatus }
					},
					{
						type: CASE_RELATIONSHIP_LINKED,
						childId: 300,
						child: { appealStatus: mockS78Appeal.appealStatus }
					}
				];

				databaseConnector.appeal.findUnique.mockResolvedValue({
					...mockS78Appeal,
					childAppeals
				});

				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'appellant_final_comment' },
					{ representationType: 'lpa_final_comment' }
				]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);
				databaseConnector.user.upsert.mockResolvedValue({ id: 1, azureAdUserId });

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'final_comments' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'final-comments-done-appellant'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'final-comments-done-lpa'
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(4);

				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
					data: {
						appealId: childAppeals[0].childId,
						details: 'Case progressed to event',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(2, {
					data: {
						appealId: childAppeals[2].childId,
						details: 'Case progressed to event',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(3, {
					data: {
						appealId: mockS78Appeal.id,
						details: 'Case progressed to event',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(4, {
					data: {
						appealId: mockS78Appeal.id,
						details: 'Final comments shared',
						loggedAt: expect.any(Date),
						userId: 1
					}
				});
			});

			test('send notify lpa and appellant final comments S20', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS20Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS20Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: false,
					appeal_reference_number: mockS20Appeal.reference,
					final_comments_deadline: '',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS20Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'appellant_final_comment' },
					{ representationType: 'lpa_final_comment' }
				]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'final_comments' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS20.appellant.email,
					templateName: 'final-comments-done-appellant'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS20.lpa.email,
					templateName: 'final-comments-done-lpa'
				});
			});

			test('send notify lpa and appellant final comments S20 agent email', async () => {
				mockS20Appeal.appellant.email = null;
				mockS20Appeal.agent = {
					email: 'agent@example.com'
				};
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS20Appeal.address[key])
					.filter((value) => value)
					.join(', ');
				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS20Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: false,
					appeal_reference_number: mockS20Appeal.reference,
					final_comments_deadline: '',
					site_address: expectedSiteAddress,
					user_type: ''
				};
				databaseConnector.appeal.findUnique.mockResolvedValue(mockS20Appeal);
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
				expect(mockNotifySend).toHaveBeenCalledTimes(2);
				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: mockS20Appeal.agent.email,
					templateName: 'final-comments-done-appellant'
				});
				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: mockS20Appeal.lpa.email,
					templateName: 'final-comments-done-lpa'
				});
			});

			test('send notify to lpa and appellant if no appellant final comments submitted', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS78Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: false,
					appeal_reference_number: mockS78Appeal.reference,
					final_comments_deadline: '',
					site_address: expectedSiteAddress,
					user_type: '',
					what_happens_next: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'final_comments' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						user_type: 'local planning authority',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: mockS78Appeal.appellant.email,
					templateName: 'final-comments-none'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						user_type: 'appellant',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: mockS78Appeal.lpa.email,
					templateName: 'final-comments-none'
				});
			});

			test('sends notify emails to LPA and appellant when only LPA final comments are received', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS20Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS20Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: false,
					appeal_reference_number: mockS20Appeal.reference,
					final_comments_deadline: '',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS20Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'lpa_final_comment' }
				]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'final_comments' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS20.appellant.email,
					templateName: 'final-comments-done-appellant'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						user_type: 'appellant',
						what_happens_next: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: mockS78Appeal.lpa.email,
					templateName: 'final-comments-none'
				});
			});

			test('sends notify emails to LPA and appellant when only appellant final comments are received', async () => {
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS20Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					...emailPayload,
					lpa_reference: mockS20Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: false,
					appeal_reference_number: mockS20Appeal.reference,
					final_comments_deadline: '',
					site_address: expectedSiteAddress,
					user_type: '',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS20Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'appellant_final_comment' }
				]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'final_comments' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: '',
						user_type: 'local planning authority',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: mockS78Appeal.appellant.email,
					templateName: 'final-comments-none'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: '',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk'
					},
					recipientEmail: appealS20.lpa.email,
					templateName: 'final-comments-done-lpa'
				});
			});
		});

		describe('publish proof of evidence', () => {
			beforeEach(() => {
				mockS78Appeal.appealStatus[0].status = 'evidence';
				mockS20Appeal.appealStatus[0].status = 'evidence';
			});

			test('409 if case is not in EVIDENCE state', async () => {
				mockS78Appeal.appealStatus[0].status = 'lpa_questionnaire';
				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'evidence' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(409);
			});

			test('send notify lpa and appellant proof of evidence S78 with inquiry address', async () => {
				mockS78Appeal = {
					...mockS78Appeal,
					inquiry: {
						id: 1,
						inquiryStartTime: '2025-12-13 14:00',
						estimatedDays: 8,
						address: {
							addressLine1: '10 Mole lane',
							addressLine2: 'Test address 2',
							addressTown: 'London',
							addressCounty: 'London',
							postcode: 'WL3 6GH',
							addressCountry: 'United Kingdom'
						}
					}
				};
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedinquiryAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.inquiry.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					lpa_reference: mockS78Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: false,
					appeal_reference_number: mockS78Appeal.reference,
					final_comments_deadline: '',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'appellant_proofs_evidence' },
					{ representationType: 'lpa_proofs_evidence' }
				]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'evidence' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: 'You need to attend the inquiry on 13 December 2025.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inquiry_address: expectedinquiryAddress,
						inquiry_date: '13 December 2025',
						inquiry_detail_warning_text:
							'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
						inquiry_expected_days: '8',
						inquiry_time: '2:00pm',
						inquiry_witnesses_text:
							'Your witnesses should be available for the duration of the inquiry.',
						inquiry_subject_line:
							'We did not receive any proof of evidence and witnesses from appellant or any other parties',
						is_inquiry_procedure: true
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'not-received-proof-of-evidence-and-witnesses'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: 'You need to attend the inquiry on 13 December 2025.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inquiry_address: expectedinquiryAddress,
						inquiry_date: '13 December 2025',
						inquiry_detail_warning_text:
							'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
						inquiry_expected_days: '8',
						inquiry_time: '2:00pm',
						is_inquiry_procedure: true,
						inquiry_witnesses_text:
							'Your witnesses should be available for the duration of the inquiry.',
						inquiry_subject_line:
							'We did not receive any proof of evidence and witnesses from local planning authority or any other parties'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'not-received-proof-of-evidence-and-witnesses'
				});
			});

			test('send notify lpa and appellant proof of evidence S78 with no inquiry address', async () => {
				mockS78Appeal = {
					...mockS78Appeal,
					inquiry: {
						id: 1,
						inquiryStartTime: '2025-12-13 14:00',
						estimatedDays: 8
					}
				};
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedinquiryAddress = '';

				const expectedEmailPayload = {
					lpa_reference: mockS78Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: false,
					appeal_reference_number: mockS78Appeal.reference,
					final_comments_deadline: '',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'appellant_proofs_evidence' },
					{ representationType: 'lpa_proofs_evidence' }
				]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'evidence' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: 'You need to attend the inquiry on 13 December 2025.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inquiry_address: expectedinquiryAddress,
						inquiry_date: '13 December 2025',
						inquiry_detail_warning_text:
							'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
						inquiry_expected_days: '8',
						inquiry_time: '2:00pm',
						inquiry_witnesses_text:
							'Your witnesses should be available for the duration of the inquiry.',
						inquiry_subject_line:
							'We did not receive any proof of evidence and witnesses from appellant or any other parties',
						is_inquiry_procedure: true
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'not-received-proof-of-evidence-and-witnesses'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: 'You need to attend the inquiry on 13 December 2025.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inquiry_address: expectedinquiryAddress,
						inquiry_date: '13 December 2025',
						inquiry_detail_warning_text:
							'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
						inquiry_expected_days: '8',
						inquiry_time: '2:00pm',
						is_inquiry_procedure: true,
						inquiry_witnesses_text:
							'Your witnesses should be available for the duration of the inquiry.',
						inquiry_subject_line:
							'We did not receive any proof of evidence and witnesses from local planning authority or any other parties'
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'not-received-proof-of-evidence-and-witnesses'
				});
			});

			test('send notify to lpa and when appellant proof of evidence is not provided but LPA is completed', async () => {
				mockS78Appeal = {
					...mockS78Appeal,
					representations: [
						...mockS78Appeal.representations,
						{
							id: 4488,
							appealId: 2377,
							representationType: 'lpa_proofs_evidence',
							dateCreated: new Date('2024-11-27T15:08:55.704Z'),
							dateLastUpdated: new Date('2024-11-27T15:08:55.704Z'),
							originalRepresentation: 'Proof of evidence from lpa',
							redactedRepresentation: null,
							representedId: 5875,
							representativeId: null,
							lpaCode: null,
							status: 'valid',
							reviewer: null,
							notes: null,
							siteVisitRequested: false,
							source: 'citizen'
						}
					],
					inquiry: {
						id: 1,
						inquiryStartTime: '2025-12-13 14:00',
						estimatedDays: 8,
						address: {
							addressLine1: '10 Mole lane',
							addressLine2: 'Test address 2',
							addressTown: 'London',
							addressCounty: 'London',
							postcode: 'WL3 6GH',
							addressCountry: 'United Kingdom'
						}
					}
				};
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedinquiryAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.inquiry.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					lpa_reference: mockS78Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: false,
					appeal_reference_number: mockS78Appeal.reference,
					final_comments_deadline: '',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'appellant_proofs_evidence' },
					{ representationType: 'lpa_proofs_evidence' }
				]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'evidence' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: 'You need to attend the inquiry on 13 December 2025.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inquiry_address: expectedinquiryAddress,
						inquiry_date: '13 December 2025',
						inquiry_detail_warning_text:
							'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
						inquiry_expected_days: '8',
						inquiry_time: '2:00pm',
						inquiry_witnesses_text:
							'Your witnesses should be available for the duration of the inquiry.',
						inquiry_subject_line:
							'We did not receive any proof of evidence and witnesses from appellant or any other parties',
						is_inquiry_procedure: true
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'not-received-proof-of-evidence-and-witnesses'
				});
			});

			test('send notify to appellant and when lpa proof of evidence is not provided but appellant is completed', async () => {
				mockS78Appeal = {
					...mockS78Appeal,
					representations: [
						...mockS78Appeal.representations,
						{
							id: 4488,
							appealId: 2377,
							representationType: 'appellant_proofs_evidence',
							dateCreated: new Date('2024-11-27T15:08:55.704Z'),
							dateLastUpdated: new Date('2024-11-27T15:08:55.704Z'),
							originalRepresentation: 'Proof of evidence from appellant',
							redactedRepresentation: null,
							representedId: 5875,
							representativeId: null,
							lpaCode: null,
							status: 'valid',
							reviewer: null,
							notes: null,
							siteVisitRequested: false,
							source: 'citizen'
						}
					],
					inquiry: {
						id: 1,
						inquiryStartTime: '2025-12-13 14:00',
						estimatedDays: 8,
						address: {
							addressLine1: '10 Mole lane',
							addressLine2: 'Test address 2',
							addressTown: 'London',
							addressCounty: 'London',
							postcode: 'WL3 6GH',
							addressCountry: 'United Kingdom'
						}
					}
				};
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedinquiryAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.inquiry.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					lpa_reference: mockS78Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: false,
					appeal_reference_number: mockS78Appeal.reference,
					final_comments_deadline: '',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'appellant_proofs_evidence' },
					{ representationType: 'lpa_proofs_evidence' }
				]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'evidence' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(1);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: 'You need to attend the inquiry on 13 December 2025.',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inquiry_address: expectedinquiryAddress,
						inquiry_date: '13 December 2025',
						inquiry_detail_warning_text:
							'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
						inquiry_expected_days: '8',
						inquiry_time: '2:00pm',
						inquiry_witnesses_text:
							'Your witnesses should be available for the duration of the inquiry.',
						inquiry_subject_line:
							'We did not receive any proof of evidence and witnesses from local planning authority or any other parties',
						is_inquiry_procedure: true
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'not-received-proof-of-evidence-and-witnesses'
				});
			});

			test('send notify to lpa and appellant when both appellant and lpa proof of evidence have been provided', async () => {
				mockS78Appeal = {
					...mockS78Appeal,
					representations: [
						...mockS78Appeal.representations,
						{
							id: 4488,
							appealId: 2377,
							representationType: 'lpa_proofs_evidence',
							dateCreated: new Date('2024-11-27T15:08:55.704Z'),
							dateLastUpdated: new Date('2024-11-27T15:08:55.704Z'),
							originalRepresentation: 'Proof of evidence from lpa',
							redactedRepresentation: null,
							representedId: 5875,
							representativeId: null,
							lpaCode: null,
							status: 'valid',
							reviewer: null,
							notes: null,
							siteVisitRequested: false,
							source: 'citizen'
						},
						{
							id: 4489,
							appealId: 2377,
							representationType: 'appellant_proofs_evidence',
							dateCreated: new Date('2024-11-27T15:08:55.704Z'),
							dateLastUpdated: new Date('2024-11-27T15:08:55.704Z'),
							originalRepresentation: 'Proof of evidence from appellant',
							redactedRepresentation: null,
							representedId: 5875,
							representativeId: null,
							lpaCode: null,
							status: 'valid',
							reviewer: null,
							notes: null,
							siteVisitRequested: false,
							source: 'citizen'
						}
					],
					inquiry: {
						id: 1,
						inquiryStartTime: '2025-12-13 14:00',
						estimatedDays: 8,
						address: {
							addressLine1: '10 Mole lane',
							addressLine2: 'Test address 2',
							addressTown: 'London',
							addressCounty: 'London',
							postcode: 'WL3 6GH',
							addressCountry: 'United Kingdom'
						}
					}
				};
				const expectedSiteAddress = [
					'addressLine1',
					'addressLine2',
					'addressTown',
					'addressCounty',
					'postcode',
					'addressCountry'
				]
					.map((key) => mockS78Appeal.address[key])
					.filter((value) => value)
					.join(', ');

				const expectedEmailPayload = {
					lpa_reference: mockS78Appeal.applicationReference,
					has_ip_comments: false,
					has_statement: false,
					is_hearing_procedure: false,
					is_inquiry_procedure: false,
					appeal_reference_number: mockS78Appeal.reference,
					final_comments_deadline: '',
					site_address: expectedSiteAddress,
					user_type: ''
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'appellant_proofs_evidence' },
					{ representationType: 'lpa_proofs_evidence' }
				]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'evidence' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);

				expect(mockNotifySend).toHaveBeenCalledTimes(2);

				expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: 'appeals',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inquiry_address: '',
						inquiry_date: '13 December 2025',
						inquiry_detail_warning_text: '',
						inquiry_expected_days: '',
						inquiry_time: '',
						inquiry_witnesses_text: '',
						inquiry_subject_line: 'local planning authority',
						is_inquiry_procedure: true
					},
					recipientEmail: appealS78.appellant.email,
					templateName: 'proof-of-evidence-and-witnesses-shared'
				});

				expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
					azureAdUserId: expect.anything(),
					notifyClient: expect.anything(),
					personalisation: {
						...expectedEmailPayload,
						what_happens_next: 'manage-appeals',
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inquiry_address: '',
						inquiry_date: '13 December 2025',
						inquiry_detail_warning_text: '',
						inquiry_expected_days: '',
						inquiry_time: '',
						inquiry_witnesses_text: '',
						inquiry_subject_line: 'appellant',
						is_inquiry_procedure: true
					},
					recipientEmail: appealS78.lpa.email,
					templateName: 'proof-of-evidence-and-witnesses-shared'
				});
			});

			test('send rule 6 proof of evidence S78 with inquiry address', async () => {
				mockS78Appeal = {
					...mockS78Appeal,
					inquiry: {
						id: 1,
						inquiryStartTime: '2025-12-13 14:00',
						estimatedDays: 8,
						address: {
							addressLine1: '10 Mole lane',
							addressLine2: 'Test address 2',
							addressTown: 'London',
							addressCounty: 'London',
							postcode: 'WL3 6GH',
							addressCountry: 'United Kingdom'
						}
					}
				};

				databaseConnector.appeal.findUnique.mockResolvedValue(mockS78Appeal);
				databaseConnector.appealStatus.create.mockResolvedValue({});
				databaseConnector.appealStatus.updateMany.mockResolvedValue([]);
				databaseConnector.representation.findMany.mockResolvedValue([
					{ representationType: 'appellant_proofs_evidence' },
					{ representationType: 'lpa_proofs_evidence' },
					{ representationType: 'rule_6_party_proofs_evidence' }
				]);
				databaseConnector.representation.updateMany.mockResolvedValue([]);
				databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
					{ key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED }
				]);
				databaseConnector.documentVersion.findMany.mockResolvedValue([]);

				const response = await request
					.post('/appeals/1/reps/publish')
					.query({ type: 'evidence' })
					.set('azureAdUserId', '732652365');

				expect(response.status).toEqual(200);
			});
		});
	});
	describe('POST /appeals/:appealId/reps/publish', () => {
		test('publish Rule 6 statements', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...fullPlanningAppeal,
				appealStatus: [{ status: APPEAL_CASE_STATUS.STATEMENTS, valid: true }],
				childAppeals: [],
				lpa: { email: 'lpa@example.com' },
				appellant: { email: 'appellant@example.com' },
				procedureType: { key: 'written' },
				appealTimetable: {
					finalCommentsDueDate: new Date('2024-01-01T00:00:00.000Z'),
					proofOfEvidenceAndWitnessesDueDate: new Date('2024-02-01T00:00:00.000Z'),
					ipCommentsDueDate: new Date('2023-01-01T00:00:00.000Z'),
					lpaStatementDueDate: new Date('2023-01-01T00:00:00.000Z')
				},
				documentationSummary: {}
			});

			databaseConnector.documentVersion.findMany.mockResolvedValue([]);
			databaseConnector.documentVersion.updateMany.mockResolvedValue({ count: 0 });
			databaseConnector.representation.updateMany.mockResolvedValue({ count: 2 });
			databaseConnector.representation.findMany.mockResolvedValue([
				{
					id: 1,
					representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
					status: APPEAL_REPRESENTATION_STATUS.PUBLISHED
				},
				{
					id: 2,
					representationType: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT,
					status: APPEAL_REPRESENTATION_STATUS.PUBLISHED
				}
			]);
			databaseConnector.auditTrail.create.mockResolvedValue({});

			const response = await request
				.post('/appeals/2/reps/publish')
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toHaveLength(2);
		});
	});
});
