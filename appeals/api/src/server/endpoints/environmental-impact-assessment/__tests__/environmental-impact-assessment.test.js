// @ts-nocheck
import { request } from '#server/app-test.js';
import {
	childAppealsEnforcementBase,
	enforcementNoticeAppeal,
	householdAppeal
} from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
const { databaseConnector } = await import('#utils/database-connector.js');

describe('environmental impact assessment routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('returns 404 when the appeal is not found', async () => {
		databaseConnector.appeal.findUnique.mockResolvedValue(null);
		const response = await request
			.patch('/appeals/0/eia-screening-required')
			.send({ eiaScreeningRequired: true })
			.set('azureAdUserId', azureAdUserId);

		expect(response.status).toEqual(404);
	});

	describe.each([
		['single appeal household', () => householdAppeal],
		['single appeal Enforcement Notice', () => enforcementNoticeAppeal],
		[
			'linked appeals Enforcement Notice',
			() =>
				JSON.parse(
					JSON.stringify({
						...enforcementNoticeAppeal,
						childAppeals: childAppealsEnforcementBase
					})
				)
		]
	])('%s', (_, getAppeal) => {
		const getAppealIds = (appeal) => [
			appeal.id,
			...(appeal.childAppeals ?? [])
				.filter(
					(childAppeal) =>
						childAppeal.type === CASE_RELATIONSHIP_LINKED && childAppeal.childId !== null
				)
				.map((childAppeal) => childAppeal.childId)
		];

		test('returns 400 when eiaScreeningRequired is missing', async () => {
			const appeal = getAppeal();
			databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
			const response = await request
				.patch(`/appeals/${appeal.id}/eia-screening-required`)
				.send({})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});

		test('returns 400 when eiaScreeningRequired is not a boolean', async () => {
			const appeal = getAppeal();
			databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
			const response = await request
				.patch(`/appeals/${appeal.id}/eia-screening-required`)
				.send({ eiaScreeningRequired: 'not a boolean' })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});

		test('updates eiaScreeningRequired for the appeal group', async () => {
			const appeal = getAppeal();
			const appealIds = getAppealIds(appeal);
			databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
			databaseConnector.appeal.updateMany.mockResolvedValue({
				count: appealIds.length
			});
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});
			databaseConnector.auditTrail.create.mockResolvedValue({ id: 1 });

			const response = await request
				.patch(`/appeals/${appeal.id}/eia-screening-required`)
				.send({ eiaScreeningRequired: true })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual(true);
			expect(databaseConnector.appeal.updateMany).toHaveBeenCalledTimes(1);
			expect(databaseConnector.appeal.updateMany).toHaveBeenCalledWith({
				data: {
					eiaScreeningRequired: true
				},
				where: {
					id: { in: appealIds }
				}
			});
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					appealId: appeal.id,
					userId: 1
				})
			});
		});
	});
});
