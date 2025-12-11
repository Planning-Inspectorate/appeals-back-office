import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	cancelHearing,
	getHearingById,
	postHearing,
	rearrangeHearing
} from './hearing.controller.js';
import { checkHearingExists } from './hearing.service.js';
import {
	deleteHearingDateValidator,
	deleteHearingParamsValidator,
	getHearingValidator,
	patchHearingValidator,
	postHearingValidator
} from './hearing.validator.js';

const router = createRouter();

router.get(
	'/:appealId/hearing/:hearingId',
	/*
        #swagger.tags = ['Hearing Details']
        #swagger.path = '/appeals/{appealId}/hearing/{hearingId}'
        #swagger.description = 'Gets a single hearing by appeal ID'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.responses[200] = {
            description: 'Gets a single hearing by ID',
            schema: { $ref: '#/components/schemas/HearingResponse' }
        }
        #swagger.responses[400] = {}
        #swagger.responses[404] = {}
     */
	getHearingValidator,
	checkAppealExistsByIdAndAddPartialToRequest(['hearing']),
	checkHearingExists,
	asyncHandler(getHearingById)
);

router.post(
	'/:appealId/hearing',
	/*
        #swagger.tags = ['Hearing Details']
        #swagger.path = '/appeals/{appealId}/hearing'
        #swagger.description = 'Sets a single hearing by appeal ID'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.requestBody = {
			in: 'body',
			description: 'Site visit details to create',
			schema: { $ref: '#/components/schemas/CreateHearingRequest' },
			required: true
		}
        #swagger.responses[200] = {
            description: 'Sets a single hearing by ID',
            schema: { $ref: '#/components/schemas/CreateHearing' }
        }
        #swagger.responses[400] = {}
        #swagger.responses[404] = {}
	 */
	postHearingValidator,
	checkAppealExistsByIdAndAddPartialToRequest([
		'hearing',
		'appealStatus',
		'appellant',
		'agent',
		'lpa',
		'address'
	]),
	asyncHandler(postHearing)
);

router.patch(
	'/:appealId/hearing/:hearingId',
	/*
        #swagger.tags = ['Hearing Details']
        #swagger.path = '/appeals/{appealId}/hearing/{hearingId}'
        #swagger.description = 'Updates hearing values for a single appeal by id'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.requestBody = {
            in: 'body',
            description: 'Hearing details to update',
            schema: { $ref: '#/components/schemas/UpdateHearingRequest' },
            required: true
        }
        #swagger.responses[200] = {
            description: 'Updates a single hearing by id',
            schema: { $ref: '#/components/schemas/UpdateHearing' }
        }
        #swagger.responses[400] = {}
        #swagger.responses[500] = {}
     */
	patchHearingValidator,
	checkAppealExistsByIdAndAddPartialToRequest([
		'hearing',
		'appealStatus',
		'appellant',
		'agent',
		'lpa',
		'address'
	]),
	checkHearingExists,
	asyncHandler(rearrangeHearing)
);

router.delete(
	'/:appealId/hearing/:hearingId',
	/*
        #swagger.tags = ['Hearing Details']
        #swagger.path = '/appeals/{appealId}/hearing/{hearingId}'
        #swagger.description = 'Cancels a single hearing by id'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.responses[200] = {
            description: 'Cancels a single hearing by id',
            schema: { $ref: '#/components/schemas/CancelHearing' }
        }
        #swagger.responses[400] = {}
        #swagger.responses[500] = {}
     */
	deleteHearingParamsValidator,
	checkAppealExistsByIdAndAddPartialToRequest([
		'hearing',
		'appealStatus',
		'appellant',
		'agent',
		'lpa',
		'address'
	]),
	checkHearingExists,
	deleteHearingDateValidator,
	asyncHandler(cancelHearing)
);

export { router as hearingRoutes };
