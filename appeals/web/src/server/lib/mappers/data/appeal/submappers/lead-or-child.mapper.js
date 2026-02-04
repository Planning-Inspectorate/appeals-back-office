import { linkedAppealStatus } from '#lib/appeals-formatter.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLeadOrChild = ({ appealDetails }) => ({
	id: 'lead-or-child',
	display:
		appealDetails.linkedAppeals.length > 0
			? {
					statusTag: {
						status: linkedAppealStatus(
							appealDetails.isParentAppeal || false,
							appealDetails.isChildAppeal || false
						),
						classes: 'govuk-!-margin-left-1 govuk-!-margin-bottom-4'
					}
				}
			: {}
});
