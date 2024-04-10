import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { AUDIT_TRAIL_SERVICE_USER_UPDATED, ERROR_NOT_FOUND } from '#endpoints/constants.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import serviceUserRepository from '#repositories/service-user.repository.js';

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

	console.log(serviceUser);

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
		details: stringTokenReplacement(AUDIT_TRAIL_SERVICE_USER_UPDATED, [userType])
	});
	// TODO: Will need to broadcast service user as part of integration work
	//await produceServiceUsersUpdate(, EventType.Update, userType);

	return res.send({
		serviceUserId
	});
};
