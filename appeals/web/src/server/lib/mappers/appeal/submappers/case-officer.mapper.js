import { surnameFirstToFullName } from '#lib/person-name-formatter.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../appeal.mapper.js').SubMapper} */ export const mapCaseOfficer = ({
	appealDetails,
	currentRoute,
	skipAssignedUsersData,
	caseOfficerUser,
	userHasUpdateCasePermission
}) => {
	let caseOfficerRowValue = '';

	if (caseOfficerUser && !skipAssignedUsersData) {
		caseOfficerRowValue = caseOfficerUser
			? `<ul class="govuk-list"><li>${surnameFirstToFullName(caseOfficerUser?.name)}</li><li>${
					caseOfficerUser?.email
			  }</li></ul>`
			: '<p class="govuk-body">A case officer is assigned but their user account was not found</p>';
	}
	return textSummaryListItem({
		id: 'case-officer',
		text: 'Case officer',
		value: {
			html: caseOfficerRowValue
		},
		link: `${currentRoute}/assign-user/case-officer`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-case-officer',
		actionText: appealDetails.caseOfficer ? 'Change' : 'Assign'
	});
};
