import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { getLookupData } from '../../common/controllers/lookup-data.controller.js';
import { controller } from './local-planning-authorities.controller.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { postLpaValidator } from './local-planning-authorities.validators.js';
import { checkLpaIdExists } from './local-planning-authorities.middleware.js';

const router = createRouter();

router.get(
	'/local-planning-authorities',
	/*
        #swagger.tags = ['LPAs List']
        #swagger.path = '/appeals/local-planning-authorities'
        #swagger.description = 'Gets list of LPAs'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.responses[200] = {
            description: 'Local Planning Authorities',
            schema: { $ref: '#/components/schemas/LPAs' },
        }
        #swagger.responses[400] = {}
     */
	asyncHandler(getLookupData('lPA'))
);

router.post(
	'/:appealId/lpa',
	/*
        #swagger.tags = ['LPA']
        #swagger.path = '/appeals/{appealId}/lpa'
        #swagger.description = 'Changes LPA ID for an appeal'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.requestBody = {
            in: 'body',
            description: 'LPA ID',
            schema: { $ref: '#/components/schemas/LPAChangeRequest' },
            required: true
        }
        #swagger.responses[400] = {}
	*/
	postLpaValidator,
	asyncHandler(checkAppealExistsByIdAndAddToRequest),
	checkLpaIdExists,
	asyncHandler(controller.changeLpa)
);

export { router as localPlanningAuthoritiesRoutes };
