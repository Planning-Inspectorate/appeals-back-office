import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { getRelatableAppealById, unrelateAppeal } from './related-appeals.controller.js';

const router = createRouter();

router.get(
	'/relatable-appeal/:appealReference',
	/*
		#swagger.tags = ['Related appeals']
		#swagger.path = '/appeals/relatable-appeal/{appealReference}'
		#swagger.description = Gets a single related appeal by id from BO or Horizon. If mocking use 1000000 for valid case on horizon, 2000000 for unpublished case on horizon, any for case not found on horizon
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.parameters['appealReference'] = {
            in: 'path',
            description: 'Appeal Reference',
            required: true,
            type: 'string'
        }
		#swagger.responses[200] = {
			description: 'Gets a single related appeal by reference from BO or Horizon',
			schema: { $ref: '#/components/schemas/SingleRelatedAppealSummaryResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
		#swagger.responses[409] = {}
		#swagger.responses[432] = {}
	 */
	asyncHandler(getRelatableAppealById)
);

router.delete(
	'/:appealId/unrelate-appeal',
	/*
		#swagger.tags = ['Related Appeals']
		#swagger.path = '/appeals/{appealId}/unrelate-appeal'
		#swagger.description = 'Remove an appeal relationship by ID'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Unrelate Appeal Request',
			schema: { $ref: '#/components/schemas/UnrelateAppealRequest' },
			required: true
		}
		#swagger.responses[400] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(unrelateAppeal)
);

export { router as relatedAppealsRoutes };
