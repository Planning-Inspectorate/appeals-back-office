import config from '#environment/config.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { capitalize } from 'lodash-es';
import usersService from '../../appeal-users/users-service.js';

/** @typedef {import('../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 */
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

	const unassignUser = {
		value: JSON.stringify({ id: '0', name: 'Unassign', email: 'Unassign' }),
		text: 'Unassign'
	};
	const removeUser = {
		value: JSON.stringify({ id: '0', name: 'Remove', email: 'Remove' }),
		text: 'Remove'
	};

	isInspector && appealDetails?.inspector ? userArray.push(unassignUser, removeUser) : null;

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
				text: userTypeText == 'inspector' ? `Find an ${userTypeText}` : `Find a ${userTypeText}`,
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
		preHeading: `Appeal ${shortAppealReference}  - assign ${userTypeText}`,
		pageComponents: [selectSearchPageComponent, searchButtonPageComponent]
	};

	return pageContent;
}

/**

 * @param {number} appealId
 * @param {User} user
 * @param {string} appealReference
 * @param {string} baseUrl - The base URL of the page.
 * @returns {PageContent}
 */
export function checkAndConfirmPage(appealId, user, appealReference, baseUrl) {
	const isInspector = baseUrl.includes('inspector');
	const userTypeText = isInspector ? 'inspector' : 'case officer';
	const mappedUser = mapUserText(user, userTypeText);
	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: capitalize(userTypeText)
					},
					value: {
						html: mappedUser
					}
				}
			]
		}
	};
	const userTypeLink = isInspector ? 'inspector' : 'case-officer';
	/** @type {PageContent} */
	const pageContent = {
		title: 'Check answers',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/assign-${userTypeLink}/search-${userTypeLink}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading:
			user.id == '0' && (user.name === 'Unassign' || user.name === 'Remove')
				? `Check details and unassign ${userTypeText}`
				: `Check details and assign ${userTypeText}`,
		submitButtonProperties: {
			text: `${user.id == '0' ? 'Remove' : 'Assign'} ${userTypeText}`,
			type: 'submit'
		},
		pageComponents: [summaryListComponent]
	};

	return pageContent;
}

/**
 * @param {User} user
 * @param {string} userTypeText - The text to display for the user type.
 * @returns {string} The formatted user's name and email.
 */
export const mapUserText = (user, userTypeText) => {
	const renderedText =
		user.id == '0'
			? `Not assigned<br>This will remove the current case ${userTypeText} from the appeal`
			: user.email
			? `${user.name}<br>${user.email}`
			: `${user.name}`;
	return renderedText;
};
