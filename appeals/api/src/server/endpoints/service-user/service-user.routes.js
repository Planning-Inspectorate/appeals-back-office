import {
	checkAppealExistsByIdAndAddPartialToRequest,
	checkAppealExistsByIdAndAddToRequest
} from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	removeServiceUserById,
	updateServiceUserAddress,
	updateServiceUserById
} from './service-user.controller.js';
import {
	patchAddressValidator,
	removeServiceUserValidator,
	updateServiceUserValidator
} from './service-user.validators.js';

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
	checkAppealExistsByIdAndAddPartialToRequest(['agent']),
	updateServiceUserValidator,
	asyncHandler(updateServiceUserById)
);

router.patch(
	'/:appealId/service-user/:serviceUserId/address',
	/*
	#swagger.tags = ['Service Users']
	#swagger.path = '/appeals/{appealId}/service-user/{serviceUserId}/address'
	#swagger.description = 'Updates or creates the address for a single service user by id'
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.requestBody = {
			in: 'body',
			description: 'Service user to update',
			schema: { $ref: '#/components/schemas/UpdateAddressRequest' },
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
	patchAddressValidator,
	asyncHandler(updateServiceUserAddress)
);

router.delete(
	'/:appealId/service-user',
	/*
	#swagger.tags = ['Service Users']
	#swagger.path = '/appeals/{appealId}/service-user'
	#swagger.description = Deletes a single service user by id
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.requestBody = {
			in: 'body',
			description: 'Service user to delete',
			schema: { $ref: '#/components/schemas/DeleteServiceUserRequest' },
			required: true
		}
	#swagger.responses[200] = {
		description: 'Deletes a single service user by id',
		schema: { $ref: '#/components/schemas/DeleteServiceUserResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	checkAppealExistsByIdAndAddToRequest,
	removeServiceUserValidator,
	asyncHandler(removeServiceUserById)
);

export { router as serviceUserRoutes };
