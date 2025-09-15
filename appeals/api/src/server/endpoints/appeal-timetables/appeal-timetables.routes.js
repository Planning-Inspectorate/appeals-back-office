import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	getCalculatedAppealTimetable,
	startAppeal,
	updateAppealTimetableById
} from './appeal-timetables.controller.js';
import { checkAppealTimetableExists } from './appeal-timetables.service.js';
import {
	createAppealTimetableValidator,
	patchAppealTimetableValidator
} from './appeal-timetables.validators.js';

const router = createRouter();

router.post(
	'/:appealId/appeal-timetables/',
	/*
		#swagger.tags = ['Appeal Timetables']
		#swagger.path = '/appeals/{appealId}/appeal-timetables/'
		#swagger.description = 'Starts an appeal by creating a timetable'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal and optional start date (defaults to the current date, if omitted)',
			schema: { $ref: '#/components/schemas/StartCaseRequest' },
			required: true
		}
		#swagger.responses[201] = {
			description: 'Creates an appeal timetable and start the appeal',
			schema: { $ref: '#/components/schemas/StartCaseResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	createAppealTimetableValidator,
	asyncHandler(startAppeal)
);

router.patch(
	'/:appealId/appeal-timetables/:appealTimetableId',
	/*
		#swagger.tags = ['Appeal Timetables']
		#swagger.path = '/appeals/{appealId}/appeal-timetables/{appealTimetableId}'
		#swagger.description = 'Updates a single appeal timetable by id'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal timetable details to update',
			schema: { $ref: '#/components/schemas/UpdateAppealTimetableRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Updates a single appeal timetable by id',
			schema: { $ref: '#/components/schemas/UpdateAppealTimetableResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	checkAppealTimetableExists,
	patchAppealTimetableValidator,
	asyncHandler(updateAppealTimetableById)
);

router.get(
	'/:appealId/appeal-timetables/calculate',
	/*
		#swagger.tags = ['Appeal Timetables']
		#swagger.path = '/appeals/{appealId}/appeal-timetables/calculate'
		#swagger.description = 'Calculates the timetable that would result from starting this appeal'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.parameters['startDate'] = {
			in: 'query',
			required: false,
			example: '2025-01-01'
		}
		#swagger.parameters['procedureType'] = {
			in: 'query',
			required: false,
			example: 'written'
		}
		#swagger.responses[200] = {
			description: 'The timetable that would result from starting this appeal',
			schema: { $ref: '#/components/schemas/CalculateAppealTimetableResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
		#swagger.responses[500] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(getCalculatedAppealTimetable)
);

export { router as appealTimetablesRoutes };
