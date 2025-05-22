import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { getLookupData } from '#common/controllers/lookup-data.controller.js';

const router = createRouter();

router.get(
	'/case-teams',
	/*
        #swagger.tags = ['Case Teams List']
        #swagger.path = '/appeals/case-teams'
        #swagger.description = 'Gets list of case teams'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.responses[200] = {
            description: 'Case Teams',
            schema: { $ref: '#/components/schemas/CaseTeams' },
        }
        #swagger.responses[400] = {}
     */
	asyncHandler(getLookupData('caseTeam'))
);

export { router as caseTeamsRoutes };
