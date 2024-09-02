/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsAppellantCorrespondence = ({ appealDetails, currentRoute }) => {
	const appealHasAppellantCorrespondenceCostsDocuments =
		appealDetails?.costs?.appellantCorrespondenceFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	return {
		id: 'costs-appellant-correspondence',
		display: {
			tableItem: [
				{
					text: 'Appellant correspondence',
					classes: 'appeal-costs-appellant-correspondence-documentation'
				},
				{
					text: appealHasAppellantCorrespondenceCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-appellant-correspondence-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
					${
						appealHasAppellantCorrespondenceCostsDocuments
							? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/appellant/correspondence/manage-documents/${appealDetails?.costs?.appellantCorrespondenceFolder?.folderId}">Manage</a></li>`
							: ''
					}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-appeallant" href="${currentRoute}/costs/appellant/correspondence/upload-documents/${
						appealDetails?.costs?.appellantCorrespondenceFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-appellant-correspondence-actions'
				}
			]
		}
	};
};
