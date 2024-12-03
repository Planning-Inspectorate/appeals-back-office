import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { getLookupData } from '#common/controllers/lookup-data.controller.js';

const router = createRouter();

router.get(
	'/lpas',
	/*
		#swagger.tags = ['LPAs']
		#swagger.path = '/appeals/lpas'
		#swagger.description = 'Gets LPAs'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'LPAs',
			schema: { $ref: '#/components/schemas/AllLPAsResponse' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getLookupData('lPA'))
);

export { router as lpasRoutes };
