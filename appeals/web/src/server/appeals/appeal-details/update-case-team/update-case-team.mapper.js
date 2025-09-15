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
	const mappedTeamList = [
		{ value: '', text: '' },
		...teamList.map((team) => ({
			value: team.id,
			text: team.email ? `${team.name} (${team.email})` : team.name
		}))
	];

	/** @type {PageComponent} */
	const selectSearchPageComponent = {
		type: 'select',
		parameters: {
			name: 'case-team',
			id: 'case-team',
			label: {
				classes: 'govuk-fieldset__legend--l',
				text: `Case team`,
				isPageHeading: true
			},
			value: '',
			items: mappedTeamList,
			attributes: { 'data-cy': 'search-case-team' },
			classes: 'accessible-autocomplete',
			errorMessage: errors && errors['case-team']?.msg && { text: errors['case-team']?.msg }
		}
	};

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Update case team - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference} - update case team`,
		submitButtonText: 'Continue',
		pageComponents: [selectSearchPageComponent]
	};

	return pageContent;
}

/**
 *
 * @param {number} appealId
 * @param {(import('@pins/appeals.api').Api.CaseTeam)} team
 * @param {string} appealReference
 * @returns {PageContent}
 */
export function checkAndConfirmPage(appealId, team, appealReference) {
	const mappedTeam = mapTeamText(team);

	/** @type {PageComponent} */

	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Case team'
					},
					value: {
						html: mappedTeam
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealId}/case-team/edit`,
								visuallyHiddenText: 'Change team'
							}
						]
					}
				}
			]
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: 'Check answers',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/case-team/edit`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Check details and update case team',
		submitButtonProperties: {
			text: 'Update case team',
			type: 'submit'
		},
		pageComponents: [summaryListComponent]
	};

	return pageContent;
}

/**
 * @param {(import('@pins/appeals.api').Api.CaseTeam)} team
 * @returns {string} The formatted team name and email.
 */
export const mapTeamText = (team) => {
	const renderedText =
		team.id === 0
			? `Not assigned<br>This will remove the current case team from the appeal`
			: team.email
			? `${team.name}<br>${team.email}`
			: `${team.name}`;
	return renderedText;
};
