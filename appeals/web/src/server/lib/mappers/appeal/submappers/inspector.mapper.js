import { surnameFirstToFullName } from '#lib/person-name-formatter.js';

/** @type {import('../appeal.mapper.js').SubMapper} */ export const mapInspector = ({
	appealDetails,
	currentRoute,
	skipAssignedUsersData,
	inspectorUser
}) => {
	let inspectorRowValue = '';

	if (inspectorUser && !skipAssignedUsersData) {
		inspectorRowValue = inspectorUser
			? `<ul class="govuk-list"><li>${surnameFirstToFullName(inspectorUser?.name)}</li><li>${
					inspectorUser?.email
			  }</li></ul>`
			: '<p class="govuk-body">An inspector is assigned but their user account was not found';
	}

	return {
		id: 'inspector',
		display: {
			summaryListItem: {
				key: {
					text: 'Inspector'
				},
				value: {
					html: inspectorRowValue
				},
				actions: {
					items: [
						{
							text: appealDetails.inspector ? 'Change' : 'Assign',
							href: `${currentRoute}/assign-user/inspector`,
							visuallyHiddenText: 'inspector',
							attributes: {
								'data-cy': (appealDetails.inspector ? 'change' : 'assign') + '-inspector'
							}
						}
					]
				},
				classes: 'appeal-inspector'
			}
		}
	};
};
