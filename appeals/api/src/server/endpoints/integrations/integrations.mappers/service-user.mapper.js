import { ODW_AGENT_SVCUSR, ODW_APPELLANT_SVCUSR, ODW_SYSTEM_ID } from '#endpoints/constants.js';

/** @typedef {import('@pins/appeals.api').Schema.ServiceUser} ServiceUser */

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
 * @param {ServiceUser} data
 * @param {string} serviceUserType
 * @param {string} caseReference
 * @returns {import('pins-data-model').Schemas.ServiceUser | null}
 */
export const mapServiceUserOut = (data, serviceUserType, caseReference) => {
	if (data) {
		const user = {
			id: data.id.toString(),
			organisation: data.organisationName ?? null,
			organisationType: null,
			salutation: data.salutation ?? null,
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
			serviceUserType: mapServiceUserType(serviceUserType),
			role: null,
			otherPhoneNumber: null,
			faxNumber: null
		};

		return user;
	}

	return null;
};

/**
 *
 * @param {string} type
 * @returns {'Applicant' | 'Appellant' | 'Agent' | 'RepresentationContact' | 'Subscriber'}
 */
const mapServiceUserType = (type) => {
	if (type.toLowerCase() === ODW_APPELLANT_SVCUSR.toLowerCase()) {
		return ODW_APPELLANT_SVCUSR;
	}
	if (type.toLowerCase() === ODW_AGENT_SVCUSR.toLowerCase()) {
		return ODW_AGENT_SVCUSR;
	}

	return ODW_APPELLANT_SVCUSR;
};
