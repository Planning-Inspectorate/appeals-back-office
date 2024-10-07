import { isFolderInfo } from '#lib/ts-utilities.js';
import { formatDocumentActionLink, formatDocumentValues } from '#lib/display-page-formatter.js';

/**
 * Returns the instructions for a document display field
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {number} options.appealId
 * @param {import('@pins/appeals.api').Appeals.FolderInfo|null|undefined} options.folderInfo
 * @param {boolean} options.userHasEditPermission
 * @param {string} options.manageUrl
 * @param {string} options.uploadUrlTemplate
 * @param {string} [options.cypressDataName]
 * @returns {Instructions}
 */
export function documentSummaryListItem({
	id,
	text,
	appealId,
	folderInfo,
	userHasEditPermission,
	manageUrl,
	uploadUrlTemplate,
	cypressDataName = id
}) {
	const documents = (isFolderInfo(folderInfo) && folderInfo.documents) || [];
	/** @type {ActionItemProperties[]} */
	const actions = [];
	if (userHasEditPermission) {
		if (documents.length) {
			actions.push({
				text: 'Manage',
				visuallyHiddenText: text,
				href: manageUrl,
				attributes: { 'data-cy': `manage-${cypressDataName}` }
			});
		}
		actions.push({
			text: 'Add',
			visuallyHiddenText: text,
			href: formatDocumentActionLink(appealId, folderInfo, uploadUrlTemplate),
			attributes: { 'data-cy': `add-${cypressDataName}` }
		});
	}
	return {
		id,
		display: {
			summaryListItem: {
				key: { text },
				value: formatDocumentValues(appealId, documents),
				actions: { items: actions }
			}
		}
	};
}
