import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { postDecisionPreview, postInspectorDecision } from './decision.controller.js';
import {
	getDateValidator,
	getDecisionsValidator,
	getDecisionTypeValidator,
	getDocumentValidator,
	getInvalidDecisionReasonValidator,
	getOutcomeValidator
} from './decision.validator.js';

const router = createRouter();

router.post(
	'/:appealId/decision/preview',
	/*
			#swagger.tags = ['Decision']
			#swagger.path = '/appeals/{appealId}/decision/preview'
			#swagger.description = Returns email previews for the decision notification emails
			#swagger.parameters['azureAdUserId'] = {
					in: 'header',
					required: true,
					example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
			}
			#swagger.requestBody = {
					in: 'body',
					description: 'Decision preview request',
					schema: {
							outcome: 'allowed',
							invalidDecisionReason: null
					},
					required: true
			}
			#swagger.responses[200] = {
					description: 'Returns rendered email previews'
			}
			#swagger.responses[400] = {}
			#swagger.responses[404] = {}
	 */
	checkAppealExistsByIdAndAddPartialToRequest([
		'appealStatus',
		'address',
		'appellant',
		'agent',
		'lpa',
		'folders',
		'appealType',
		'childAppeals',
		'appealRule6Parties'
	]),
	asyncHandler(postDecisionPreview)
);

router.post(
	'/:appealId/decision',
	/*
		#swagger.tags = ['Decision']
		#swagger.path = '/appeals/{appealId}/decision'
		#swagger.description = Closes an appeal by setting the inspector decision
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Decision info',
			schema: { $ref: '#/components/schemas/DecisionInfo' },
			required: true
		}
		#swagger.responses[201] = {
			description: 'Gets the decision info or null',
			schema: { $ref: '#/components/schemas/DecisionInfo' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	checkAppealExistsByIdAndAddPartialToRequest([
		'appealStatus',
		'address',
		'appellant',
		'agent',
		'lpa',
		'folders',
		'appealType',
		'childAppeals',
		'appealRule6Parties'
	]),
	getDecisionsValidator,
	getDecisionTypeValidator,
	getOutcomeValidator,
	getDateValidator,
	getDocumentValidator,
	getInvalidDecisionReasonValidator,
	asyncHandler(postInspectorDecision)
);

export { router as decisionRoutes };
