import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteAddress = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'site-address',
		text: 'Site address',
		value: appealSiteToAddressString(appealDetails.appealSite),
		link: `${currentRoute}/change-appeal-details/site-address`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-site-address'
	});
