import { permissionNames } from '#environment/permissions.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { userHasPermission } from '../permissions.mapper.js';
import { submaps as hasSubmaps } from './has.js';
import { submaps as s78Submaps } from './s78.js';
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

/** @type {Record<string, Record<string, SubMapper>>} */
const submaps = {
	[APPEAL_TYPE.D]: hasSubmaps,
	[APPEAL_TYPE.W]: s78Submaps
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

	const submappers = submaps[appealDetails.appealType];

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