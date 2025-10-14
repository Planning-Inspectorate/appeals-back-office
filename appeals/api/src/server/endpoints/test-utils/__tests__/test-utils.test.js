// @ts-nocheck
import { fullPlanningAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';
const { databaseConnector } = await import('#utils/database-connector.js');

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
});
