import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { getLookupData } from '../../common/controllers/lookup-data.controller.js';

const router = createRouter();

router.get(
	'/lpa-designated-sites',
	/*
		#swagger.tags = ['LPA Designated Sites']
		#swagger.path = '/appeals/lpa-designated-sites'
		#swagger.description = 'Gets LPA designated sites'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'LPA designated sites',
			schema: { $ref: '#/components/schemas/DesignatedSiteName' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getLookupData('designatedSite'))
);

export { router as lpaDesignatedSitesRoutes };
