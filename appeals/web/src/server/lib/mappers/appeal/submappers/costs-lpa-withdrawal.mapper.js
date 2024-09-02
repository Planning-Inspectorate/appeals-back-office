/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsLpaWithdrawal = ({ appealDetails, currentRoute }) => {
	const appealHasLPAWithdrawalCostsDocuments =
		appealDetails?.costs?.lpaWithdrawalFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	return {
		id: 'costs-lpa-withdrawal',
		display: {
			tableItem: [
				{
					text: 'LPA withdrawal',
					classes: 'appeal-costs-lpa-withdrawal-documentation'
				},
				{
					text: appealHasLPAWithdrawalCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-lpa-withdrawal-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
					${
						appealHasLPAWithdrawalCostsDocuments
							? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/lpa/withdrawal/manage-documents/${appealDetails?.costs?.lpaWithdrawalFolder?.folderId}">Manage</a></li>`
							: ''
					}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-lpa" href="${currentRoute}/costs/lpa/withdrawal/upload-documents/${
						appealDetails?.costs?.lpaWithdrawalFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-lpa-withdrawal-actions'
				}
			]
		}
	};
};
