import { formatAddressForDb } from '#endpoints/addresses/addresses.formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import transitionState from '#state/transition-state.js';
import { arrayOfStatusesContainsString } from '#utils/array-of-statuses-contains-string.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_INQUIRY_ADDRESS_ADDED,
	AUDIT_TRAIL_INQUIRY_SET_UP,
	ERROR_FAILED_TO_SAVE_DATA,
	VALIDATION_OUTCOME_COMPLETE
} from '@pins/appeals/constants/support.js';
import { dateISOStringToDisplayDate } from '@pins/appeals/utils/date-formatter.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { createInquiry, updateInquiry } from './inquiry.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const postInquiry = async (req, res) => {
	const {
		body: {
			inquiryStartTime,
			inquiryEndTime,
			address,
			startDate,
			estimatedDays,
			lpaQuestionnaireDueDate,
			statementDueDate,
			ipCommentsDueDate,
			statementOfCommonGroundDueDate,
			proofOfEvidenceAndWitnessesDueDate,
			planningObligationDueDate
		},
		params,
		appeal
	} = req;

	const appealId = Number(params.appealId);
	const azureAdUserId = String(req.get('azureAdUserId'));
	try {
		await createInquiry(
			{
				appealId,
				startDate,
				inquiryStartTime,
				inquiryEndTime,
				estimatedDays,
				lpaQuestionnaireDueDate,
				statementDueDate,
				ipCommentsDueDate,
				statementOfCommonGroundDueDate,
				proofOfEvidenceAndWitnessesDueDate,
				planningObligationDueDate,
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
			req.get('azureAdUserId') || ''
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
export const patchInquiry = async (req, res) => {
	const {
		body: { inquiryStartTime, address, estimatedDays, addressId },
		params,
		appeal
	} = req;

	const appealId = Number(params.appealId);
	const inquiryId = Number(params.inquiryId);
	const azureAdUserId = String(req.get('azureAdUserId'));
	try {
		await updateInquiry(
			{
				appealId,
				inquiryId,
				inquiryStartTime,
				inquiryEndTime: undefined,
				estimatedDays,
				addressId,
				...{
					address: address === null ? null : formatAddressForDb(address)
				}
			},
			appeal
		);

		if (arrayOfStatusesContainsString(appeal.appealStatus, APPEAL_CASE_STATUS.EVENT) && address) {
			await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
		}
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.status(201).send({ appealId, inquiryStartTime });
};
