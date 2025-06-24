import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import {
	simulateSiteVisitElapsed,
	simulateStatementsElapsed,
	simulateFinalCommentsElapsed,
	retrieveNotifyEmails
} from './test-utils.controller.js';

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

router.post(
	'/:appealReference/statements-elapsed',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/statements-elapsed'
		#swagger.description = 'A test endpoint to simulate the deadline for statements in the past'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateStatementsElapsed)
);

router.post(
	'/:appealReference/final-comments-elapsed',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/final-comments-elapsed'
		#swagger.description = 'A test endpoint to simulate the deadline for final comments in the past'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateFinalCommentsElapsed)
);

router.get(
	'/:appealReference/notify-emails-sent',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/notify-emails-sent'
		#swagger.description = 'A test endpoint to retrieve an array of notify emails sent for this appeal reference'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
	 */
	asyncHandler(retrieveNotifyEmails)
);

export { router as testUtilsRoutes };
