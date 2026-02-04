import { formatDocumentValues } from '#lib/display-page-formatter.js';
import { isFolderInfo } from '#lib/ts-utilities.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapAdditionalDocumentsContents = ({ lpaQuestionnaireData }) => ({
	id: 'additional-documents-contents',
	display: {
		...((isFolderInfo(lpaQuestionnaireData.documents.lpaCaseCorrespondence)
			? lpaQuestionnaireData.documents.lpaCaseCorrespondence.documents || []
			: []
		).length > 0
			? {
					summaryListItems: [
						{
							key: {
								text: 'Additional documents',
								classes: 'govuk-visually-hidden'
							},
							value: formatDocumentValues({
								appealId: lpaQuestionnaireData.appealId,
								documents: isFolderInfo(lpaQuestionnaireData.documents.lpaCaseCorrespondence)
									? lpaQuestionnaireData.documents.lpaCaseCorrespondence.documents || []
									: [],
								isAdditionalDocuments: true
							}),
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
								text: 'None'
							}
						}
					]
				})
	}
});
