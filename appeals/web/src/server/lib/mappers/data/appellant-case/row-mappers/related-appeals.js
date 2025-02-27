import { formatListOfRelatedAppeals } from '#lib/display-page-formatter.js';
import { displayComponentGivenPermission } from '#lib/mappers/utils/permissions.mapper.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapRelatedAppeals = ({ currentRoute, userHasUpdateCase, appealDetails }) => {
	const actionItems = [];

	if (appealDetails.otherAppeals.length) {
		actionItems.push(
			displayComponentGivenPermission(userHasUpdateCase, {
				text: 'Manage',
				href: `${currentRoute}/other-appeals/manage`,
				visuallyHiddenText: 'Related appeals',
				attributes: { 'data-cy': 'manage-related-appeals' }
			})
		);
	}

	actionItems.push(
		displayComponentGivenPermission(userHasUpdateCase, {
			text: 'Add',
			href: `${currentRoute}/other-appeals/add`,
			visuallyHiddenText: 'Related appeals',
			attributes: { 'data-cy': 'add-related-appeals' }
		})
	);

	return {
		id: 'related-appeals',
		display: {
			summaryListItem: {
				key: {
					text: 'Related appeals'
				},
				value: {
					html: formatListOfRelatedAppeals(appealDetails.otherAppeals) || 'No related appeals'
				},
				actions: {
					items: actionItems
				},
				classes: 'appeal-related-appeals'
			}
		}
	};
};
