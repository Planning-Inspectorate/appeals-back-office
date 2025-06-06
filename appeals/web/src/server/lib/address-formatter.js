import { join, map, pick } from 'lodash-es';

/**
 * converts a multi part address to a single string
 *
 * @param {import('@pins/appeals').Address | import('@pins/appeals.api/src/server/endpoints/appeals.js').AppealSite} address
 * @param {string} [separator] the separator to use between address parts (default is ', ')
 * @returns {string}
 */
export const addressToString = (address, separator = ', ') => {
	return join(
		map(pick(address, ['addressLine1', 'addressLine2', 'town', 'county', 'postCode']), (value) => {
			return value?.trim();
		}).filter((value) => value?.length),
		separator
	);
};

/**
 * converts a multi part address to a multiline string
 *
 * @param {import('@pins/appeals').Address} address
 * @returns {string}
 */
export const addressToMultilineStringHtml = (address) => {
	return join(
		map(pick(address, ['addressLine1', 'addressLine2', 'town', 'county', 'postCode']), (value) => {
			return value?.trim();
		}).filter((value) => value?.length),
		', </br>'
	);
};

/**
 * @param {import('@pins/appeals.api').Appeals.AppealSite} appealSite
 * @returns {import('@pins/appeals').Address}
 */
export const appealSiteToAddress = (appealSite) => {
	return {
		addressLine1: appealSite.addressLine1 || '',
		addressLine2: appealSite.addressLine2 || '',
		town: appealSite.town || '',
		county: appealSite.county || '',
		postCode: appealSite.postCode || ''
	};
};

/**
 * @param {import('@pins/appeals.api').Appeals.AppealSite} appealSite
 * @returns {string}
 */
export const appealSiteToAddressString = (appealSite) => {
	return addressToString(appealSiteToAddress(appealSite));
};

/**
 * @param {import('@pins/appeals.api').Appeals.AppealSite | undefined} appealSite
 * @returns {string}
 */
export const appealSiteToMultilineAddressStringHtml = (appealSite) => {
	if (appealSite) {
		return addressToMultilineStringHtml(appealSiteToAddress(appealSite));
	}

	return '';
};

/**
 * @param {import('#appeals/appeal-details/representations/types.js').Representation} rep
 * @returns {boolean}
 */
export const representationHasAddress = (rep) => {
	const { addressLine1, postCode } = rep.represented?.address ?? {};
	return !!(addressLine1 && postCode);
};
