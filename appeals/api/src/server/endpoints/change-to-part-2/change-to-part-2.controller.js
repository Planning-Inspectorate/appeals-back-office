/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { databaseConnector } from '#utils/database-connector.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL,
	ERROR_FAILED_TO_SAVE_DATA
} from '@pins/appeals/constants/support.js';
import { getChangeToPart2NotifyPreviews } from './change-to-part-2.service.js';

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const requestChangeOfProcedureTypeAndUpdateDueDate = async (req, res) => {
	const { body, params, appeal } = req;
	const data = body;
	const appealId = Number(params.appealId);
	// const azureAdUserId = String(req.get('azureAdUserId'));
	try {
		const result = await databaseConnector.$transaction(async (tx) => {
			const procedureType = await tx.procedureType.findFirst({
				where: { key: data.appealProcedure }
			});

			const updatedAppeal = await tx.appeal.update({
				where: { id: appealId },
				data: {
					procedureTypeId: procedureType?.id,
					caseExtensionDate: new Date(data.appealDueDate)
				}
			});

			return { updatedAppeal };
		});

		await broadcasters.broadcastAppeal(appeal.id);
		console.log(result);
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.status(201).send({ appealId });
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response|undefined>}
 */
export const changeOfProcedureTypeAndUpdateDueDateNotifyPreview = async (req, res) => {
	const { body, appeal } = req;
	if (appeal && appeal.appealType) {
		let dueDate = body.dueDate;
		let procedureType = body.procedureType;
		if (!dueDate) {
			dueDate = new Date().toISOString();
		}

		const siteAddress = appeal.address
			? formatAddressSingleLine(appeal.address)
			: 'Address not available';

		try {
			const result = await getChangeToPart2NotifyPreviews(
				appeal,
				siteAddress,
				procedureType,
				dueDate
			);
			return res.status(200).send(result);
		} catch (/** @type {any} */ error) {
			logger.error(`Could not generate notify previews for case ${appeal.reference}: ${error}`);
			return res.status(500).send({
				errors: {
					body: stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
						error?.message || 'Unknown error'
					])
				}
			});
		}
	}
};
