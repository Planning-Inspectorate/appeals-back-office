import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteAddress = ({ appealDetails, userHasUpdateCasePermission, request }) =>
	textSummaryListItem({
		id: 'site-address',
		text: 'Site address',
		value: appealSiteToAddressString(appealDetails.appealSite),
		link: addBackLinkQueryToUrl(
			request,
			`/appeals-service/appeal-details/${appealDetails.appealId}/site-address/change/${appealDetails.appealSite.addressId}`
		),
		editable: userHasUpdateCasePermission,
		classes: 'appeal-site-address'
	});
