/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsLpaCorrespondence = ({ appealDetails, currentRoute }) => {
	const appealHasLPACorrespondenceCostsDocuments =
		appealDetails?.costs?.lpaCorrespondenceFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	return {
		id: 'costs-lpa-correspondence',
		display: {
			tableItem: [
				{
					text: 'LPA correspondence',
					classes: 'appeal-costs-lpa-correspondence-documentation'
				},
				{
					text: appealHasLPACorrespondenceCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-lpa-correspondence-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
					${
						appealHasLPACorrespondenceCostsDocuments
							? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/lpa/correspondence/manage-documents/${appealDetails?.costs?.lpaCorrespondenceFolder?.folderId}">Manage</a></li>`
							: ''
					}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-lpa" href="${currentRoute}/costs/lpa/correspondence/upload-documents/${
						appealDetails?.costs?.lpaCorrespondenceFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-lpa-correspondence-actions'
				}
			]
		}
	};
};
