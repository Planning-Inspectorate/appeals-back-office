import addressRepository from '#repositories/address.repository.js';
import serviceUserRepository from '#repositories/service-user.repository.js';

/**
 * @param {number} id
 * @param {import('@pins/appeals.api').Appeals.UpdateAddressRequest} data
 * @returns {Promise<import('@pins/appeals.api').Schema.ServiceUser | null>}
 * */
export async function upsertServiceUserAddress(id, data) {
	const serviceUserInfo = await serviceUserRepository.getServiceUserById(id);
	if (!serviceUserInfo) {
		return null;
	}

	if (!serviceUserInfo.addressId) {
		const address = await addressRepository.createAddress(data);

		return await serviceUserRepository.updateServiceUserById(id, {
			addressId: address.id
		});
	}

	await addressRepository.updateAddressById(serviceUserInfo.addressId, data);

	return await serviceUserRepository.getServiceUserById(id);
}

/**
 * @param {import('@pins/appeals.api').Schema.ServiceUser} su
 * @returns {string}
 * */
export const formatServiceUser = (su) =>
	[`${su.firstName} ${su.lastName}`, su.organisationName, su.email, su.phoneNumber]
		.filter(Boolean)
		.join('\n');
