import { getTeamFromAppealId } from '#appeals/appeal-details/update-case-team/update-case-team.service.js';
import config from '#environment/config.js';
import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
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
	const { baseUrl, session, currentAppeal, apiClient } = request;

	const isInspector = baseUrl.includes('inspector');
	const userTypeText = isInspector ? 'inspector' : 'case officer';
	const prevUser = session.prevUser ? session.prevUser : '';
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

	/** @type {EmailPersonalisation} */
	const personalisation = {
		appeal_reference_number: currentAppeal.appealReference,
		site_address: appealSiteToAddressString(currentAppeal.appealSite),
		lpa_reference: currentAppeal.planningApplicationReference || '',
		team_email_address: '',
		inspector_name: isUnassign ? prevUser.name : user.name
	};

	const generatedTemplate = isInspector
		? (
				await generateInspectorNotifyPreviews(
					apiClient,
					personalisation,
					isUnassign
						? 'appeal-unassign-inspector.content.md'
						: 'appeal-assign-inspector.content.md',
					currentAppeal
				)
		  ).appellantTemplate
		: null;

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
						html: generatedTemplate.renderedHtml
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
/**
 * Generate Notify preview templates for appellant
 * @param {import('got').Got} apiClient
 * @param {EmailPersonalisation} personalisation
 * @param {string} templateName
 * @param {import('../appeal-details.types.js').WebAppeal} currentAppeal
 * @returns {Promise<{ appellantTemplate: { renderedHtml: string } }>}
 */
const generateInspectorNotifyPreviews = async (
	apiClient,
	personalisation,
	templateName,
	currentAppeal
) => {
	const { email: assignedTeamEmail } = await getTeamFromAppealId(
		apiClient,
		String(currentAppeal.appealId)
	);
	personalisation.team_email_address = assignedTeamEmail;
	const [appellantTemplate] = await Promise.all([
		generateNotifyPreview(apiClient, templateName, personalisation)
	]);
	return { appellantTemplate };
};
