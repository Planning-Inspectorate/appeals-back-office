import usersService from '#appeals/appeal-users/users-service.js';
import config from '#environment/config.js';
import { permissionNames } from '#environment/permissions.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { submaps as s78Submaps } from './s78.js';
import { submaps as hasSubmaps } from './has.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/**
 * @typedef {Object} SubMapperParams
 * @property {WebAppeal} appealDetails
 * @property {string} currentRoute
 * @property {SessionWithAuth} session
 * @property {boolean} userHasUpdateCasePermission
 * @property {boolean} skipAssignedUsersData
 * @property {import('@pins/express/types/express.js').Request} request
 * @property {{
 *     [x: string]: any;
 *   } | null} [caseOfficerUser]
 * @property {{
 *     [x: string]: any;
 *   } | null} [inspectorUser]
 * @property {import('#appeals/appeal-details/representations/representations.service.js').Representation} [appellantFinalComments]
 * @property {import('#appeals/appeal-details/representations/representations.service.js').Representation} [lpaFinalComments]
 * @property {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} [appellantCase]
 */

/**
 * @typedef {(params: SubMapperParams) => Instructions} SubMapper
 */

/** @type {Record<string, Record<string, SubMapper>>} */
const submaps = {
	[APPEAL_TYPE.HOUSEHOLDER]: hasSubmaps,
	[APPEAL_TYPE.S78]: s78Submaps,
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: s78Submaps
};

/**
 * @param {WebAppeal} appealDetails
 * @param {string} currentRoute
 * @param {SessionWithAuth} session
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {boolean} [skipAssignedUsersData]
 * @param {import('#appeals/appeal-details/representations/representations.service.js').Representation} [appellantFinalComments]
 * @param {import('#appeals/appeal-details/representations/representations.service.js').Representation} [lpaFinalComments]
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} [appellantCase]
 * @returns {Promise<{appeal: MappedInstructions}>}
 */
export async function initialiseAndMapAppealData(
	appealDetails,
	currentRoute,
	session,
	request,
	skipAssignedUsersData = false,
	appellantFinalComments,
	lpaFinalComments,
	appellantCase
) {
	if (appealDetails === undefined) {
		throw new Error('appealDetails is undefined');
	}

	if (!appealDetails.appealType) {
		throw new Error('No appealType on appealDetails');
	}

	const caseOfficerUser = appealDetails.caseOfficer
		? await usersService.getUserByRoleAndId(
				config.referenceData.appeals.caseOfficerGroupId,
				session,
				appealDetails.caseOfficer
		  )
		: null;

	const inspectorUser = appealDetails.inspector
		? await usersService.getUserByRoleAndId(
				config.referenceData.appeals.inspectorGroupId,
				session,
				appealDetails.inspector
		  )
		: null;

	const userHasUpdateCasePermission = userHasPermission(permissionNames.updateCase, session);

	/** @type {Record<string, SubMapper>} */
	const submappers = submaps[appealDetails.appealType];

	/** @type {{appeal: MappedInstructions}} */
	const mappedData = {
		appeal: {}
	};

	Object.entries(submappers).forEach(([key, submapper]) => {
		mappedData.appeal[key] = submapper({
			appealDetails,
			currentRoute,
			session,
			request,
			skipAssignedUsersData,
			userHasUpdateCasePermission,
			caseOfficerUser,
			inspectorUser,
			appellantFinalComments,
			lpaFinalComments,
			appellantCase
		});
	});
	return mappedData;
}
