import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	getAppeals,
	getPersonalList,
	updateCompletedEventsController
} from './appeals.controller.js';
import { validateAppealStatus, validateHasInspector } from './appeals.middleware.js';
import { getAppealsValidator } from './appeals.validators.js';

const router = createRouter();

router.get(
	'/',
	/*
		#swagger.tags = ['Appeal Lists']
		#swagger.path = '/appeals'
		#swagger.description = 'Gets requested appeals, limited to the first 30 appeals if no pagination params are given'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.parameters['pageNumber'] = {
			in: 'query',
			description: 'The pagination page number - required if pageSize is given',
			example: 1,
		}
		#swagger.parameters['pageSize'] = {
			in: 'query',
			description: 'The pagination page size - required if pageNumber is given',
			example: 30,
		}
		#swagger.parameters['searchTerm'] = {
			in: 'query',
			description: 'The search term - does a partial, case-insensitive match of appeal reference and postcode fields',
			example: 'NR35 2ND',
		}
		#swagger.parameters['status'] = {
			in: 'query',
			description: 'The appeal status',
			example: 'lpa_questionnaire_due',
		}
		#swagger.parameters['hasInspector'] = {
			in: 'query',
			description: 'The Inspector Filter assigned status',
			example: 'true',
		}
		#swagger.parameters['lpaCode'] = {
			in: 'query',
			description: 'The lpa filter is assigned an an lpa code',
			example: 'BRIS',
		}
		#swagger.parameters['inspectorId'] = {
			in: 'query',
			description: 'The inspector filter is assigned an an inspector id',
			example: 22,
		}
		#swagger.parameters['caseOfficerId'] = {
			in: 'query',
			description: 'The case officer filter is assigned an an case officer id',
			example: 19,
		}
		#swagger.parameters['isGreenBelt'] = {
			in: 'query',
			description: 'The Green belt filter is applied',
			example: 'true',
		}
		#swagger.parameters['appealTypeId'] = {
			in: 'query',
			description: 'The appeal type filter is assigned an  appeal type id',
			example: 1,
		}
		#swagger.responses[200] = {
			description: 'Requested appeals',
			schema: { $ref: '#/components/schemas/AllAppeals' },
		}
		#swagger.responses[400] = {}
	 */
	getAppealsValidator,
	validateAppealStatus,
	validateHasInspector,
	asyncHandler(getAppeals)
);

router.get(
	'/personal-list',
	/*
		#swagger.tags = ['Appeal Lists']
		#swagger.path = '/appeals/personal-list'
		#swagger.description = 'Gets appeals assigned to the current user'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.parameters['pageNumber'] = {
			in: 'query',
			description: 'The pagination page number - required if pageSize is given',
			example: 1,
		}
		#swagger.parameters['pageSize'] = {
			in: 'query',
			description: 'The pagination page size - required if pageNumber is given',
			example: 30,
		}
		#swagger.parameters['status'] = {
			in: 'query',
			description: 'The appeal status',
			example: 'lpa_questionnaire_due',
		}
		#swagger.responses[200] = {
			description: 'Requested appeals',
			schema: { $ref: '#/components/schemas/AllAppeals' },
		}
		#swagger.responses[400] = {}
	 */
	getAppealsValidator,
	validateAppealStatus,
	asyncHandler(getPersonalList)
);

router.post(
	'/update-complete-events',
	/*
		#swagger.tags = ['Appeal Lists']
		#swagger.path = '/appeals/update-complete-events'
		#swagger.description = 'Updates the status of any appeals in the EVENT status where the event has now taken place'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[204] = {}
		#swagger.responses[400] = {}
	 */
	asyncHandler(updateCompletedEventsController)
);

export { router as appealsRoutes };
