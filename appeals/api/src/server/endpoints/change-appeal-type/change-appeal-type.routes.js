import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	getAppealTypes,
	requestChangeOfAppealType,
	requestConfirmationTransferOfAppeal,
	requestTransferOfAppeal
} from './change-appeal-type.controller.js';
import {
	loadAllAppealTypesAndAddToRequest,
	validateAppealStatus,
	validateAppealStatusForTransfer,
	validateAppealType
} from './change-appeal-type.middleware.js';
import {
	postAppealTypeChangeValidator,
	postAppealTypeTransferConfirmationValidator,
	postAppealTypeTransferValidator
} from './change-appeal-type.validators.js';

const router = createRouter();

router.get(
	'/:appealId/appeal-types',
	/*
		#swagger.tags = ['Appeal Type Change Request']
		#swagger.path = '/appeals/{appealId}/appeal-types'
		#swagger.description = 'Gets the list of appeal types'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'List of appeal types',
			schema: { $ref: '#/components/schemas/AppealTypes' },
		}
		#swagger.responses[400] = {}
	 */
	loadAllAppealTypesAndAddToRequest,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(getAppealTypes)
);

router.post(
	'/:appealId/appeal-change-request',
	/*
		#swagger.tags = ['Appeal Type Change Request']
		#swagger.path = '/appeals/{appealId}/appeal-change-request'
		#swagger.description = 'Records a request to change the appeal type'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal type change request',
			schema: { $ref: '#/components/schemas/AppealTypeChangeRequest' },
			required: true
		}
		#swagger.responses[400] = {}
	 */
	loadAllAppealTypesAndAddToRequest,
	checkAppealExistsByIdAndAddToRequest,
	validateAppealStatus,
	validateAppealType,
	postAppealTypeChangeValidator,
	asyncHandler(requestChangeOfAppealType)
);

router.post(
	'/:appealId/appeal-transfer-request',
	/*
		#swagger.tags = ['Appeal Type Change Request']
		#swagger.path = '/appeals/{appealId}/appeal-transfer-request'
		#swagger.description = 'Records a request to transfer the appeal to another system'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal type transfer request',
			schema: { $ref: '#/components/schemas/AppealTypeTransferRequest' },
			required: true
		}
		#swagger.responses[400] = {}
	 */
	loadAllAppealTypesAndAddToRequest,
	checkAppealExistsByIdAndAddToRequest,
	validateAppealStatus,
	validateAppealType,
	postAppealTypeTransferValidator,
	asyncHandler(requestTransferOfAppeal)
);

router.post(
	'/:appealId/appeal-transfer-confirmation',
	/*
		#swagger.tags = ['Appeal Type Change Request']
		#swagger.path = '/appeals/{appealId}/appeal-transfer-confirmation'
		#swagger.description = 'Confirms the transfer of the appeal to another system'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal type transfer confirmation',
			schema: { $ref: '#/components/schemas/AppealTypeTransferConfirmationRequest' },
			required: true
		}
		#swagger.responses[400] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	validateAppealStatusForTransfer,
	postAppealTypeTransferConfirmationValidator,
	asyncHandler(requestConfirmationTransferOfAppeal)
);

export { router as changeAppealTypeRoutes };
