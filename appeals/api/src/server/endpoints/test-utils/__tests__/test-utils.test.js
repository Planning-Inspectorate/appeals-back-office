// @ts-nocheck
import config from '#config/config.js';
import {
	simulateDocumentScan,
	simulateIssueDecision,
	simulateLinkAppeals,
	simulateReviewAppellantFinalComments,
	simulateReviewAppellantProofOfEvidence,
	simulateReviewAppellantStatement,
	simulateReviewIpComment,
	simulateReviewLpaFinalComments,
	simulateReviewLpaProofOfEvidence,
	simulateReviewLPAQ,
	simulateReviewLpaStatement,
	simulateReviewRuleSixProofOfEvidence,
	simulateReviewRuleSixStatement,
	simulateSetUpHearing,
	simulateSetUpSiteVisit,
	simulateShareIpCommentsAndLpaStatement,
	simulateStartAppeal
} from '#endpoints/test-utils/test-utils.controller.js';
import { fullPlanningAppeal, householdAppeal } from '#tests/appeals/mocks.js';
import { documentCreated, documentVersionCreated, savedFolder } from '#tests/documents/mocks.js';
import { horizonGetCaseSuccessResponse } from '#tests/horizon/mocks.js';
import { azureAdUserId, lpaQuestionnaireValidationOutcomes } from '#tests/shared/mocks.js';
import { parseHorizonGetCaseResponse } from '#utils/mapping/map-horizon.js';
import { jest } from '@jest/globals';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import bodyParser from 'body-parser';
import express from 'express';
import supertest from 'supertest';
import { request } from '../../../app-test.js';
const { databaseConnector } = await import('#utils/database-connector.js');
const { default: got } = await import('got');
const baseDate = '2025-10-23T00:00:00.000Z';
jest.useFakeTimers({ doNotFake: ['performance'] }).setSystemTime(new Date(baseDate));

const app = express();
app.use(bodyParser.json({ limit: config.requestSizeLimit }));
app.post('/:appealReference/start-appeal', simulateStartAppeal);
app.post('/:appealReference/review-ip-comment', simulateReviewIpComment);
app.post('/:appealReference/review-lpaq', simulateReviewLPAQ);
app.post('/:appealReference/review-lpa-statement', simulateReviewLpaStatement);
app.post('/:appealReference/review-lpa-final-comments', simulateReviewLpaFinalComments);
app.post('/:appealReference/review-appellant-final-comments', simulateReviewAppellantFinalComments);
app.post('/:appealReference/share-comments-and-statement', simulateShareIpCommentsAndLpaStatement);
app.post('/:appealReference/issue-decision', simulateIssueDecision);
app.post('/:appealReference/set-up-site-visit', simulateSetUpSiteVisit);
app.post('/:appealReference/set-up-hearing', simulateSetUpHearing);
app.post('/:appealReference/document-scan-complete', simulateDocumentScan);
app.post('/:appealReference/link-appeals', simulateLinkAppeals);
app.post('/:appealReference/review-appellant-statement', simulateReviewAppellantStatement);
app.post('/:appealReference/review-rule-6-statement', simulateReviewRuleSixStatement);
app.post('/:appealReference/review-rule-6-proof-of-evidence', simulateReviewRuleSixProofOfEvidence);
app.post('/:appealReference/review-lpa-proof-of-evidence', simulateReviewLpaProofOfEvidence);
app.post(
	'/:appealReference/review-appellant-proof-of-evidence',
	simulateReviewAppellantProofOfEvidence
);
const testApiRequest = supertest(app);

