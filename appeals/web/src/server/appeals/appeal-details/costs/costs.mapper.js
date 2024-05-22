import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {Object} CostsDocumentType
 * @property {string} value
 * @property {string} name
 */

/**
 *
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {CostsDocumentType[]} documentTypes
 * @returns {PageContent}
 */
export function addDocumentTypePage(appealDetails, documentTypes) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `What is the document type? - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		heading: 'What is the document type?',
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'costs-document-type',
					value: 'costs-document-type',
					items: documentTypes.map((documentType) => ({
						value: documentType.value,
						text: documentType.name
					}))
				}
			}
		]
	};

	return pageContent;
}

/**
 *
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('@pins/appeals.api').Appeals.SingleFolderResponse} decisionDocumentFolder
 * @returns {PageContent}
 */
export function decisionCheckAndConfirmPage(appealDetails, decisionDocumentFolder) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Costs decision'
					},
					value: {
						html: `<ul class="govuk-list"><li>${(decisionDocumentFolder.documents || [])
							.map(
								(document) =>
									`<a class="govuk-link" href="/documents/${appealDetails.appealId}/download/${document.id}/preview/">${document.name}</a>`
							)
							.join('</li><li>')}</li></ul>`
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/costs/decision/upload-documents/${decisionDocumentFolder.id}`
							}
						]
					}
				}
			]
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: `Check your answers - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/costs/decision/upload-documents/${decisionDocumentFolder.id}`,
		heading: 'Check your answers',
		pageComponents: [
			...(decisionDocumentFolder.documents && decisionDocumentFolder.documents.length > 0
				? [summaryListComponent]
				: []),
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
