import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import {
	findListedBuilding,
	deleteListedBuilding,
	upsertListedBuilding
} from './historic-england.controller.js';
import { validateListedBuildingsPayload } from './historic-england.validators.js';

const router = createRouter();

router.get(
	'/listed-buildings/:reference',
	/*
		#swagger.tags = ['Listed buildings']
		#swagger.path = '/appeals/listed-buildings/{reference}'
		#swagger.description = Retrieves the listed building info, given the reference
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[400] = {}
		#swagger.responses[200] = {
			description: 'Returns the listedBuilding data',
			schema: { $ref: '#/components/schemas/ListedBuilding' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	asyncHandler(findListedBuilding)
);

router.post(
	'/listed-buildings',
	/*
		#swagger.tags = ['Listed buildings']
		#swagger.path = '/appeals/listed-buildings'
		#swagger.description = Inserts or updates a listed building record, from a Service Bus message
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'A list entry',
			schema: { $ref: '#/components/schemas/ListedBuilding' },
			required: true
		}
		#swagger.responses[400] = {}
		#swagger.responses[201] = {
			description: 'Returns the listedBuilding data',
			schema: { $ref: '#/components/schemas/ListedBuilding' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	validateListedBuildingsPayload,
	asyncHandler(upsertListedBuilding)
);

router.delete(
	'/listed-buildings/:reference',
	/*
		#swagger.tags = ['Listed buildings']
		#swagger.path = '/appeals/listed-buildings/{reference}'
		#swagger.description = Deletes a listed building record, from a Service Bus message
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[400] = {}
		#swagger.responses[201] = {
			description: 'Returns the listedBuilding data',
			schema: { $ref: '#/components/schemas/ListedBuilding' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	asyncHandler(deleteListedBuilding)
);

export { router as historicEnglandRoutes };
