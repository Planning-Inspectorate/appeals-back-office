import { appealShortReference } from '#lib/appeals-formatter.js';
import { addressInputs } from '#lib/mappers/index.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealData
 * @param {string} backLinkUrl
 * @param {import('@pins/appeals').Address} sessionData
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function changeSiteAddressPage(appealData, backLinkUrl, sessionData, request, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const address = sessionData ?? appealData.appealSite;

	return {
		title: `What is the address of the appeal site?`,
		backLinkUrl: getBackLinkUrlFromQuery(request) || backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'What is the address of the appeal site?',
		pageComponents: addressInputs({ address, errors })
	};
}
