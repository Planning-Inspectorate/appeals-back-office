import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { SERVICE_USER_TYPE } from '@planning-inspectorate/data-model';

/** @typedef {import('#endpoints/integrations/integrations.broadcasters/service-users.js').GetServiceUser} ServiceUser */
/** @typedef {import('@pins/appeals.api').Schema.Address} Address */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.ServiceUser} AppealServiceUser */

// Start range for serviceUserIDs in network messages
export const serviceUserIdStartRange = 200000000;

/**
 *
 * @param {ServiceUser} data
 * @param {string} serviceUserType
 * @param {string} caseReference
 * @returns {AppealServiceUser | undefined}
 */
export const mapServiceUserEntity = (data, serviceUserType, caseReference) => {
	if (data) {
		const userId = serviceUserIdStartRange + data.id;
		const userSuid = serviceUserIdStartRange + data.id;
		const user = {
			id: userId.toString(),
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
			sourceSuid: userSuid.toString(),
			caseReference,
			sourceSystem: ODW_SYSTEM_ID,
			serviceUserType: mapServiceUserType(serviceUserType),
			role: null,
			otherPhoneNumber: null,
			faxNumber: null
		};

		return user;
	}
};

/**
 *
 * @param {string} type
 * @returns {'Applicant' | 'Appellant' | 'Agent' | 'RepresentationContact' | 'Subscriber' | 'InterestedParty' | 'Rule6Party'}
 */
const mapServiceUserType = (type) => {
	if (type.toLowerCase() === SERVICE_USER_TYPE.APPELLANT.toLowerCase()) {
		// @ts-ignore
		return SERVICE_USER_TYPE.APPELLANT;
	}
	if (type.toLowerCase() === SERVICE_USER_TYPE.AGENT.toLowerCase()) {
		// @ts-ignore
		return SERVICE_USER_TYPE.AGENT;
	}
	if (type.toLowerCase() === SERVICE_USER_TYPE.RULE_6_PARTY.toLowerCase()) {
		// @ts-ignore
		return SERVICE_USER_TYPE.RULE_6_PARTY;
	}

	// @ts-ignore
	return SERVICE_USER_TYPE.INTERESTED_PARTY;
};
