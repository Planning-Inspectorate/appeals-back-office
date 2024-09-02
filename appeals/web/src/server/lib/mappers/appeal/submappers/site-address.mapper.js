import { appealSiteToAddressString } from '#lib/address-formatter.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapSiteAddress = ({ appealDetails, currentRoute }) => ({
	id: 'site-address',
	display: {
		summaryListItem: {
			key: {
				text: 'Site address'
			},
			value: {
				text: appealSiteToAddressString(appealDetails.appealSite)
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `${currentRoute}/change-appeal-details/site-address`,
						visuallyHiddenText: 'site address',
						attributes: { 'data-cy': 'change-site-address' }
					}
				]
			},
			classes: 'appeal-site-address'
		}
	}
});
