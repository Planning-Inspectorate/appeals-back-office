import {
	formatAddressForDb,
	formatAddressSingleLine
} from '#endpoints/addresses/addresses.formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import hearingRepository from '#repositories/hearing.repository.js';
import transitionState from '#state/transition-state.js';
import { arrayOfStatusesContainsString } from '#utils/array-of-statuses-contains-string.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_HEARING_ADDRESS_ADDED,
	AUDIT_TRAIL_HEARING_ADDRESS_UPDATED,
	AUDIT_TRAIL_HEARING_CANCELLED,
	AUDIT_TRAIL_HEARING_DATE_UPDATED,
	AUDIT_TRAIL_HEARING_SET_UP,
	ERROR_FAILED_TO_SAVE_DATA,
	VALIDATION_OUTCOME_CANCEL,
	VALIDATION_OUTCOME_COMPLETE,
	VALIDATION_OUTCOME_INCOMPLETE
} from '@pins/appeals/constants/support.js';
import { dateISOStringToDisplayDate } from '@pins/appeals/utils/date-formatter.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { formatHearing } from './hearing.formatter.js';
import { createHearing, deleteHearing, updateHearing } from './hearing.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('@pins/appeals.api').Schema.Hearing} Hearing */

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
		body: { hearingStartTime, hearingEndTime, estimatedDays, address },
		params,
		appeal
	} = req;

	const appealId = Number(params.appealId);
	const azureAdUserId = String(req.get('azureAdUserId'));
	try {
		await createHearing(
			{
				appealId,
				hearingStartTime,
				hearingEndTime,
				estimatedDays,
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
			},
			appeal,
			req.notifyClient,
			azureAdUserId
		);

		if (arrayOfStatusesContainsString(appeal.appealStatus, APPEAL_CASE_STATUS.EVENT) && address) {
			await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
		}

		await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_HEARING_SET_UP, [
				dateISOStringToDisplayDate(hearingStartTime)
			])
		});
		if (address) {
			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId,
				details: AUDIT_TRAIL_HEARING_ADDRESS_ADDED
			});
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
		body: { hearingStartTime, hearingEndTime, estimatedDays, address, addressId },
		params,
		appeal
	} = req;

	const azureAdUserId = String(req.get('azureAdUserId'));
	const appealId = Number(params.appealId);
	const hearingId = Number(params.hearingId);

	try {
		/** @type {Hearing | undefined} */
		const currentHearing = await hearingRepository.getHearingById(hearingId);
		const existingAddressId = currentHearing?.addressId;

		await updateHearing(
			{
				appealId,
				hearingId,
				hearingStartTime,
				hearingEndTime,
				estimatedDays,
				addressId,
				...(address !== undefined && {
					address: address === null ? null : formatAddressForDb(address)
				})
			},
			appeal,
			req.notifyClient,
			azureAdUserId,
			existingAddressId
		);

		if (arrayOfStatusesContainsString(appeal.appealStatus, APPEAL_CASE_STATUS.EVENT)) {
			if (address && !currentHearing?.addressId) {
				await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
			} else if (!address && currentHearing?.addressId) {
				await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_INCOMPLETE);
			}
		}

		const existingHearing = req.appeal.hearing;
		if (existingHearing?.hearingStartTime !== hearingStartTime) {
			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId,
				details: stringTokenReplacement(AUDIT_TRAIL_HEARING_DATE_UPDATED, [
					dateISOStringToDisplayDate(hearingStartTime)
				])
			});
		}
		if (address) {
			const details = existingHearing?.address
				? stringTokenReplacement(AUDIT_TRAIL_HEARING_ADDRESS_UPDATED, [
						formatAddressSingleLine(formatAddressForDb(address))
					])
				: AUDIT_TRAIL_HEARING_ADDRESS_ADDED;
			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId,
				details
			});
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
		await deleteHearing(
			{ hearingId: Number(hearingId) },
			req.notifyClient,
			req.appeal,
			azureAdUserId
		);
		await transitionState(Number(appealId), azureAdUserId, VALIDATION_OUTCOME_CANCEL);
		await createAuditTrail({
			appealId: Number(appealId),
			azureAdUserId,
			details: AUDIT_TRAIL_HEARING_CANCELLED
		});
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.status(200).send({ appealId, hearingId });
};
