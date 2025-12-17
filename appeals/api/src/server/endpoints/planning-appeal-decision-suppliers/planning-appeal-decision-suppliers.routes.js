import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { getLookupDataByTableName } from '../../common/controllers/lookup-data.controller.js';
import { getPADSUserFromSapId } from './planning-appeal-decision-suppliers.controller.js';

const router = createRouter();

router.get(
	'/planning-appeal-decision-suppliers',
	/*
        #swagger.tags = ['PADS Inspectors']
        #swagger.path = '/appeals/planning-appeal-decision-suppliers'
        #swagger.description = 'Gets list of PADSUsers'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.responses[200] = {
            description: 'Planning Appeal Decision Suppliers',
            schema: { $ref: '#/components/schemas/PADSUsers' },
        }
        #swagger.responses[400] = {}
     */
	asyncHandler(getLookupDataByTableName('pADSUser'))
);

router.get(
	'/planning-appeal-decision-suppliers/:sapId',
	/*
        #swagger.tags = ['PADS Inspectors']
        #swagger.path = '/appeals/planning-appeal-decision-suppliers/{sapId}'
        #swagger.description = 'Get PADSUser by sapId'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.responses[200] = {
            description: 'Planning Appeal Decision Suppliers',
            schema: { $ref: '#/components/schemas/PADSUser' },
        }
        #swagger.responses[400] = {}
     */
	asyncHandler(getPADSUserFromSapId)
);

export { router as planningAppealDecisionSuppliersRoutes };
