import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { notifySend } from '#notify/notify-send.js';
import inquiryRepository from '#repositories/inquiry.repository.js';
import transitionState from '#state/transition-state.js';
import { databaseConnector } from '#utils/database-connector.js';
import logger from '#utils/logger.js';
import { trimAppealType } from '#utils/string-utils.js';
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
/** @typedef {import('@pins/appeals.api').Appeals.CancelInquiry} CancelInquiry */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @typedef {{appealId: number,lpaQuestionnaireDueDate: string | Date,lpaStatementDueDate: string | Date,appellantStatementDueDate: string | Date,planningObligationDueDate: string | Date | undefined,statementOfCommonGroundDueDate: string | Date,ipCommentsDueDate: string | Date,proofOfEvidenceAndWitnessesDueDate: string | Date}} TimetableData
 */

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} templateName
 * @param {Appeal} appeal
 * @param {string | Date} inquiryStartTime
 * @param {string} estimatedDays
 * @param {TimetableData | undefined} timetableData
 * @param {Omit<import('@pins/appeals.api').Schema.Address, 'id'> | null | undefined} address
 * @param {string | Date} startDate
 * @returns {Promise<void>}
 */
const sendInquiryDetailsNotifications = async (
	notifyClient,
	templateName,
	appeal,
	inquiryStartTime,
	estimatedDays,
	timetableData,
	address,
	startDate
) => {
	const personalisation = {
		appeal_type: trimAppealType(appeal.appealType?.type ?? ''),
		start_date: dateISOStringToDisplayDate(
			startDate ? (typeof startDate === 'string' ? startDate : startDate.toISOString()) : ''
		),
		inquiry_date: dateISOStringToDisplayDate(
			typeof inquiryStartTime === 'string' ? inquiryStartTime : inquiryStartTime.toISOString()
		),
		inquiry_time: formatTime12h(
			typeof inquiryStartTime === 'string' ? new Date(inquiryStartTime) : inquiryStartTime
		),
		inquiry_address: address ? formatAddressSingleLine({ ...address, id: 0 }) : '',
		inquiry_expected_days: estimatedDays,
		questionnaire_due_date: dateISOStringToDisplayDate(
			timetableData?.lpaQuestionnaireDueDate
				? typeof timetableData?.lpaQuestionnaireDueDate === 'string'
					? timetableData?.lpaQuestionnaireDueDate
					: timetableData?.lpaQuestionnaireDueDate.toISOString()
				: ''
		),
		lpa_statement_deadline: dateISOStringToDisplayDate(
			timetableData?.lpaStatementDueDate
				? typeof timetableData?.lpaStatementDueDate === 'string'
					? timetableData?.lpaStatementDueDate
					: timetableData?.lpaStatementDueDate.toISOString()
				: ''
		),
		ip_comments_deadline: dateISOStringToDisplayDate(
			timetableData?.ipCommentsDueDate
				? typeof timetableData?.ipCommentsDueDate === 'string'
					? timetableData?.ipCommentsDueDate
					: timetableData?.ipCommentsDueDate.toISOString()
				: ''
		),
		statement_of_common_ground_deadline: dateISOStringToDisplayDate(
			timetableData?.statementOfCommonGroundDueDate
				? typeof timetableData?.statementOfCommonGroundDueDate === 'string'
					? timetableData?.statementOfCommonGroundDueDate
					: timetableData?.statementOfCommonGroundDueDate.toISOString()
				: ''
		),
		proof_of_evidence_and_witnesses_deadline: dateISOStringToDisplayDate(
			timetableData?.proofOfEvidenceAndWitnessesDueDate
				? typeof timetableData?.proofOfEvidenceAndWitnessesDueDate === 'string'
					? timetableData?.proofOfEvidenceAndWitnessesDueDate
					: timetableData?.proofOfEvidenceAndWitnessesDueDate.toISOString()
				: ''
		),
		planning_obligation_deadline: dateISOStringToDisplayDate(
			timetableData?.planningObligationDueDate
				? typeof timetableData.planningObligationDueDate === 'string'
					? timetableData?.planningObligationDueDate
					: timetableData?.planningObligationDueDate.toISOString()
				: ''
		),
		team_email_address: await getTeamEmailFromAppealId(appeal.id)
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

	[
		{ email: appellantEmail, isLpa: false },
		{ email: lpaEmail, isLpa: true }
	].forEach(async (item) => {
		await notifySend({
			notifyClient,
			templateName,
			personalisation: {
				appeal_reference_number: appeal.reference,
				site_address: appeal.address ? formatAddressSingleLine(appeal.address) : '',
				lpa_reference: appeal.applicationReference ?? '',
				is_lpa: item.isLpa,
				...personalisation
			},
			recipientEmail: item.email
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
		const estimatedDays = createInquiryData.estimatedDays
			? createInquiryData.estimatedDays.toString()
			: '';
		const isStartCase = createInquiryData.isStartCase;

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

			let updatedAppeal;

			/** @type {TimetableData | undefined} */
			let timetableData;
			if (isStartCase) {
				updatedAppeal = await tx.appeal.update({
					where: { id: appeal.id },
					data: {
						caseStartedDate: startDateWithTimeCorrection.toISOString(),
						...(procedureTypeId && { procedureTypeId })
					}
				});

				const existingTimetable = await tx.appealTimetable.findFirst({
					where: { appealId }
				});
				timetableData = {
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
			}

			// Return anything you want from this transaction
			return { addr, inquiry, updatedAppeal, timetableData };
		});
		const timetableData = result.timetableData;

		if (isStartCase) {
			await transitionState(
				appeal.id,
				azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
			);

			await sendInquiryDetailsNotifications(
				notifyClient,
				'start-case-inquiry-set-up',
				appeal,
				inquiryStartTime,
				estimatedDays,
				timetableData,
				address,
				startDateWithTimeCorrection
			);
		} else {
			await sendInquiryDetailsNotifications(
				notifyClient,
				'inquiry-set-up',
				appeal,
				inquiryStartTime,
				estimatedDays,
				timetableData,
				address,
				startDateWithTimeCorrection
			);
		}
		await broadcasters.broadcastAppeal(appeal.id);
		await broadcasters.broadcastEvent(result.inquiry.id, EVENT_TYPE.INQUIRY, EventType.Create);
	} catch (error) {
		logger.error(error, 'Failed to create inquiry');
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {UpdateInquiry | Omit<UpdateInquiry, 'address'>} updateInquiryData
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {Appeal} appeal
 * @param {number | null | undefined} existingAddressId
 * @returns {Promise<void>}
 */
const updateInquiry = async (updateInquiryData, notifyClient, appeal, existingAddressId) => {
	try {
		const appealId = updateInquiryData.appealId;
		const inquiryId = updateInquiryData.inquiryId;
		const inquiryStartTime = updateInquiryData.inquiryStartTime;
		const inquiryEndTime = updateInquiryData.inquiryEndTime;
		const address = 'address' in updateInquiryData ? updateInquiryData.address : undefined;
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
			...(address !== undefined && { address }),
			estimatedDays
		};

		const result = await inquiryRepository.updateInquiryById(inquiryId, updateData);

		if (result.address || existingAddressId) {
			await broadcasters.broadcastEvent(updateData.inquiryId, EVENT_TYPE.INQUIRY, EventType.Update);
			await sendInquiryDetailsNotifications(
				notifyClient,
				'inquiry-updated',
				appeal,
				inquiryStartTime,
				result?.estimatedDays ? result?.estimatedDays.toString() : '',
				undefined,
				address,
				''
			);
		}
	} catch (error) {
		logger.error(error, 'Failed to update inquiry');
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {CancelInquiry} deleteInquiryData
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {Appeal} appeal
 */
const deleteInquiry = async (deleteInquiryData, notifyClient, appeal) => {
	try {
		const { inquiryId } = deleteInquiryData;

		const existingInquiry = await inquiryRepository.getInquiryById(inquiryId);

		await inquiryRepository.deleteInquiryById(inquiryId);

		await broadcasters.broadcastEvent(
			inquiryId,
			EVENT_TYPE.INQUIRY,
			EventType.Delete,
			existingInquiry
		);
		await sendInquiryNotifications(notifyClient, 'inquiry-cancelled', appeal, {
			team_email_address: await getTeamEmailFromAppealId(appeal.id)
		});
	} catch (error) {
		logger.error(error, 'Failed to delete inquiry');
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

export { checkInquiryExists, createInquiry, deleteInquiry, updateInquiry };
