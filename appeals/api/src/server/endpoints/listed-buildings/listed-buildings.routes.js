import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	addListedBuilding,
	removeListedBuilding,
	updateListedBuilding
} from './listed-buildings.controller.js';
import {
	createListedBuildingValidator,
	removeListedBuildingValidator,
	updateListedBuildingValidator
} from './listed-buildings.validators.js';
const router = createRouter();

router.post(
	'/:appealId/listed-buildings',
	/*
		#swagger.tags = ['Listed buildings']
		#swagger.path = '/appeals/{appealId}/listed-buildings'
		#swagger.description = Adds a listed building list entry to an existing appeal
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'A list entry, an LPA Questionnaire ID , and if it affects a listed building',
			schema: { $ref: '#/components/schemas/ListedBuildingCreateRequest' },
			required: true
		}
		#swagger.responses[400] = {}
		#swagger.responses[201] = {
			description: 'Returns the listedBuildingId',
			schema: { $ref: '#/components/schemas/ListedBuildingCreateResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	createListedBuildingValidator,
	asyncHandler(addListedBuilding)
);

router.patch(
	'/:appealId/listed-buildings/:listedBuildingId',
	/*
		#swagger.tags = ['Listed buildings']
		#swagger.path = '/appeals/{appealId}/listed-buildings/{listedBuildingId}'
		#swagger.description = Updates a listed building list entry to an existing appeal
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'A list entry and if it affects a listed building',
			schema: { $ref: '#/components/schemas/ListedBuildingUpdateRequest' },
			required: true
		}
		#swagger.responses[400] = {}
		#swagger.responses[200] = {
			description: 'Returns the listedBuildingId',
			schema: { $ref: '#/components/schemas/ListedBuildingUpdateResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	updateListedBuildingValidator,
	asyncHandler(updateListedBuilding)
);

router.delete(
	'/:appealId/listed-buildings',
	/*
		#swagger.tags = ['Listed buildings']
		#swagger.path = '/appeals/{appealId}/listed-buildings'
		#swagger.description = Delete a listed building list entry to an existing appeal
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'The id of the listed building to delete',
			schema: { $ref: '#/components/schemas/ListedBuildingDeleteRequest' },
			required: true
		}
		#swagger.responses[400] = {}
		#swagger.responses[200] = {
			description: 'Returns the listedBuildingId',
			schema: { $ref: '#/components/schemas/ListedBuildingDeleteResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	removeListedBuildingValidator,
	asyncHandler(removeListedBuilding)
);

export { router as listedBuildingRoutes };
