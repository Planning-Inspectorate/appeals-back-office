/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	errorEmailAllowEmpty,
	errorFirstName,
	errorLastName
} from '#lib/error-handlers/change-screen-error-handlers.js';
import { capitalize } from 'lodash-es';

/**
 *
 * @param {Appeal} appealData
 * @param {string} userType
 * @param {import('../appeal-details.types.js').WebServiceUser} userDetailsInSession
 * @param {import('@pins/express').ValidationErrors | undefined } errors
 * @returns {PageContent}
 */
export const changeServiceUserPage = (appealData, userDetailsInSession, userType, errors) => {
	// @ts-ignore
	let serviceUserDetails = appealData[userType];

	if (userDetailsInSession) {
		serviceUserDetails = userDetailsInSession;
	}

	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Update ${userType} details`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Update ${userType} details`,
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'first-name',
					name: 'firstName',
					type: 'text',
					label: {
						isPageHeading: false,
						text: `${capitalize(userType)}'s first name`
					},
					value: serviceUserDetails?.firstName ?? '',
					errorMessage: errorFirstName(errors)
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'last-name',
					name: 'lastName',
					type: 'text',
					label: {
						isPageHeading: false,
						text: `${capitalize(userType)}'s last name`
					},
					value: serviceUserDetails?.lastName ?? '',
					errorMessage: errorLastName(errors)
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'email-address',
					name: 'emailAddress',
					type: 'text',
					label: {
						isPageHeading: false,
						text: `${capitalize(userType)}'s email address`
					},
					value: serviceUserDetails?.email ?? '',
					errorMessage: errorEmailAllowEmpty(errors)
				}
			}
		]
	};

	return pageContent;
};