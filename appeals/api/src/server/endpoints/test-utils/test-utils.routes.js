import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	deleteAppeals,
	retrieveNotifyEmails,
	simulateFinalCommentsElapsed,
	simulateHearingElapsed,
	simulateInquiryElapsed,
	simulateProofOfEvidenceElapsed,
	simulateReviewAppellantFinalComments,
	simulateReviewIpComment,
	simulateReviewLpaFinalComments,
	simulateReviewLPAQ,
	simulateReviewLpaStatement,
	simulateSetUpSiteVisit,
	simulateShareIpCommentsAndLpaStatement,
	simulateSiteVisitElapsed,
	simulateStartAppeal,
	simulateStatementsElapsed
} from './test-utils.controller.js';
import { deleteAppealsParamsValidator } from './test-utils.validators.js';

const router = createRouter();

router.post(
	'/:appealReference/site-visit-elapsed',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/site-visit-elapsed'
		#swagger.description = 'A test endpoint to simulate the completion of a site visit event'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateSiteVisitElapsed)
);

router.post(
	'/:appealReference/statements-elapsed',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/statements-elapsed'
		#swagger.description = 'A test endpoint to simulate the deadline for statements in the past'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateStatementsElapsed)
);

router.post(
	'/:appealReference/proof-of-evidence-elapsed',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/proof-of-evidence-elapsed'
		#swagger.description = 'A test endpoint to simulate the deadline for proof of evidence in the past'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateProofOfEvidenceElapsed)
);

router.post(
	'/:appealReference/final-comments-elapsed',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/final-comments-elapsed'
		#swagger.description = 'A test endpoint to simulate the deadline for final comments in the past'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateFinalCommentsElapsed)
);

router.get(
	'/:appealReference/notify-emails-sent',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/notify-emails-sent'
		#swagger.description = 'A test endpoint to retrieve an array of notify emails sent for this appeal reference'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
	 */
	asyncHandler(retrieveNotifyEmails)
);

router.post(
	'/:appealReference/hearing-elapsed',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/hearing-elapsed'
		#swagger.description = 'A test endpoint to simulate the completion of a hearing event'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateHearingElapsed)
);

router.post(
	'/:appealReference/inquiry-elapsed',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/inquiry-elapsed'
		#swagger.description = 'A test endpoint to simulate the completion of a inquiry event'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateInquiryElapsed)
);

router.delete(
	'/delete-appeals',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/delete-appeals'
		#swagger.description = 'A test endpoint to delete one or many appeals and their related data'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal IDs to delete',
			schema: { $ref: '#/components/schemas/DeleteAppealsRequest' },
			required: true
		}
		#swagger.responses[200] = {}
		#swagger.responses[400] = {}
	 */
	deleteAppealsParamsValidator,
	asyncHandler(deleteAppeals)
);

router.post(
	'/:appealReference/start-appeal',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/start-appeal'
		#swagger.description = 'A test endpoint to simulate the completion of a start appeal event'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[201] = {
			description: 'Creates an appeal timetable and start the appeal',
			schema: { $ref: '#/components/schemas/StartCaseResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	asyncHandler(simulateStartAppeal)
);

router.post(
	'/:appealReference/review-ip-comment',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/review-ip-comment'
		#swagger.description = 'A test endpoint to simulate the completion of a review ip comment event'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Get a single representation for an appeal',
			schema: { $ref: '#/components/schemas/RepResponse' }
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateReviewIpComment)
);

router.post(
	'/:appealReference/review-lpaq',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/review-lpaq'
		#swagger.description = 'A test endpoint to simulate the completion of a review LPA questionnaire event'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Updates a single LPA questionnaire by id',
			schema: { $ref: '#/components/schemas/UpdateLPAQuestionnaireResponse' }
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateReviewLPAQ)
);

router.post(
	'/:appealReference/review-lpa-statement',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/review-lpa-statement'
		#swagger.description = 'A test endpoint to simulate the completion of a review lpa statement event'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Get a single representation for an appeal',
			schema: { $ref: '#/components/schemas/RepResponse' }
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateReviewLpaStatement)
);

router.post(
	'/:appealReference/review-appellant-final-comments',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/review-appellant-final-comments'
		#swagger.description = 'A test endpoint to simulate the completion of a review appellant final comments event'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Get a single representation for an appeal',
			schema: { $ref: '#/components/schemas/RepResponse' }
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateReviewAppellantFinalComments)
);

router.post(
	'/:appealReference/review-lpa-final-comments',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/review-lpa-final-comments'
		#swagger.description = 'A test endpoint to simulate the completion of a review lpa final comments event'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Get a single representation for an appeal',
			schema: { $ref: '#/components/schemas/RepResponse' }
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateReviewLpaFinalComments)
);

router.post(
	'/:appealReference/share-comments-and-statement',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/share-comments-and-statement'
		#swagger.description = 'A test endpoint to simulate the completion of a share ip comments and lpa statement event'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			schema: { $ref: '#/components/schemas/RepResponse' }
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateShareIpCommentsAndLpaStatement)
);

router.post(
	'/:appealReference/set-up-site-visit',
	/*
		#swagger.tags = ['Test Utilities']
		#swagger.path = '/appeals/{appealReference}/set-up-site-visit'
		#swagger.description = 'A test endpoint to simulate the completion of a set up site visit event'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[201] = {
			description: 'Creates a single site visit',
			schema: { $ref: '#/components/schemas/SiteVisitSingleResponse' }
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(simulateSetUpSiteVisit)
);

export { router as testUtilsRoutes };
