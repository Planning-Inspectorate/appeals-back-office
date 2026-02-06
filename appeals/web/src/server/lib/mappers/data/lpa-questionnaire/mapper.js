import { permissionNames } from '#environment/permissions.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { submaps as advertSubmaps } from './advert.js';
import { submaps as casAdvertSubmaps } from './cas-advert.js';
import { submaps as casPlanningSubmaps } from './cas-planning.js';
import { submaps as enforcementSubmaps } from './enforcement.js';
import { submaps as hasSubmaps } from './has.js';
import { submaps as ldcSubmaps } from './ldc.js';
import { submaps as s20Submaps } from './s20.js';
import { submaps as s78Submaps } from './s78.js';
/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth & Express.Request["session"]} SessionWithAuth
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
/** @type {Record<string, Record<string, SubMapper>>} */
const submaps = {
	[APPEAL_TYPE.HOUSEHOLDER]: hasSubmaps,
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: casAdvertSubmaps,
	[APPEAL_TYPE.ADVERTISEMENT]: advertSubmaps,
	[APPEAL_TYPE.CAS_PLANNING]: casPlanningSubmaps,
	[APPEAL_TYPE.S78]: s78Submaps,
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: s20Submaps,
	[APPEAL_TYPE.ENFORCEMENT_NOTICE]: enforcementSubmaps,
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: ldcSubmaps
};

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
	if (appealDetails === undefined) {
		throw new Error('appealDetails is undefined');
	}

	if (!appealDetails.appealType) {
		throw new Error('No appealType on appealDetails');
	}

	currentRoute = currentRoute.endsWith('/') ? currentRoute.slice(0, -1) : currentRoute;

	const userHasUpdateCase = userHasPermission(permissionNames.updateCase, session);

	/** @type {{lpaq: MappedInstructions}} */
	const mappedData = { lpaq: {} };

	const submappers = submaps[appealDetails.appealType];

	if (!submappers) {
		console.error(`[LPAQ Mapper] No submapper found for appeal type: ${appealDetails.appealType}`);
		return mappedData;
	}

	Object.entries(submappers).forEach(([key, submapper]) => {
		mappedData.lpaq[key] = submapper({
			lpaQuestionnaireData,
			appealDetails,
			currentRoute,
			session,
			userHasUpdateCase
		});
	});

	return mappedData;
}
