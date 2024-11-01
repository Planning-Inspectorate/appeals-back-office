import * as displayPageFormatter from '#lib/display-page-formatter.js';

/**
 *
 * @param {import('@pins/appeals.api').Appeals.AppealSite} appealSite
 * @returns {InputInstruction[]}
 */
export function mapAddressInput(appealSite) {
	return [
		{
			type: 'input',
			properties: {
				id: 'address-line-1',
				name: 'addressLine1',
				value: displayPageFormatter.nullToEmptyString(appealSite.addressLine1),
				label: {
					text: 'Address Line 1',
					isPageHeading: false
				}
			}
		},
		{
			type: 'input',
			properties: {
				id: 'address-line-2',
				name: 'addressLine2',
				value: displayPageFormatter.nullToEmptyString(appealSite.addressLine2),
				label: {
					text: 'Address Line 2',
					isPageHeading: false
				}
			}
		},
		{
			type: 'input',
			properties: {
				id: 'address-town',
				name: 'addressTown',
				value: displayPageFormatter.nullToEmptyString(appealSite.town),
				label: {
					text: 'Town',
					isPageHeading: false
				}
			}
		},
		{
			type: 'input',
			properties: {
				id: 'address-county',
				name: 'addressCounty',
				value: displayPageFormatter.nullToEmptyString(appealSite.county),
				label: {
					text: 'County',
					isPageHeading: false
				}
			}
		},
		{
			type: 'input',
			properties: {
				id: 'address-postcode',
				name: 'addressPostcode',
				value: displayPageFormatter.nullToEmptyString(appealSite.postCode),
				label: {
					text: 'Postcode',
					isPageHeading: false
				}
			}
		}
	];
}
