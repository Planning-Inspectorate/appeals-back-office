import usersService from '../../appeal-users/users-service.js';
import config from '#environment/config.js';
import { appealShortReference } from '#lib/appeals-formatter.js';

/** @typedef {import('../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth */

/**
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {boolean} isInspector
 * @param {SessionWithAuth} session
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {Promise<PageContent>}
 */
export async function assignUserPage(appealDetails, isInspector, session, errors = undefined) {
	const userTypeText = isInspector ? 'inspector' : 'case officer';
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	const users = await usersService.getUsersByRole(
		isInspector
			? config.referenceData.appeals.inspectorGroupId
			: config.referenceData.appeals.caseOfficerGroupId,
		session
	);

	const userArray = [
		{ value: '', text: '' },
		...users
			.filter((user) => user.email && user.name)
			.map((user) => ({
				value: JSON.stringify(user),
				text: `${user.name} (${user.email})`
			}))
	];

	/** @type {PageComponent} */
	const selectSearchPageComponent = {
		type: 'select',
		wrapperHtml: {
			opening: '<form method="post" novalidate class="govuk-!-margin-bottom-5">',
			closing: ''
		},
		parameters: {
			name: 'user',
			id: 'users',
			label: {
				classes: 'govuk-fieldset__legend--l',
				text: `Search for ${userTypeText} by name or email address`,
				isPageHeading: true
			},
			value: '',
			items: userArray,
			attributes: { 'data-cy': 'search-users' },
			classes: 'accessible-autocomplete',
			errorMessage: errors
				? {
						text: errors?.user.msg
				  }
				: undefined
		}
	};

	/** @type {PageComponent} */
	const searchButtonPageComponent = {
		type: 'button',
		wrapperHtml: {
			opening: '',
			closing: '</form>'
		},
		parameters: {
			text: 'Continue'
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: `Search for ${userTypeText} by name or email address`,
		backLinkText: 'Back',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}  - Assign ${userTypeText}`,
		pageComponents: [selectSearchPageComponent, searchButtonPageComponent]
	};

	return pageContent;
}
