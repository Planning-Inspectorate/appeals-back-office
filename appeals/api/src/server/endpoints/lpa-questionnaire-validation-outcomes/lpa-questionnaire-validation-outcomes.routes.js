import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { getLookupData } from '../../common/controllers/lookup-data.controller.js';

const router = createRouter();

router.get(
	'/lpa-questionnaire-validation-outcomes',
	/*
		#swagger.tags = ['LPA Questionnaire Validation Outcomes']
		#swagger.path = '/appeals/lpa-questionnaire-validation-outcomes'
		#swagger.description = 'Gets LPA questionnaire validation outcomes'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'LPA questionnaire validation outcomes',
			schema: { $ref: '#/components/schemas/AllLPAQuestionnaireValidationOutcomesResponse' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getLookupData('lPAQuestionnaireValidationOutcome'))
);

export { router as lpaQuestionnaireValidationOutcomesRoutes };
