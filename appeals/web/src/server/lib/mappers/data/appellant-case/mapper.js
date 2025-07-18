import { permissionNames } from '#environment/permissions.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { userHasPermission } from '../../utils/permissions.mapper.js';
import { submaps as hasSubmaps } from './has.js';
import { submaps as s78Submaps } from './s78.js';
import { submaps as s20Submaps } from './s20.js';
import { submaps as casSubmaps } from './cas.js';

/**
 * @typedef SubMapperParams
 * @property {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @property {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @property {string} currentRoute
 * @property {boolean} userHasUpdateCase
 */

/**
 * @typedef {(params: SubMapperParams) => Instructions} SubMapper
 */

/** @type {Record<string, Record<string, SubMapper>>} */
const submaps = {
	[APPEAL_TYPE.HOUSEHOLDER]: hasSubmaps,
	[APPEAL_TYPE.S78]: s78Submaps,
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: s20Submaps,
	[APPEAL_TYPE.CAS_PLANNING]: casSubmaps
};

/**
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} session
 * @param {string} currentRoute
 * @returns {MappedInstructions}
 */
export function initialiseAndMapData(appellantCaseData, appealDetails, currentRoute, session) {
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
		userHasUpdateCase
	};
	/** @type {Record<string, SubMapper>} */
	const submappers = submaps[appealDetails.appealType];

	/** @type {MappedInstructions} */
	const mappedData = {};

	Object.entries(submappers).forEach(([key, submapper]) => {
		mappedData[key] = submapper(submapperParams);
	});

	return mappedData;
}
