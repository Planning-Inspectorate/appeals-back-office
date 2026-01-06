import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	getAppealTypes,
	requestChangeOfAppealType,
	requestConfirmationTransferOfAppeal,
	requestResubmitAndMarkInvalid,
	requestTransferOfAppeal,
	requestUpdateOfAppeal
} from './change-appeal-type.controller.js';
import {
	loadAllAppealTypesAndAddToRequest,
	loadEnabledAppealTypesAndAddToRequest,
	validateAppealStatus,
	validateAppealStatusForTransfer,
	validateAppealStatusForUpdate,
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
	checkAppealExistsByIdAndAddPartialToRequest(['appealType']),
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
	checkAppealExistsByIdAndAddPartialToRequest([
		'appealStatus',
		'appealType',
		'address',
		'appellant',
		'agent'
	]),
	validateAppealStatus,
	validateAppealType,
	postAppealTypeChangeValidator,
	asyncHandler(requestChangeOfAppealType)
);

router.post(
	'/:appealId/appeal-resubmit-mark-invalid',
	/*
		#swagger.tags = ['Appeal Type Change Request']
		#swagger.path = '/appeals/{appealId}/appeal-resubmit-mark-invalid'
		#swagger.description = 'Records a request to mark an appeal as invalid when due to be resubmitted'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal type change request',
			schema: { $ref: '#/components/schemas/AppealTypeResubmitMarkInvalidRequest' },
			required: true
		}
		#swagger.responses[400] = {}
	 */
	loadAllAppealTypesAndAddToRequest,
	checkAppealExistsByIdAndAddPartialToRequest([
		'appealStatus',
		'appealType',
		'address',
		'appellant',
		'agent'
	]),
	validateAppealStatus,
	validateAppealType,
	postAppealTypeChangeValidator,
	asyncHandler(requestResubmitAndMarkInvalid)
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
	checkAppealExistsByIdAndAddPartialToRequest(['appealStatus']),
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
	checkAppealExistsByIdAndAddPartialToRequest(['appealStatus']),
	validateAppealStatusForTransfer,
	postAppealTypeTransferConfirmationValidator,
	asyncHandler(requestConfirmationTransferOfAppeal)
);

router.post(
	'/:appealId/appeal-update-request',
	/*
		#swagger.tags = ['Appeal Type Change Request']
		#swagger.path = '/appeals/{appealId}/appeal-update-request'
		#swagger.description = 'Updates the appeal type'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal type update request',
			schema: { $ref: '#/components/schemas/AppealTypeUpdateRequest' },
			required: true
		}
		#swagger.responses[400] = {}
	 */
	checkAppealExistsByIdAndAddPartialToRequest([
		'appealStatus',
		'appealType',
		'address',
		'appellant',
		'agent',
		'lpa'
	]),
	loadEnabledAppealTypesAndAddToRequest,
	validateAppealType,
	validateAppealStatusForUpdate,
	asyncHandler(requestUpdateOfAppeal)
);

export { router as changeAppealTypeRoutes };
