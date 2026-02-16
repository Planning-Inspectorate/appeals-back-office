import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import addressRepository from '#repositories/address.repository.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_ADDRESS_UPDATED,
	ERROR_FAILED_TO_SAVE_DATA
} from '@pins/appeals/constants/support.js';
import { formatAddress, formatAddressMultiline } from './addresses.formatter.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAddressById = async (req, res) => {
	const { address } = req.appeal;
	const formattedAddress = (address && formatAddress(address)) || {};

	return res.send(formattedAddress);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const updateAddressById = async (req, res) => {
	const {
		body: { addressLine1, addressLine2, country, county, postcode, town },
		params: { appealId, addressId }
	} = req;

	const updateAddress = {
		addressLine1,
		addressLine2,
		addressCountry: country,
		addressCounty: county,
		postcode,
		addressTown: town
	};

	let updatedAddress;
	try {
		updatedAddress = await addressRepository.updateAddressById(Number(addressId), updateAddress);

		await broadcasters.broadcastAppeal(parseInt(appealId));
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	createAuditTrail({
		appealId: parseInt(appealId),
		azureAdUserId: req.get('azureAdUserId'),
		details: stringTokenReplacement(AUDIT_TRAIL_ADDRESS_UPDATED, [
			formatAddressMultiline(updatedAddress)
		])
	});

	return res.send(updateAddress);
};

export { getAddressById, updateAddressById };
