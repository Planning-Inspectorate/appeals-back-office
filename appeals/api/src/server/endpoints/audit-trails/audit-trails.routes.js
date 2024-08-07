import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { getAuditTrailById } from './audit-trails.controller.js';
import { getAuditTrailValidator } from './audit-trails.validators.js';

const router = createRouter();

router.get(
	'/:appealId/audit-trails',
	/*
		#swagger.tags = ['Audit Trails']
		#swagger.path = '/appeals/{appealId}/audit-trails'
		#swagger.description = Gets audit trail entries for an appeal by id
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Gets audit trail entries for an appeal by id',
			schema: { $ref: '#/components/schemas/GetAuditTrailsResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAuditTrailValidator,
	asyncHandler(getAuditTrailById)
);

export { router as auditTrailsRoutes };
