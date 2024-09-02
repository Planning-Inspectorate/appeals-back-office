/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsAppellantWithdrawal = ({ appealDetails, currentRoute }) => {
	const appealHasAppellantWithdrawalCostsDocuments =
		appealDetails?.costs?.appellantWithdrawalFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	return {
		id: 'costs-appellant-withdrawal',
		display: {
			tableItem: [
				{
					text: 'Appellant withdrawal',
					classes: 'appeal-costs-appellant-withdrawal-documentation'
				},
				{
					text: appealHasAppellantWithdrawalCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-appellant-withdrawal-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
					${
						appealHasAppellantWithdrawalCostsDocuments
							? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/appellant/withdrawal/manage-documents/${appealDetails?.costs?.appellantWithdrawalFolder?.folderId}">Manage</a></li>`
							: ''
					}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-appeallant" href="${currentRoute}/costs/appellant/withdrawal/upload-documents/${
						appealDetails?.costs?.appellantWithdrawalFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-appellant-withdrawal-actions'
				}
			]
		}
	};
};
