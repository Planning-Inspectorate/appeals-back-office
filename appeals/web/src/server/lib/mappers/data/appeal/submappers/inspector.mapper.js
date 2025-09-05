import config from '#environment/config.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { surnameFirstToFullName } from '#lib/person-name-formatter.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapInspector = ({
	appealDetails,
	currentRoute,
	skipAssignedUsersData,
	inspectorUser,
	userHasUpdateCasePermission
}) => {
	const inspectorRowValue = (() => {
		if (skipAssignedUsersData) {
			return '';
		}

		if (!inspectorUser) {
			return '<p class="govuk-body">Not assigned</p>';
		}

		return `<ul class="govuk-list"><li>${surnameFirstToFullName(inspectorUser.name)}</li><li>${
			inspectorUser.email
		}</li></ul>`;
	})();
	const inspectorRoute = config.featureFlags.featureFlagSimplifyTeamAssignment
		? 'assign-inspector/search-inspector'
		: 'assign-user/inspector';

	return textSummaryListItem({
		id: 'inspector',
		text: 'Inspector',
		value: {
			html: inspectorRowValue
		},
		link: `${currentRoute}/${inspectorRoute}`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-inspector',
		actionText: appealDetails.inspector ? 'Change' : 'Assign'
	});
};
