import { checkAppealExistsById } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './case-team.controller.js';
import { updateAssignedCaseIdValidator } from './case-team.validators.js';

const router = createRouter();

router.get(
	'/case-teams',
	/*
		#swagger.tags = ['Case Team']
		#swagger.path = '/appeals/case-teams'
		#swagger.description = 'Gets the list of case teams'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'List of case teams',
			schema: { $ref: '#/components/schemas/CaseTeams' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(controller.getAllCaseTeams)
);

router.patch(
	'/:appealId/case-team',
	/*
		#swagger.tags = ['Case Team']
		#swagger.path = '/appeals/{appealId}/case-team'
		#swagger.description = 'Updates case team members for a single appeal'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal details to update',
			schema: { $ref: '#/components/schemas/UpdateAsssignedTeamRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Updates the assignedTeaId by appeal id',
			schema: { $ref: '#/components/schemas/UpdateAsssignedTeamResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	updateAssignedCaseIdValidator,
	asyncHandler(checkAppealExistsById),
	asyncHandler(controller.updateAssignedTeamId)
);

export { router as caseTeamRouter };
