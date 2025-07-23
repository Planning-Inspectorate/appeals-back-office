/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { errorOrganisationNameAllowEmpty } from '#lib/error-handlers/change-screen-error-handlers.js';
import { capitalize } from 'lodash-es';

/**
 *
 * @param {Appeal} appealData
 * @param {import('../appeal-details.types.js').WebServiceUser} userDetailsInSession
 * @param {string} userType
 * @param {string} backLinkUrl
 * @param {string} removeLinkUrl
 * @param {import('@pins/express').ValidationErrors | undefined } errors
 * @returns {PageContent}
 */
export const changeServiceUserPage = (
	appealData,
	userDetailsInSession,
	userType,
	backLinkUrl,
	removeLinkUrl,
	errors
) => {
	// @ts-ignore
	let serviceUserDetails = appealData[userType];

	if (userDetailsInSession) {
		serviceUserDetails = userDetailsInSession;
	}

	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Update ${userType} details`,
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `${capitalize(userType)}'s contact details`,
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'first-name',
					name: 'firstName',
					type: 'text',
					label: {
						text: `First name`
					},
					value: serviceUserDetails?.firstName ?? '',
					errorMessage: errors?.firstName
						? {
								text: errors.firstName.msg
						  }
						: undefined
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'last-name',
					name: 'lastName',
					type: 'text',
					label: {
						text: `Last name`
					},
					value: serviceUserDetails?.lastName ?? '',
					errorMessage: errors?.lastName
						? {
								text: errors.lastName.msg
						  }
						: undefined
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'organisation-name',
					name: 'organisationName',
					type: 'text',
					label: {
						text: `Company or organisation name`
					},
					value: serviceUserDetails?.organisationName ?? '',
					errorMessage: errorOrganisationNameAllowEmpty(errors)
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'email-address',
					name: 'emailAddress',
					type: 'text',
					label: {
						text: `Email address`
					},
					value: serviceUserDetails?.email ?? '',
					errorMessage: errors?.emailAddress
						? {
								text: errors.emailAddress.msg
						  }
						: undefined
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'phone-number',
					name: 'phoneNumber',
					type: 'text',
					label: {
						text: `Phone number`
					},
					value: serviceUserDetails?.phoneNumber ?? '',
					errorMessage: errors?.phoneNumber
						? {
								text: errors.phoneNumber.msg
						  }
						: undefined
				}
			}
		]
	};

	if (removeLinkUrl) {
		pageContent.postPageComponents = [
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body"><a class="govuk-link" href="${removeLinkUrl}">Remove ${userType}</a></p>`
				}
			}
		];
	}

	return pageContent;
};

/**
 *
 * @param {Appeal} appealData
 * @param {string} userType
 * @param {string} backLinkUrl
 * @param {string} cancelLinkUrl
 * @returns {PageContent}
 */
export const removeServiceUserPage = (appealData, userType, backLinkUrl, cancelLinkUrl) => {
	// @ts-ignore
	const { firstName, lastName } = appealData[userType];

	/** @type {PageContent} */
	const pageContent = {
		title: `Remove ${userType}`,
		backLinkUrl: backLinkUrl,
		preHeading: `${firstName} ${lastName}`,
		heading: `Confirm that you want to remove the ${userType}`,
		submitButtonText: `Remove ${userType}`,
		postPageComponents: [
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body"><a class="govuk-link" href="${cancelLinkUrl}">Cancel</a></p>`
				}
			}
		]
	};

	return pageContent;
};
