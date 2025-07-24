// @ts-nocheck
import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';
import { azureAdUserId } from '#tests/shared/mocks.js';
import {
	householdAppeal,
	casPlanningAppeal,
	fullPlanningAppeal,
	listedBuildingAppeal
} from '#tests/appeals/mocks.js';
import { documentCreated } from '#tests/documents/mocks.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { ERROR_CANNOT_BE_EMPTY_STRING } from '@pins/appeals/constants/support.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('invalid appeal decision routes', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});
	describe('POST', () => {
		test('returns 400 when state is not correct - blank invalidDecisionReason', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inspector-decision-invalid`)
				.send({
					invalidDecisionReason: ''
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					invalidDecisionReason: ERROR_CANNOT_BE_EMPTY_STRING
				}
			});
		});
		test('returns 400 when state is not correct - 1001 charecters invalidDecisionReason', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inspector-decision-invalid`)
				.send({
					invalidDecisionReason:
						'Li Europan lingues es membres del sam familie. Lor separat existentie es un myth. Por scientie, musica, sport etc, litot Europa usa li sam vocabular. Li lingues differe solmen in li grammatica, li pronunciation e li plu commun vocabules. Omnicos directe al desirabilite de un nov lingua franca: On refusa continuar payar custosi traductores. At solmen va esser necessi far uniform grammatica, pronunciation e plu sommun paroles. Ma quande lingues coalesce, li grammatica del resultant lingue es plu simplic e regulari quam ti del coalescent lingues. Li nov lingua franca va esser plu simplic e regulari quam li existent Europan lingues. It va esser tam simplic quam Occidental in fact, it va esser Occidental. A un Angleso it va semblar un simplificat Angles, quam un skeptic Cambridge amico dit me que Occidental es. Li Europan lingues es membres del sam familie. Lor separat existentie es un myth. Por scientie, musica, sport etc, litot Europa usa li sam vocabular. Li lingues differe solmen in li g'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					invalidDecisionReason: 'must be 1000 characters or less'
				}
			});
		});
		test('returns 400 when state is not correct - invalidDecisionReason not a string', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inspector-decision-invalid`)
				.send({
					invalidDecisionReason: 1000
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					invalidDecisionReason: 'must be a string'
				}
			});
		});

		test.each([
			['householdAppeal', householdAppeal],
			['casPlanningAppeal', casPlanningAppeal],
			['fullPlanningAppeal', fullPlanningAppeal],
			['listedBuildingAppeal', listedBuildingAppeal]
		])('returns 200 and send 2 notify emails when all good, appeal type: %s', async (_, appeal) => {
			const correctAppealState = {
				...appeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
						valid: true
					}
				]
			};
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(correctAppealState);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);
			// @ts-ignore
			databaseConnector.inspectorDecision.create.mockResolvedValue({});

			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

			const response = await request
				.post(`/appeals/${appeal.id}/inspector-decision-invalid`)
				.send({
					invalidDecisionReason: 'Invalid reason'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.any(Object),
				personalisation: {
					appeal_reference_number: correctAppealState.reference,
					has_costs_decision: false,
					lpa_reference: correctAppealState.applicationReference,
					site_address: `${correctAppealState.address.addressLine1}, ${correctAppealState.address.addressLine2}, ${correctAppealState.address.addressTown}, ${correctAppealState.address.addressCounty}, ${correctAppealState.address.postcode}, ${correctAppealState.address.addressCountry}`,
					reasons: ['Invalid reason']
				},
				recipientEmail: correctAppealState.agent.email,
				templateName: 'decision-is-invalid-appellant'
			});

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				notifyClient: expect.any(Object),
				personalisation: {
					appeal_reference_number: correctAppealState.reference,
					has_costs_decision: false,
					lpa_reference: correctAppealState.applicationReference,
					site_address: `${correctAppealState.address.addressLine1}, ${correctAppealState.address.addressLine2}, ${correctAppealState.address.addressTown}, ${correctAppealState.address.addressCounty}, ${correctAppealState.address.postcode}, ${correctAppealState.address.addressCountry}`,
					reasons: ['Invalid reason']
				},
				recipientEmail: correctAppealState.lpa.email,
				templateName: 'decision-is-invalid-lpa'
			});
			expect(response.status).toEqual(201);
		});
	});
});
