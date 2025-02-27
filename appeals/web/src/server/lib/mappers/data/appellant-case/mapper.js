import { permissionNames } from '#environment/permissions.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { hasRowMaps } from './has.js';
import { s78RowMaps } from './s78.js';

/**
 * @typedef RowMapperParams
 * @property {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @property {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @property {string} currentRoute
 * @property {boolean} userHasUpdateCase
 */

/**
 * @typedef {(params: RowMapperParams) => Instructions} RowMapper
 */

/** @type {Record<string, Record<string, RowMapper>>} */
const rowMaps = {
	[APPEAL_TYPE.D]: hasRowMaps,
	[APPEAL_TYPE.W]: s78RowMaps
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

	const rowMapperParams = {
		appellantCaseData,
		appealDetails,
		currentRoute,
		userHasUpdateCase
	};
	/** @type {Record<string, RowMapper>} */
	const rowMappers = rowMaps[appealDetails.appealType];

	/** @type {MappedInstructions} */
	const mappedData = {};

	Object.entries(rowMappers).forEach(([key, rowMapper]) => {
		mappedData[key] = rowMapper(rowMapperParams);
	});

	return mappedData;
}
