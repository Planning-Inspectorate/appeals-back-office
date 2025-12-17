import { validateRepresentationsToPublish } from '#endpoints/representations/representations.middleware.js';
import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { checkRepresentationExistsById } from '#middleware/check-representation-exists.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './representations.controller.js';
import {
	createRepresentationProofOfEvidenceValidator,
	createRepresentationValidator,
	getRepresentationRouteValidator,
	getRepresentationUpdateValidator,
	validateRejectionReasonsPayload
} from './representations.validators.js';

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
	checkAppealExistsByIdAndAddPartialToRequest([]),
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
  #swagger.parameters['type'] = {
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
	checkAppealExistsByIdAndAddPartialToRequest([]),
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
	checkAppealExistsByIdAndAddPartialToRequest([]),
	asyncHandler(controller.getRepresentation)
);

router.patch(
	'/:appealId/reps/:repId',
	/*
	#swagger.tags = ['Representations']
	#swagger.path = '/appeals/{appealId}/reps/{repId}'
	#swagger.description = "Update a representation"
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.requestBody = {
		in: 'body',
		required: true,
		schema: { $ref: '#/components/schemas/RepUpdateRequest' },
	}
	#swagger.responses[200] = {
		description: 'Get a single representation for an appeal',
		schema: { $ref: '#/components/schemas/RepResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	getRepresentationUpdateValidator,
	checkAppealExistsByIdAndAddPartialToRequest([
		'address',
		'appealTimetable',
		'appellant',
		'agent',
		'lpa'
	]),
	checkRepresentationExistsById,
	asyncHandler(controller.updateRepresentation)
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
	#swagger.responses[201] = {
		description: 'Create a Representation against an appeal',
		schema: { $ref: '#/components/schemas/RepResponse' }
	}
	#swagger.responses[400] = {}
 */
	checkAppealExistsByIdAndAddPartialToRequest(['appealStatus']),
	createRepresentationValidator,
	asyncHandler(controller.createRepresentation('comment'))
);

router.post(
	'/:appealId/reps/:proofOfEvidenceType/proof-of-evidence',
	/*
	#swagger.tags = ['Representations']
	#swagger.path = '/appeals/{appealId}/reps/{proofOfEvidenceType}/proof-of-evidence'
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
	#swagger.responses[201] = {
		description: 'Create a Representation against an appeal',
		schema: { $ref: '#/components/schemas/RepResponse' }
	}
	#swagger.responses[400] = {}
 */
	checkAppealExistsByIdAndAddPartialToRequest([]),
	createRepresentationProofOfEvidenceValidator,
	asyncHandler(controller.createRepresentationProofOfEvidence)
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
	checkAppealExistsByIdAndAddPartialToRequest([]),
	validateRejectionReasonsPayload,
	checkRepresentationExistsById,
	asyncHandler(controller.updateRejectionReasons)
);

router.patch(
	'/:appealId/reps/:repId/attachments',
	/*
	#swagger.tags = ['Representations']
	#swagger.path = '/appeals/{appealId}/reps/{repId}/attachments'
	#swagger.description = Update attachments for a representation
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.requestBody = {
		in: 'body',
		required: true,
		schema: { type: 'object', properties: { attachments: { type: 'array', items: { type: 'string' } } } },
		example: {
			"attachments": [
				"39ad6cd8-60ab-43f0-a995-4854db8f12c6",
				"b6f15730-2d7f-4fa0-8752-2d26a62474de",
				"7919b64d-acca-4b6d-9793-97a0dd786139"
			]
		}
	}
	#swagger.responses[200] = {
		description: 'Attachments updated successfully',
		schema: { $ref: '#/components/schemas/RepResponse' }
	}
	#swagger.responses[400] = {
		description: 'Invalid payload',
		schema: { errors: { attachments: 'must be an array of strings' } }
	}
	*/
	asyncHandler(controller.updateRepresentationAttachments)
);

router.post(
	'/:appealId/reps/publish',
	/*
	#swagger.tags = ['Representations']
	#swagger.path = '/appeals/{appealId}/reps/publish'
	#swagger.description = "Publish LPA statement and final comments for appeal"
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.responses[200] = {
		schema: { $ref: '#/components/schemas/RepResponse' }
	}
	*/
	checkAppealExistsByIdAndAddPartialToRequest([
		'appealStatus',
		'representations',
		'appealTimetable'
	]),
	validateRepresentationsToPublish,
	asyncHandler(controller.publish)
);

export { router as representationRoutes };
