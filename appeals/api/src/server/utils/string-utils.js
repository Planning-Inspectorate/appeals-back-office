import { join, map, pick } from 'lodash-es';

/**
 * @param {string} appealType
 * @returns {string}
 */
const trimAppealType = (appealType) => {
	return appealType.endsWith(' appeal') ? appealType.replace(' appeal', '') : appealType;
};

/**
 * converts a multi part address to a single string
 * @typedef {import('@pins/appeals.api').Schema.Address} Address
 *
 * @param {import('@pins/appeals.api').Schema.Address} address
 * @param {string} [separator] the separator to use between address parts (default is ', ')
 * @returns {string}
 */
const addressToString = (address, separator = ', ') => {
	return join(
		map(
			pick(address, ['addressLine1', 'addressLine2', 'addressTown', 'addressCounty', 'postcode']),
			(value) => {
				return value?.trim();
			}
		).filter((value) => value?.length),
		separator
	);
};

export { addressToString, trimAppealType };
