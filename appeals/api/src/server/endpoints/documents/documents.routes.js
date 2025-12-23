import { getAppealValidator } from '#endpoints/appeal-details/appeal-details.validators.js';
import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './documents.controller.js';
import { validateDocumentAndAddToRequest } from './documents.middleware.js';
import {
	getDocumentIdValidator,
	getDocumentValidator,
	getDocumentsValidator,
	getFolderIdValidator,
	patchDocumentFileNameValidator,
	patchDocumentsAvCheckValidator,
	patchDocumentsValidator
} from './documents.validators.js';

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
	checkAppealExistsByIdAndAddPartialToRequest([]),
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
	getAppealValidator,
	checkAppealExistsByIdAndAddPartialToRequest([]),
	getFolderIdValidator,
	asyncHandler(controller.getFolder)
);

router.get(
	'/documents/:documentId',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/documents/{documentId}'
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
	getDocumentIdValidator,
	validateDocumentAndAddToRequest,
	asyncHandler(controller.getDocument)
);

router.get(
	'/documents/:documentId/versions',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/documents/{documentId}/versions'
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
	getDocumentIdValidator,
	asyncHandler(controller.getDocumentAndVersions) // /appeals/{appealId}/documents/{documentId}/versions
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
		#swagger.responses[204] = {
			description: 'Document metadata successfully added',
			schema: { $ref: '#/components/schemas/AddDocumentsResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppealValidator,
	checkAppealExistsByIdAndAddPartialToRequest(['appellantCase', 'lpaQuestionnaire']),
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
		#swagger.responses[201] = {
			description: 'Document metadata successfully added',
			schema: { $ref: '#/components/schemas/AddDocumentsResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppealValidator,
	checkAppealExistsByIdAndAddPartialToRequest(['appellant', 'agent', 'lpa', 'address']),
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
	checkAppealExistsByIdAndAddPartialToRequest([]),
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
	checkAppealExistsByIdAndAddPartialToRequest([]),
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
	'/documents/:documentId/:version',
	/*
		#swagger.tags = ['Documents']
		#swagger.path = '/appeals/documents/{documentId}/{version}'
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
	getDocumentIdValidator,
	validateDocumentAndAddToRequest,
	asyncHandler(controller.deleteDocumentVersion)
);

export { router as documentsRoutes };
