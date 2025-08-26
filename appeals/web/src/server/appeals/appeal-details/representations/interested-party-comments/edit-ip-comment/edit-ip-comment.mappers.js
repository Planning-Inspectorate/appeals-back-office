import { appealShortReference } from '#lib/appeals-formatter.js';
import { addressToMultilineStringHtml } from '#lib/address-formatter.js';
import { yesNoInput } from '#lib/mappers/components/index.js';

/** @typedef {import("../../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {number} commentId
 * @param {{ addressLine1: string, addressLine2: string, town: string, county: string, postCode: string }} address
 * @returns {PageContent}
 * */
export const checkAddressPage = (appealDetails, commentId, address) => {
	const editBaseUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${commentId}/edit/address`;
	const editPageUrl = `${editBaseUrl}?editEntrypoint=${editBaseUrl}`;

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

/**
 * @param {Appeal} appealDetails
 * @param {number} commentId
 * @returns {PageContent}
 * */
export const siteVisitRequestedPage = (appealDetails, commentId) => ({
	title: 'Site visit request',
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${commentId}/view`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: 'Are you sure you want to change the site visit request?',
	pageComponents: [
		yesNoInput({
			name: 'siteVisitRequested',
			id: 'siteVisitRequested'
		})
	]
});
