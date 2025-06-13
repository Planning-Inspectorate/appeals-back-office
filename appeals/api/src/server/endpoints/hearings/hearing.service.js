import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import hearingRepository from '#repositories/hearing.repository.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { EventType } from '@pins/event-client';
import { EVENT_TYPE } from '@pins/appeals/constants/common.js';

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
 * @param {CreateHearing} createHearingData
 * @returns {Promise<void>}
 */
const createHearing = async (createHearingData) => {
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

		if (hearing && address) {
			await broadcasters.broadcastEvent(hearing.id, EVENT_TYPE.HEARING, EventType.Create);
		}
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {UpdateHearing} updateHearingData
 */
const updateHearing = async (updateHearingData) => {
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

		if (result && address) {
			await broadcasters.broadcastEvent(updateData.hearingId, EVENT_TYPE.HEARING, EventType.Update);
		}

		return result;
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {CancelHearing} deleteHearingData
 */
const deleteHearing = async (deleteHearingData) => {
	try {
		const { hearingId } = deleteHearingData;

		await hearingRepository.deleteHearingById(hearingId);

		await broadcasters.broadcastEvent(hearingId, EVENT_TYPE.HEARING, EventType.Delete);
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

export { checkHearingExists, createHearing, updateHearing, deleteHearing };
