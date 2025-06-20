import usersService from '../../appeal-users/users-service.js';
import config from '#environment/config.js';
import { appealShortReference } from '#lib/appeals-formatter.js';

/** @typedef {import('../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth */

/**
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {boolean} isInspector
 * @param {SessionWithAuth} session
 * @returns {Promise<PageContent>}
 */
export async function assignUserPage(appealDetails, isInspector, session) {
	const userTypeText = isInspector ? 'inspector' : 'case officer';
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	const users = await usersService.getUsersByRole(
		isInspector
			? config.referenceData.appeals.inspectorGroupId
			: config.referenceData.appeals.caseOfficerGroupId,
		session
	);

	const userArray = [
		{ value: { id: '', name: '', email: '' }, text: '' },
		...users
			.filter((user) => user.email && user.name)
			.map((user) => ({
				value: user,
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
			name: 'users',
			id: 'users',
			label: {
				classes: 'govuk-fieldset__legend--l',
				text: 'Search for case officer by name or email address',
				isPageHeading: true
			},
			value: 'all',
			items: userArray,
			attributes: { 'data-cy': 'search-case-officer' },
			classes: 'accessible-autocomplete'
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

/**
 * @param {string} appealId
 * @param {string} appealReference
 * @param {Object|undefined} user
 * @param {Object|null|undefined} existingUser
 * @param {boolean} isInspector
 * @param {boolean} isUnassign
 * @param {import('@pins/express/types/express.js').ValidationErrors | undefined} errors
 * @returns {import('./assign-user.types.js').AssignUserCheckAndConfirmPageContent}
 */
export function assignOrUnassignUserCheckAndConfirmPage(
	appealId,
	appealReference,
	user,
	existingUser,
	isInspector,
	isUnassign,
	errors
) {
	return {
		appeal: {
			id: appealId,
			reference: appealReference,
			shortReference: appealShortReference(appealReference)
		},
		user,
		existingUser,
		isInspector,
		isUnassign,
		errors
	};
}
