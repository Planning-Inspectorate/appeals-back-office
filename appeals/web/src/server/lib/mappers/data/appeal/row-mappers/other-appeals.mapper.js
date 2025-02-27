import * as displayPageFormatter from '#lib/display-page-formatter.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapOtherAppeals = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	const otherAppealsItems = [];

	if (userHasUpdateCasePermission) {
		if (appealDetails.otherAppeals.length) {
			otherAppealsItems.push({
				text: 'Manage',
				href: `${currentRoute}/other-appeals/manage`,
				visuallyHiddenText: 'Related appeals',
				attributes: { 'data-cy': 'manage-related-appeals' }
			});
		}

		otherAppealsItems.push({
			text: 'Add',
			href: `${currentRoute}/other-appeals/add`,
			visuallyHiddenText: 'Related appeals',
			attributes: { 'data-cy': 'add-related-appeals' }
		});
	}

	return {
		id: 'other-appeals',
		display: {
			summaryListItem: {
				key: {
					text: 'Related appeals'
				},
				value: {
					html:
						displayPageFormatter.formatListOfRelatedAppeals(appealDetails.otherAppeals || []) ||
						'<span>No related appeals</span>'
				},
				actions: {
					items: otherAppealsItems
				},
				classes: 'appeal-other-appeals'
			}
		}
	};
};
