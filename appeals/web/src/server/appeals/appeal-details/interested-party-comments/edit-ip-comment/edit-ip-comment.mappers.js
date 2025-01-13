import { appealShortReference } from '#lib/appeals-formatter.js';
import { addressToMultilineStringHtml } from '#lib/address-formatter.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */

/**
 * @param {Appeal} appealDetails
 * @param {number} commentId
 * @param {{ addressLine1: string, addressLine2: string, town: string, county: string, postCode: string }} address
 * */
export const checkAddressPage = (appealDetails, commentId, address) => {
	const editPageUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${commentId}/edit/address`;

	return {
		title: 'Check your answers',
		backLinkUrl: editPageUrl,
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
		heading: 'Check your answers',
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					rows: [
						{
							key: {
								text: "Interested party's address"
							},
							value: {
								html: addressToMultilineStringHtml(address)
							},
							actions: {
								items: [
									{
										text: 'Change',
										href: editPageUrl,
										visuallyHiddenText: 'interested party address'
									}
								]
							}
						}
					]
				}
			}
		]
	};
};
