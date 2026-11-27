import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	changeOfProcedureTypeAndUpdateDueDateNotifyPreview,
	requestChangeOfProcedureTypeAndUpdateDueDate
} from './change-to-part-2.controller.js';
import { postChangeProcedureTypeValidator } from './change-to-part-2.validator.js';

const router = createRouter();

router.post(
	'/:appealId/change-to-part-2',
	/*
		#swagger.tags = ['Appeal Procedure Change To Written Rep Part 2 Request']
		#swagger.path = '/appeals/{appealId}/change-tp-part-2'
		#swagger.description = 'Records a request to change the appeal procedure type to Written representation Part 2'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal procedure change request',
			schema: { $ref: '#/components/schemas/AppealProcedureChangeToPart2Request' },
			required: true
		}
		#swagger.responses[400] = {}
	 */
	postChangeProcedureTypeValidator,
	checkAppealExistsByIdAndAddPartialToRequest([
		'hearing',
		'inquiry',
		'siteVisit',
		'appellant',
		'agent',
		'lpa',
		'address'
	]),
	asyncHandler(requestChangeOfProcedureTypeAndUpdateDueDate)
);

router.post(
	'/:appealId/change-to-part-2/notify-preview',
	/*
		#swagger.tags = ['Appeal Procedure Change To Written Rep Part 2 Request']
		#swagger.path = '/appeals/{appealId}/change-to-part-2/notify-preview'
		#swagger.description = 'Returns the rendered HTML of the emails that would be sent to the relevant parties'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal and optionally a start date (defaults to the current date, if omitted), procedure type, and hearing start time',
			schema: { $ref: '#/components/schemas/AppealProcedureChangeToPart2Request' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Returns the rendered HTML of the emails that would be sent to the relevant parties',
			schema: { $ref: '#/components/schemas/StartCaseNotifyPreviewResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
		#swagger.responses[500] = {}
	 */
	checkAppealExistsByIdAndAddPartialToRequest([
		'appealType',
		'procedureType',
		'parentAppeals',
		'childAppeals',
		'address',
		'appellant',
		'agent',
		'lpa',
		'appealGrounds',
		'appellantCase'
	]),
	asyncHandler(changeOfProcedureTypeAndUpdateDueDateNotifyPreview)
);

export { router as changeToPart2Routes };
