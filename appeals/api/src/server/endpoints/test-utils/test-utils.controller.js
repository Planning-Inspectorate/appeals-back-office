import { databaseConnector } from '#utils/database-connector.js';
import { sub } from 'date-fns';
import { updateCompletedEvents } from '#endpoints/appeals/appeals.service.js';
import { AUDIT_TRAIL_SYSTEM_UUID } from '#endpoints/constants.js';
import { APPEAL_START_RANGE } from '@pins/appeals/constants/common.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const simulateSiteVisitElapsed = async (req, res) => {
	const { appealReference } = req.params;
	const reference = Number(appealReference);
	const appealId = reference - APPEAL_START_RANGE;

	const event = await databaseConnector.siteVisit.findFirst({
		where: { appealId }
	});

	if (event !== null) {
		const { id, ...siteVisitData } = event;

		siteVisitData.visitDate = sub(new Date(), { days: 3 });
		if (siteVisitData.visitStartTime !== null) {
			siteVisitData.visitStartTime = sub(new Date(), { days: 3 });
		}
		if (siteVisitData.visitEndTime !== null) {
			siteVisitData.visitEndTime = sub(new Date(), { days: 3 });
		}

		await databaseConnector.siteVisit.update({
			where: { id },
			data: siteVisitData
		});

		await updateCompletedEvents(AUDIT_TRAIL_SYSTEM_UUID);
		return res.send(true);
	}

	return res.send(false);
};
