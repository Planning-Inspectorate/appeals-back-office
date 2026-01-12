import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import initNotifyClientAndAddToRequest from '../../middleware/init-notify-client-and-add-to-request.js';
import * as controller from './integrations.controller.js';
import {
	validateAppellantCase,
	validateCaseType,
	validateLpaQuestionnaire,
	validateRepresentation
} from './integrations.middleware.js';

const router = createRouter();

router.use(initNotifyClientAndAddToRequest);

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
		#swagger.responses[201] = {
			description: 'Appeal successfully created',
			schema: { $ref: '#/components/schemas/Appeal' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	validateCaseType,
	validateAppellantCase,
	asyncHandler(controller.importAppeal)
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
		#swagger.responses[201] = {
			description: 'Appeal successfully updated',
			schema: { $ref: '#/components/schemas/Appeal' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	validateLpaQuestionnaire,
	asyncHandler(controller.importLpaqSubmission)
);

router.post(
	'/representation-submission',
	/*
		#swagger.tags = ['Integration']
		#swagger.path = '/appeals/representation-submission'
		#swagger.description = Request adding a representation to an existing case
		#swagger.requestBody = {
			in: 'body',
			description: 'Representation data',
			schema: { $ref: '#/components/schemas/RepresentationData' },
			required: true
		}
		#swagger.responses[201] = {
			description: 'Appeal successfully updated',
			schema: { $ref: '#/components/schemas/Appeal' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	validateRepresentation,
	asyncHandler(controller.importRepresentation)
);

export { router as integrationsRoutes };
