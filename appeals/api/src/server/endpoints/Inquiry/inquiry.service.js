import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { notifySend } from '#notify/notify-send.js';
import inquiryRepository from '#repositories/inquiry.repository.js';
import transitionState from '#state/transition-state.js';
import { databaseConnector } from '#utils/database-connector.js';
import { EVENT_TYPE, PROCEDURE_TYPE_ID_MAP } from '@pins/appeals/constants/common.js';
import {
	AUDIT_TRAIL_SYSTEM_UUID,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_NO_RECIPIENT_EMAIL,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import {
	recalculateDateIfNotBusinessDay,
	setTimeInTimeZone
} from '@pins/appeals/utils/business-days.js';
import { dateISOStringToDisplayDate, formatTime12h } from '@pins/appeals/utils/date-formatter.js';
import { EventType } from '@pins/event-client';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Inquiry} Inquiry */
/** @typedef {import('@pins/appeals.api').Appeals.CreateInquiry} CreateInquiry */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateInquiry} UpdateInquiry */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} templateName
 * @param {Appeal} appeal
 * @param {string | Date} inquiryStartTime
 * @param {Omit<import('@pins/appeals.api').Schema.Address, 'id'>} address
 * @returns {Promise<void>}
 */
const sendInquiryDetailsNotifications = async (
	notifyClient,
	templateName,
	appeal,
	inquiryStartTime,
	address
) => {
	const personalisation = {
		inquiry_date: dateISOStringToDisplayDate(
			typeof inquiryStartTime === 'string' ? inquiryStartTime : inquiryStartTime.toISOString()
		),
		inquiry_time: formatTime12h(
			typeof inquiryStartTime === 'string' ? new Date(inquiryStartTime) : inquiryStartTime
		),
		inquiry_address: formatAddressSingleLine({ ...address, id: 0 })
	};
	await sendInquiryNotifications(notifyClient, templateName, appeal, personalisation);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
const checkInquiryExists = async (req, res, next) => {
	const {
		appeal,
		params: { inquiryId }
	} = req;

	const hasInquiry = appeal.inquiry?.id === Number(inquiryId);

	if (!hasInquiry) {
		return res.status(404).send({ errors: { hearingId: ERROR_NOT_FOUND } });
	}

	next();
};

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} templateName
 * @param {Appeal} appeal
 * @param {Record<string, string>} [personalisation]
 * @returns {Promise<void>}
 */
const sendInquiryNotifications = async (
	notifyClient,
	templateName,
	appeal,
	personalisation = {}
) => {
	const appellantEmail = appeal.appellant?.email ?? appeal.agent?.email;
	const lpaEmail = appeal.lpa?.email;
	if (!appellantEmail || !lpaEmail) {
		throw new Error(ERROR_NO_RECIPIENT_EMAIL);
	}

	[appellantEmail, lpaEmail].forEach(async (email) => {
		await notifySend({
			notifyClient,
			templateName,
			personalisation: {
				appeal_reference_number: appeal.reference,
				site_address: appeal.address ? formatAddressSingleLine(appeal.address) : '',
				lpa_reference: appeal.applicationReference ?? '',
				...personalisation
			},
			recipientEmail: email
		});
	});
};

/**
 * @param {CreateInquiry} createInquiryData
 * @param {Appeal} appeal
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const createInquiry = async (createInquiryData, appeal, notifyClient, azureAdUserId) => {
	try {
		const appealId = createInquiryData.appealId;
		const inquiryStartTime = createInquiryData.inquiryStartTime;
		const inquiryEndTime = createInquiryData.inquiryEndTime;
		const address = createInquiryData.address;

		const appealType = appeal.appealType || null;
		if (!appealType) {
			throw new Error('Appeal type is required to start a case.');
		}

		const startedAt = await recalculateDateIfNotBusinessDay(createInquiryData.startDate.toString());
		const startDateWithTimeCorrection = setTimeInTimeZone(startedAt, 0, 0);

		const procedureTypeId = PROCEDURE_TYPE_ID_MAP['inquiry'];

		const result = await databaseConnector.$transaction(async (tx) => {
			let addr;
			if (address) {
				// Add address
				addr = await tx.address.create({
					data: address
				});
			}

			// Add inquiry
			const inquiry = await tx.inquiry.create({
				data: {
					inquiryStartTime,
					inquiryEndTime,
					appealId,
					addressId: addr?.id,
					estimatedDays: createInquiryData.estimatedDays
						? Number(createInquiryData.estimatedDays)
						: undefined
				}
			});

			const updatedAppeal = await tx.appeal.update({
				where: { id: appeal.id },
				data: {
					caseStartedDate: startDateWithTimeCorrection.toISOString(),
					...(procedureTypeId && { procedureTypeId })
				}
			});

			const existingTimetable = await tx.appealTimetable.findFirst({
				where: { appealId }
			});
			const timetableData = {
				appealId,
				lpaQuestionnaireDueDate: createInquiryData.lpaQuestionnaireDueDate,
				lpaStatementDueDate: createInquiryData.statementDueDate,
				appellantStatementDueDate: createInquiryData.statementDueDate,
				planningObligationDueDate: createInquiryData.planningObligationDueDate,
				statementOfCommonGroundDueDate: createInquiryData.statementOfCommonGroundDueDate,
				ipCommentsDueDate: createInquiryData.ipCommentsDueDate,
				proofOfEvidenceAndWitnessesDueDate: createInquiryData.proofOfEvidenceAndWitnessesDueDate
			};

			if (existingTimetable) {
				// Add Appeal Timetable
				await tx.appealTimetable.update({
					where: { appealId },
					data: timetableData
				});
			} else {
				// Add Appeal Timetable
				await tx.appealTimetable.create({
					data: timetableData
				});
			}

			// Return anything you want from this transaction
			return { addr, inquiry, updatedAppeal };
		});

		await transitionState(
			appeal.id,
			azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
			APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
		);

		if (address) {
			await broadcasters.broadcastEvent(result.inquiry.id, EVENT_TYPE.INQUIRY, EventType.Create);
			await sendInquiryDetailsNotifications(
				notifyClient,
				'inquiry-set-up',
				appeal,
				inquiryStartTime,
				address
			);
		}
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {UpdateInquiry} updateInquiryData
 * @param {Appeal} appeal
 * @returns {Promise<void>}
 */
const updateInquiry = async (updateInquiryData, appeal) => {
	try {
		const appealId = updateInquiryData.appealId;
		const inquiryId = updateInquiryData.inquiryId;
		const inquiryStartTime = updateInquiryData.inquiryStartTime;
		const inquiryEndTime = updateInquiryData.inquiryEndTime;
		const address = updateInquiryData.address;
		const addressId = updateInquiryData.addressId;
		const estimatedDays = updateInquiryData.estimatedDays;

		const appealType = appeal.appealType || null;
		if (!appealType) {
			throw new Error('Appeal type is required to start a case.');
		}

		const updateData = {
			appealId,
			inquiryId,
			inquiryStartTime,
			inquiryEndTime,
			addressId,
			address,
			estimatedDays
		};

		await inquiryRepository.updateInquiryById(inquiryId, updateData);
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

export { checkInquiryExists, createInquiry, updateInquiry };
