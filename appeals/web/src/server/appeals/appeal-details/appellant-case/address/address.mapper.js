import { appealShortReference } from '#lib/appeals-formatter.js';
import { addressInputs } from '#lib/page-components/address.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealData
 * @param {string} backLinkUrl
 * @param {import('@pins/appeals.api').Appeals.AppealSite} sessionData
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function changeSiteAddressPage(appealData, backLinkUrl, sessionData, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const address = sessionData ?? appealData.appealSite;

	return {
		title: `Change site address`,
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Change site address',
		headingClasses: 'govuk-heading-l',
		pageComponents: addressInputs({ address, errors })
	};
}
