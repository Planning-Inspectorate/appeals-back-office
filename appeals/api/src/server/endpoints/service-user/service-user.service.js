import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import addressRepository from '#repositories/address.repository.js';
import serviceUserRepository from '#repositories/service-user.repository.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { capitalizeFirstLetter } from '#utils/string-utils.js';
import {
	AUDIT_TRAIL_SERVICE_USER_UPDATED,
	AUDIT_TRAIL_SYSTEM_UUID
} from '@pins/appeals/constants/support.js';
import { EventType } from '@pins/event-client';

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
 *
 * @param {string | undefined} azureAdUserId
 * @param {number} serviceUserId
 * @param {string} userType
 * @param {Partial<import('@pins/appeals.api').Schema.Appeal>} appeal
 * @param {{ email?: string; phoneNumber?: string; organisationName: string; firstName: string; middleName: string; lastName: string }} dataToUpdate
 * @returns {Promise<*>}
 */
export async function updateServiceUser(
	azureAdUserId,
	serviceUserId,
	userType,
	appeal,
	dataToUpdate
) {
	const { id: appealId, reference: appealReference } = appeal;
	if (!appealId || !appealReference) {
		return;
	}

	const dbSavedResult = await serviceUserRepository.updateServiceUserById(
		serviceUserId,
		dataToUpdate
	);

	if (!dbSavedResult) {
		return;
	}

	await createAuditTrail({
		appealId,
		azureAdUserId: azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
		details: stringTokenReplacement(AUDIT_TRAIL_SERVICE_USER_UPDATED, [
			capitalizeFirstLetter(userType),
			formatServiceUser(dbSavedResult)
		])
	});
	await broadcasters.broadcastServiceUser(
		dbSavedResult.id,
		EventType.Update,
		userType,
		appealReference
	);

	return dbSavedResult;
}

/**
 * @param {import('@pins/appeals.api').Schema.ServiceUser} su
 * @returns {string}
 * */
export const formatServiceUser = (su) =>
	[`${su.firstName} ${su.lastName}`, su.organisationName, su.email, su.phoneNumber]
		.filter(Boolean)
		.join('\n');
