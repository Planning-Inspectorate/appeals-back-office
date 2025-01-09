/**
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {boolean} [options.hasDocuments]
 * @param {string} options.link
 * @param {boolean} [options.editable]
 * @param {number | undefined} options.folderId
 * @returns {string}
 */
export function actionsHtml({
	id,
	text = '',
	hasDocuments = false,
	link,
	editable = false,
	folderId
}) {
	let actionsHtmls = `<ul class="govuk-summary-list__actions-list">`;

	if (hasDocuments) {
		actionsHtmls += listItemLink(link + '/manage-documents/' + folderId, 'Manage', text);
	}
	if (editable) {
		actionsHtmls += listItemLink(link + '/upload-documents/' + folderId, 'Add', text, 'add-' + id);
	}
	actionsHtmls += `</ul>`;
	return actionsHtmls;
}

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
					html: actionsHtml({ id, text, hasDocuments, link, editable, folderId }),
					classes: `appeal-${id}-actions govuk-!-text-align-right`
				}
			]
		}
	};
}

/**
 * Returns the instructions for a costs folder table item
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {string} [options.textClasses]
 * @param {string} options.statusText
 * @param {string} [options.statusTextClasses]
 * @param {string} options.receivedText
 * @param {string} [options.receivedTextClasses]
 * @param {string} options.actionHtml
 * @param {string} [options.actionHtmlClasses]
 * @returns {Instructions}
 */
export function documentationFolderTableItem({
	id,
	text,
	textClasses,
	statusText,
	statusTextClasses,
	receivedText,
	receivedTextClasses,
	actionHtml,
	actionHtmlClasses
}) {
	return {
		id,
		display: {
			tableItem: [
				{
					text,
					...(textClasses && {
						classes: textClasses
					})
				},
				{
					text: statusText,
					...(statusTextClasses && {
						classes: statusTextClasses
					})
				},
				{
					text: receivedText,
					...(receivedTextClasses && {
						classes: receivedTextClasses
					})
				},
				{
					html: actionHtml,
					classes: `govuk-!-text-align-right${actionHtmlClasses ? ` ${actionHtmlClasses}` : ''}`
				}
			]
		}
	};
}

/**
 * @param {string} link
 * @param {string} text
 * @param {string} hiddenText
 * @param {string} [cypressDataName]
 * @returns {string}
 */
export function listItemLink(link, text, hiddenText, cypressDataName) {
	const dataCy = cypressDataName ? `data-cy="${cypressDataName}" ` : '';
	return (
		`<li class="govuk-summary-list__actions-list-item">` +
		`<a class="govuk-link" ${dataCy}href="${link}">` +
		text +
		`<span class="govuk-visually-hidden"> ${hiddenText}</span>` +
		`</a></li>`
	);
}
