import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { getLookupData } from '../../common/controllers/lookup-data.controller.js';

const router = createRouter();

router.get(
	'/appellant-case-invalid-reasons',
	/*
		#swagger.tags = ['Appellant Case Invalid Reasons']
		#swagger.path = '/appeals/appellant-case-invalid-reasons'
		#swagger.description = 'Gets appellant case invalid reasons'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Appellant case invalid reasons',
			schema: { $ref: '#/components/schemas/AllAppellantCaseInvalidReasonsResponse' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getLookupData('appellantCaseInvalidReason'))
);

export { router as appellantCaseInvalidReasonsRoutes };
