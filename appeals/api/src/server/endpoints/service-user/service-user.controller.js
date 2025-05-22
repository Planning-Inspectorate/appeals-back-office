import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import {
	AUDIT_TRAIL_SERVICE_USER_REMOVED,
	AUDIT_TRAIL_SERVICE_USER_UPDATED,
	AUDIT_TRAIL_SERVICE_USER_ADDRESS_UPDATED,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import { SERVICE_USER_TYPE } from 'pins-data-model';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { capitalizeFirstLetter } from '#utils/string-utils.js';
import serviceUserRepository from '#repositories/service-user.repository.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { EventType } from '@pins/event-client';
import { upsertServiceUserAddress, formatServiceUser } from './service-user.service.js';
import appealRepository from '#repositories/appeal.repository.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const updateServiceUserById = async (req, res) => {
	const { serviceUser } = req.body;
	const { appealId } = req.params;

	const {
		serviceUserId,
		userType,
		organisationName,
		firstName,
		middleName,
		lastName,
		email,
		phoneNumber,
		addressId
	} = serviceUser;

	const dbSavedResult = await serviceUserRepository.updateServiceUserById(parseInt(serviceUserId), {
		organisationName,
		firstName,
		middleName,
		lastName,
		email,
		phoneNumber,
		addressId
	});

	if (!dbSavedResult) {
		return res.status(404).send({ errors: { serviceUserId: ERROR_NOT_FOUND } });
	}

	await createAuditTrail({
		appealId: parseInt(appealId),
		azureAdUserId: req.get('azureAdUserId'),
		details: stringTokenReplacement(AUDIT_TRAIL_SERVICE_USER_UPDATED, [
			capitalizeFirstLetter(userType),
			formatServiceUser(dbSavedResult)
		])
	});

	await broadcasters.broadcastServiceUser(
		dbSavedResult.id,
		EventType.Update,
		userType,
		req.appeal.reference
	);

	return res.send({
		serviceUserId
	});
};

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 * */
export async function updateServiceUserAddress(request, response) {
	const { serviceUserId, appealId } = request.params;
	const userType = request.body?.userType || SERVICE_USER_TYPE.INTERESTED_PARTY;

	const { addressLine1, addressLine2, county, country, postcode, town } = request.body;

	const addressInput = {
		addressLine1,
		addressLine2,
		addressCountry: country,
		addressCounty: county,
		addressTown: town,
		postcode
	};

	const result = await upsertServiceUserAddress(parseInt(serviceUserId), addressInput);

	if (!result) {
		return response.status(404).end();
	}

	await createAuditTrail({
		appealId: parseInt(appealId),
		azureAdUserId: request.get('azureAdUserId'),
		details: stringTokenReplacement(AUDIT_TRAIL_SERVICE_USER_ADDRESS_UPDATED, [userType])
	});

	await broadcasters.broadcastServiceUser(
		result.id,
		EventType.Update,
		userType,
		request.appeal.reference
	);

	return response.send(result);
}

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export async function removeServiceUserById(request, response) {
	const {
		body: { userType },
		params
	} = request;
	const appealId = Number(params.appealId);
	const azureAdUserId = request.get('azureAdUserId');

	const serviceUserId = request.appeal?.agent?.id;

	let deletedServiceUser;
	if (serviceUserId) {
		deletedServiceUser = await appealRepository.removeAppealServiceUser(appealId, {
			userType,
			serviceUserId
		});
	}

	if (!deletedServiceUser) {
		return response.status(404).send({ errors: { serviceUserId: ERROR_NOT_FOUND } });
	}

	await createAuditTrail({
		appealId,
		azureAdUserId,
		details: stringTokenReplacement(AUDIT_TRAIL_SERVICE_USER_REMOVED, [userType])
	});

	// TODO: Implement an overload for broadcastEntity to pass the full data, besides loading it from its ID in the case of Deletes
	// await broadcasters.broadcastServiceUser(
	// 	deletedServiceUser,
	// 	EventType.Delete,
	// 	userType,
	// 	request.appeal.reference
	// );

	return response.send({ serviceUserId: deletedServiceUser.id });
}
