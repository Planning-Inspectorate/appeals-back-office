import logger from '#utils/logger.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';
import { formatHearing } from './hearing.formatter.js';
import { createHearing, deleteHearing, updateHearing } from './hearing.service.js';
import { arrayOfStatusesContainsString } from '#utils/array-of-statuses-contains-string.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import transitionState from '#state/transition-state.js';
import {
	VALIDATION_OUTCOME_COMPLETE,
	VALIDATION_OUTCOME_CANCEL
} from '@pins/appeals/constants/support.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getHearingById = async (req, res) => {
	const { appeal } = req;
	const formattedAppeal = formatHearing(appeal);

	console.log('formattedAppeal', formattedAppeal);

	return res.send(formattedAppeal);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const postHearing = async (req, res) => {
	const {
		body: { hearingStartTime, hearingEndTime, address },
		params,
		appeal
	} = req;

	const appealId = Number(params.appealId);
	const azureAdUserId = String(req.get('azureAdUserId'));
	try {
		await createHearing({
			appealId,
			hearingStartTime,
			hearingEndTime,
			...(address && {
				address: {
					addressLine1: address.addressLine1,
					addressLine2: address.addressLine2,
					addressTown: address.town,
					addressCounty: address.county,
					postcode: address.postcode,
					addressCountry: address.country
				}
			})
		});
		if (arrayOfStatusesContainsString(appeal.appealStatus, APPEAL_CASE_STATUS.EVENT) && address) {
			await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
		}
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.status(201).send({ appealId, hearingStartTime, hearingEndTime });
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const rearrangeHearing = async (req, res) => {
	const {
		body: { hearingStartTime, hearingEndTime, address, addressId },
		params,
		appeal
	} = req;

	const azureAdUserId = String(req.get('azureAdUserId'));
	const appealId = Number(params.appealId);
	const hearingId = Number(params.hearingId);

	try {
		await updateHearing({
			appealId,
			hearingId,
			hearingStartTime,
			hearingEndTime,
			addressId,
			...(address !== undefined && {
				address:
					address === null
						? null
						: {
								addressLine1: address.addressLine1,
								addressLine2: address.addressLine2,
								addressTown: address.town,
								addressCounty: address.county,
								postcode: address.postcode,
								addressCountry: address.country
						  }
			})
		});
		if (arrayOfStatusesContainsString(appeal.appealStatus, APPEAL_CASE_STATUS.EVENT) && address) {
			await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
		}
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.status(201).send({ appealId, hearingStartTime, hearingEndTime });
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const cancelHearing = async (req, res) => {
	const {
		params: { appealId, hearingId }
	} = req;
	const azureAdUserId = String(req.get('azureAdUserId'));
	try {
		await deleteHearing({ hearingId: Number(hearingId) });
		await transitionState(Number(appealId), azureAdUserId, VALIDATION_OUTCOME_CANCEL);
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.status(200).send({ appealId, hearingId });
};
