import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	claimCaseFilePackage,
	completeCaseFilePackage,
	failCaseFilePackage,
	getCaseFilePackage,
	getCaseFilePackageById,
	getCaseFilePackageDownloadUrl,
	requestCaseFilePackage
} from './case-file-packages.controller.js';
import { validateCaseFilePackageAppealId } from './case-file-packages.validators.js';

const router = createRouter();

router
	.route('/:appealId/case-file-package')
	.get(
		/*
			#swagger.tags = ['Case File Packages']
			#swagger.path = '/appeals/{appealId}/case-file-package'
			#swagger.description = 'Gets latest package status.'
			#swagger.parameters['azureAdUserId'] = { in: 'header', required: true, type: 'string' }
			#swagger.parameters['appealId'] = { in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }
			#swagger.responses[200] = { schema: { $ref: '#/components/schemas/CaseFilePackageStatus' } }
			#swagger.responses[400] = { description: 'Invalid appeal ID' }
			#swagger.responses[404] = { description: 'Appeal not found or feature disabled' }
		 */
		validateCaseFilePackageAppealId,
		asyncHandler(getCaseFilePackage)
	)
	.post(
		/*
			#swagger.tags = ['Case File Packages']
			#swagger.path = '/appeals/{appealId}/case-file-package'
			#swagger.description = 'Queues a case file package, or returns existing active package.'
			#swagger.parameters['azureAdUserId'] = { in: 'header', required: true, type: 'string' }
			#swagger.parameters['appealId'] = { in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }
			#swagger.responses[200] = { description: 'Existing active package', schema: { $ref: '#/components/schemas/CaseFilePackage' } }
			#swagger.responses[202] = { description: 'Package queued', schema: { $ref: '#/components/schemas/CaseFilePackage' } }
			#swagger.responses[400] = { description: 'Invalid appeal ID' }
			#swagger.responses[404] = { description: 'Appeal not found or feature disabled' }
			#swagger.responses[500] = { description: 'Could not queue package' }
		 */
		validateCaseFilePackageAppealId,
		asyncHandler(requestCaseFilePackage)
	);

router.get(
	'/:appealId/case-file-package/download-url',
	/*
		#swagger.tags = ['Case File Packages']
		#swagger.path = '/appeals/{appealId}/case-file-package/download-url'
		#swagger.description = 'Gets a read-only download URL valid for 15 minutes for latest ready package. Response uses Cache-Control: no-store.'
		#swagger.parameters['azureAdUserId'] = { in: 'header', required: true, type: 'string' }
		#swagger.parameters['appealId'] = { in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }
		#swagger.responses[200] = { schema: { $ref: '#/components/schemas/CaseFilePackageDownloadUrl' } }
		#swagger.responses[400] = { description: 'Invalid appeal ID' }
		#swagger.responses[404] = { description: 'Ready package not found or feature disabled' }
	*/
	validateCaseFilePackageAppealId,
	asyncHandler(getCaseFilePackageDownloadUrl)
);

router.post(
	'/:appealId/case-file-package/:packageId/claim',
	/*
		#swagger.tags = ['Case File Packages']
		#swagger.path = '/appeals/{appealId}/case-file-package/{packageId}/claim'
		#swagger.description = 'Claims an active queued package for processing.'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header', required: true, schema: { type: 'string', enum: ['00000000-0000-0000-0000-000000000000'] }
		}
		#swagger.parameters['appealId'] = { in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }
		#swagger.parameters['packageId'] = { in: 'path', required: true, type: 'string' }
		#swagger.responses[204] = { description: 'Package claimed' }
		#swagger.responses[400] = { description: 'Invalid appeal ID' }
		#swagger.responses[409] = { description: 'No matching active queued package' }
	*/
	validateCaseFilePackageAppealId,
	asyncHandler(claimCaseFilePackage)
);
router.get(
	'/:appealId/case-file-package/:packageId',
	/*
		#swagger.tags = ['Case File Packages']
		#swagger.path = '/appeals/{appealId}/case-file-package/{packageId}'
		#swagger.description = 'Gets a specific package.'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header', required: true, schema: { type: 'string', enum: ['00000000-0000-0000-0000-000000000000'] }
		}
		#swagger.parameters['appealId'] = { in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }
		#swagger.parameters['packageId'] = { in: 'path', required: true, type: 'string' }
		#swagger.responses[200] = { schema: { $ref: '#/components/schemas/CaseFilePackage' } }
		#swagger.responses[400] = { description: 'Invalid appeal ID' }
		#swagger.responses[404] = { description: 'Package not found' }
	*/
	validateCaseFilePackageAppealId,
	asyncHandler(getCaseFilePackageById)
);
router.post(
	'/:appealId/case-file-package/:packageId/complete',
	/*
		#swagger.tags = ['Case File Packages']
		#swagger.path = '/appeals/{appealId}/case-file-package/{packageId}/complete'
		#swagger.description = 'Marks an active processing package ready.'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header', required: true, schema: { type: 'string', enum: ['00000000-0000-0000-0000-000000000000'] }
		}
		#swagger.parameters['appealId'] = { in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }
		#swagger.parameters['packageId'] = { in: 'path', required: true, type: 'string' }
		#swagger.requestBody = { required: true, schema: { $ref: '#/components/schemas/CompleteCaseFilePackageRequest' } }
		#swagger.responses[204] = { description: 'Package completed' }
		#swagger.responses[400] = { description: 'Invalid appeal ID, blob path or size' }
		#swagger.responses[409] = { description: 'No matching active processing package' }
	*/
	validateCaseFilePackageAppealId,
	asyncHandler(completeCaseFilePackage)
);
router.post(
	'/:appealId/case-file-package/:packageId/fail',
	/*
		#swagger.tags = ['Case File Packages']
		#swagger.path = '/appeals/{appealId}/case-file-package/{packageId}/fail'
		#swagger.description = 'Marks a processing package failed.'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header', required: true, schema: { type: 'string', enum: ['00000000-0000-0000-0000-000000000000'] }
		}
		#swagger.parameters['appealId'] = { in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }
		#swagger.parameters['packageId'] = { in: 'path', required: true, type: 'string' }
		#swagger.requestBody = { required: false, schema: { $ref: '#/components/schemas/FailCaseFilePackageRequest' } }
		#swagger.responses[204] = { description: 'Package marked failed' }
		#swagger.responses[400] = { description: 'Invalid appeal ID' }
		#swagger.responses[409] = { description: 'No matching active processing package' }
	*/
	validateCaseFilePackageAppealId,
	asyncHandler(failCaseFilePackage)
);

export { router as caseFilePackagesRoutes };
