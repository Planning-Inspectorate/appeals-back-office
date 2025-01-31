/**
 *
 * @param {*} data
 * @returns {import('#db-client').Prisma.ServiceUserCreateInput|undefined}
 */
export const mapServiceUserIn = (data) => {
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

		return serviceUser;
	}
};
