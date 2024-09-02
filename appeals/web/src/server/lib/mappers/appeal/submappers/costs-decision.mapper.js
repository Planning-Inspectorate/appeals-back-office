/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsDecision = ({ appealDetails, currentRoute }) => {
	const appealHasCostsDecisionDocuments = appealDetails?.costs?.decisionFolder?.documents?.filter(
		(document) => document.latestDocumentVersion?.isDeleted === false
	).length;

	return {
		id: 'costs-decision',
		display: {
			tableItem: [
				{
					text: 'Costs decision',
					classes: 'appeal-costs-decision-documentation'
				},
				{
					text: appealHasCostsDecisionDocuments ? 'Uploaded' : '',
					classes: 'appeal-costs-decision-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
						${
							appealHasCostsDecisionDocuments
								? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/decision/manage-documents/${appealDetails?.costs?.decisionFolder?.folderId}">Manage</a></li>`
								: ''
						}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-decision" href="${currentRoute}/costs/decision/upload-documents/${
						appealDetails?.costs?.decisionFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-decision-actions'
				}
			]
		}
	};
};
