import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import {
	validateAppellantCase,
	validateLpaQuestionnaire,
	validateCaseType
} from './integrations.middleware.js';
import * as controller from './integrations.controller.js';

const router = createRouter();

router.post(
	'/case-submission',
	/*
		#swagger.tags = ['Integration']
		#swagger.path = '/appeals/case-submission'
		#swagger.description = Request the creation of a new case
		#swagger.requestBody = {
			in: 'body',
			description: 'Case data',
			schema: { $ref: '#/components/schemas/AppellantCaseData' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Appeal successfully created',
			schema: { $ref: '#/components/schemas/Appeal' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	validateAppellantCase,
	validateCaseType,
	asyncHandler(controller.postAppealSubmission)
);

router.post(
	'/lpaq-submission',
	/*
		#swagger.tags = ['Integration']
		#swagger.path = '/appeals/lpaq-submission'
		#swagger.description = Request adding LPA response to an existing case
		#swagger.requestBody = {
			in: 'body',
			description: 'Questionnaire data',
			schema: { $ref: '#/components/schemas/QuestionnaireData' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Appeal successfully updated',
			schema: { $ref: '#/components/schemas/Appeal' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	validateLpaQuestionnaire,
	asyncHandler(controller.postLpaqSubmission)
);

export { router as integrationsRoutes };
