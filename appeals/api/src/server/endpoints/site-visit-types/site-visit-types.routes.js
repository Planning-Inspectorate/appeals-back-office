import { getLookupData } from '#common/controllers/lookup-data.controller.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';

const router = createRouter();

router.get(
	'/site-visit-types',
	/*
		#swagger.tags = ['Site Visit Types']
		#swagger.path = '/appeals/site-visit-types'
		#swagger.description = 'Gets site visit types'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Site visit types',
			schema: { $ref: '#/components/schemas/AllSiteVisitTypesResponse' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getLookupData('siteVisitType'))
);

export { router as siteVisitTypesRoutes };
