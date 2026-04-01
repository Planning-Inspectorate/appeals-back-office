import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	broadcastAppeal,
	broadcastDocument,
	broadcastRepresentation,
	broadcastServiceUser
} from './broadcast.controller.js';
import {
	broadcastAppealValidator,
	broadcastDocumentValidator,
	broadcastRepresentationValidator,
	broadcastServiceUserValidator
} from './broadcast.validators.js';

const router = createRouter();

router.post(
	'/broadcast/appeal/:appealId',
	/*
		#swagger.tags = ['Broadcast']
		#swagger.path = '/appeals/broadcast/appeal/{appealId}'
		#swagger.description = 'Broadcasts an appeal'
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	broadcastAppealValidator,
	asyncHandler(broadcastAppeal)
);

router.post(
	'/broadcast/document/:documentGuid',
	/*
		#swagger.tags = ['Broadcast']
		#swagger.path = '/appeals/broadcast/document/{documentGuid}'
		#swagger.description = 'Broadcasts a document'
		#swagger.requestBody = {
			in: 'body',
			description: 'Document broadcasting options',
			schema: {
				type: 'object',
				properties: {
					updateType: {
						type: 'string',
						enum: ['Create', 'Update', 'Delete']
					},
					version: {
						type: 'number'
					}
				},
				required: ['updateType', 'version']
			},
			required: true
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	broadcastDocumentValidator,
	asyncHandler(broadcastDocument)
);

router.post(
	'/broadcast/representation/:representationId',
	/*
		#swagger.tags = ['Broadcast']
		#swagger.path = '/appeals/broadcast/representation/{representationId}'
		#swagger.description = 'Broadcasts a representation'
		#swagger.requestBody = {
			in: 'body',
			description: 'Representation broadcasting options',
			schema: {
				type: 'object',
				properties: {
					updateType: {
						type: 'string',
						enum: ['Create', 'Update', 'Delete']
					}
				},
				required: ['updateType']
			},
			required: true
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	broadcastRepresentationValidator,
	asyncHandler(broadcastRepresentation)
);

router.post(
	'/broadcast/serviceUser/:serviceUserId',
	/*
		#swagger.tags = ['Broadcast']
		#swagger.path = '/appeals/broadcast/serviceUser/{serviceUserId}'
		#swagger.description = 'Broadcasts a service user'		
		#swagger.requestBody = {
			in: 'body',
			description: 'Service user broadcasting options',
			schema: {
				type: 'object',
				properties: {
					updateType: {
						type: 'string',
						enum: ['Create', 'Update', 'Delete']
					},
					roleName: {
						type: 'string'
					},
					caseReference: {
						type: 'string'
					}
				},
				required: ['updateType', 'roleName', 'caseReference']
			},
			required: true
		}		
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	broadcastServiceUserValidator,
	asyncHandler(broadcastServiceUser)
);

export { router as broadcastRoutes };
