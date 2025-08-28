import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './case-team.controller.js';

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

export { router as caseTeamRouter };
