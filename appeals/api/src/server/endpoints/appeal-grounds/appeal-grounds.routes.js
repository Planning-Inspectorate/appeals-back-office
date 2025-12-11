import { patchAppealValidator } from '#endpoints/appeal-details/appeal-details.validators.js';
import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { controller } from './appeal-grounds.controller.js';

const router = createRouter();

router.patch(
	'/:appealId/grounds-for-appeal/:groundRef',
	/*
		#swagger.tags = ['Grounds for appeal']
		#swagger.path = '/appeals/{appealId}/grounds-for-appeal/{groundRef}'
		#swagger.description = 'Updates factsForGround for one ground for a single appeal'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: false,
			type: 'string',
			nullable: true
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Facts for ground to update',
			schema: { $ref: '#/components/schemas/UpdateCaseGroundsForAppealRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Updates a single appeal ground by appeal id and ground reference',
			schema: { $ref: '#/components/schemas/UpdateCaseGroundsForAppealResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	patchAppealValidator,
	asyncHandler(checkAppealExistsByIdAndAddPartialToRequest(['appealGrounds'])),
	asyncHandler(controller.updateFactsForGroundByAppealIdAndGroundRef)
);

export { router as appealGroundsRoutes };
