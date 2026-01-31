import { formatListOfRelatedAppeals } from '#lib/display-page-formatter.js';
import { displayComponentGivenPermission } from '#lib/mappers/utils/permissions.mapper.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapRelatedAppeals = ({
	currentRoute,
	userHasUpdateCase,
	appealDetails,
	appellantCaseData
}) => {
	const actionItems = [];

	if (!appellantCaseData.isEnforcementChild) {
		if (appealDetails.otherAppeals.length) {
			actionItems.push(
				displayComponentGivenPermission(userHasUpdateCase, {
					text: 'Change',
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
				visuallyHiddenText: 'Are there other appeals linked to your development?',
				attributes: { 'data-cy': 'add-related-appeals' }
			})
		);
	}

	return {
		id: 'related-appeals',
		display: {
			summaryListItem: {
				key: {
					text: 'Are there other appeals linked to your development?'
				},
				value: {
					html: formatListOfRelatedAppeals(appealDetails.otherAppeals)
				},
				actions: {
					items: actionItems
				},
				classes: 'appeal-related-appeals'
			}
		}
	};
};