describe('test utils routes', () => {
	beforeEach(() => {
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
		databaseConnector.appeal.findMany.mockResolvedValue([fullPlanningAppeal]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('DELETE /appeals/delete-appeals', () => {
		test('returns 200 when the appeal IDs are provided', async () => {
			const response = await request
				.delete('/appeals/delete-appeals')
				.set('azureAdUserId', azureAdUserId)
				.send({ appealIds: [1, 2, 3] });

			expect(response.status).toEqual(200);
			expect(response.body).toEqual(true);
		});

		test('returns 400 when the appeal IDs are not provided', async () => {
			const response = await request
				.delete('/appeals/delete-appeals')
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					appealIds: 'must be an array of numbers'
				}
			});
		});

		test('returns 400 when the appeal IDs are not an array', async () => {
			const response = await request
				.delete('/appeals/delete-appeals')
				.set('azureAdUserId', azureAdUserId)
				.send({ appealIds: '1,2,3' });

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					appealIds: 'must be an array of numbers'
				}
			});
		});

		test('makes the expected database calls', async () => {
			const response = await request
				.delete('/appeals/delete-appeals')
				.set('azureAdUserId', azureAdUserId)
				.send({ appealIds: [2] });

			expect(response.status).toEqual(200);
			expect(response.body).toEqual(true);

			expect(databaseConnector.appealNotification.deleteMany).toHaveBeenCalledWith({
				where: {
					caseReference: {
						in: ['1345264']
					}
				}
			});
			expect(databaseConnector.caseNote.deleteMany).toHaveBeenCalledWith({
				where: {
					caseId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.auditTrail.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.appealSpecialism.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.appealAllocation.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.appealRelationship.deleteMany).toHaveBeenCalledWith({
				where: {
					parentId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.appealRelationship.deleteMany).toHaveBeenCalledWith({
				where: {
					childId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.appellantCaseIncompleteReasonText.deleteMany).toHaveBeenCalledWith({
				where: {
					appellantCaseId: {
						in: []
					}
				}
			});
			expect(databaseConnector.appellantCaseInvalidReasonText.deleteMany).toHaveBeenCalledWith({
				where: {
					appellantCaseId: {
						in: []
					}
				}
			});
			expect(
				databaseConnector.appellantCaseIncompleteReasonsSelected.deleteMany
			).toHaveBeenCalledWith({
				where: {
					appellantCaseId: {
						in: []
					}
				}
			});
			expect(databaseConnector.appellantCaseInvalidReasonsSelected.deleteMany).toHaveBeenCalledWith(
				{
					where: {
						appellantCaseId: {
							in: []
						}
					}
				}
			);
			expect(databaseConnector.designatedSiteSelected.deleteMany).toHaveBeenCalledWith({
				where: {
					lpaQuestionnaireId: {
						in: []
					}
				}
			});
			expect(
				databaseConnector.lPAQuestionnaireIncompleteReasonText.deleteMany
			).toHaveBeenCalledWith({
				where: {
					lpaQuestionnaireId: {
						in: []
					}
				}
			});
			expect(
				databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.deleteMany
			).toHaveBeenCalledWith({
				where: {
					lpaQuestionnaireId: {
						in: []
					}
				}
			});
			expect(databaseConnector.lPANotificationMethodsSelected.deleteMany).toHaveBeenCalledWith({
				where: {
					lpaQuestionnaireId: {
						in: []
					}
				}
			});
			expect(databaseConnector.listedBuildingSelected.deleteMany).toHaveBeenCalledWith({
				where: {
					lpaQuestionnaireId: {
						in: []
					}
				}
			});
			expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.neighbouringSite.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.appealStatus.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.appellantCase.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.lPAQuestionnaire.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.siteVisit.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.representation.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.representationAttachment.deleteMany).toHaveBeenCalledWith({
				where: {
					representationId: {
						in: []
					}
				}
			});
			expect(databaseConnector.hearingEstimate.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.hearing.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.inquiry.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.inquiryEstimate.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.personalList.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: [2]
					}
				}
			});
			expect(databaseConnector.appeal.deleteMany).toHaveBeenCalledWith({
				where: {
					id: {
						in: [2]
					}
				}
			});
		});
	});

	describe('POST /:appealReference/start-appeal', () => {
		test('returns 201 for valid appeal reference', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

			const response = await testApiRequest.post('/1/start-appeal');

			expect(response.status).toEqual(201);
			expect(response.body).toEqual({
				finalCommentsDueDate: '2025-12-11T23:59:00.000Z',
				ipCommentsDueDate: '2025-11-27T23:59:00.000Z',
				lpaQuestionnaireDueDate: '2025-10-30T23:59:00.000Z',
				lpaStatementDueDate: '2025-11-27T23:59:00.000Z',
				s106ObligationDueDate: '2025-12-11T23:59:00.000Z'
			});
		});

		test('returns 201 for valid appeal reference with procedureType', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

			const response = await testApiRequest
				.post('/1/start-appeal')
				.send({ procedureType: 'hearing' });

			expect(response.status).toEqual(201);
			expect(response.body).toEqual({
				finalCommentsDueDate: '2025-12-11T23:59:00.000Z',
				ipCommentsDueDate: '2025-11-27T23:59:00.000Z',
				lpaQuestionnaireDueDate: '2025-10-30T23:59:00.000Z',
				lpaStatementDueDate: '2025-11-27T23:59:00.000Z',
				s106ObligationDueDate: '2025-12-11T23:59:00.000Z',
				statementOfCommonGroundDueDate: '2025-11-27T23:59:00.000Z'
			});
		});

		test('returns 400 for invalid appeal reference', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/start-appeal');
			expect(databaseConnector.appeal.findUnique).toHaveBeenCalled();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for no appeal type', async () => {
			const testAppeal = fullPlanningAppeal;
			testAppeal.appealType = null;
			databaseConnector.appeal.findUnique.mockResolvedValue(testAppeal);

			const response = await testApiRequest.post('/1/start-appeal');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/review-ip-comment', () => {
		test('returns 200 for valid appeal reference', async () => {
			const mockRepresentation = {
				id: 1,
				lpa: false,
				status: 'awaiting_review',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				dateCreated: new Date('2024-12-06T12:00:00Z'),
				notes: 'Some notes',
				representationType: 'comment',
				siteVisitRequested: true,
				source: 'comment',
				representationRejectionReasonsSelected: []
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(mockRepresentation);
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'valid'
			});

			const response = await testApiRequest.post('/1/review-ip-comment');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				attachments: [],
				author: 'undefined undefined',
				created: '2024-12-06T12:00:00.000Z',
				id: 1,
				notes: 'Some notes',
				origin: 'citizen',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				rejectionReasons: [],
				representationType: 'comment',
				siteVisitRequested: true,
				source: 'comment',
				status: 'valid'
			});
		});

		test('returns 400 for null representation', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-ip-comment');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-ip-comment');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/review-lpaq', () => {
		test('returns 200 for valid appeal reference', async () => {
			databaseConnector.appeal.findUnique
				.mockResolvedValueOnce({
					...householdAppeal,
					appealStatus: [
						{
							status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
							valid: true
						}
					]
				})
				.mockResolvedValueOnce({
					...householdAppeal,
					appealStatus: [
						{
							status: APPEAL_CASE_STATUS.EVENT,
							valid: true
						}
					]
				});
			databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
				lpaQuestionnaireValidationOutcomes[0]
			);
			databaseConnector.documentVersion.findMany.mockResolvedValue([]);
			databaseConnector.documentRedactionStatus.findMany.mockResolvedValue([
				{ id: 1, key: 'no_redaction_required' }
			]);

			const response = await testApiRequest.post('/1/review-lpaq');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({ validationOutcome: { id: 1, name: 'Complete' } });
		});

		test('returns 400 for invalid appeal reference', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);
			databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
				lpaQuestionnaireValidationOutcomes[0]
			);

			const response = await testApiRequest.post('/1/review-lpaq');
			expect(databaseConnector.appeal.findUnique).toHaveBeenCalled();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for no lpa questionnaire', async () => {
			const testAppeal = fullPlanningAppeal;
			testAppeal.lpaQuestionnaire = null;
			databaseConnector.appeal.findUnique.mockResolvedValue(testAppeal);
			databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(
				lpaQuestionnaireValidationOutcomes[0]
			);

			const response = await testApiRequest.post('/1/review-lpaq');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for no validation outcome', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.lPAQuestionnaireValidationOutcome.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-lpaq');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/review-lpa-statement', () => {
		test('returns 200 for valid appeal reference', async () => {
			const mockRepresentation = {
				id: 1,
				lpa: true,
				status: 'awaiting_review',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				dateCreated: new Date('2024-12-06T12:00:00Z'),
				notes: 'Some notes',
				representationType: 'lpa_statement',
				siteVisitRequested: true,
				source: 'lpa',
				representationRejectionReasonsSelected: []
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(mockRepresentation);
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'valid'
			});

			const response = await testApiRequest.post('/1/review-lpa-statement');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				attachments: [],
				created: '2024-12-06T12:00:00.000Z',
				id: 1,
				notes: 'Some notes',
				origin: 'lpa',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				rejectionReasons: [],
				representationType: 'lpa_statement',
				siteVisitRequested: true,
				source: 'lpa',
				status: 'valid'
			});
		});

		test('returns 400 for null representation', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-lpa-statement');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-lpa-statement');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/review-lpa-final-comments', () => {
		test('returns 200 for valid appeal reference', async () => {
			const mockRepresentation = {
				id: 1,
				lpa: true,
				status: 'awaiting_review',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				dateCreated: new Date('2024-12-06T12:00:00Z'),
				notes: 'Some notes',
				representationType: 'lpa_final_comment',
				siteVisitRequested: true,
				source: 'lpa',
				representationRejectionReasonsSelected: []
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'valid'
			});

			const response = await testApiRequest.post('/1/review-lpa-final-comments');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				attachments: [],
				created: '2024-12-06T12:00:00.000Z',
				id: 1,
				notes: 'Some notes',
				origin: 'lpa',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				rejectionReasons: [],
				representationType: 'lpa_final_comment',
				siteVisitRequested: true,
				source: 'lpa',
				status: 'valid'
			});
		});

		test('returns 400 for null representation', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-lpa-final-comments');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-lpa-final-comments');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/review-appellant-final-comments', () => {
		test('returns 200 for valid appeal reference', async () => {
			const mockRepresentation = {
				id: 1,
				lpa: false,
				status: 'awaiting_review',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				dateCreated: new Date('2024-12-06T12:00:00Z'),
				notes: 'Some notes',
				representationType: 'appellant_final_comment',
				siteVisitRequested: true,
				source: 'citizen',
				representationRejectionReasonsSelected: []
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'valid'
			});

			const response = await testApiRequest.post('/1/review-appellant-final-comments');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				attachments: [],
				author: 'undefined undefined',
				created: '2024-12-06T12:00:00.000Z',
				id: 1,
				notes: 'Some notes',
				origin: 'citizen',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				rejectionReasons: [],
				representationType: 'appellant_final_comment',
				siteVisitRequested: true,
				source: 'citizen',
				status: 'valid'
			});
		});

		test('returns 400 for null representation', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-appellant-final-comments');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-appellant-final-comments');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/share-comments-and-statement', () => {
		test('returns 200 for valid appeal reference', async () => {
			const testAppeal = householdAppeal;
			testAppeal.appealStatus[0].status = 'statements';
			databaseConnector.appeal.findUnique.mockResolvedValue(testAppeal);
			databaseConnector.representation.findMany.mockResolvedValue([
				{ representationType: 'lpa_statement' },
				{ representationType: 'comment' }
			]);

			const response = await testApiRequest
				.post('/1/share-comments-and-statement')
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual([
				{ representationType: 'lpa_statement' },
				{ representationType: 'comment' }
			]);
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/share-comments-and-statement');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/issue-decision', () => {
		test('returns 201 for valid appeal reference', async () => {
			const testAppeal = householdAppeal;
			testAppeal.appealStatus[0].status = 'issue_determination';
			databaseConnector.appeal.findUnique.mockResolvedValue(testAppeal);

			const response = await testApiRequest
				.post('/1/issue-decision')
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(response.body).toEqual({});
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/issue-decision');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/set-up-site-visit', () => {
		test('returns 200 for valid appeal reference', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.siteVisitType.findUnique.mockResolvedValue({
				id: 3,
				key: 'site_visit_unaccompanied',
				name: 'Unaccompanied'
			});

			const response = await testApiRequest
				.post('/1/set-up-site-visit')
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				visitDate: '2025-10-23T00:00:00.000Z',
				visitEndTime: '2025-10-23T10:00:00.000Z',
				visitStartTime: '2025-10-23T09:00:00.000Z',
				visitType: 'Unaccompanied'
			});
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/set-up-site-visit');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/set-up-hearing', () => {
		test('returns 201 for valid appeal reference', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await testApiRequest
				.post('/1/set-up-hearing')
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(response.body).toEqual({
				appealId: householdAppeal.id,
				hearingEndTime: '2025-10-23T10:00:00.000Z',
				hearingStartTime: '2025-10-23T09:00:00.000Z'
			});
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/set-up-hearing');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/document-scan-complete', () => {
		test('returns 200 for valid appeal with documents to scan', async () => {
			databaseConnector.document.findMany.mockResolvedValue([
				{
					latestDocumentVersion: {
						documentGuid: documentCreated.guid,
						version: documentCreated.latestDocumentVersion.version
					}
				}
			]);

			databaseConnector.document.findUnique.mockReturnValue({
				...documentCreated,
				allVersions: [documentCreated.latestDocumentVersion]
			});
			databaseConnector.documentVersion.update.mockReturnValue({
				...documentCreated,
				latestDocumentVersion: {
					...documentCreated.latestDocumentVersion,
					virusCheckStatus: 'scanned'
				}
			});

			const response = await testApiRequest.post('/1/document-scan-complete');
			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				documents: [
					{
						id: documentCreated.guid,
						version: documentCreated.latestDocumentVersion.version,
						virusCheckStatus: 'scanned'
					}
				]
			});
		});

		test('returns 400 for no documents to scan', async () => {
			databaseConnector.document.findMany.mockResolvedValue([]);

			const response = await testApiRequest.post('/1/document-scan-complete');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/link-appeals', () => {
		test('returns 201 for valid parent and child appeal references', async () => {
			const mockSavedFolderWithValidDates = {
				...savedFolder,
				documents: [
					{
						...savedFolder.documents[0],
						latestDocumentVersion: {
							...savedFolder.documents[0].latestDocumentVersion,
							dateReceived: new Date(),
							fileName: 'mydoc.pdf'
						}
					}
				]
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
			databaseConnector.folder.findMany.mockResolvedValue([mockSavedFolderWithValidDates]);
			databaseConnector.document.create.mockReturnValue(documentCreated);
			databaseConnector.documentVersion.create.mockResolvedValue(documentVersionCreated);

			got.post.mockReturnValueOnce({
				json: jest
					.fn()
					.mockResolvedValueOnce(parseHorizonGetCaseResponse(horizonGetCaseSuccessResponse))
			});

			const response = await testApiRequest
				.post('/1/link-appeals')
				.send({
					childAppealReference: '2'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(201);
			expect(response.body).toEqual({});
		});

		test('returns 400 for invalid parent appeal references', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest
				.post('/1/link-appeals')
				.send({
					childAppealReference: '2'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for invalid parent child references', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValueOnce(householdAppeal);
			databaseConnector.appeal.findUnique.mockResolvedValueOnce(null);

			const response = await testApiRequest
				.post('/1/link-appeals')
				.send({
					childAppealReference: '2'
				})
				.set('azureAdUserId', '732652365');

			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/review-appellant-statement', () => {
		test('returns 200 for valid appeal reference', async () => {
			const mockRepresentation = {
				id: 1,
				lpa: true,
				status: 'awaiting_review',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				dateCreated: new Date('2024-12-06T12:00:00Z'),
				notes: 'Some notes',
				representationType: 'appellant_statement',
				siteVisitRequested: true,
				source: 'appellant',
				representationRejectionReasonsSelected: []
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'valid'
			});

			const response = await testApiRequest.post('/1/review-appellant-statement');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				attachments: [],
				created: '2024-12-06T12:00:00.000Z',
				id: 1,
				notes: 'Some notes',
				origin: 'lpa',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				rejectionReasons: [],
				representationType: 'appellant_statement',
				siteVisitRequested: true,
				source: 'appellant',
				status: 'valid'
			});
		});

		test('returns 400 for null representation', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-appellant-statement');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-appellant-statement');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/review-rule-6-statement', () => {
		test('returns 200 for valid appeal reference', async () => {
			const mockRepresentation = {
				id: 1,
				lpa: true,
				status: 'awaiting_review',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				dateCreated: new Date('2024-12-06T12:00:00Z'),
				notes: 'Some notes',
				representationType: 'rule_6_party_statement',
				siteVisitRequested: true,
				source: 'citizen',
				representationRejectionReasonsSelected: []
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'valid'
			});

			const response = await testApiRequest.post('/1/review-rule-6-statement');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				attachments: [],
				created: '2024-12-06T12:00:00.000Z',
				id: 1,
				notes: 'Some notes',
				origin: 'lpa',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				rejectionReasons: [],
				representationType: 'rule_6_party_statement',
				siteVisitRequested: true,
				source: 'citizen',
				status: 'valid'
			});
		});

		test('returns 400 for null representation', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-rule-6-statement');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-rule-6-statement');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/review-rule-6-proof-of-evidence', () => {
		test('returns 200 for valid appeal reference', async () => {
			const mockRepresentation = {
				id: 1,
				lpa: true,
				status: 'awaiting_review',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				dateCreated: new Date('2024-12-06T12:00:00Z'),
				notes: 'Some notes',
				representationType: 'rule_6_party_proofs_evidence',
				siteVisitRequested: true,
				source: 'citizen',
				representationRejectionReasonsSelected: []
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'valid'
			});

			const response = await testApiRequest.post('/1/review-rule-6-proof-of-evidence');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				attachments: [],
				created: '2024-12-06T12:00:00.000Z',
				id: 1,
				notes: 'Some notes',
				origin: 'lpa',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				rejectionReasons: [],
				representationType: 'rule_6_party_proofs_evidence',
				siteVisitRequested: true,
				source: 'citizen',
				status: 'valid'
			});
		});

		test('returns 400 for null representation', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-rule-6-proof-of-evidence');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-rule-6-proof-of-evidence');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/review-lpa-proof-of-evidence', () => {
		test('returns 200 for valid appeal reference', async () => {
			const mockRepresentation = {
				id: 1,
				lpa: true,
				status: 'awaiting_review',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				dateCreated: new Date('2024-12-06T12:00:00Z'),
				notes: 'Some notes',
				representationType: 'lpa_proofs_evidence',
				siteVisitRequested: true,
				source: 'lpa',
				representationRejectionReasonsSelected: []
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'valid'
			});

			const response = await testApiRequest.post('/1/review-lpa-proof-of-evidence');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				attachments: [],
				created: '2024-12-06T12:00:00.000Z',
				id: 1,
				notes: 'Some notes',
				origin: 'lpa',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				rejectionReasons: [],
				representationType: 'lpa_proofs_evidence',
				siteVisitRequested: true,
				source: 'lpa',
				status: 'valid'
			});
		});

		test('returns 400 for null representation', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-lpa-proof-of-evidence');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-lpa-proof-of-evidence');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});

	describe('POST /:appealReference/review-appellant-proof-of-evidence', () => {
		test('returns 200 for valid appeal reference', async () => {
			const mockRepresentation = {
				id: 1,
				lpa: true,
				status: 'awaiting_review',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				dateCreated: new Date('2024-12-06T12:00:00Z'),
				notes: 'Some notes',
				representationType: 'appellant_proofs_evidence',
				siteVisitRequested: true,
				source: 'appellant',
				representationRejectionReasonsSelected: []
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.findUnique.mockResolvedValue(mockRepresentation);
			databaseConnector.representation.update.mockResolvedValue({
				...mockRepresentation,
				status: 'valid'
			});

			const response = await testApiRequest.post('/1/review-lpa-proof-of-evidence');

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				attachments: [],
				created: '2024-12-06T12:00:00.000Z',
				id: 1,
				notes: 'Some notes',
				origin: 'lpa',
				originalRepresentation: 'Original text of the representation',
				redactedRepresentation: '',
				rejectionReasons: [],
				representationType: 'appellant_proofs_evidence',
				siteVisitRequested: true,
				source: 'appellant',
				status: 'valid'
			});
		});

		test('returns 400 for null representation', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
			databaseConnector.representation.findFirst.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-appellant-proof-of-evidence');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});

		test('returns 400 for invalid appeal', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await testApiRequest.post('/1/review-appellant-proof-of-evidence');
			expect(response.status).toEqual(400);
			expect(response.body).toEqual(false);
		});
	});
});
