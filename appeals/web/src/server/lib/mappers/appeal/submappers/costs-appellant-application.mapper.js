/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsAppellantApplication = ({ appealDetails, currentRoute }) => {
	const appealHasAppellantApplicationCostsDocuments =
		appealDetails?.costs?.appellantApplicationFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	return {
		id: 'costs-appellant-application',
		display: {
			tableItem: [
				{
					text: 'Appellant application',
					classes: 'appeal-costs-appellant-application-documentation'
				},
				{
					text: appealHasAppellantApplicationCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-appellant-application-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
					${
						appealHasAppellantApplicationCostsDocuments
							? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/appellant/application/manage-documents/${appealDetails?.costs?.appellantApplicationFolder?.folderId}">Manage</a></li>`
							: ''
					}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-appeallant" href="${currentRoute}/costs/appellant/application/upload-documents/${
						appealDetails?.costs?.appellantApplicationFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-appellant-application-actions'
				}
			]
		}
	};
};
