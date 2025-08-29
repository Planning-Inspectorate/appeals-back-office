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
 *
 * @param {(import('@pins/appeals.api').Api.CaseTeam)} team
 */
export const mapTeamText = (team) => {
	return `${team.name}<br>${team.email}`;
};
