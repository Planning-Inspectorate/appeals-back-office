/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsLpaApplication = ({ appealDetails, currentRoute }) => {
	const appealHasLPAApplicationCostsDocuments =
		appealDetails?.costs?.lpaApplicationFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	return {
		id: 'costs-lpa-application',
		display: {
			tableItem: [
				{
					text: 'LPA application',
					classes: 'appeal-costs-lpa-application-documentation'
				},
				{
					text: appealHasLPAApplicationCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-lpa-application-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
					${
						appealHasLPAApplicationCostsDocuments
							? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/lpa/application/manage-documents/${appealDetails?.costs?.lpaApplicationFolder?.folderId}">Manage</a></li>`
							: ''
					}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-lpa" href="${currentRoute}/costs/lpa/application/upload-documents/${
						appealDetails?.costs?.lpaApplicationFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-lpa-application-actions'
				}
			]
		}
	};
};
