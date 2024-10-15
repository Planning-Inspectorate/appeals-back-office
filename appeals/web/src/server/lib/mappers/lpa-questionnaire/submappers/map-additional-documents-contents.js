import { formatDocumentValues } from '#lib/display-page-formatter.js';
import { isFolderInfo } from '#lib/ts-utilities.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapAdditionalDocumentsContents = ({ lpaQuestionnaireData }) => ({
	id: 'additional-documents-contents',
	display: {
		...((isFolderInfo(lpaQuestionnaireData.documents.lpaCaseCorrespondence)
			? lpaQuestionnaireData.documents.lpaCaseCorrespondence.documents || []
			: []
		).length > 0
			? {
					summaryListItems: (isFolderInfo(lpaQuestionnaireData.documents.lpaCaseCorrespondence)
						? lpaQuestionnaireData.documents.lpaCaseCorrespondence.documents || []
						: []
					).map(
						(
							/** @type {import('@pins/appeals.api/src/server/endpoints/appeals.js').DocumentInfo} */ document
						) => ({
							key: {
								text: 'Additional documents',
								classes: 'govuk-visually-hidden'
							},
							value: formatDocumentValues(
								lpaQuestionnaireData.appealId,
								[document],
								document.latestDocumentVersion?.isLateEntry || false
							),
							actions: {
								items: []
							}
						})
					)
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
