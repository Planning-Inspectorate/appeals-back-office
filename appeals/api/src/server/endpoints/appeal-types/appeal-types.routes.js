import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { getLookupData } from '#common/controllers/lookup-data.controller.js';

const router = createRouter();

router.get(
	'/appeal-types',
	/*
		#swagger.tags = ['Appeal Types']
		#swagger.path = '/appeals/appeal-types'
		#swagger.description = 'Gets the list of appeal types'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'List of appeal types',
			schema: { $ref: '#/components/schemas/AppealTypes' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getLookupData('appealType'))
);

export { router as appealTypeRoutes };
