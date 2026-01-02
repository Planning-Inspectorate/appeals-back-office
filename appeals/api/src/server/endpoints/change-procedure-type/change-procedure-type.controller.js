/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_CHANGE_PROCEDURE_TYPE,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_INVALID_PROCEDURE_TYPE
} from '@pins/appeals/constants/support.js';
import {
	changeProcedureToHearing,
	changeProcedureToInquiry,
	changeProcedureToWritten,
	sendChangeProcedureTypeNotifications
} from './change-procedure-type.service.js';

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const requestChangeOfProcedureType = async (req, res) => {
	const { body, params, appeal } = req;

	/**@type {import('src/server/openapi-types.js').ChangeProcedureTypeRequest} */
	const data = body;
	const appealId = Number(params.appealId);
	const azureAdUserId = String(req.get('azureAdUserId'));
	try {
		switch (data.appealProcedure) {
			case 'written':
				await changeProcedureToWritten(data, appealId);
				break;
			case 'hearing':
				await changeProcedureToHearing(data, appealId);
				break;
			case 'inquiry':
				await changeProcedureToInquiry(data, appealId);
				break;
			default:
				logger.error(`Appeal procedure ${data.appealProcedure} is not valid`);
				return res.status(500).send({ errors: { body: ERROR_INVALID_PROCEDURE_TYPE } });
		}

		await broadcasters.broadcastAppeal(appeal.id);

		if (data.appealProcedure !== data.existingAppealProcedure) {
			await sendChangeProcedureTypeNotifications(
				req.notifyClient,
				'change-procedure-type',
				appeal,
				data.appealProcedure,
				data.existingAppealProcedure,
				data.proofOfEvidenceAndWitnessesDueDate,
				data.caseManagementConferenceDueDate,
				// @ts-ignore
				data.address,
				data.eventDate
			);

			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId,
				details: stringTokenReplacement(AUDIT_TRAIL_CHANGE_PROCEDURE_TYPE, [
					data.appealProcedure === 'written' ? 'written representations' : data.appealProcedure
				])
			});
		}
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.status(201).send({ appealId });
};
