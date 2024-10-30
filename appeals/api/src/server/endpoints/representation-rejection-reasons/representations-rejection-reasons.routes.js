import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { getLookupData } from '../../common/controllers/lookup-data.controller.js';

const router = createRouter();

router.get(
	'/representation-rejection-reasons',
	/*
		#swagger.tags = ['Representation Rejection Reasons']
		#swagger.path = '/appeals/representation-rejection-reasons'
		#swagger.description = 'Gets representation rejection reasons'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Representation rejection reasons',
			schema: { $ref: '#/components/schemas/AllRepresentationRejectionReasonsResponse' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getLookupData('representationRejectionReason'))
);

export { router as representationRejectionReasonsRoutes };
