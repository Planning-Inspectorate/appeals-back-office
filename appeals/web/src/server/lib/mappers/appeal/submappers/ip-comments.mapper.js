import { mapDocumentStatus } from '#lib/display-page-formatter.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapIpComments = ({ appealDetails, currentRoute }) => {
	return {
		id: 'ip-comments',
		display: {
			tableItem: [
				{
					text: 'Interested party comments'
				},
				{
					text: mapDocumentStatus(appealDetails?.documentationSummary?.ipComments?.status)
				},
				{
					text: 'Not applicable'
				},
				{
					html:
						appealDetails?.documentationSummary?.ipComments?.status === 'received'
							? `<a href="${currentRoute}/interested-party-comments" data-cy="review-ip-comments" class="govuk-link">Review <span class="govuk-visually-hidden">I P comments</span></a>`
							: `<a href="${currentRoute}/interested-party-comments" data-cy="review-ip-comments" class="govuk-link">Add <span class="govuk-visually-hidden">I P comments</span></a>`
				}
			]
		}
	};
};
