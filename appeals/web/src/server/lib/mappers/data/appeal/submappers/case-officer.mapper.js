import { surnameFirstToFullName } from '#lib/person-name-formatter.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCaseOfficer = ({
	appealDetails,
	currentRoute,
	skipAssignedUsersData,
	caseOfficerUser,
	userHasUpdateCasePermission
}) => {
	const caseOfficerRowValue = (() => {
		if (skipAssignedUsersData) {
			return '';
		}

		if (!caseOfficerUser) {
			return '<p class="govuk-body">Not assigned</p>';
		}

		return `<ul class="govuk-list"><li>${surnameFirstToFullName(caseOfficerUser.name)}</li><li>${
			caseOfficerUser.email
		}</li></ul>`;
	})();

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
