import logger from '#utils/logger.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';
import { formatInquiry } from './inquiry.formatter.js';
import { createInquiry, deleteInquiry, updateInquiry } from './inquiry.service.js';
import { arrayOfStatusesContainsString } from '#utils/array-of-statuses-contains-string.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import transitionState from '#state/transition-state.js';
import {
	VALIDATION_OUTCOME_COMPLETE,
	VALIDATION_OUTCOME_CANCEL
} from '@pins/appeals/constants/support.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { dateISOStringToDisplayDate } from '@pins/appeals/utils/date-formatter.js';
import {
	AUDIT_TRAIL_INQUIRY_ADDRESS_ADDED,
	AUDIT_TRAIL_INQUIRY_DATE_UPDATED,
	AUDIT_TRAIL_INQUIRY_ADDRESS_UPDATED,
	AUDIT_TRAIL_INQUIRY_CANCELLED,
	AUDIT_TRAIL_INQUIRY_SET_UP
} from '@pins/appeals/constants/support.js';
import {
	formatAddressForDb,
	formatAddressSingleLine
} from '#endpoints/addresses/addresses.formatter.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getInquiryById = async (req, res) => {
	const { appeal } = req;
	const formattedAppeal = formatInquiry(appeal);

	console.log('formattedAppeal', formattedAppeal);

	return res.send(formattedAppeal);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const postInquiry = async (req, res) => {
	const {
		body: { inquiryStartTime, inquiryEndTime, address },
		params,
		appeal
	} = req;

	const appealId = Number(params.appealId);
	const azureAdUserId = String(req.get('azureAdUserId'));
	try {
		await createInquiry(
			{
				appealId,
				inquiryStartTime,
				inquiryEndTime,
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
			req.notifyClient
		);

		if (arrayOfStatusesContainsString(appeal.appealStatus, APPEAL_CASE_STATUS.EVENT) && address) {
			await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
		}

		await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_INQUIRY_SET_UP, [
				dateISOStringToDisplayDate(inquiryStartTime)
			])
		});
		if (address) {
			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId,
				details: AUDIT_TRAIL_INQUIRY_ADDRESS_ADDED
			});
		}
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.status(201).send({ appealId, inquiryStartTime, inquiryEndTime });
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const rearrangeInquiry = async (req, res) => {
	const {
		body: { inquiryStartTime, inquiryEndTime, address, addressId },
		params,
		appeal
	} = req;

	const azureAdUserId = String(req.get('azureAdUserId'));
	const appealId = Number(params.appealId);
	const inquiryId = Number(params.inquiryId);

	try {
		await updateInquiry(
			{
				appealId,
				inquiryId,
				inquiryStartTime,
				inquiryEndTime,
				addressId,
				...(address !== undefined && {
					address: address === null ? null : formatAddressForDb(address)
				})
			},
			appeal,
			req.notifyClient
		);

		const existingInquiry = req.appeal.inquiry;
		if (existingInquiry?.inquiryStartTime !== inquiryStartTime) {
			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId,
				details: stringTokenReplacement(AUDIT_TRAIL_INQUIRY_DATE_UPDATED, [
					dateISOStringToDisplayDate(inquiryStartTime)
				])
			});
		}
		if (address) {
			const details = existingInquiry?.address
				? stringTokenReplacement(AUDIT_TRAIL_INQUIRY_ADDRESS_UPDATED, [
						formatAddressSingleLine(formatAddressForDb(address))
				  ])
				: AUDIT_TRAIL_INQUIRY_ADDRESS_ADDED;
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

	return res.status(201).send({ appealId, inquiryStartTime, inquiryEndTime });
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const cancelInquiry = async (req, res) => {
	const {
		params: { appealId, inquiryId }
	} = req;
	const azureAdUserId = String(req.get('azureAdUserId'));
	try {
		await deleteInquiry({ inquiryId: Number(inquiryId) }, req.notifyClient, req.appeal);
		await transitionState(Number(appealId), azureAdUserId, VALIDATION_OUTCOME_CANCEL);
		await createAuditTrail({
			appealId: Number(appealId),
			azureAdUserId,
			details: AUDIT_TRAIL_INQUIRY_CANCELLED
		});
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.status(200).send({ appealId, inquiryId });
};
