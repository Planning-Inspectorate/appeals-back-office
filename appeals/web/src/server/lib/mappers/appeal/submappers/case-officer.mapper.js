import { surnameFirstToFullName } from '#lib/person-name-formatter.js';

/** @type {import('../appeal.mapper.js').SubMapper} */ export const mapCaseOfficer = ({
	appealDetails,
	currentRoute,
	skipAssignedUsersData,
	caseOfficerUser
}) => {
	let caseOfficerRowValue = '';

	if (caseOfficerUser && !skipAssignedUsersData) {
		caseOfficerRowValue = caseOfficerUser
			? `<ul class="govuk-list"><li>${surnameFirstToFullName(caseOfficerUser?.name)}</li><li>${
					caseOfficerUser?.email
			  }</li></ul>`
			: '<p class="govuk-body">A case officer is assigned but their user account was not found';
	}

	return {
		id: 'case-officer',
		display: {
			summaryListItem: {
				key: {
					text: 'Case officer'
				},
				value: {
					html: caseOfficerRowValue
				},
				actions: {
					items: [
						{
							text: appealDetails.caseOfficer ? 'Change' : 'Assign',
							href: `${currentRoute}/assign-user/case-officer`,
							visuallyHiddenText: 'case officer',
							attributes: {
								'data-cy': (appealDetails.caseOfficer ? 'change' : 'assign') + '-case-officer'
							}
						}
					]
				},
				classes: 'appeal-case-officer'
			}
		}
	};
};
