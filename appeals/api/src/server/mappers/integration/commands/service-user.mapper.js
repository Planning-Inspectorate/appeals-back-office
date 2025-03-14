import { mapAddressIn } from './address.mapper.js';

/**
 *
 * @param {*} data
 * @returns {import('#db-client').Prisma.ServiceUserCreateInput|undefined}
 */
export const mapServiceUserIn = (data, createAddress = false) => {
	if (data) {
		const serviceUser = {
			organisationName: data.organisation,
			salutation: data.salutation,
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.emailAddress,
			webAddress: data.website,
			phoneNumber: data.telephoneNumber,
			otherPhoneNumber: data.otherPhoneNumber,
			faxNumber: data.faxNumber
		};

		const address =
			createAddress && hasAddressData(data) ? { create: mapAddressIn(data) } : undefined;

		return { ...serviceUser, address };
	}
};

/**
 *
 * @param {*} data
 * @returns {boolean}
 */
function hasAddressData(data) {
	return (
		data.addressLine1 ||
		data.addressLine2 ||
		data.addressCounty ||
		data.addressPostcode ||
		data.addressTown
	);
}
