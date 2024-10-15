import { permissionNames } from '#environment/permissions.js';
import { userHasPermission } from '../permissions.mapper.js';
import { mapAdditionalDocumentsContents } from './submappers/map-additional-documents-contents.js';
import { mapAdditionalDocuments } from './submappers/map-additional-documents.js';
import { mapAffectsListedBuildingDetails } from './submappers/map-affects-listed-building-details.js';
import { mapConservationAreaMap } from './submappers/map-conservation-area-map.js';
import { mapDevelopmentPlanPolicies } from './submappers/map-development-plan-policies.js';
import { mapExtraConditions } from './submappers/map-extra-conditions.js';
import { mapIsCorrectAppealType } from './submappers/map-is-correct-appeal-type.js';
import { mapLettersToNeighbours } from './submappers/map-letters-to-neighbours.js';
import { mapLpaHealthAndSafety } from './submappers/map-lpa-health-and-safety.js';
import { mapNotificationMethods } from './submappers/map-notification-methods.js';
import { mapNotifyingParties } from './submappers/map-notify-parties.js';
import { mapOfficersReport } from './submappers/map-officers-report.js';
import { mapOtherAppeals } from './submappers/map-other-appeals.js';
import { mapPlansDrawings } from './submappers/map-plans-drawings.js';
import { mapPressAdvert } from './submappers/map-press-advert.js';
import { mapRepresentations } from './submappers/map-representations.js';
import { mapReviewOutcome } from './submappers/map-review-outcome.js';
import { mapSiteAccess } from './submappers/map-site-address.js';
import { mapSiteNotice } from './submappers/map-site-notice.js';
import { mapSiteWithinGreenBelt } from './submappers/map-site-within-green-belt.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 * @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} SingleLPAQuestionnaireResponse
 */

/**
 * @typedef {Object} SubMapperParams
 * @property {SingleLPAQuestionnaireResponse} lpaQuestionnaireData
 * @property {WebAppeal} appealDetails
 * @property {string} currentRoute
 * @property {SessionWithAuth} session
 * @property {boolean} userHasUpdateCase
 */

/**
 * @typedef {(params: SubMapperParams) => Instructions} SubMapper
 */

/**
 * @param {SingleLPAQuestionnaireResponse} lpaQuestionnaireData
 * @param {WebAppeal} appealDetails
 * @param {string} currentRoute
 * @param {SessionWithAuth} session
 * @returns {{lpaq: MappedInstructions}}
 */
export function initialiseAndMapLPAQData(
	lpaQuestionnaireData,
	appealDetails,
	session,
	currentRoute
) {
	const userHasUpdateCase = userHasPermission(permissionNames.updateCase, session);

	/** @type {SubMapperParams} */
	const submapperParams = {
		lpaQuestionnaireData,
		appealDetails,
		currentRoute,
		session,
		userHasUpdateCase
	};

	/** @type {{lpaq: MappedInstructions}} */
	const mappedData = {};
	mappedData.lpaq = {};

	/** @type {Instructions} */
	mappedData.lpaq.affectsListedBuildingDetails = mapAffectsListedBuildingDetails(submapperParams);

	mappedData.lpaq.isCorrectAppealType = mapIsCorrectAppealType(submapperParams);

	mappedData.lpaq.conservationAreaMap = mapConservationAreaMap(submapperParams);

	mappedData.lpaq.siteWithinGreenBelt = mapSiteWithinGreenBelt(submapperParams);

	mappedData.lpaq.notifyingParties = mapNotifyingParties(submapperParams);

	mappedData.lpaq.siteNotice = mapSiteNotice(submapperParams);

	mappedData.lpaq.lettersToNeighbours = mapLettersToNeighbours(submapperParams);

	mappedData.lpaq.pressAdvert = mapPressAdvert(submapperParams);

	mappedData.lpaq.notificationMethods = mapNotificationMethods(submapperParams);

	mappedData.lpaq.representations = mapRepresentations(submapperParams);

	mappedData.lpaq.officersReport = mapOfficersReport(submapperParams);

	mappedData.lpaq.plansDrawings = mapPlansDrawings(submapperParams);

	mappedData.lpaq.developmentPlanPolicies = mapDevelopmentPlanPolicies(submapperParams);

	mappedData.lpaq.siteAccess = mapSiteAccess(submapperParams);

	mappedData.lpaq.lpaHealthAndSafety = mapLpaHealthAndSafety(submapperParams);

	mappedData.lpaq.extraConditions = mapExtraConditions(submapperParams);

	mappedData.lpaq.otherAppeals = mapOtherAppeals(submapperParams);

	mappedData.lpaq.additionalDocumentsContents = mapAdditionalDocumentsContents(submapperParams);

	mappedData.lpaq.additionalDocuments = mapAdditionalDocuments(submapperParams);

	mappedData.lpaq.reviewOutcome = mapReviewOutcome(submapperParams);

	return mappedData;
}
