import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	addHearingEstimate,
	removeHearingEstimate,
	updateHearingEstimate
} from './hearing-estimates.controller.js';
import {
	createHearingEstimateValidator,
	updateHearingEstimateValidator
} from './hearing-estimates.validators.js';

const router = createRouter();

router.post(
	'/:appealId/hearing-estimates',
	/*
		#swagger.tags = ['Hearing Estimates']
		#swagger.path = '/appeals/{appealId}/hearing-estimates'
		#swagger.description = 'Creates hearing estimates for an appeal'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Hearing estimate details to create',
			schema: { $ref: '#/components/schemas/HearingEstimateCreateRequest' },
			required: true
		}
		#swagger.responses[201] = {
			description: 'Creates hearing estimates',
			schema: { $ref: '#/components/schemas/HearingEstimateResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	createHearingEstimateValidator,
	asyncHandler(addHearingEstimate)
);

router.patch(
	'/:appealId/hearing-estimates',
	/*
		#swagger.tags = ['Hearing Estimates']
		#swagger.path = '/appeals/{appealId}/hearing-estimates'
		#swagger.description = 'Updates hearing estimates for an appeal'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Hearing estimate details to update',
			schema: { $ref: '#/components/schemas/HearingEstimateUpdateRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Updates hearing estimates',
			schema: { $ref: '#/components/schemas/HearingEstimateResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
		#swagger.responses[500] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	updateHearingEstimateValidator,
	asyncHandler(updateHearingEstimate)
);

router.delete(
	'/:appealId/hearing-estimates',
	/*
		#swagger.tags = ['Hearing Estimates']
		#swagger.path = '/appeals/{appealId}/hearing-estimates'
		#swagger.description = 'Deletes hearing estimates for an appeal'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Deletes hearing estimates',
			schema: { $ref: '#/components/schemas/HearingEstimateResponse' }
		}
		#swagger.responses[404] = {}
		#swagger.responses[500] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(removeHearingEstimate)
);

export { router as hearingEstimatesRoutes };
