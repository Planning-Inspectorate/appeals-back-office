import usersService from '#appeals/appeal-users/users-service.js';
import config from '#environment/config.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { capitalize } from 'lodash-es';
/** @typedef {import('#app/auth/auth.service.js').AccountInfo} AccountInfo */

/**
 * @return {Promise<PageContent>}
 * @param session {import('#app/auth/auth-session.service.js').SessionWithAuth}
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {string} backLinkUrl
 */

export async function searchCaseOfficerPage(session, backLinkUrl, errors) {
	const userTypeText = 'case officer';
	const users = await usersService.getUsersByRole(
		config.referenceData.appeals.caseOfficerGroupId,
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
				text: `${capitalize(userTypeText)}`,
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
			text: 'Update case officer'
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: `Search for case officer by name or email address`,
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl,
		pageComponents: [selectSearchPageComponent, searchButtonPageComponent]
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}
