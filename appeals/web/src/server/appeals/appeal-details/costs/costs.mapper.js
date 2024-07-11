import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 *
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('@pins/appeals.api').Appeals.FolderInfo} decisionDocumentFolder
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {string} [documentId]
 * @returns {PageContent}
 */
export function decisionCheckAndConfirmPage(
	appealDetails,
	decisionDocumentFolder,
	session,
	documentId
) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Check your answers - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/costs/decision/add-document-details/${decisionDocumentFolder.folderId}`,
		heading: 'Check your answers',
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					rows: [
						{
							key: {
								text: documentId ? 'Updated costs decision' : 'Costs decision'
							},
							value: {
								html: `<ul class="govuk-list"><li>${session.fileUploadInfo
									?.map(
										(/** @type {import('#lib/ts-utilities.js').FileUploadInfoItem} */ document) =>
											document.name
									)
									.join('</li><li>')}</li></ul>`
							},
							actions: {
								items: [
									{
										text: 'Change',
										href: `/appeals-service/appeal-details/${appealDetails.appealId}/costs/decision/upload-documents/${decisionDocumentFolder.folderId}`
									}
								]
							}
						}
					]
				}
			},
			{
				type: 'warning-text',
				parameters: {
					text: 'You must email the relevant parties to inform them of the decision.'
				}
			},
			{
				type: 'checkboxes',
				parameters: {
					name: 'confirm',
					items: [
						{
							text: 'I will email the relevant parties',
							value: 'yes'
						}
					]
				}
			}
		]
	};

	return pageContent;
}
