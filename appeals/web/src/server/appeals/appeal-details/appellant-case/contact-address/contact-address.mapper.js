import { appealShortReference } from '#lib/appeals-formatter.js';
import { addressInputs } from '#lib/mappers/index.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 *
 * @param {import('@pins/appeals').ContactAddress} address
 */
const mapAddressToInputs = (address) => {
	return {
		...address,
		town: address.addressTown,
		county: address.addressCounty
	};
};

/**
 * @param {Appeal} appealData
 * @param {string} backLinkUrl
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function manageContactAddressPage(appealData, backLinkUrl, request, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const newAddress = {
		addressLine1: request.body['addressLine1'],
		addressLine2: request.body['addressLine2'],
		town: request.body['town'],
		county: request.body['county'],
		postCode: request.body['postCode']
	};
	const isPostRequest = request.method === 'POST';

	const address = appealData.enforcementNotice?.appellantCase?.contactAddress;
	const mappedAddress = isPostRequest
		? newAddress
		: address
		? mapAddressToInputs(address)
		: undefined;

	return {
		title: `What is your contact address?`,
		backLinkUrl: getBackLinkUrlFromQuery(request) || backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'What is your contact address?',
		pageComponents: addressInputs({ address: mappedAddress, errors })
	};
}
