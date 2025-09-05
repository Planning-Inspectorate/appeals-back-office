import validateDateParameter from '#common/validators/date-parameter.js';
import { validateRequiredNumberParameter } from '#common/validators/number-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { asyncHandler, composeMiddleware } from '@pins/express';
import { Router as createRouter } from 'express';
import { addBusinessDays, validate } from './business-days.controller.js';

const router = createRouter();

router.post(
	'/validate-business-date',
	/*
		#swagger.tags = ['Utilities']
		#swagger.path = '/appeals/validate-business-date'
		#swagger.description = Validates a date to ensure is a business day
		#swagger.requestBody = {
			in: 'body',
			description: 'Date to validate',
			schema: { $ref: '#/components/schemas/ValidateDate' },
			required: true
		}
		#swagger.responses[400] = {
			error: 'Must be a business day'
		}
	 */
	composeMiddleware(
		validateDateParameter({
			parameterName: 'inputDate',
			isRequired: true,
			mustBeBusinessDay: true
		}),
		validationErrorHandler
	),
	asyncHandler(validate)
);

router.post(
	'/add-business-days',
	/*
		#swagger.tags = ['Utilities']
		#swagger.path = '/appeals/add-business-days'
		#swagger.description = Adds specified number of business days to the given date
		#swagger.requestBody = {
			in: 'body',
			description: 'Date to validate',
			schema: { $ref: '#/components/schemas/AddBusinessDays' },
			required: true
		}
		#swagger.responses[400] = {
			error: 'Must be a business day'
		}
	 */
	composeMiddleware(
		validateDateParameter({
			parameterName: 'inputDate',
			isRequired: true,
			mustBeBusinessDay: false
		}),
		validateRequiredNumberParameter('numDays'),
		validationErrorHandler
	),
	asyncHandler(addBusinessDays)
);

export { router as businessDaysRoutes };
