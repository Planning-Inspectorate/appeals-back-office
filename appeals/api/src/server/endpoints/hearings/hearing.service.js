import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import hearingRepository from '#repositories/hearing.repository.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';
import { notifySend } from '#notify/notify-send.js';
import { ERROR_NO_RECIPIENT_EMAIL } from '@pins/appeals/constants/support.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { dateISOStringToDisplayDate, formatTime12h } from '@pins/appeals/utils/date-formatter.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { EventType } from '@pins/event-client';
import { EVENT_TYPE } from '@pins/appeals/constants/common.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Hearing} Hearing */
/** @typedef {import('@pins/appeals.api').Appeals.CreateHearing} CreateHearing */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateHearing} UpdateHearing */
/** @typedef {import('@pins/appeals.api').Appeals.CancelHearing} CancelHearing */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
const checkHearingExists = async (req, res, next) => {
	const {
		appeal,
		params: { hearingId }
	} = req;

	const hasHearing = appeal.hearing?.id === Number(hearingId);

	if (!hasHearing) {
		return res.status(404).send({ errors: { hearingId: ERROR_NOT_FOUND } });
	}

	next();
};

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} templateName
 * @param {Appeal} appeal
 * @param {string | Date} hearingStartTime
 * @param {Omit<import('@pins/appeals.api').Schema.Address, 'id'> | null} address
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const sendHearingDetailsNotifications = async (
	notifyClient,
	templateName,
	appeal,
	hearingStartTime,
	address,
	azureAdUserId
) => {
	const personalisation = {
		hearing_date: dateISOStringToDisplayDate(
			typeof hearingStartTime === 'string' ? hearingStartTime : hearingStartTime.toISOString()
		),
		hearing_time: formatTime12h(
			typeof hearingStartTime === 'string' ? new Date(hearingStartTime) : hearingStartTime
		),
		hearing_address: address ? formatAddressSingleLine({ ...address, id: 0 }) : ''
	};
	await sendHearingNotifications(
		notifyClient,
		templateName,
		appeal,
		azureAdUserId,
		personalisation
	);
};

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} templateName
 * @param {Appeal} appeal
 * @param {string} azureAdUserId
 * @param {Record<string, string>} [personalisation]
 * @returns {Promise<void>}
 */
const sendHearingNotifications = async (
	notifyClient,
	templateName,
	appeal,
	azureAdUserId,
	personalisation = {}
) => {
	const appellantEmail = appeal.appellant?.email ?? appeal.agent?.email;
	const lpaEmail = appeal.lpa?.email;
	if (!appellantEmail || !lpaEmail) {
		throw new Error(ERROR_NO_RECIPIENT_EMAIL);
	}

	[appellantEmail, lpaEmail].forEach(async (email) => {
		await notifySend({
			azureAdUserId,
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
 * @param {CreateHearing} createHearingData
 * @param {Appeal} appeal
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const createHearing = async (createHearingData, appeal, notifyClient, azureAdUserId) => {
	try {
		const appealId = createHearingData.appealId;
		const hearingStartTime = createHearingData.hearingStartTime;
		const hearingEndTime = createHearingData.hearingEndTime;
		const address = createHearingData.address;

		const hearing = await hearingRepository.createHearingById({
			appealId,
			hearingStartTime,
			hearingEndTime,
			address
		});

		if (address) {
			await broadcasters.broadcastEvent(hearing.id, EVENT_TYPE.HEARING, EventType.Create);
			await sendHearingDetailsNotifications(
				notifyClient,
				'hearing-set-up',
				appeal,
				hearingStartTime,
				address,
				azureAdUserId
			);
		}
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {UpdateHearing} updateHearingData
 * @param {Appeal} appeal
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @param {number | null | undefined} existingAddressId
 */
const updateHearing = async (
	updateHearingData,
	appeal,
	notifyClient,
	azureAdUserId,
	existingAddressId
) => {
	try {
		const appealId = updateHearingData.appealId;
		const hearingId = Number(updateHearingData.hearingId);
		const hearingStartTime = updateHearingData.hearingStartTime;
		const hearingEndTime = updateHearingData.hearingEndTime;
		const address = updateHearingData.address;
		const addressId = updateHearingData.addressId;

		const updateData = {
			appealId,
			hearingId,
			hearingStartTime: hearingStartTime,
			hearingEndTime: hearingEndTime || undefined,
			addressId: addressId,
			address: address
		};

		const result = await hearingRepository.updateHearingById(hearingId, updateData);

		// @ts-ignore
		if (result.address || existingAddressId) {
			await broadcasters.broadcastEvent(updateData.hearingId, EVENT_TYPE.HEARING, EventType.Update);
			await sendHearingDetailsNotifications(
				notifyClient,
				'hearing-updated',
				appeal,
				hearingStartTime,
				result.address,
				azureAdUserId
			);
		}

		return result;
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {CancelHearing} deleteHearingData
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {Appeal} appeal
 * @param {string} azureAdUserId
 */
const deleteHearing = async (deleteHearingData, notifyClient, appeal, azureAdUserId) => {
	try {
		const { hearingId } = deleteHearingData;

		const existingHearing = await hearingRepository.getHearingById(hearingId);

		await hearingRepository.deleteHearingById(hearingId);

		await broadcasters.broadcastEvent(
			hearingId,
			EVENT_TYPE.HEARING,
			EventType.Delete,
			existingHearing
		);
		await sendHearingNotifications(notifyClient, 'hearing-cancelled', appeal, azureAdUserId);
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

export { checkHearingExists, createHearing, updateHearing, deleteHearing };
