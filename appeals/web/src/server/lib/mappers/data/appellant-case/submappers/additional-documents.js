import { formatDocumentValues } from '#lib/display-page-formatter.js';
import { isFolderInfo } from '#lib/ts-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAdditionalDocuments = ({ appellantCaseData }) => ({
	id: 'additional-documents',
	display: {
		...((isFolderInfo(appellantCaseData.documents.appellantCaseCorrespondence)
			? appellantCaseData.documents.appellantCaseCorrespondence.documents || []
			: []
		).length > 0
			? {
					summaryListItems: [
						{
							key: {
								text: 'Additional documents',
								classes: 'govuk-visually-hidden'
							},
							value: formatDocumentValues(
								appellantCaseData.appealId,
								isFolderInfo(appellantCaseData.documents.appellantCaseCorrespondence)
									? appellantCaseData.documents.appellantCaseCorrespondence.documents || []
									: [],
								true
							),
							actions: {
								items: []
							}
						}
					]
			  }
			: {
					summaryListItems: [
						{
							key: {
								text: 'Additional documents',
								classes: 'govuk-visually-hidden'
							},
							value: {
								text: 'No documents available'
							}
						}
					]
			  })
	}
});
