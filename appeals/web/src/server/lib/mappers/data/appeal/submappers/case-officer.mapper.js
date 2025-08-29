import config from '#environment/config.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { surnameFirstToFullName } from '#lib/person-name-formatter.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCaseOfficer = ({
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

	const caseOfficerRoute = config.featureFlags.featureFlagSimplifyTeamAssignment
		? 'assign-case-officer/search-case-officer'
		: 'assign-user/case-officer';

	return textSummaryListItem({
		id: 'case-officer',
		text: 'Case officer',
		value: {
			html: caseOfficerRowValue
		},
		link: `${currentRoute}/${caseOfficerRoute}`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-case-officer',
		actionText: caseOfficerUser ? 'Change' : 'Assign'
	});
};
