import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import inquiryRepository from '#repositories/inquiry.repository.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';
import { notifySend } from '#notify/notify-send.js';
import { ERROR_NO_RECIPIENT_EMAIL } from '@pins/appeals/constants/support.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { dateISOStringToDisplayDate, formatTime12h } from '@pins/appeals/utils/date-formatter.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { EventType } from '@pins/event-client';
import { EVENT_TYPE } from '@pins/appeals/constants/common.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Inquiry} Inquiry */
/** @typedef {import('@pins/appeals.api').Appeals.CreateInquiry} CreateInquiry */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateInquiry} UpdateInquiry */
/** @typedef {import('@pins/appeals.api').Appeals.CancelInquiry} CancelInquiry */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

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
		return res.status(404).send({ errors: { inquiryId: ERROR_NOT_FOUND } });
	}

	next();
};

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
 * @returns {Promise<void>}
 */
const createInquiry = async (createInquiryData, appeal, notifyClient) => {
	try {
		const appealId = createInquiryData.appealId;
		const inquiryStartTime = createInquiryData.inquiryStartTime;
		const inquiryEndTime = createInquiryData.inquiryEndTime;
		const address = createInquiryData.address;

		const inquiry = await inquiryRepository.createInquiryById({
			appealId,
			inquiryStartTime,
			inquiryEndTime,
			address
		});

		if (address) {
			await broadcasters.broadcastEvent(inquiry.id, EVENT_TYPE.INQUIRY, EventType.Create);
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
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 */
const updateInquiry = async (updateInquiryData, appeal, notifyClient) => {
	try {
		const appealId = updateInquiryData.appealId;
		const inquiryId = Number(updateInquiryData.inquiryId);
		const inquiryStartTime = updateInquiryData.inquiryStartTime;
		const inquiryEndTime = updateInquiryData.inquiryEndTime;
		const address = updateInquiryData.address;
		const addressId = updateInquiryData.addressId;

		const updateData = {
			appealId,
			inquiryId,
			inquiryStartTime: inquiryStartTime,
			inquiryEndTime: inquiryEndTime || undefined,
			addressId: addressId,
			address: address
		};

		const result = await inquiryRepository.updateInquiryById(inquiryId, updateData);

		// @ts-ignore
		if (result.address) {
			await broadcasters.broadcastEvent(updateData.inquiryId, EVENT_TYPE.INQUIRY, EventType.Update);
			await sendInquiryDetailsNotifications(
				notifyClient,
				'inquiry-updated',
				appeal,
				inquiryStartTime,
				result.address
			);
		}

		return result;
	} catch (error) {
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
		await sendInquiryNotifications(notifyClient, 'inquiry-cancelled', appeal);
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

export { checkInquiryExists, createInquiry, updateInquiry, deleteInquiry };
