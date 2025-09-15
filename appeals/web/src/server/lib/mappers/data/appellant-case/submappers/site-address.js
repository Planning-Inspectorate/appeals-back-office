import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteAddress = ({
	appellantCaseData,
	appealDetails,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'site-address',
		text: 'What is the address of the appeal site?',
		value: appealSiteToAddressString(appellantCaseData.appealSite),
		link: `${currentRoute}/site-address/change/${appealDetails.appealSite.addressId}`,
		editable: userHasUpdateCase,
		classes: 'appeal-site-address'
	});
