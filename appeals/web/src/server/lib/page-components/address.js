import {
	errorAddressLine1,
	errorPostcode,
	errorTown
} from '#lib/error-handlers/change-screen-error-handlers.js';

/**
 * Return page components for address inputs
 *
 * @param {Object} options
 * @param {import('@pins/appeals.api').Appeals.AppealSite} [options.address]
 * @param {import('@pins/express').ValidationErrors} [options.errors]
 * @returns {PageComponent[]}
 */
export function addressInputs({ address, errors }) {
	return [
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
				value: address?.addressLine1 ?? '',
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
				value: address?.addressLine2 ?? ''
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
				value: address?.town ?? '',
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
				value: address?.county ?? ''
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
				value: address?.postCode ?? '',
				errorMessage: errorPostcode(errors)
			}
		}
	];
}
