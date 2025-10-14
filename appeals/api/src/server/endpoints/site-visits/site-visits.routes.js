import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import checkLookupValueIsValidAndAddToRequest from '#middleware/check-lookup-value-is-valid-and-add-to-request.js';
import { ERROR_INVALID_SITE_VISIT_TYPE } from '@pins/appeals/constants/support.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	cancelSiteVisit,
	getSiteVisitById,
	postSiteVisit,
	rearrangeSiteVisit
} from './site-visits.controller.js';
import { checkSiteVisitExists } from './site-visits.service.js';
import {
	deleteSiteVisitValidator,
	getSiteVisitValidator,
	patchSiteVisitValidator,
	postSiteVisitValidator
} from './site-visits.validators.js';

const router = createRouter();

router.post(
	'/:appealId/site-visits',
	/*
		#swagger.tags = ['Site Visits']
		#swagger.path = '/appeals/{appealId}/site-visits'
		#swagger.description = 'Creates a single site visit'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Site visit details to create',
			schema: { $ref: '#/components/schemas/SiteVisitCreateRequest' },
			required: true
		}
		#swagger.responses[201] = {
			description: 'Creates a single site visit',
			schema: { $ref: '#/components/schemas/SiteVisitSingleResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	postSiteVisitValidator,
	checkAppealExistsByIdAndAddToRequest,
	checkLookupValueIsValidAndAddToRequest(
		'visitType',
		'siteVisitType',
		ERROR_INVALID_SITE_VISIT_TYPE
	),
	asyncHandler(postSiteVisit)
);

router.get(
	'/:appealId/site-visits/:siteVisitId',
	/*
		#swagger.tags = ['Site Visits']
		#swagger.path = '/appeals/{appealId}/site-visits/{siteVisitId}'
		#swagger.description = 'Gets a single site visit by id'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Gets a single site visit by id',
			schema: { $ref: '#/components/schemas/SiteVisitSingleResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	getSiteVisitValidator,
	checkAppealExistsByIdAndAddToRequest,
	checkSiteVisitExists,
	asyncHandler(getSiteVisitById)
);

router.patch(
	'/:appealId/site-visits/:siteVisitId',
	/*
		#swagger.tags = ['Site Visits']
		#swagger.path = '/appeals/{appealId}/site-visits/{siteVisitId}'
		#swagger.description = 'Updates a single site visit by id'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Site visit details to create',
			schema: { $ref: '#/components/schemas/SiteVisitUpdateRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Creates a single site visit by id',
			schema: { $ref: '#/components/schemas/SiteVisitUpdateRequest' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	patchSiteVisitValidator,
	checkAppealExistsByIdAndAddToRequest,
	checkSiteVisitExists,
	checkLookupValueIsValidAndAddToRequest(
		'visitType',
		'siteVisitType',
		ERROR_INVALID_SITE_VISIT_TYPE
	),
	asyncHandler(rearrangeSiteVisit)
);
router.delete(
	'/:appealId/site-visits/:siteVisitId',
	/*
		#swagger.tags = ['Site Visits']
		#swagger.path = '/appeals/{appealId}/site-visits/{siteVisitId}'
		#swagger.description = 'Updates a single site visit by id'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Site visit details to create',
			schema: { $ref: '#/components/schemas/SiteVisitUpdateRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Creates a single site visit by id',
			schema: { $ref: '#/components/schemas/SiteVisitUpdateRequest' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	deleteSiteVisitValidator,
	checkAppealExistsByIdAndAddToRequest,
	checkSiteVisitExists,
	checkLookupValueIsValidAndAddToRequest(
		'visitType',
		'siteVisitType',
		ERROR_INVALID_SITE_VISIT_TYPE
	),
	asyncHandler(cancelSiteVisit)
);

export { router as siteVisitRoutes };
