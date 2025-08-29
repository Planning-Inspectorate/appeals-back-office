import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { patchInquiry, postInquiry } from './inquiry.controller.js';
import { checkInquiryExists } from './inquiry.service.js';
import { patchInquiryValidator, postInquiryValidator } from './inquiry.validator.js';

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
			description: 'Inquiry details to create',
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

router.patch(
	'/:appealId/inquiry/:inquiryId',
	/*
        #swagger.tags = ['Inquiry Details']
        #swagger.path = '/appeals/{appealId}/inquiry/{inquiryId}'
        #swagger.description = 'Updates inquiry values for a single appeal by id'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.requestBody = {
            in: 'body',
            description: 'Inquiry details to update',
            schema: { $ref: '#/components/schemas/UpdateInquiryRequest' },
            required: true
        }
        #swagger.responses[200] = {
            description: 'Updates a single inquiry by id',
            schema: { $ref: '#/components/schemas/UpdateInquiry' }
        }
        #swagger.responses[400] = {}
        #swagger.responses[500] = {}
     */
	patchInquiryValidator,
	checkAppealExistsByIdAndAddToRequest,
	checkInquiryExists,
	asyncHandler(patchInquiry)
);

export { router as inquiryRoutes };
