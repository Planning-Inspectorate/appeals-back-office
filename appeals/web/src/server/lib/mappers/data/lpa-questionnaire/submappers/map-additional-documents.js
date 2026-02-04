import { permissionNames } from '#environment/permissions.js';
import { formatDocumentActionLink } from '#lib/display-page-formatter.js';
import { mapActionComponent } from '#lib/mappers/index.js';
import { isFolderInfo } from '#lib/ts-utilities.js';
import { buildDocumentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';
import { mapAdditionalDocumentsContents } from './map-additional-documents-contents.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapAdditionalDocuments = ({ lpaQuestionnaireData, session, ...params }) => ({
	id: 'additional-documents',
	display: {
		cardItem: {
			classes: 'pins-summary-list--fullwidth-value',
			attributes: {
				id: 'additional-documents'
			},
			card: {
				title: {
					text: 'Additional documents'
				},
				actions: {
					items:
						(isFolderInfo(lpaQuestionnaireData.documents.lpaCaseCorrespondence)
							? lpaQuestionnaireData.documents.lpaCaseCorrespondence.documents
							: []
						).length > 0
							? [
									mapActionComponent(permissionNames.updateCase, session, {
										text: 'Manage',
										visuallyHiddenText: 'additional documents',
										href: mapDocumentManageUrl(
											lpaQuestionnaireData.appealId,
											lpaQuestionnaireData.lpaQuestionnaireId,
											(isFolderInfo(lpaQuestionnaireData.documents.lpaCaseCorrespondence) &&
												lpaQuestionnaireData.documents.lpaCaseCorrespondence.folderId) ||
												undefined
										)
									}),
									mapActionComponent(permissionNames.updateCase, session, {
										text: 'Add',
										visuallyHiddenText: 'additional documents',
										href: formatDocumentActionLink(
											lpaQuestionnaireData.appealId,
											lpaQuestionnaireData.documents.lpaCaseCorrespondence,
											buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId)
										)
									})
								]
							: [
									mapActionComponent(permissionNames.updateCase, session, {
										text: 'Add',
										visuallyHiddenText: 'additional documents',
										href: formatDocumentActionLink(
											lpaQuestionnaireData.appealId,
											lpaQuestionnaireData.documents.lpaCaseCorrespondence,
											buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId)
										)
									})
								]
				}
			},
			rows: mapAdditionalDocumentsContents({ lpaQuestionnaireData, session, ...params }).display
				.summaryListItems
		}
	}
});
