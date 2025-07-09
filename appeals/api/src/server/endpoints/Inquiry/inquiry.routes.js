import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { postInquiry } from './inquiry.controller.js';
import { postInquiryValidator } from './inquiry.validator.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';

const router = createRouter();

router.post(
	'/:appealId/inquiry',
	/*
        #swagger.tags = ['Inquiry Details']
        #swagger.path = '/appeals/{appealId}/inquiry'
        #swagger.description = 'Sets a single inquiry by appeal ID'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.requestBody = {
			in: 'body',
			description: 'Site visit details to create',
			schema: { $ref: '#/components/schemas/CreateInquiryRequest' },
			required: true
		}
        #swagger.responses[200] = {
            description: 'Sets a single inquiry by ID',
            schema: { $ref: '#/components/schemas/CreateInquiry' }
        }
        #swagger.responses[400] = {}
        #swagger.responses[404] = {}
	 */
	postInquiryValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(postInquiry)
);

export { router as inquiryRoutes };
