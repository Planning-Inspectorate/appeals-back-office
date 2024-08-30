import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	errorAddressLine1,
	errorPostcode,
	errorTown
} from '#lib/error-handlers/change-screen-error-handlers.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealData
 * @param {string} backLinkUrl
 * @param {import('@pins/appeals.api').Appeals.AppealSite} sessionData
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function changeSiteAddressPage(appealData, backLinkUrl, sessionData, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const siteAddress = sessionData ?? appealData.appealSite;

	/** @type {PageContent} */
	const pageContent = {
		title: `Change site address`,
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Change site address',
		headingClasses: 'govuk-heading-l',
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
					value: siteAddress?.addressLine1 ?? '',
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
					},
					value: siteAddress?.addressLine2 ?? ''
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'address-town',
					name: 'town',
					type: 'text',
					classes: 'govuk-input govuk-input--width-20',
					label: {
						isPageHeading: false,
						text: 'Town or city'
					},
					value: siteAddress?.town ?? '',
					errorMessage: errorTown(errors)
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'address-county',
					name: 'county',
					type: 'text',
					classes: 'govuk-input govuk-input--width-20',
					label: {
						isPageHeading: false,
						text: 'County (optional)'
					},
					value: siteAddress?.county ?? ''
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'address-postcode',
					name: 'postCode',
					type: 'text',
					classes: 'govuk-input govuk-input--width-10',
					label: {
						isPageHeading: false,
						text: 'Postcode'
					},
					value: siteAddress?.postCode ?? '',
					errorMessage: errorPostcode(errors)
				}
			}
		]
	};

	return pageContent;
}
