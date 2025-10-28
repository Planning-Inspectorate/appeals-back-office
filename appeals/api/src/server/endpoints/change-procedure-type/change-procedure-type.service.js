/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

import { databaseConnector } from '#utils/database-connector.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';

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
				await tx.hearing.delete({
					where: { appealId }
				});
				await tx.hearingEstimate.delete({
					where: { appealId }
				});
			} else if (data.existingAppealProcedure === 'inquiry') {
				await tx.inquiry.delete({
					where: { appealId }
				});
				await tx.inquiryEstimate.delete({
					where: { appealId }
				});
			}
			return { updatedAppeal };
		});
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};
