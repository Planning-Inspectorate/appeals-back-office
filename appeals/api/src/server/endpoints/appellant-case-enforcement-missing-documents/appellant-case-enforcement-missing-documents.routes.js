import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { getLookupData } from '../../common/controllers/lookup-data.controller.js';

const router = createRouter();

router.get(
	'/appellant-case-enforcement-missing-documents',
	/*
		#swagger.tags = ['Appellant Case Enforcement Missing Documents']
		#swagger.path = '/appeals/appellant-case-enforcement-missing-documents'
		#swagger.description = 'Gets appellant case enforcement missing documents'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Appellant case enforcement missing documents',
			schema: { $ref: '#/components/schemas/AllAppellantCaseEnforcementMissingDocumentsResponse' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getLookupData('appellantCaseEnforcementMissingDocument'))
);

export { router as appellantCaseEnforcementMissingDocumentsRoutes };
