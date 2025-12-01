import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { getLookupData } from '../../common/controllers/lookup-data.controller.js';
import { getPADsUserFromSapId } from './planning-appeal-decision-suppliers.controller.js';

const router = createRouter();

router.get(
	'/planning-appeal-decision-suppliers',
	/*
        #swagger.tags = ['PADs List']
        #swagger.path = '/appeals/planning-appeal-decision-suppliers'
        #swagger.description = 'Gets list of PADUsers'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.responses[200] = {
            description: 'Planning Appeal Decision Suppliers',
            schema: { $ref: '#/components/schemas/PADUsers' },
        }
        #swagger.responses[400] = {}
     */
	asyncHandler(getLookupData('pADUsers'))
);

router.get(
	'/planning-appeal-decision-suppliers/:sapId',
	/*
        #swagger.tags = ['PADs List']
        #swagger.path = '/appeals/planning-appeal-decision-suppliers'
        #swagger.description = 'Get PADUser by sapId'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.responses[200] = {
            description: 'Planning Appeal Decision Suppliers',
            schema: { $ref: '#/components/schemas/PADUsers' },
        }
        #swagger.responses[400] = {}
     */
	asyncHandler(getPADsUserFromSapId)
);

export { router as planningAppealDecisionSuppliersRoutes };
