import { Router as createRouter } from 'express';
import { asyncHandler } from '#middleware/async-handler.js';
import { updateServiceUserById } from './service-user.controller.js';
import { updateServiceUserValidator } from './service-user.validators.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';

const router = createRouter();

router.patch(
	'/:appealId/service-user',
	/*
	#swagger.tags = ['Service Users']
	#swagger.path = '/appeals/{appealId}/service-user'
	#swagger.description = Updates a single service user by id
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.requestBody = {
			in: 'body',
			description: 'Service user to update',
			schema: { $ref: '#/components/schemas/UpdateServiceUserRequest' },
			required: true
		}
	#swagger.responses[200] = {
		description: 'Updates a single service user by id',
		schema: { $ref: '#/components/schemas/UpdateServiceUserResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	checkAppealExistsByIdAndAddToRequest,
	updateServiceUserValidator,
	asyncHandler(updateServiceUserById)
);

export { router as serviceUserRoutes };
