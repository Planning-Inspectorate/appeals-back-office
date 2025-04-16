import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { databaseConnector } from '#utils/database-connector.js';
import { FRONT_OFFICE_URL } from '@pins/appeals/constants/support.js';
import transitionState from '#state/transition-state.js';
import formatDate from '#utils/date-formatter.js';
import timetableRepository from '#repositories/appeal-timetable.repository.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { setTimeInTimeZone } from '#utils/business-days.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import { notifySend } from '#notify/notify-send.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {Appeal} appeal
 * @param {number} newAppealTypeId
 * @param {string} newAppealType
 * @param {string} dueDate
 * @param {import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const changeAppealType = async (
	appeal,
	newAppealTypeId,
	newAppealType,
	dueDate,
	notifyClient,
	siteAddress,
	azureAdUserId
) => {
	Promise.all([
		await databaseConnector.appeal.update({
			where: { id: appeal.id },
			data: {
				caseResubmittedTypeId: newAppealTypeId,
				caseUpdatedDate: new Date()
			}
		}),
		await timetableRepository.upsertAppealTimetableById(appeal.id, {
			caseResubmissionDueDate: setTimeInTimeZone(dueDate, DEADLINE_HOUR, DEADLINE_MINUTE)
		}),
		await transitionState(appeal.id, azureAdUserId, APPEAL_CASE_STATUS.CLOSED),
		await broadcasters.broadcastAppeal(appeal.id)
	]);

	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	const personalisation = {
		existing_appeal_type: appeal.appealType?.type || '',
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		site_address: siteAddress,
		url: FRONT_OFFICE_URL,
		due_date: formatDate(new Date(dueDate || ''), false),
		appeal_type: newAppealType || ''
	};

	if (recipientEmail) {
		await notifySend({
			templateName: 'appeal-type-change-non-has',
			notifyClient,
			recipientEmail,
			personalisation
		});
	}
};

export { changeAppealType };
