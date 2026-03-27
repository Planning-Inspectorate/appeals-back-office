// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';

import { enforcementNoticeAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('cancel routes', () => {
	beforeEach(() => {
		databaseConnector.appeal.findUnique.mockResolvedValue(enforcementNoticeAppeal);
		databaseConnector.appellantCaseValidationOutcome.findUnique.mockResolvedValue({
			id: 1,
			name: 'Invalid'
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('POST /appeals/:appealId/cancel/enforcement-notice-withdrawn', () => {
		test('returns notify previews when dryRun=true', async () => {
			const response = await request
				.post(
					`/appeals/${enforcementNoticeAppeal.id}/cancel/enforcement-notice-withdrawn?dryRun=true`
				)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body.appellant).toContain('We have closed the appeal');
			expect(response.body.lpa).toContain('We have closed the appeal');

			expect(databaseConnector.appellantCase.update).not.toHaveBeenCalled();
			expect(databaseConnector.appealStatus.updateMany).not.toHaveBeenCalled();
			expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
			expect(mockNotifySend).not.toHaveBeenCalled();
		});

		test('cancels the appeal and returns the appeal when dryRun is not set', async () => {
			const response = await request
				.post(`/appeals/${enforcementNoticeAppeal.id}/cancel/enforcement-notice-withdrawn`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toMatchObject({
				id: enforcementNoticeAppeal.id,
				reference: enforcementNoticeAppeal.reference
			});

			expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: enforcementNoticeAppeal.appellantCase.id },
					data: {
						appellantCaseValidationOutcomeId: 1
					}
				})
			);

			expect(mockNotifySend).toHaveBeenCalledWith(
				expect.objectContaining({
					azureAdUserId,
					recipientEmail: enforcementNoticeAppeal.agent.email,
					templateName: 'appeal-cancelled-enforcement-notice-withdrawn'
				})
			);
			expect(mockNotifySend).toHaveBeenCalledWith(
				expect.objectContaining({
					azureAdUserId,
					recipientEmail: enforcementNoticeAppeal.lpa.email,
					templateName: 'appeal-cancelled-enforcement-notice-withdrawn'
				})
			);
			expect(databaseConnector.personalList.upsert).toHaveBeenCalled();
			expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(enforcementNoticeAppeal.id);
		});
		test('cancels the appeal and returns the appeal when dryRun is not set and there are child appeals', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...enforcementNoticeAppeal,
				childAppeals: [
					{
						childId: 100,
						type: CASE_RELATIONSHIP_LINKED
					}
				]
			});
			const response = await request
				.post(`/appeals/${enforcementNoticeAppeal.id}/cancel/enforcement-notice-withdrawn`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toMatchObject({
				id: enforcementNoticeAppeal.id,
				reference: enforcementNoticeAppeal.reference
			});

			expect(databaseConnector.appellantCase.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: enforcementNoticeAppeal.appellantCase.id },
					data: {
						appellantCaseValidationOutcomeId: 1
					}
				})
			);

			expect(mockNotifySend).toHaveBeenCalledWith(
				expect.objectContaining({
					azureAdUserId,
					recipientEmail: enforcementNoticeAppeal.agent.email,
					templateName: 'appeal-cancelled-enforcement-notice-withdrawn'
				})
			);
			expect(mockNotifySend).toHaveBeenCalledWith(
				expect.objectContaining({
					azureAdUserId,
					recipientEmail: enforcementNoticeAppeal.lpa.email,
					templateName: 'appeal-cancelled-enforcement-notice-withdrawn'
				})
			);
			expect(databaseConnector.personalList.upsert).toHaveBeenCalled();
			expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(enforcementNoticeAppeal.id);
			expect(mockBroadcasters.broadcastAppeal).toHaveBeenCalledWith(100);
		});

		test('returns 400 when dryRun is not a boolean', async () => {
			const response = await request
				.post(
					`/appeals/${enforcementNoticeAppeal.id}/cancel/enforcement-notice-withdrawn?dryRun=notABool`
				)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body.errors).toHaveProperty('dryRun', 'Dry run must be a boolean');
		});

		test('returns 404 when appeal is not found', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await request
				.post(`/appeals/${enforcementNoticeAppeal.id}/cancel/enforcement-notice-withdrawn`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
			expect(response.body).toEqual({
				errors: { appealId: 'Not found' }
			});
		});
	});
});
