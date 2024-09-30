import { isFolderInfo } from '#lib/ts-utilities.js';
import { mapActionComponent } from '#lib/mappers/component-permissions.mapper.js';
import { formatDocumentActionLink, formatDocumentValues } from '#lib/display-page-formatter.js';

/**
 * Returns the instructions for a document display field
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {number} options.appealId
 * @param {import('@pins/appeals.api').Appeals.FolderInfo|null|undefined} options.folderInfo
 * @param {string} options.requiredPermissionName
 * @param {import('../../app/auth/auth-session.service.js').SessionWithAuth} options.session
 * @param {string} options.manageUrl
 * @param {string} options.uploadUrlTemplate
 * @param {string} [options.cypressDataName]
 * @returns {Instructions}
 */
export function documentTypeDisplayField({
	id,
	text,
	appealId,
	folderInfo,
	requiredPermissionName,
	session,
	manageUrl,
	uploadUrlTemplate,
	cypressDataName = id
}) {
	const documents = (isFolderInfo(folderInfo) && folderInfo.documents) || [];
	/** @type {ActionItemProperties[]} */
	const actions = [];
	if (documents.length) {
		const manage = mapActionComponent(requiredPermissionName, session, {
			text: 'Manage',
			visuallyHiddenText: text,
			href: manageUrl,
			attributes: { 'data-cy': `manage-${cypressDataName}` }
		});
		manage && actions.push(manage);
	}
	const add = mapActionComponent(requiredPermissionName, session, {
		text: 'Add',
		visuallyHiddenText: text,
		href: formatDocumentActionLink(appealId, folderInfo, uploadUrlTemplate),
		attributes: { 'data-cy': `add-${cypressDataName}` }
	});
	add && actions.push(add);
	return {
		id,
		display: {
			summaryListItem: {
				key: {
					text
				},
				value: formatDocumentValues(appealId, documents),
				actions: {
					items: actions
				}
			}
		}
	};
}
