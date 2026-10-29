import { permissionNames } from '#environment/permissions.js';
import {
	actionsHtml,
	documentationFolderTableItem,
	userHasPermission
} from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapRedeterminationEvidence = ({ appealDetails, currentRoute, session }) => {
	const id = 'redetermination-evidence';
	const folderInfo = appealDetails.redeterminationEvidence;

	if (!folderInfo) {
		return { id, display: {} };
	}

	const folderId = folderInfo.folderId;
	const documentCount = folderInfo.documentCount ?? 0;
	const hasDocuments = documentCount > 0;
	let statusText = 'No documents';

	if (hasDocuments) {
		if (documentCount === 1) {
			statusText = '1 document';
		} else {
			statusText = `${documentCount} documents`;
		}
	}

	return documentationFolderTableItem({
		id,
		text: 'Redetermination documents',
		statusText,
		receivedText: 'Not applicable',
		actionHtml: folderId
			? actionsHtml({
					id,
					text: 'Redetermination documents',
					hasDocuments,
					link: `${currentRoute}/supporting-documents`,
					editable: userHasPermission(permissionNames.updateCase, session),
					folderId
				})
			: '',
		actionHtmlClasses: 'govuk-!-width-one-quarter'
	});
};
