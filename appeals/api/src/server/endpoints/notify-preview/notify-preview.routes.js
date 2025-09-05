import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';

import * as controller from './notify-preview.controller.js';
const router = createRouter();
router.post(
	'/notify-preview/:templateName',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/{appealId}/document-folders/{folderId}'
		#swagger.description = Returns the contents of a single appeal folder, by id
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.parameters['repId'] = {
			in: 'query',
			description: 'The ID of a representation to filter attachments to',
			example: 1,
		}
		#swagger.responses[200] = {
			description: 'Returns the contents of a single appeal folder, by id',
			schema: { $ref: '#/components/schemas/Folder' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	asyncHandler(controller.generateNotifyTemplate)
);

export { router as notifyPreviewRouter };
