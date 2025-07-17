import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import {
	addInquiryEstimate,
	updateInquiryEstimate,
	removeInquiryEstimate
} from './inquiry-estimates.controller.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import {
	createInquiryEstimateValidator,
	updateInquiryEstimateValidator
} from './inquiry-estimates.validators.js';

const router = createRouter();

router.post(
	'/:appealId/inquiry-estimates',
	/*
		#swagger.tags = ['Inquiry Estimates']
		#swagger.path = '/appeals/{appealId}/inquiry-estimates'
		#swagger.description = 'Creates inquiry estimates for an appeal'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Inquiry estimate details to create',
			schema: { $ref: '#/components/schemas/InquiryEstimateCreateRequest' },
			required: true
		}
		#swagger.responses[201] = {
			description: 'Creates inquiry estimates',
			schema: { $ref: '#/components/schemas/InquiryEstimateResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	createInquiryEstimateValidator,
	asyncHandler(addInquiryEstimate)
);

router.patch(
	'/:appealId/inquiry-estimates',
	/*
		#swagger.tags = ['Inquiry Estimates']
		#swagger.path = '/appeals/{appealId}/inquiry-estimates'
		#swagger.description = 'Updates inquiry estimates for an appeal'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Inquiry estimate details to update',
			schema: { $ref: '#/components/schemas/InquiryEstimateUpdateRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Updates inquiry estimates',
			schema: { $ref: '#/components/schemas/InquiryEstimateResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
		#swagger.responses[500] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	updateInquiryEstimateValidator,
	asyncHandler(updateInquiryEstimate)
);

router.delete(
	'/:appealId/inquiry-estimates',
	/*
		#swagger.tags = ['Inquiry Estimates']
		#swagger.path = '/appeals/{appealId}/inquiry-estimates'
		#swagger.description = 'Deletes inquiry estimates for an appeal'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Deletes inquiry estimates',
			schema: { $ref: '#/components/schemas/InquiryEstimateResponse' }
		}
		#swagger.responses[404] = {}
		#swagger.responses[500] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(removeInquiryEstimate)
);

export { router as inquiryEstimatesRoutes };
