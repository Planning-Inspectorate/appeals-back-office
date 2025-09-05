import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { getLookupData } from '../../common/controllers/lookup-data.controller.js';

const router = createRouter();

router.get(
	'/procedure-types',
	/*
		#swagger.tags = ['Procedure Types']
		#swagger.path = '/appeals/procedure-types'
		#swagger.description = 'Gets procedure types'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Procedure types',
			schema: { $ref: '#/components/schemas/AllProcedureTypesResponse' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getLookupData('procedureType'))
);

export { router as procedureTypesRoutes };
