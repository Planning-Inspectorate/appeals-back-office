import {
	errorAddressLine1,
	errorAddressLine2,
	errorPostcode,
	errorTown,
	errorCounty
} from '#lib/error-handlers/change-screen-error-handlers.js';

/**
 * Return page components for address inputs
 *
 * @param {Object} options
 * @param {import('@pins/appeals').Address | Record<string, string>} [options.address]
 * @param {string} [options.operationType]
 * @param {import('@pins/express').ValidationErrors} [options.errors]
 * @returns {PageComponent[]}
 */
export function addressInputs({ address, operationType, errors }) {
	return [
		{
			type: 'input',
			parameters: {
				id: 'address-line-1',
				name: 'addressLine1',
				type: 'text',
				label: {
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
					text: 'Address line 2 (optional)'
				},
				value: address?.addressLine2 ?? '',
				errorMessage: errorAddressLine2(errors)
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'town',
				name: 'town',
				type: 'text',
				classes: 'govuk-input govuk-input--width-20',
				label: {
					text: 'Town or city'
				},
				value: address?.town ?? '',
				errorMessage: errorTown(errors)
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'county',
				name: 'county',
				type: 'text',
				classes: 'govuk-input govuk-input--width-20',
				label: {
					text: 'County (optional)'
				},
				value: address?.county ?? '',
				errorMessage: errorCounty(errors)
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'post-code',
				name: 'postCode',
				type: 'text',
				classes: 'govuk-input govuk-input--width-10',
				label: {
					text: 'Postcode'
				},
				value: address?.postCode ?? '',
				errorMessage: errorPostcode(errors)
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'operation-type',
				name: 'operationType',
				type: 'hidden',
				value: operationType || ''
			}
		}
	];
}
