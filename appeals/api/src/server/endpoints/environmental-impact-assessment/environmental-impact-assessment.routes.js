import { getAppealValidator } from '#endpoints/appeal-details/appeal-details.validators.js';
import { patchEiaScreeningRequired } from '#endpoints/environmental-impact-assessment/environmental-impact-assessment.controller.js';
import { getEiaScreeningRequirementValidator } from '#endpoints/environmental-impact-assessment/environmental-impact-assessment.validator.js';
import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';

const router = createRouter();

router.patch(
	'/:appealId/eia-screening-required' /*
		#swagger.tags = ['EIA Screening Required']
		#swagger.path = '/appeals/{appealId}/eia-screening-required'
		#swagger.description = Sets the EIA screening required boolean'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'EIA Screening Required request',
			schema: { $ref: '#/definitions/EiaScreeningRequiredRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Gets the eiaScreeningRequired boolean or null'
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */,
	getAppealValidator,
	getEiaScreeningRequirementValidator,
	checkAppealExistsByIdAndAddPartialToRequest([]),
	asyncHandler(patchEiaScreeningRequired)
);

export { router as environmentalImpactAssessmentRoutes };
