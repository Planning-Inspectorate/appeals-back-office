import { ODW_SYSTEM_ID } from '#endpoints/constants.js';

/**
 *
 * @param {*} data
 * @returns
 */
export const mapServiceUserIn = (data) => {
	if (data) {
		const serviceUser = {
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.emailAddress
		};
		return {
			create: serviceUser
		};
	}
};

/**
 *
 * @param {*} data
 * @param {'Appellant' | 'Agent'} serviceUserType
 * @param {string} caseReference
 * @returns {import('pins-data-model').Schemas.ServiceUser | null}
 */
export const mapServiceUserOut = (data, serviceUserType, caseReference) => {
	if (data) {
		const user = {
			id: data.id.toString(),
			organisation: data.organisationName ?? null,
			organisationType: null,
			salutation: null,
			firstName: data.firstName ?? null,
			lastName: data.lastName ?? null,
			emailAddress: data.email ?? null,
			webAddress: data.website ?? null,
			telephoneNumber: data.phoneNumber ?? null,
			addressLine1: data.address?.addressLine1 ?? null,
			addressLine2: data.address?.addressLine2 ?? null,
			addressTown: data.address?.addressTown ?? null,
			addressCounty: data.address?.addressCounty ?? null,
			postcode: data.address?.postcode ?? null,
			addressCountry: data.address?.addressCountry ?? null,
			sourceSuid: data.id.toString(),
			caseReference,
			sourceSystem: ODW_SYSTEM_ID,
			serviceUserType,
			role: data.jobTitle ?? null,
			otherPhoneNumber: null,
			faxNumber: null
		};

		return user;
	}

	return null;
};
