import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { simulateSiteVisitElapsed } from './test-utils.controller.js';

const router = createRouter();

router.post(
	'/:appealReference/site-visit-elapsed',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/site-visit-elapsed'
		#swagger.description = 'A test endpoint to simulate the completion of a site visit event'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateSiteVisitElapsed)
);

export { router as testUtilsRoutes };
