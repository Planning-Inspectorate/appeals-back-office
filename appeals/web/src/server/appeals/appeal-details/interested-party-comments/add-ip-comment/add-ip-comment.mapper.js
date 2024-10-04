import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	errorAddressLine1,
	errorAddressProvidedRadio,
	errorEmail,
	errorFirstName,
	errorLastName,
	errorPostcode,
	errorTown
} from '#lib/error-handlers/change-screen-error-handlers.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 * */
export const ipDetailsPage = (appealDetails, errors) => ({
	title: "Interested party's details",
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: "Interested party's details",
	pageComponents: [
		{
			type: 'input',
			parameters: {
				id: 'first-name',
				name: 'firstName',
				type: 'text',
				label: {
					isPageHeading: false,
					text: 'First name'
				},
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
					text: 'Last name'
				},
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
					text: 'Email address (optional)'
				},
				errorMessage: errorEmail(errors)
			}
		}
	]
});

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 * */
export const checkAddressPage = (appealDetails, errors) => ({
	title: 'Did the interested party provide an address?',
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/ip-details`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: 'Did the interested party provide an address?',
	submitButtonProperties: {
		text: 'Continue'
	},
	pageComponents: [
		{
			type: 'radios',
			parameters: {
				name: 'addressProvided',
				items: [
					{
						value: 'yes',
						text: 'Yes'
					},
					{
						value: 'no',
						text: 'No'
					}
				],
				errorMessage: errorAddressProvidedRadio(errors)
			}
		}
	]
});

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 * */
export const ipAddressPage = (appealDetails, errors) => ({
	title: "Interested party's address",
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/check-address`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: "Interested party's address",
	pageComponents: [
		{
			type: 'input',
			parameters: {
				id: 'address-line-1',
				name: 'addressLine1',
				type: 'text',
				label: {
					isPageHeading: false,
					text: 'Address line 1'
				},
				errorMessage: errorAddressLine1(errors)
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'address-line-2',
				name: 'addressLine2',
				type: 'text',
				label: {
					isPageHeading: false,
					text: 'Address line 2 (optional)'
				}
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'town',
				name: 'town',
				type: 'text',
				label: {
					isPageHeading: false,
					text: 'Town or city'
				},
				errorMessage: errorTown(errors)
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'county',
				name: 'county',
				type: 'text',
				label: {
					isPageHeading: false,
					text: 'County (optional)'
				}
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'postCode',
				name: 'postCode',
				type: 'text',
				label: {
					isPageHeading: false,
					text: 'Postcode'
				},
				errorMessage: errorPostcode(errors)
			}
		}
	]
});
