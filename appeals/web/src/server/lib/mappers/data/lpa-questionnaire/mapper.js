import { permissionNames } from '#environment/permissions.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { submaps as hasSubmaps } from './has.js';
import { submaps as s78Submaps } from './s78.js';
import { initialiseAndMapDataFactory } from '../initialise-and-map-data.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
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
 * @typedef {Object} InnerParams
 * @property {SingleLPAQuestionnaireResponse} lpaQuestionnaireData
 * @property {WebAppeal} appealDetails
 * @property {string} currentRoute
 * @property {SessionWithAuth} session
 */

/**
 * @param {InnerParams} params
 * @returns {SubMapperParams}
 */
const getSubmapperParams = ({ lpaQuestionnaireData, appealDetails, session, currentRoute }) => {
	const userHasUpdateCase = userHasPermission(permissionNames.updateCase, session);

	return {
		lpaQuestionnaireData,
		appealDetails,
		currentRoute,
		session,
		userHasUpdateCase
	};
};

/**
 * @param {InnerParams} params
 * @returns {string}
 */
const getAppealType = ({ appealDetails }) => {
	if (appealDetails === undefined) {
		throw new Error('appealDetails is undefined');
	}

	if (!appealDetails.appealType) {
		throw new Error('No appealType on appealDetails');
	}
	return appealDetails.appealType;
};

export const initialiseAndMapLPAQData = initialiseAndMapDataFactory(
	getSubmapperParams,
	submaps,
	getAppealType,
	'lpaq'
);
