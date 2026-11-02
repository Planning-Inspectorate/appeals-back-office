import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteAddress = ({ appealDetails, userHasUpdateCasePermission, request }) => {
	const addressString = appealDetails.appealSite
		? appealSiteToAddressString(appealDetails.appealSite)
		: '';
	const hasAddress = Boolean(addressString);
	const addressId = appealDetails.appealSite?.addressId;

	return textSummaryListItem({
		id: 'site-address',
		text: 'Site address',
		value: addressString,
		link: addBackLinkQueryToUrl(
			request,
			addressId
				? `/appeals-service/appeal-details/${appealDetails.appealId}/site-address/change/${addressId}`
				: `/appeals-service/appeal-details/${appealDetails.appealId}/site-address/change`
		),
		actionText: hasAddress ? 'Change' : 'Add',
		editable: userHasUpdateCasePermission && !isChildAppeal(appealDetails),
		classes: 'appeal-site-address'
	});
};
