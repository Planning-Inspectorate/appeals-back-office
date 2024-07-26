import usersService from '#appeals/appeal-users/users-service.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from 'pins-data-model';

/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetAuditTrailsResponse} GetAuditTrailsResponse */
/** @typedef {import('#app/auth/auth-session.service').SessionWithAuth} SessionWithAuth */
/** @typedef {{ documentGuid: string, name: string, stage: string, folderId: number, documentType: string }} DocInfo */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<GetAuditTrailsResponse>}
 */
export async function getAppealAudit(apiClient, appealId) {
	return await apiClient.get(`appeals/${appealId}/audit-trails`).json();
}

/**
 *
 * @param {string} id
 * @param {SessionWithAuth} session
 * @returns {Promise<string>}
 */
export const mapUser = async (id, session) => {
	const result = await tryMapUsers(id, session);
	return result;
};

/**
 * @param {import('../appeal-details.types.js').WebAppeal} appeal
 * @param {string} log
 * @param {DocInfo | undefined } docInfo
 * @param {SessionWithAuth} session
 * @returns {Promise<string>}
 */
export const mapMessageContent = async (appeal, log, docInfo, session) => {
	let result = log;
	if (result.indexOf('Document') === -1) {
		result = await tryMapUsers(result, session);
	}
	result = await tryMapDocument(
		appeal.appealId,
		result,
		docInfo,
		appeal?.lpaQuestionnaireId || null
	);
	result = await tryMapStatus(result);
	result = await tryMapUrl(result);

	return result;
};

/**
 * Regex for extracting UUIDs
 */
const uuidRegex =
	/^(.*)([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})(.*)$/;

/**
 *
 * @param {string} log
 * @param {SessionWithAuth} session
 * @returns {Promise<string>}
 */
const tryMapUsers = async (log, session) => {
	let result = log.replace('00000000-0000-0000-0000-000000000000', 'System');
	const uuid = uuidRegex.exec(result);
	if (uuid) {
		const user = await usersService.getUserById(uuid[2], session);
		result = result.replace(uuid[2], user?.email || 'User not found!');
	}
	return result;
};

/**
 *
 * @param {number} appealId
 * @param {string} log
 * @param {DocInfo | undefined } docInfo
 * @param {number | null} lpaqId
 * @returns {Promise<string>}
 */
const tryMapDocument = async (appealId, log, docInfo, lpaqId) => {
	if (!docInfo) {
		return log;
	}

	const { name, documentGuid, documentType, stage, folderId } = docInfo;

	if (name && documentGuid && documentType && stage && folderId) {
		switch (stage) {
			case APPEAL_CASE_STAGE.APPELLANT_CASE: {
				const url = `/appeals-service/appeal-details/${appealId}/appellant-case/manage-documents/${folderId}/${documentGuid}`;
				return log.replace(name, `<a class="govuk-link" href="${url}">${name}</a>`);
			}
			case APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE: {
				if (!lpaqId) {
					break;
				}

				const url = `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaqId}/manage-documents/${folderId}/${documentGuid}`;
				return log.replace(name, `<a class="govuk-link" href="${url}">${name}</a>`);
			}
			case APPEAL_CASE_STAGE.COSTS: {
				const types = ['application', 'correspondence', 'withdrawal'];
				const sources = ['appellant', 'lpa'];
				let path = 'decision';

				switch (documentType) {
					case APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_APPLICATION: {
						path = `${sources[0]}/${types[0]}`;
						break;
					}
					case APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_CORRESPONDENCE: {
						path = `${sources[0]}/${types[1]}`;
						break;
					}
					case APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_WITHDRAWAL: {
						path = `${sources[0]}/${types[2]}`;
						break;
					}
					case APPEAL_DOCUMENT_TYPE.LPA_COSTS_APPLICATION: {
						path = `${sources[1]}/${types[0]}`;
						break;
					}
					case APPEAL_DOCUMENT_TYPE.LPA_COSTS_CORRESPONDENCE: {
						path = `${sources[1]}/${types[1]}`;
						break;
					}
					case APPEAL_DOCUMENT_TYPE.LPA_COSTS_WITHDRAWAL: {
						path = `${sources[1]}/${types[2]}`;
						break;
					}
				}

				const url = `/appeals-service/appeal-details/${appealId}/costs/${path}/manage-documents/${folderId}/${documentGuid}`;
				return log.replace(name, `<a class="govuk-link" href="${url}">${name}</a>`);
			}
			//TODO: internal folders, when the data model is updated
		}
	}

	return log;
};

/**
 *
 * @param {string} log
 * @returns {Promise<string>}
 */
const tryMapStatus = async (log) => {
	let result = log;
	result = result.replace(
		'progressed to validation',
		'progressed to <strong class="govuk-tag govuk-tag--orange single-line govuk-!-margin-bottom-4">Validation</strong>'
	);
	result = result.replace(
		'progressed to ready_to_start',
		'progressed to <strong class="govuk-tag govuk-tag--turquoise single-line govuk-!-margin-bottom-4">Ready to start</strong>'
	);
	result = result.replace(
		'progressed to lpa_questionnaire',
		'progressed to <strong class="govuk-tag govuk-tag--yellow single-line govuk-!-margin-bottom-4">LPA questionnaire</strong>'
	);
	result = result.replace(
		'progressed to withdrawn',
		'progressed to <strong class="govuk-tag govuk-tag--yellow single-line govuk-!-margin-bottom-4">Withdrawn</strong>'
	);
	result = result.replace(
		'progressed to awaiting_transfer',
		'progressed to <strong class="govuk-tag govuk-tag--red single-line govuk-!-margin-bottom-4">Awaiting transfer</strong>'
	);
	result = result.replace(
		'progressed to transferred',
		'progressed to <strong class="govuk-tag govuk-tag--grey single-line govuk-!-margin-bottom-4">Transferred</strong>'
	);
	result = result.replace(
		'progressed to closed',
		'progressed to <strong class="govuk-tag govuk-tag--grey single-line govuk-!-margin-bottom-4">Closed</strong>'
	);
	result = result.replace(
		'progressed to invalid',
		'progressed to <strong class="govuk-tag govuk-tag--grey single-line govuk-!-margin-bottom-4">Invalid</strong>'
	);
	result = result.replace(
		'progressed to issue_determination',
		'progressed to <strong class="govuk-tag govuk-tag--pink single-line govuk-!-margin-bottom-4">Issue decision</strong>'
	);
	result = result.replace(
		'progressed to complete',
		'progressed to <strong class="govuk-tag govuk-tag--green single-line govuk-!-margin-bottom-4">Complete</strong>'
	);

	return result;
};

/**
 *
 * @param {string} log
 * @returns {Promise<string>}
 */
const tryMapUrl = async (log) => {
	return log;
};
