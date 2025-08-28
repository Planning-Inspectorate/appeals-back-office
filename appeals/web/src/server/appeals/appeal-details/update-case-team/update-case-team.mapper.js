import { appealShortReference } from '#lib/appeals-formatter.js';
/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealDetails
 * @param {(import('@pins/appeals.api').Api.CaseTeams)} teamList
 * @param {Number} caseTeamId
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {Promise<PageContent>}
 */
export async function updateCaseTeam(appealDetails, teamList, caseTeamId, errors) {
	const mappedTeamList = teamList.map((team) => ({
		value: team.id,
		text: team.name,
		hint: { text: team.email }
	}));
	mappedTeamList.push({
		value: 0,
		text: 'Unassign team',
		hint: { text: 'This will remove the current case team from the appeal' }
	});

	/** @type {PageComponent} */
	const selectVisitTypeComponent = {
		type: 'radios',
		parameters: {
			name: 'case-team',
			idPrefix: 'case-team',
			fieldset: {
				legend: {
					text: 'Case team',
					classes: 'govuk-fieldset__legend--m'
				}
			},
			value: caseTeamId,
			items: mappedTeamList,
			errorMessage: errors && errors['case-team']?.msg && { text: errors['case-team']?.msg }
		}
	};

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Update case team - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference} - update case team`,
		heading: `Update case team`,
		submitButtonText: 'Continue',
		pageComponents: [selectVisitTypeComponent]
	};

	return pageContent;
}
