import { listItemLink } from '#lib/mappers/index.js';

/**
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {import('@pins/appeals.api').Appeals.FolderInfo|null|undefined} options.folderInfo
 * @param {string} options.currentRoute
 * @param {boolean} options.userHasUpdateCasePermission
 * @returns {Instructions}
 */
export const mapGenericDocumentFolder = ({
	id,
	text,
	folderInfo,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const folderId = folderInfo?.folderId;
	const documentCount = folderInfo?.documentCount ?? 0;
	const hasDocuments = documentCount > 0;
	const statusText = hasDocuments
		? `${documentCount} document${documentCount === 1 ? '' : 's'}`
		: 'No documents';

	let actionsHtml = `<ul class="govuk-summary-list__actions-list">`;
	if (hasDocuments) {
		actionsHtml += listItemLink(
			`${currentRoute}/${id}/manage-documents/${folderId}`,
			'Manage',
			text
		);
	}
	if (userHasUpdateCasePermission) {
		actionsHtml += listItemLink(
			`${currentRoute}/${id}/add-documents/${folderId}`,
			'Add',
			text,
			`add-${id}`
		);
	}
	actionsHtml += `</ul>`;

	return {
		id,
		display: {
			tableItem: [
				{
					text,
					classes: `appeal-${id}-documentation`
				},
				{
					text: statusText,
					classes: `appeal-${id}-status`
				},
				{
					html: actionsHtml,
					classes: `appeal-${id}-actions govuk-!-text-align-right`
				}
			]
		}
	};
};
