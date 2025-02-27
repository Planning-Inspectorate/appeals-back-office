import usersService from '#appeals/appeal-users/users-service.js';
import config from '#environment/config.js';
import { permissionNames } from '#environment/permissions.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { s78RowMappers } from './s78.js';
import { hasRowMappers } from './has.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/**
 * @typedef {Object} RowMapperParams
 * @property {WebAppeal} appealDetails
 * @property {string} currentRoute
 * @property {SessionWithAuth} session
 * @property {boolean} userHasUpdateCasePermission
 * @property {boolean} skipAssignedUsersData
 * @property {{
 *     [x: string]: any;
 *   } | null} [caseOfficerUser]
 * @property {{
 *     [x: string]: any;
 *   } | null} [inspectorUser]
 * @property {import('#appeals/appeal-details/representations/representations.service.js').Representation} [appellantFinalComments]
 * @property {import('#appeals/appeal-details/representations/representations.service.js').Representation} [lpaFinalComments]
 */

/**
 * @typedef {(params: RowMapperParams) => Instructions} RowMapper
 */

/** @type {Record<string, Record<string, RowMapper>>} */
const rowMappers = {
	[APPEAL_TYPE.D]: hasRowMappers,
	[APPEAL_TYPE.W]: s78RowMappers
};

/**
 * @param {WebAppeal} appealDetails
 * @param {string} currentRoute
 * @param {SessionWithAuth} session
 * @param {boolean} [skipAssignedUsersData]
 * @param {import('#appeals/appeal-details/representations/representations.service.js').Representation} [appellantFinalComments]
 * @param {import('#appeals/appeal-details/representations/representations.service.js').Representation} [lpaFinalComments]
 * @returns {Promise<{appeal: MappedInstructions}>}
 */
export async function initialiseAndMapAppealData(
	appealDetails,
	currentRoute,
	session,
	skipAssignedUsersData = false,
	appellantFinalComments,
	lpaFinalComments
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

	/** @type {{appeal: MappedInstructions}} */
	const mappedData = {
		appeal: {}
	};

	Object.entries(rowMappers[appealDetails.appealType]).forEach(([key, rowMapper]) => {
		mappedData.appeal[key] = rowMapper({
			appealDetails,
			currentRoute,
			session,
			skipAssignedUsersData,
			userHasUpdateCasePermission,
			caseOfficerUser,
			inspectorUser,
			appellantFinalComments,
			lpaFinalComments
		});
	});
	return mappedData;
}
