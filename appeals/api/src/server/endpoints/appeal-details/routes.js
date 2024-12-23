import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { controller } from './controller.js';
import { loadAppeal } from './middleware.js';
import { validateRequest } from './validators.js';

const router = createRouter();

router.get(
	'/:appealId',
	/*
		#swagger.tags = ['Appeal Details']
		#swagger.path = '/appeals/{appealId}'
		#swagger.description = Gets a single appeal by ID
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Gets a single appeal by ID',
			schema: { $ref: '#/components/schemas/Appeal' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	validateRequest,
	asyncHandler(loadAppeal),
	asyncHandler(controller.getAppeal)
);

export default router;
