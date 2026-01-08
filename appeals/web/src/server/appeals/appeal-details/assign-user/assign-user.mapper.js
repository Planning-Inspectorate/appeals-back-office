import config from '#environment/config.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { capitalize } from 'lodash-es';
import usersService from '../../appeal-users/users-service.js';
import { getPADSList } from './assign-user.service.js';

/** @typedef {import('../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 */
/**
 * @typedef {Object} EmailPersonalisation
 * @property {string} appeal_reference_number
 * @property {string} site_address
 * @property {string} lpa_reference
 * @property {string} team_email_address
 * @property {string} inspector_name
 */
/**
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {boolean} isInspector
 * @param {SessionWithAuth} session
 * @param {import('got').Got} apiClient
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {Promise<PageContent>}
 */
export async function assignUserPage(
	appealDetails,
	isInspector,
	session,
	apiClient,
	errors = undefined
) {
	const userTypeText = isInspector ? 'inspector' : 'case officer';
	const shortAppealReference = appealShortReference(appealDetails.appealReference);
	const padsUserList = isInspector ? await getPADSList(apiClient) : [];
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
				value: JSON.stringify({ ...user, type: isInspector ? 'inspector' : 'case officer' }),
				text: `${user.name} (${user.email})`
			}))
	];

	padsUserList
		.filter((padsUser) => padsUser.name && padsUser.sapId)
		.forEach((padsUser) => {
			userArray.push({
				value: JSON.stringify({
					id: padsUser.sapId,
					name: padsUser.name,
					email: '',
					type: 'PADSUser'
				}),
				text: `${padsUser.name}`
			});
		});

	const unassignUser = {
		value: JSON.stringify({ id: '0', name: 'Unassign', email: 'Unassign' }),
		text: 'Unassign'
	};
	const removeUser = {
		value: JSON.stringify({ id: '0', name: 'Remove', email: 'Remove' }),
		text: 'Remove'
	};

	isInspector && (appealDetails?.inspector || appealDetails?.padsInspector)
		? userArray.push(unassignUser, removeUser)
		: null;

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
				text: userTypeText === 'inspector' ? `Find an ${userTypeText}` : `Find a ${userTypeText}`,
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

	return {
		title: `Search for ${userTypeText} by name or email address`,
		backLinkText: 'Back',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}  - assign ${userTypeText}`,
		pageComponents: [selectSearchPageComponent, searchButtonPageComponent]
	};
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {Promise<PageContent>}
 * @description
 */
export async function checkAndConfirmPage(request) {
	const { baseUrl, session, currentAppeal } = request;

	const isInspector = baseUrl.includes('inspector');
	const userTypeText = isInspector ? 'inspector' : 'case officer';
	const user = session.user;
	const isUnassign =
		(user.id === '0' && (user.name === 'Unassign' || user.name === 'Remove')) || false;
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
	const generatedTemplate = null;

	/** @type {[PageComponent]} */
	const pageComponentList = [summaryListComponent];

	isInspector && generatedTemplate
		? pageComponentList.push(
				/** @type {PageComponent} */
				{
					type: 'details',
					wrapperHtml: {
						opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
						closing: '</div></div>'
					},
					parameters: {
						summaryText: `Preview email to appellant`,
						html: generatedTemplate
					}
				}
		  )
		: null;
	return {
		title: 'Check answers',
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/assign-${userTypeLink}/search-${userTypeLink}`,
		preHeading: `Appeal ${appealShortReference(currentAppeal.appealReference)}`,
		heading: isUnassign
			? `Check details and unassign ${userTypeText}`
			: `Check details and assign ${userTypeText}`,
		submitButtonProperties: {
			text: `${isUnassign ? 'Remove' : 'Assign'} ${userTypeText}`,
			type: 'submit'
		},
		pageComponents: pageComponentList
	};
}

/**
 * @param {User} user
 * @param {string} userTypeText - The text to display for the user type.
 * @returns {string} The formatted user's name and email.
 */
export const mapUserText = (user, userTypeText) => {
	return user.id === '0'
		? `Not assigned<br>This will remove the current case ${userTypeText} from the appeal`
		: user.email
		? `${user.name}<br>${user.email}`
		: `${user.name}`;
};
