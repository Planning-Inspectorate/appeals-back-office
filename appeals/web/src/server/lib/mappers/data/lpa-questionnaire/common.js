import { permissionNames } from '#environment/permissions.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { documentSummaryListItem } from '../../components/instructions/document.js';

/**
 * @param {string|number} lpaQuestionnaireId
 * @returns {string}
 */
export const buildDocumentUploadUrlTemplate = (lpaQuestionnaireId) => {
	return `/appeals-service/appeal-details/{{appealId}}/lpa-questionnaire/${lpaQuestionnaireId}/add-documents/{{folderId}}/{{documentId}}`;
};

/**
 *
 * @param {Number} caseId
 * @param {string|number} lpaQuestionnaireId
 * @param {number|undefined} folderId
 * @returns {string}
 */
export const mapDocumentManageUrl = (caseId, lpaQuestionnaireId, folderId) => {
	if (folderId === undefined) {
		return '';
	}
	return `/appeals-service/appeal-details/${caseId}/lpa-questionnaire/${lpaQuestionnaireId}/manage-documents/${folderId}/`;
};

/**
 * Generates a document field with defaults
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {import('@pins/appeals.api/src/server/endpoints/appeals.js').FolderInfo|null|undefined} options.folderInfo
 * @param {string} [options.cypressDataName]
 * @param {import('#appeals/appeals.types.js').DocumentRowDisplayMode} [options.displayMode]
 * @param {import('@pins/appeals.api/src/server/endpoints/appeals.js').SingleLPAQuestionnaireResponse} options.lpaQuestionnaireData
 * @param {import('#lib/active-directory-token.js').SessionWithAuth} options.session
 * @returns {Instructions}
 */
export const documentInstruction = ({
	id,
	text,
	folderInfo,
	cypressDataName,
	displayMode,
	lpaQuestionnaireData,
	session
}) => {
	return documentSummaryListItem({
		id,
		text,
		appealId: lpaQuestionnaireData.appealId,
		folderInfo,
		displayMode,
		editable: userHasPermission(permissionNames.updateCase, session),
		uploadUrlTemplate: buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId),
		manageUrl: mapDocumentManageUrl(
			lpaQuestionnaireData.appealId,
			lpaQuestionnaireData.lpaQuestionnaireId,
			folderInfo?.folderId
		),
		cypressDataName
	});
};
