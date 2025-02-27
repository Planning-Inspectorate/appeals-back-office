import { permissionNames } from '#environment/permissions.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { hasRowMaps } from './has.js';
import { s78RowMaps } from './s78.js';
/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth & Express.Request["session"]} SessionWithAuth
 * @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} SingleLPAQuestionnaireResponse
 */

/**
 * @typedef {Object} RowMapperParams
 * @property {SingleLPAQuestionnaireResponse} lpaQuestionnaireData
 * @property {WebAppeal} appealDetails
 * @property {string} currentRoute
 * @property {SessionWithAuth} session
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

	const userHasUpdateCase = userHasPermission(permissionNames.updateCase, session);

	/** @type {{lpaq: MappedInstructions}} */
	const mappedData = { lpaq: {} };

	Object.entries(rowMaps[appealDetails.appealType]).forEach(([key, rowMapper]) => {
		mappedData.lpaq[key] = rowMapper({
			lpaQuestionnaireData,
			appealDetails,
			currentRoute,
			session,
			userHasUpdateCase
		});
	});

	return mappedData;
}
