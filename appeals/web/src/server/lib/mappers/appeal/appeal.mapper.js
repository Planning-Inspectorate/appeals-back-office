import config from '#environment/config.js';
import { generateIssueDecisionUrl } from '#appeals/appeal-details/issue-decision/issue-decision.mapper.js';
import {
	mapDocumentDownloadUrl,
	mapVirusCheckStatus
} from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { APPEAL_CASE_STATUS, APPEAL_VIRUS_CHECK_STATUS } from 'pins-data-model';
import { submaps as hasSubmaps } from './has.js';
import { submaps as fpaSubmaps } from './fpa.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { userHasPermission } from '#lib/mappers/permissions.mapper.js';
import { permissionNames } from '#environment/permissions.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/**
 * @typedef {(
 *   appealDetails: WebAppeal,
 *   currentRoute: string,
 *   session: SessionWithAuth,
 *   skipAssignedUsersData?: boolean
 * ) => Promise<{appeal: MappedInstructions}>} Mapper
 */

/**
 * @typedef {Object} SubMapperParams
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
 */

/**
 * @typedef {(params: SubMapperParams) => Instructions} SubMapper
 */

/** @type {Record<string, Record<string, SubMapper>>} */
const submaps = {
	[APPEAL_TYPE.D]: hasSubmaps,
	[APPEAL_TYPE.W]: fpaSubmaps
};

/** @type {Mapper} */
export async function initialiseAndMapAppealData(
	appealDetails,
	currentRoute,
	session,
	skipAssignedUsersData = false
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
			skipAssignedUsersData,
			userHasUpdateCasePermission,
			caseOfficerUser,
			inspectorUser
		});
	});

	return mappedData;
}

/**
 * @param {WebAppeal} appealDetails
 * @returns {string}
 */
export function generateLinkedAppealsManageLinkHref(appealDetails) {
	const baseUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/linked-appeals`;

	if (appealDetails.linkedAppeals.length > 0) {
		return `${baseUrl}/manage`;
	}

	return `${baseUrl}/add`;
}

/**
 * @param {WebAppeal} appealDetails
 * @returns {string}
 */
export function generateAppealDecisionActionListItems(appealDetails) {
	switch (appealDetails.appealStatus) {
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION: {
			return `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${generateIssueDecisionUrl(
				appealDetails.appealId
			)}">Issue</a></li>`;
		}
		case APPEAL_CASE_STATUS.COMPLETE: {
			return `<li class="govuk-summary-list__actions-list-item">${generateDecisionDocumentDownloadHtml(
				appealDetails
			)}</li>`;
		}
		default: {
			return '';
		}
	}
}

/**
 * @param {WebAppeal} appealDetails
 * @param {string} [linkText]
 * @returns {string}
 */
export function generateDecisionDocumentDownloadHtml(appealDetails, linkText = 'View') {
	const virusCheckStatus = mapVirusCheckStatus(
		appealDetails.decision.virusCheckStatus || APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED
	);

	let html = '';

	if (virusCheckStatus.checked) {
		if (virusCheckStatus.safe) {
			html = `<a class="govuk-link" href="${
				appealDetails.decision?.documentId
					? mapDocumentDownloadUrl(appealDetails.appealId, appealDetails.decision?.documentId)
					: '#'
			}">${linkText}</a>`;
		} else {
			html = '<strong class="govuk-tag govuk-tag--red single-line">Virus detected</strong>';
		}
	} else {
		html = '<strong class="govuk-tag govuk-tag--yellow single-line">Virus scanning</strong>';
	}

	return html;
}

/**
 * @param {string | undefined} lpaQStatus
 * @returns {boolean}
 */
export function shouldDisplayChangeLinksForLPAQStatus(lpaQStatus) {
	return !lpaQStatus || lpaQStatus !== 'not_received';
}
