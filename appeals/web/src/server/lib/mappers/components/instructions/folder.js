/**
 * Returns the instructions for a costs folder table item
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {string} [options.statusText]
 * @param {string} options.link
 * @param {boolean} [options.editable]
 * @param {import('@pins/appeals.api').Appeals.FolderInfo|null|undefined} options.folderInfo
 * @returns {Instructions}
 */
export function costsFolderTableItem({
	id,
	text,
	statusText = 'Received',
	link,
	folderInfo,
	editable = false
}) {
	const hasDocuments =
		folderInfo?.documents &&
		folderInfo.documents.filter((doc) => !doc.latestDocumentVersion?.isDeleted).length > 0;
	const folderId = folderInfo?.folderId;

	let actionsHtmls = `<ul class="govuk-summary-list__actions-list">`;

	if (hasDocuments) {
		actionsHtmls += listItemLink(link + '/manage-documents/' + folderId, 'Manage');
	}
	if (editable) {
		actionsHtmls += listItemLink(link + '/upload-documents/' + folderId, 'Add', 'add-' + id);
	}
	actionsHtmls += `</ul>`;

	return {
		id,
		display: {
			tableItem: [
				{
					text,
					classes: `appeal-${id}-documentation`
				},
				{
					text: hasDocuments ? statusText : 'No documents available',
					classes: `appeal-${id}-status`
				},
				{
					html: actionsHtmls,
					classes: `appeal-${id}-actions`
				}
			]
		}
	};
}

/**
 * @param {string} link
 * @param {string} text
 * @param {string} [cypressDataName]
 * @returns {string}
 */
function listItemLink(link, text, cypressDataName) {
	const dataCy = cypressDataName ? `data-cy="${cypressDataName}" ` : '';
	return (
		`<li class="govuk-summary-list__actions-list-item">` +
		`<a class="govuk-link" ${dataCy}href="${link}">` +
		text +
		`</a></li>`
	);
}
