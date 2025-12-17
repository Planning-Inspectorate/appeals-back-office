import { getLookupData } from '#common/controllers/lookup-data.controller.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';

const router = createRouter();

router.get(
	'/grounds',
	/*
		#swagger.tags = ['Grounds']
		#swagger.path = '/appeals/grounds'
		#swagger.description = 'Gets grounds'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Grounds',
			schema: { $ref: '#/components/schemas/AllGroundsResponse' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getLookupData('ground'))
);

export { router as groundsRoutes };
