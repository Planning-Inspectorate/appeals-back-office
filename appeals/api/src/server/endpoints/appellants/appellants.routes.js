import { Router as createRouter } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';
import { getAppellantById, updateAppellantById } from './appellants.controller.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { checkAppellantExists } from './appellants.service.js';
import { getAppellantValidator, patchAppellantValidator } from './appellants.validators.js';

const router = createRouter();

router.get(
	'/:appealId/appellants/:appellantId',
	/*
		#swagger.tags = ['Appellants']
		#swagger.path = '/appeals/{appealId}/appellants/{appellantId}'
		#swagger.description = Gets a single appellant by id
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Gets a single appellant by id',
			schema: { $ref: '#/definitions/SingleAppellantResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppellantValidator,
	checkAppealExistsByIdAndAddToRequest,
	checkAppellantExists,
	asyncHandler(getAppellantById)
);

router.patch(
	'/:appealId/appellants/:appellantId',
	/*
		#swagger.tags = ['Appellants']
		#swagger.path = '/appeals/{appealId}/appellants/{appellantId}'
		#swagger.description = Updates a single appellant by id
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appellant details to update',
			schema: { $ref: '#/definitions/UpdateAppellantRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Updates a single appellant by id',
			schema: { $ref: '#/definitions/UpdateAppellantResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	patchAppellantValidator,
	checkAppealExistsByIdAndAddToRequest,
	checkAppellantExists,
	asyncHandler(updateAppellantById)
);

export { router as appellantsRoutes };