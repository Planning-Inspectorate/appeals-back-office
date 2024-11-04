import { surnameFirstToFullName } from '#lib/person-name-formatter.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../appeal.mapper.js').SubMapper} */ export const mapInspector = ({
	appealDetails,
	currentRoute,
	skipAssignedUsersData,
	inspectorUser,
	userHasUpdateCasePermission
}) => {
	let inspectorRowValue = '';

	if (inspectorUser && !skipAssignedUsersData) {
		inspectorRowValue = inspectorUser
			? `<ul class="govuk-list"><li>${surnameFirstToFullName(inspectorUser?.name)}</li><li>${
					inspectorUser?.email
			  }</li></ul>`
			: '<p class="govuk-body">An inspector is assigned but their user account was not found</p>';
	}

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
