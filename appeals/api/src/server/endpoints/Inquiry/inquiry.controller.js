import {
	formatAddressForDb,
	formatAddressSingleLine
} from '#endpoints/addresses/addresses.formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import inquiryRepository from '#repositories/inquiry.repository.js';
import transitionState from '#state/transition-state.js';
import { arrayOfStatusesContainsString } from '#utils/array-of-statuses-contains-string.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import {
	AUDIT_TRAIL_INQUIRY_ADDRESS_ADDED,
	AUDIT_TRAIL_INQUIRY_ADDRESS_UPDATED,
	AUDIT_TRAIL_INQUIRY_CANCELLED,
	AUDIT_TRAIL_INQUIRY_DATE_UPDATED,
	AUDIT_TRAIL_INQUIRY_SET_UP,
	AUDIT_TRAIL_INQUIRY_TIME_UPDATED,
	ERROR_FAILED_TO_SAVE_DATA,
	VALIDATION_OUTCOME_CANCEL,
	VALIDATION_OUTCOME_COMPLETE,
	VALIDATION_OUTCOME_INCOMPLETE
} from '@pins/appeals/constants/support.js';
import { setTimeInTimeZone } from '@pins/appeals/utils/business-days.js';
import formatDate, {
	dateISOStringToDisplayDate,
	formatTime12h
} from '@pins/appeals/utils/date-formatter.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { isSameDay } from 'date-fns';
import { createInquiry, deleteInquiry, updateInquiry } from './inquiry.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('@pins/appeals.api').Schema.Inquiry} Inquiry */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const postInquiry = async (req, res) => {
	const {
		body: { inquiryStartTime, inquiryEndTime, address, startDate, estimatedDays, isStartCase },
		params,
		appeal
	} = req;

	const appealId = Number(params.appealId);
	const azureAdUserId = String(req.get('azureAdUserId'));
	try {
		const dueDateFields = [
			'lpaQuestionnaireDueDate',
			'statementDueDate',
			'ipCommentsDueDate',
			'statementOfCommonGroundDueDate',
			'proofOfEvidenceAndWitnessesDueDate',
			'caseManagementConferenceDueDate',
			'planningObligationDueDate'
		];

		const dueDates = dueDateFields.reduce((acc, field) => {
			if (req.body[field]) {
				// @ts-ignore
				acc[field] = setTimeInTimeZone(
					req.body[field],
					DEADLINE_HOUR,
					DEADLINE_MINUTE
				).toISOString();
			}
			return acc;
		}, {});

		await createInquiry(
			{
				appealId,
				startDate,
				inquiryStartTime,
				inquiryEndTime,
				estimatedDays,
				...dueDates,
				isStartCase,
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
		/** @type {Inquiry | undefined} */
		const currentInquiry = await inquiryRepository.getInquiryById(inquiryId);
		const existingAddressId = currentInquiry?.addressId;
		await updateInquiry(
			{
				appealId,
				inquiryId,
				inquiryStartTime,
				inquiryEndTime: undefined,
				estimatedDays,
				addressId,
				...(address !== undefined && {
					address: address === null ? null : formatAddressForDb(address)
				})
			},
			req.notifyClient,
			appeal,
			existingAddressId
		);

		const existingInquiry = req.appeal.inquiry;

		if (arrayOfStatusesContainsString(appeal.appealStatus, APPEAL_CASE_STATUS.EVENT)) {
			if (address && !currentInquiry?.addressId) {
				await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
			} else if (!address && currentInquiry?.addressId) {
				await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_INCOMPLETE);
			}
		}

		if (existingInquiry) {
			const existingEnquiryStartTimeDate = new Date(existingInquiry.inquiryStartTime);
			const newEnquiryStartTimeDate = new Date(inquiryStartTime);
			if (!isSameDay(existingEnquiryStartTimeDate, newEnquiryStartTimeDate)) {
				await createAuditTrail({
					appealId: appeal.id,
					azureAdUserId,
					details: stringTokenReplacement(AUDIT_TRAIL_INQUIRY_DATE_UPDATED, [
						formatDate(newEnquiryStartTimeDate)
					])
				});
			}

			const existingTime = existingEnquiryStartTimeDate.toTimeString().slice(0, 5); // "11:30"
			const newTime = newEnquiryStartTimeDate.toTimeString().slice(0, 5);
			if (existingTime !== newTime) {
				await createAuditTrail({
					appealId: appeal.id,
					azureAdUserId,
					details: stringTokenReplacement(AUDIT_TRAIL_INQUIRY_TIME_UPDATED, [
						formatTime12h(newEnquiryStartTimeDate)
					])
				});
			}
		}

		if (address && address !== existingInquiry?.address) {
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

	return res.status(201).send({ appealId, inquiryStartTime });
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
