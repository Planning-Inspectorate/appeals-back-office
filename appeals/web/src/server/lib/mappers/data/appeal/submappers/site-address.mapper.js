import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteAddress = ({ appealDetails, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'site-address',
		text: 'Site address',
		value: appealSiteToAddressString(appealDetails.appealSite),
		link: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/site-address/change/${appealDetails.appealSite.addressId}`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-site-address'
	});
