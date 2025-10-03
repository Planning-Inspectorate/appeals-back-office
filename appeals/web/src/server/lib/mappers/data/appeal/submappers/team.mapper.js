import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCaseTeam = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	const teamAssigned =
		appealDetails.assignedTeam?.name === null && appealDetails.assignedTeam?.email === null
			? false
			: true;
	const teamRowValue = `
        <ul class="govuk-list">
            ${appealDetails.assignedTeam?.name ? `<li>${appealDetails.assignedTeam.name}</li>` : ``}
			${appealDetails.assignedTeam?.email ? `<li>${appealDetails.assignedTeam.email}</li>` : ``}
			${
				!appealDetails.assignedTeam?.email && !appealDetails.assignedTeam?.name
					? `<li>Not assigned</li>`
					: ``
			}
        </ul>
    `.trim();

	const teamRoute = 'case-team';

	return textSummaryListItem({
		id: 'case-team',
		text: 'Case team',
		value: {
			html: teamRowValue
		},
		link: `${currentRoute}/${teamRoute}/edit`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-case-team',
		actionText: teamAssigned ? 'Change' : 'Assign'
	});
};
