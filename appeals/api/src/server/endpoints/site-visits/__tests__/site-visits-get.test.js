// @ts-nocheck
import { jest } from '@jest/globals';
import { ERROR_MUST_BE_NUMBER, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import { request } from '../../../app-test.js';

import {
	childAppealsEnforcementBase,
	enforcementNoticeAppeal,
	householdAppeal as householdAppealData
} from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';

import { mockAppealFindUnique } from '#tests/shared/site-visits-test-helpers.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');

describe('GET /:appealId/site-visits/:siteVisitId', () => {
	const getHouseholdAppeal = () => JSON.parse(JSON.stringify(householdAppealData));
	const getEnforcementLeadAppeal = () =>
		JSON.parse(
			JSON.stringify({ ...enforcementNoticeAppeal, childAppeals: childAppealsEnforcementBase })
		);

	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});
	describe.each([
		['single appeal', getHouseholdAppeal],
		['linked appeals- enforcement multiple appellants', getEnforcementLeadAppeal]
	])('%s', (_, getAppeal) => {
		test('gets a single site visit', async () => {
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const { siteVisit } = appeal;
			const response = await request
				.get(`/appeals/${appeal.id}/site-visits/${siteVisit.id}`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				appealId: siteVisit.appealId,
				visitDate: siteVisit.visitDate,
				siteVisitId: siteVisit.id,
				visitEndTime: siteVisit.visitEndTime,
				visitStartTime: siteVisit.visitStartTime,
				visitType: siteVisit.siteVisitType.name
			});
		});

		test('returns an error if appealId is not numeric', async () => {
			const response = await request.get('/appeals/one').set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					appealId: ERROR_MUST_BE_NUMBER
				}
			});
		});

		test('returns an error if appealId is not found', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const response = await request
				.get('/appeals/3?include=all')
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
			expect(response.body).toEqual({
				errors: {
					appealId: ERROR_NOT_FOUND
				}
			});
		});

		test('returns an error if siteVisitId is not numeric', async () => {
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.get(`/appeals/${appeal.id}/site-visits/one`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					siteVisitId: ERROR_MUST_BE_NUMBER
				}
			});
		});

		test('returns an error if siteVistId is not found', async () => {
			const appeal = getAppeal();

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockImplementation(mockAppealFindUnique(appeal));
			// @ts-ignore
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...appeal.siteVisit,
				appeal: appeal
			});

			const response = await request
				.get(`/appeals/${appeal.id}/site-visits/2`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
			expect(response.body).toEqual({
				errors: {
					siteVisitId: ERROR_NOT_FOUND
				}
			});
		});
	});
});
