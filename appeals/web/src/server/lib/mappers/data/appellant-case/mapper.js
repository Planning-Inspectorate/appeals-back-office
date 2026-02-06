import { permissionNames } from '#environment/permissions.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { userHasPermission } from '../../utils/permissions.mapper.js';
import { submaps as advertSubmaps } from './advert.js';
import { submaps as casAdvertSubmaps } from './cas-advert.js';
import { submaps as casPlanningSubmaps } from './cas-planning.js';
import { submaps as enforcementNoticeSubmaps } from './enforcement-notice.js';
import { submaps as hasSubmaps } from './has.js';
import { submaps as ldcSubmaps } from './ldc.js';
import { submaps as s20Submaps } from './s20.js';
import { submaps as s78Submaps } from './s78.js';

/**
 * @typedef SubMapperParams
 * @property {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @property {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @property {string} currentRoute
 * @property {boolean} userHasUpdateCase
 * @property {import('@pins/express/types/express.js').Request} request
 */

/**
 * @typedef {(params: SubMapperParams) => Instructions} SubMapper
 */

/**
 * @typedef {(params: SubMapperParams) => Instructions[]} SubMapperList
 */

/** @type {Record<string, Record<string, SubMapper | SubMapperList>>} */
const submaps = {
	[APPEAL_TYPE.HOUSEHOLDER]: hasSubmaps,
	[APPEAL_TYPE.S78]: s78Submaps,
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: s20Submaps,
	[APPEAL_TYPE.CAS_PLANNING]: casPlanningSubmaps,
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: casAdvertSubmaps,
	[APPEAL_TYPE.ADVERTISEMENT]: advertSubmaps,
	[APPEAL_TYPE.ENFORCEMENT_NOTICE]: enforcementNoticeSubmaps,
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: ldcSubmaps,
	[APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING]: enforcementNoticeSubmaps
};

/**
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} session
 * @param {string} currentRoute
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {MappedInstructions}
 */
export function initialiseAndMapData(
	appellantCaseData,
	appealDetails,
	currentRoute,
	session,
	request
) {
	if (!appellantCaseData || appellantCaseData === null) {
		throw new Error('appellantCaseDetails is null or undefined');
	}
	if (appealDetails === undefined) {
		throw new Error('appealDetails is undefined');
	}

	if (!appealDetails.appealType) {
		throw new Error('No appealType on appealDetails');
	}

	currentRoute =
		currentRoute[currentRoute.length - 1] === '/' ? currentRoute.slice(0, -1) : currentRoute;

	const userHasUpdateCase = userHasPermission(permissionNames.updateCase, session);

	const submapperParams = {
		appellantCaseData,
		appealDetails,
		currentRoute,
		request,
		userHasUpdateCase
	};
	/** @type {Record<string, SubMapper | SubMapperList>} */
	const submappers = submaps[appealDetails.appealType];

	if (!submappers) {
		throw new Error(`No submappers found for appeal type ${appealDetails.appealType}`);
	}

	/** @type {MappedInstructions} */
	const mappedData = {};

	Object.entries(submappers).forEach(([key, submapper]) => {
		// @ts-ignore
		mappedData[key] = submapper(submapperParams);
	});

	return mappedData;
}
