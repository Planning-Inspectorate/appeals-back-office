import { appealShortReference } from '#lib/appeals-formatter.js';
import { addressInputs } from '#lib/mappers/index.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 *
 * @param {import('@pins/appeals').ContactAddress | null} [address]
 */
const mapAddressToInputs = (address) => {
	if (!address) {
		return undefined;
	}

	return {
		...address,
		town: address.addressTown,
		county: address.addressCounty
	};
};

/**
 * @param {Appeal} appealData
 * @param {string} backLinkUrl
 * @param {import('@pins/appeals').Address} sessionData
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function manageContactAddressPage(appealData, backLinkUrl, sessionData, request, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const address = appealData.enforcementNotice?.appellantCase?.contactAddress;
	const mappedAddress = sessionData ?? mapAddressToInputs(address);

	return {
		title: `What is your contact address?`,
		backLinkUrl: getBackLinkUrlFromQuery(request) || backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'What is your contact address?',
		pageComponents: addressInputs({ address: mappedAddress, errors })
	};
}
