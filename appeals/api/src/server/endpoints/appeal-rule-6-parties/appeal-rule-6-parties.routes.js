import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './appeal-rule-6-parties.controller.js';
import * as validators from './appeal-rule-6-parties.validators.js';

const router = createRouter();

router.get(
	'/:appealId/rule-6-parties',
	/*
        #swagger.tags = ['Appeal Rule 6 Parties']
        #swagger.path = '/appeals/{appealId}/rule-6-parties'
        #swagger.description = 'Gets all rule 6 parties for an appeal'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.responses[200] = {
            description: 'Gets all rule 6 parties for an appeal',
            schema: { $ref: '#/components/schemas/Rule6PartyResponse' }
        }
        #swagger.responses[400] = {}
        #swagger.responses[404] = {}
     */
	validators.getRule6PartiesValidator,
	checkAppealExistsByIdAndAddPartialToRequest(['appealRule6Parties']),
	asyncHandler(controller.getRule6Parties)
);

router.post(
	'/:appealId/rule-6-parties',
	/*
        #swagger.tags = ['Appeal Rule 6 Parties']
        #swagger.path = '/appeals/{appealId}/rule-6-parties'
        #swagger.description = 'Adds a rule 6 party to an appeal'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.requestBody = {
			in: 'body',
			description: 'Rule 6 party details to add',
			schema: { $ref: '#/components/schemas/CreateRule6PartyRequest' },
			required: true
		}
        #swagger.responses[200] = {
            description: 'Adds a rule 6 party to an appeal',
            schema: { $ref: '#/components/schemas/Rule6PartyResponse' }
        }
        #swagger.responses[400] = {}
        #swagger.responses[404] = {}
	 */
	validators.addRule6PartyValidator,
	checkAppealExistsByIdAndAddPartialToRequest(['appealRule6Parties']),
	asyncHandler(controller.addRule6Party)
);

router.patch(
	'/:appealId/rule-6-parties/:rule6PartyId',
	/*
        #swagger.tags = ['Appeal Rule 6 Parties']
        #swagger.path = '/appeals/{appealId}/rule-6-parties/{rule6PartyId}'
        #swagger.description = 'Updates a rule 6 party for an appeal'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.requestBody = {
			in: 'body',
			description: 'Rule 6 party details to update',
			schema: { $ref: '#/components/schemas/CreateRule6PartyRequest' },
			required: true
		}
        #swagger.responses[200] = {
            description: 'Updates a rule 6 party for an appeal',
            schema: { $ref: '#/components/schemas/Rule6PartyResponse' }
        }
        #swagger.responses[400] = {}
        #swagger.responses[404] = {}
	 */
	validators.updateRule6PartyValidator,
	checkAppealExistsByIdAndAddPartialToRequest(['appealRule6Parties']),
	asyncHandler(controller.updateRule6Party)
);

export { router as appealRule6PartiesRoutes };
