import { appealShortReference } from '#lib/appeals-formatter.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */

/**
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 * */
export const ipDetailsPage = (appealDetails) => ({
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
				}
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
				}
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
				}
			}
		}
	]
});

/**
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 * */
export const checkAddressPage = (appealDetails) => ({
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
				name: 'address-provided',
				items: [
					{
						value: 'yes',
						text: 'Yes'
					},
					{
						value: 'no',
						text: 'No'
					}
				]
			}
		}
	]
});

/**
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 * */
export const ipAddressPage = (appealDetails) => ({
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
				}
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
				}
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
				id: 'postcode',
				name: 'postcode',
				type: 'text',
				label: {
					isPageHeading: false,
					text: 'Postcode'
				}
			}
		}
	]
});
