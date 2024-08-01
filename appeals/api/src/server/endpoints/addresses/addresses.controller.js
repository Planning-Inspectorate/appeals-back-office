import logger from '#utils/logger.js';
import { AUDIT_TRAIL_ADDRESS_UPDATED, ERROR_FAILED_TO_SAVE_DATA } from '../constants.js';
import { formatAddress } from './addresses.formatter.js';
import addressRepository from '#repositories/address.repository.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';

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

	try {
		await addressRepository.updateAddressById(Number(addressId), updateAddress);
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
		}
	}

	await createAuditTrail({
		appealId: parseInt(appealId),
		azureAdUserId: req.get('azureAdUserId'),
		details: AUDIT_TRAIL_ADDRESS_UPDATED
	});

	return res.send(updateAddress);
};

export { getAddressById, updateAddressById };
