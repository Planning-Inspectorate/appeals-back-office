import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import {
	createRepresentationValidator,
	getRepresentationRouteValidator,
	getRepresentationUpdateValidator,
	validateRejectionReasonsPayload
} from './representations.validators.js';
import * as controller from './representations.controller.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { checkRepresentationExistsById } from '#middleware/check-representation-exists.js';

const router = createRouter();

router.get(
	'/:appealId/reps/count',
	/*
	#swagger.tags = ['Representations']
	#swagger.path = '/appeals/{appealId}/reps/count'
	#swagger.description = "Get all representations"
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.parameters['status'] = {
		in: 'query',
		required: false,
		example: 'awaiting_review'
	}
	#swagger.responses[200] = {
		description: 'Get statements for an appeal',
		schema: { $ref: '#/components/schemas/RepResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	getRepresentationRouteValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(controller.getRepresentationCounts)
);

router.get(
	'/:appealId/reps',
	/*
	#swagger.tags = ['Representations']
	#swagger.path = '/appeals/{appealId}/reps'
	#swagger.description = "Get all representations"
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
  #swagger.parameters['types'] = {
    in: 'query',
    required: false,
    example: 'lpa_statement'
  }
  #swagger.parameters['pageNumber'] = {
    in: 'query',
    required: false,
    example: '1'
  }
  #swagger.parameters['pageSize'] = {
    in: 'query',
    required: false,
    example: '30'
  }
	#swagger.parameters['status'] = {
		in: 'query',
		required: false,
		example: 'awaiting_review'
	}
	#swagger.responses[200] = {
		description: 'Get statements for an appeal',
		schema: { $ref: '#/components/schemas/RepResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	getRepresentationRouteValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(controller.getRepresentations)
);

router.get(
	'/:appealId/reps/:repId',
	/*
	#swagger.tags = ['Representations']
	#swagger.path = '/appeals/{appealId}/reps/{repId}'
	#swagger.description = Get a single representation
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.responses[200] = {
		description: 'Get a single representation for an appeal',
		schema: { $ref: '#/components/schemas/RepResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	getRepresentationRouteValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(controller.getRepresentation)
);

router.patch(
	'/:appealId/reps/:repId/status',
	/*
	#swagger.tags = ['Representations']
	#swagger.path = '/appeals/{appealId}/reps/{repId}/status'
	#swagger.description = Get a single representation
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.requestBody = {
		in: 'body',
		required: true,
		schema: { $ref: '#/components/schemas/RepStatusUpdateRequest' },
	}
	#swagger.responses[200] = {
		description: 'Get a single representation for an appeal',
		schema: { $ref: '#/components/schemas/RepResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	getRepresentationUpdateValidator,
	checkAppealExistsByIdAndAddToRequest,
	checkRepresentationExistsById,
	asyncHandler(controller.changeRepresentationStatus)
);

router.patch(
	'/:appealId/reps/:repId/redaction',
	/*
	#swagger.tags = ['Representations']
	#swagger.path = '/appeals/{appealId}/reps/{repId}/redaction'
	#swagger.description = Get a single representation
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.requestBody = {
		in: 'body',
		required: true,
		schema: { $ref: '#/components/schemas/RepRedactionRequest' },
	}
	#swagger.responses[200] = {
		description: 'Get a single representation for an appeal',
		schema: { $ref: '#/components/schemas/RepResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	getRepresentationUpdateValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(controller.addRedactedRepresentation)
);

router.post(
	'/:appealId/reps/comments',
	/*
	#swagger.tags = ['Representations']
	#swagger.path = '/appeals/{appealId}/reps/comments'
	#swagger.description = Create a representation
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.requestBody = {
		in: 'body',
		required: true,
		schema: { $ref: '#/components/schemas/CreateRepRequest' },
	}
	#swagger.responses[200] = {
		description: 'Create a Representation against an appeal',
		schema: { $ref: '#/components/schemas/RepResponse' }
	}
	#swagger.responses[400] = {}
 */
	checkAppealExistsByIdAndAddToRequest,
	createRepresentationValidator,
	asyncHandler(controller.createRepresentation('comment'))
);

router.patch(
	'/:appealId/reps/:repId/rejection-reasons',
	/*
		#swagger.tags = ['Representations']
		#swagger.path = '/appeals/{appealId}/reps/{repId}/rejection-reasons'
		#swagger.description = 'Update rejection reasons for a representation'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			required: true,
			schema: { $ref: '#/components/schemas/RepRejectionReasonsUpdateRequest' },
		}
		#swagger.responses[200] = {
			description: 'Updated representation with rejection reasons',
			schema: { $ref: '#/components/schemas/RepResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	validateRejectionReasonsPayload,
	checkRepresentationExistsById,
	asyncHandler(controller.updateRejectionReasons)
);

export { router as representationRoutes };
