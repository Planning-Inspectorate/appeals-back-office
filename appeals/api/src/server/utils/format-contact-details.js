import { formatName } from './format-name.js';

/**
 * @param {import('@pins/appeals.api').Schema.ServiceUser} contactDetails
 * @returns {string}
 */
export const formatContactDetails = (contactDetails) => {
	const { email, phoneNumber } = contactDetails;
	const name = formatName(contactDetails);
	return `${name}${email ? `, ${email}` : ''}${phoneNumber ? `, ${phoneNumber}` : ''}`;
};
