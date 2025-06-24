import usersService from '#appeals/appeal-users/users-service.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE, APPEAL_REDACTED_STATUS } from 'pins-data-model';
import { mapStatusText } from '#lib/appeal-status.js';

/** @typedef {import('#app/auth/auth-session.service').SessionWithAuth} SessionWithAuth */
/** @typedef {{ documentGuid: string, name: string, stage: string, folderId: number, documentType: string }} DocInfo */

/**
 * @param {import('../appeal-details.types.js').WebAppeal} appeal
 * @param {string} log
 * @param {DocInfo | undefined } docInfo
 * @param {SessionWithAuth} session
 * @returns {Promise<string>}
 */
export const mapMessageContent = async (appeal, log, docInfo, session) => {
	let result = log;
	if (log.toLowerCase().indexOf('document') === -1) {
		result = await tryMapUsers(result, session);
	}

	result = tryMapDocumentRedactionStatus(result);
	result = tryMapDocument(appeal.appealId, result, docInfo, appeal?.lpaQuestionnaireId || null);

	result = tryMapRepresentationType(result);
	result = tryMapStatus(result, appeal.appealType, appeal.procedureType);

	result = result.replace(/\n/g, '<br>');

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
export const tryMapUsers = async (log, session) => {
	const result = log.replace('00000000-0000-0000-0000-000000000000', 'System');
	const uuid = uuidRegex.exec(result);

	if (!uuid) {
		return result;
	}

	const user = await usersService.getUserById(uuid[2], session);

	return result.replace(uuid[2], user?.email || 'User not found!');
};

/**
 *
 * @param {number} appealId
 * @param {string} log
 * @param {DocInfo | undefined } docInfo
 * @param {number | null} lpaqId
 * @returns {string}
 */
export const tryMapDocument = (appealId, log, docInfo, lpaqId) => {
	if (!docInfo) {
		return log;
	}

	const { name, documentGuid, documentType, stage, folderId } = docInfo;

	if (!(name && documentGuid && documentType && stage && folderId)) {
		return log;
	}

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
		case APPEAL_CASE_STAGE.INTERNAL: {
			const internalTypes = ['appellant', 'cross-team', 'inspector'];
			let internalDocsPath = '';
			switch (documentType) {
				case APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_CORRESPONDENCE: {
					internalDocsPath = `internal-correspondence/${internalTypes[0]}`;
					break;
				}
				case APPEAL_DOCUMENT_TYPE.CROSS_TEAM_CORRESPONDENCE: {
					internalDocsPath = `internal-correspondence/${internalTypes[1]}`;
					break;
				}
				case APPEAL_DOCUMENT_TYPE.INSPECTOR_CORRESPONDENCE: {
					internalDocsPath = `internal-correspondence/${internalTypes[2]}`;
					break;
				}
			}

			const url = `/appeals-service/appeal-details/${appealId}/${internalDocsPath}/manage-documents/${folderId}/${documentGuid}`;
			return log.replace(name, `<a class="govuk-link" href="${url}">${name}</a>`);
		}
		case 'representation': {
			const repAuditDisplayName = name.replace(/[a-f\d-]{36}_/, '');
			return log.replace(name, `<a class="govuk-link" href="#">${repAuditDisplayName}</a>`);
		}
	}

	return log;
};

/**
 * @param {string} log
 * @param {string|null|undefined} appealType
 * @param {string|undefined} appealProcedureType
 * @returns {string}
 */
const tryMapStatus = (log, appealType, appealProcedureType) => {
	const status = log.match(/progressed to ([a-zA-Z_]+)/)?.[1];

	if (!status) {
		return log;
	}

	const mappedStatus = mapStatusText(status, appealType || '', appealProcedureType);

	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			type: 'html',
			parameters: {
				html: '',
				pageComponents: [
					{
						type: 'status-tag',
						parameters: {
							status: mappedStatus
						}
					}
				]
			}
		}
	];

	preRenderPageComponents(pageComponents);

	return log.replace(
		/progressed to ([a-zA-Z_]+)/,
		`progressed to ${pageComponents[0].parameters.html || status}`
	);
};

/**
 *
 * @param {string} log
 * @returns {string}
 */
const tryMapRepresentationType = (log) =>
	log
		.replace('ip_comment', 'An interested party comment')
		.replace('lpa_statement', 'The LPA statement')
		.replace('lpa_final_comment', 'The LPA final comment')
		.replace('appellant_final_comment', 'The appellant final comment');

/**
 *
 * @param {string} log
 * @returns {string}
 */
const tryMapDocumentRedactionStatus = (log) =>
	log
		.replace(APPEAL_REDACTED_STATUS.REDACTED, 'redacted')
		.replace(APPEAL_REDACTED_STATUS.NOT_REDACTED, 'unredacted')
		.replace(APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED, 'no redaction required');
