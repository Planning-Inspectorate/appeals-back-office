import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { getAppealValidator } from '#endpoints/appeals/appeals.validators.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { validateDocumentAndAddToRequest } from './documents.middleware.js';
import {
	getFolderIdValidator,
	getDocumentIdValidator,
	getDocumentValidator,
	getDocumentsValidator,
	patchDocumentsValidator,
	patchDocumentFileNameValidator,
	patchDocumentsAvCheckValidator
} from './documents.validators.js';
import * as controller from './documents.controller.js';

const router = createRouter();

router.get(
	'/:appealId/document-folders',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/{appealId}/document-folders'
		#swagger.description = 'Returns the list of folders for the appeal, optionally querying based on the folder name'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Returns the contents of a single appeal folder, by id',
			schema: { $ref: '#/components/schemas/Folder' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppealValidator,
	checkAppealExistsByIdAndAddToRequest,
	controller.getFolders
);

router.get(
	'/:appealId/document-folders/:folderId',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/{appealId}/document-folders/{folderId}'
		#swagger.description = Returns the contents of a single appeal folder, by id
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Returns the contents of a single appeal folder, by id',
			schema: { $ref: '#/components/schemas/Folder' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppealValidator,
	checkAppealExistsByIdAndAddToRequest,
	getFolderIdValidator,
	asyncHandler(controller.getFolder)
);

router.get(
	'/:appealId/documents/:documentId',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/{appealId}/documents/{documentId}'
		#swagger.description = Returns a single document by id
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Returns a single document by id',
			schema: { $ref: '#/components/schemas/DocumentDetails' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppealValidator,
	checkAppealExistsByIdAndAddToRequest,
	getDocumentIdValidator,
	validateDocumentAndAddToRequest,
	asyncHandler(controller.getDocument)
);

router.get(
	'/:appealId/documents/:documentId/versions',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/{appealId}/documents/{documentId}/versions'
		#swagger.description = Returns a single document by id
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Returns a single document by id and its versions',
			schema: { $ref: '#/components/schemas/DocumentDetails' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppealValidator,
	checkAppealExistsByIdAndAddToRequest,
	getDocumentIdValidator,
	asyncHandler(controller.getDocumentAndVersions)
);

router.post(
	'/:appealId/documents',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/{appealId}/documents'
		#swagger.description = Upload documents to a case
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal documents to post',
			schema: { $ref: '#/components/schemas/AddDocumentsRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Document metadata successfully added',
			schema: { $ref: '#/components/schemas/AddDocumentsResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppealValidator,
	checkAppealExistsByIdAndAddToRequest,
	getDocumentsValidator,
	asyncHandler(controller.addDocuments)
);

router.post(
	'/:appealId/documents/:documentId',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/{appealId}/documents/{documentId}'
		#swagger.description = Add a new version of a document
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal documents to post',
			schema: { $ref: '#/components/schemas/AddDocumentVersionRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Document metadata successfully added',
			schema: { $ref: '#/components/schemas/AddDocumentsResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppealValidator,
	checkAppealExistsByIdAndAddToRequest,
	getDocumentIdValidator,
	validateDocumentAndAddToRequest,
	getDocumentValidator,
	asyncHandler(controller.addDocumentVersion)
);

router.patch(
	'/:appealId/documents',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/{appealId}/documents'
		#swagger.description = Updates multiple documents
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Documents to update',
			schema: { $ref: '#/components/schemas/UpdateDocumentsRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Documents to update',
			schema: { $ref: '#/components/schemas/UpdateDocumentsResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	patchDocumentsValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(controller.updateDocuments)
);

router.patch(
	'/:appealId/documents/:documentId',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/{appealId}/documents/{documentId}'
		#swagger.description = Updates document file name
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Document to update file name',
			schema: { $ref: '#/components/schemas/UpdateDocumentFileNameRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Document to update filename',
			schema: { $ref: '#/components/schemas/UpdateDocumentFileNameResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	patchDocumentFileNameValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(controller.updateDocumentFileName)
);

router.patch(
	'/documents/avcheck',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/documents/avcheck'
		#swagger.description = Updates multiple documents, following an AV check
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Documents to update for AV report',
			schema: { $ref: '#/components/schemas/UpdateDocumentsAvCheckRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Documents to update',
			schema: { $ref: '#/components/schemas/UpdateDocumentsAvCheckResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	patchDocumentsAvCheckValidator,
	asyncHandler(controller.updateDocumentsAvCheckStatus)
);

router.delete(
	'/:appealId/documents/:documentId/:version',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/{appealId}/documents/{documentId}/{version}'
		#swagger.description = Delete a document version and sets the previous as current version
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Returns a single document by id',
			schema: { $ref: '#/components/schemas/DocumentDetails' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppealValidator,
	checkAppealExistsByIdAndAddToRequest,
	getDocumentIdValidator,
	validateDocumentAndAddToRequest,
	asyncHandler(controller.deleteDocumentVersion)
);

export { router as documentsRoutes };
