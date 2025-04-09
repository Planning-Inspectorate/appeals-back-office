import { surnameFirstToFullName } from '#lib/person-name-formatter.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

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

	return textSummaryListItem({
		id: 'inspector',
		text: 'Inspector',
		value: {
			html: inspectorRowValue
		},
		link: `${currentRoute}/assign-user/inspector`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-inspector',
		actionText: appealDetails.inspector ? 'Change' : 'Assign'
	});
};
