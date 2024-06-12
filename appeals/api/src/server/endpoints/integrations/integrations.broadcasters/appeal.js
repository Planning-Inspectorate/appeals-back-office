import config from '#config/config.js';
import pino from '#utils/logger.js';
import { EventType } from '@pins/event-client';

export const broadcastAppeal = async (
	/** @type {Number} */ appealId,
	/** @type {string} */ updateType = EventType.Update
) => {
	if (!config.serviceBusEnabled) {
		return false;
	}

	pino.info({ appealId, updateType });
};
