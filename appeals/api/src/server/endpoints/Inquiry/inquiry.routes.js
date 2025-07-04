import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import {
	cancelInquiry,
	getInquiryById,
	postInquiry,
	rearrangeInquiry
} from './inquiry.controller.js';
import {
	getInquiryValidator,
	patchInquiryValidator,
	postInquiryValidator,
	deleteInquiryParamsValidator,
	deleteInquiryDateValidator
} from './inquiry.validator.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { checkInquiryExists } from './inquiry.service.js';

const router = createRouter();

router.get(
	'/:appealId/inquiry/:inquiryId',
	/*
        #swagger.tags = ['Inquiry Details']
        #swagger.path = '/appeals/{appealId}/inquiry/{inquiryId}'
        #swagger.description = 'Gets a single inquiry by appeal ID'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.responses[200] = {
            description: 'Gets a single inquiry by ID',
            schema: { $ref: '#/components/schemas/InquiryResponse' }
        }
        #swagger.responses[400] = {}
        #swagger.responses[404] = {}
     */
	getInquiryValidator,
	checkAppealExistsByIdAndAddToRequest,
	checkInquiryExists,
	asyncHandler(getInquiryById)
);

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
	asyncHandler(rearrangeInquiry)
);

router.delete(
	'/:appealId/inquiry/:inquiryId',
	/*
        #swagger.tags = ['Inquiry Details']
        #swagger.path = '/appeals/{appealId}/inquiry/{inquiryId}'
        #swagger.description = 'Cancels a single inquiry by id'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.responses[200] = {
            description: 'Cancels a single inquiry by id',
            schema: { $ref: '#/components/schemas/CancelInquiry' }
        }
        #swagger.responses[400] = {}
        #swagger.responses[500] = {}
     */
	deleteInquiryParamsValidator,
	checkAppealExistsByIdAndAddToRequest,
	checkInquiryExists,
	deleteInquiryDateValidator,
	asyncHandler(cancelInquiry)
);

export { router as inquiryRoutes };
