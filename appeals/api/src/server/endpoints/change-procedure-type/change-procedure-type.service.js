/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { notifySend } from '#notify/notify-send.js';
import { databaseConnector } from '#utils/database-connector.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import {
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_NO_RECIPIENT_EMAIL
} from '@pins/appeals/constants/support.js';

/**
 * @param {import('src/server/openapi-types.js').ChangeProcedureTypeRequest} data
 * @param {number} appealId
 * @returns {Promise<void>}
 */
export const changeProcedureToWritten = async (data, appealId) => {
	try {
		await databaseConnector.$transaction(async (tx) => {
			const procedureType = await tx.procedureType.findFirst({
				where: { key: data.appealProcedure }
			});

			await tx.appeal.update({
				where: { id: appealId },
				data: {
					procedureTypeId: procedureType?.id
				}
			});

			const updatedAppeal = await tx.appealTimetable.update({
				where: { appealId },
				data: {
					lpaQuestionnaireDueDate: data.lpaQuestionnaireDueDate,
					lpaStatementDueDate: data.statementDueDate,
					appellantStatementDueDate: data.statementDueDate,
					ipCommentsDueDate: data.ipCommentsDueDate
				}
			});

			if (data.existingAppealProcedure === 'hearing') {
				await tx.hearing.deleteMany({
					where: { appealId }
				});
				await tx.hearingEstimate.deleteMany({
					where: { appealId }
				});
			} else if (data.existingAppealProcedure === 'inquiry') {
				await tx.inquiry.deleteMany({
					where: { appealId }
				});
				await tx.inquiryEstimate.deleteMany({
					where: { appealId }
				});
			}
			return { updatedAppeal };
		});
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} templateName
 * @param {Appeal} appeal
 * @param {string} appealProcedure
 * @param {string | undefined} existingAppealProcedure
 * @returns {Promise<void>}
 */
export const sendChangeProcedureTypeNotifications = async (
	notifyClient,
	templateName,
	appeal,
	appealProcedure,
	existingAppealProcedure
) => {
	const lpaStatement = await databaseConnector.representation.findFirst({
		where: { appealId: appeal.id, representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT }
	});
	const personalisation = {
		change_message: `We have changed your appeal procedure to ${
			appealProcedure === 'written' ? 'written representations' : appealProcedure
		} ${
			existingAppealProcedure === 'hearing'
				? `and cancelled your hearing`
				: existingAppealProcedure === 'inquiry'
				? `and cancelled your inquiry`
				: ''
		}.`,
		appeal_procedure: appealProcedure,
		team_email_address: await getTeamEmailFromAppealId(appeal.id)
	};
	await sendNotifications(notifyClient, templateName, appeal, lpaStatement, personalisation);
};

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} templateName
 * @param {Appeal} appeal
 * @param {Object | null} lpaStatement
 * @param {Record<string, string>} [personalisation]
 * @returns {Promise<void>}
 */
const sendNotifications = async (
	notifyClient,
	templateName,
	appeal,
	lpaStatement,
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
		const subject = `We have changed ${item.isLpa ? 'the' : 'your'} appeal procedure: ${
			appeal.reference
		}`;

		await notifySend({
			notifyClient,
			templateName,
			personalisation: {
				appeal_reference_number: appeal.reference,
				site_address: appeal.address ? formatAddressSingleLine(appeal.address) : '',
				lpa_reference: appeal.applicationReference ?? '',
				is_lpa: item.isLpa,
				lpa_statement_exists: lpaStatement ? true : false,
				subject,
				...personalisation
			},
			recipientEmail: item.email
		});
	});
};
