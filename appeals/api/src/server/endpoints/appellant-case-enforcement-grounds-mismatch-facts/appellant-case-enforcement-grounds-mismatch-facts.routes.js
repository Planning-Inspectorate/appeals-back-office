import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { getLookupData } from '../../common/controllers/lookup-data.controller.js';

const router = createRouter();

router.get(
	'/appellant-case-enforcement-grounds-mismatch-facts',
	/*
		#swagger.tags = ['Appellant Case Enforcement Grounds Mismatch Facts']
		#swagger.path = '/appeals/appellant-case-enforcement-grounds-mismatch-facts'
		#swagger.description = 'Gets appellant case enforcement grounds mismatch facts'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Appellant case enforcement grounds mismatch facts',
			schema: { $ref: '#/components/schemas/AllAppellantCaseEnforcementGroundsMismatchFactsResponse' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getLookupData('appellantCaseEnforcementGroundsMismatchFacts'))
);

export { router as appellantCaseEnforcementGroundsMismatchFactsRoutes };
