import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import appealRepository from '#repositories/appeal.repository.js';
import appealTimetableRepository from '#repositories/appeal-timetable.repository.js';
import {
	calculateTimetable,
	recalculateDateIfNotBusinessDay,
	setTimeInTimeZone
} from '#utils/business-days.js';
import logger from '#utils/logger.js';
import {
	AUDIT_TRAIL_CASE_TIMELINE_CREATED,
	AUDIT_TRAIL_TIMETABLE_DUE_DATE_CHANGED,
	AUDIT_TRAIL_SYSTEM_UUID,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import transitionState from '#state/transition-state.js';
import formatDate, { dateISOStringToDisplayDate } from '#utils/date-formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { PROCEDURE_TYPE_MAP, PROCEDURE_TYPE_ID_MAP } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS, APPEAL_CASE_TYPE } from 'pins-data-model';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import { notifySend } from '#notify/notify-send.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { APPEAL_TYPE_SHORTHAND_HAS } from '@pins/appeals/constants/support.js';
import { AUDIT_TRAIL_CASE_STARTED } from '@pins/appeals/constants/support.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
const checkAppealTimetableExists = async (req, res, next) => {
	const {
		appeal,
		params: { appealTimetableId }
	} = req;
	const hasAppealTimetable = appeal.appealTimetable?.id === Number(appealTimetableId);

	if (!hasAppealTimetable) {
		return res.status(404).send({ errors: { appealTimetableId: ERROR_NOT_FOUND } });
	}

	next();
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} startDate
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @param {string} [procedureType]
 * @returns
 */
const startCase = async (
	appeal,
	startDate,
	notifyClient,
	siteAddress,
	azureAdUserId,
	procedureType
) => {
	try {
		const appealType = appeal.appealType || null;
		if (!appealType) {
			throw new Error('Appeal type is required to start a case.');
		}

		const startedAt = await recalculateDateIfNotBusinessDay(startDate);
		const timetable = await calculateTimetable(appealType.key, startedAt, procedureType);
		const startDateWithTimeCorrection = setTimeInTimeZone(startedAt, 0, 0);

		/** @type {Record<string, string>} */
		const appealTypeMap = {
			D: '-',
			W: '-s78-',
			Y: '-s78-'
		};

		const appellantTemplate = appeal.caseStartedDate
			? 'appeal-start-date-change-appellant'
			: `appeal-valid-start-case${[appealTypeMap[appealType.key]]}appellant`;

		const lpaTemplate = appeal.caseStartedDate
			? 'appeal-start-date-change-lpa'
			: `appeal-valid-start-case${[appealTypeMap[appealType.key]]}lpa`;

		const procedureTypeId = procedureType && PROCEDURE_TYPE_ID_MAP[procedureType];

		if (timetable) {
			await Promise.all([
				// @ts-ignore
				appealTimetableRepository.upsertAppealTimetableById(appeal.id, timetable),
				appealRepository.updateAppealById(appeal.id, {
					caseStartedDate: startDateWithTimeCorrection.toISOString(),
					...(procedureTypeId && { procedureTypeId })
				})
			]);

			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId,
				details: AUDIT_TRAIL_CASE_TIMELINE_CREATED
			});

			if (appeal.appealType?.key === APPEAL_CASE_TYPE.W) {
				await createAuditTrail({
					appealId: appeal.id,
					azureAdUserId,
					details: stringTokenReplacement(AUDIT_TRAIL_CASE_STARTED, [procedureType || 'written'])
				});
			}

			const appellantEmail = appeal.appellant?.email || appeal.agent?.email;
			const lpaEmail = appeal.lpa?.email || '';
			const { type } = appeal.appealType || {};
			const appealType = type?.endsWith(' appeal') ? type.replace(' appeal', '') : type;

			const weWillEmailWhen =
				procedureType === APPEAL_CASE_PROCEDURE.HEARING
					? [
							'to let you know when you can view information from other parties in the appeals service',
							'when we set up your hearing'
					  ]
					: 'when you can view information from other parties in the appeals service.';

			// Note that those properties not used within the specified template will be ignored
			const commonEmailVariables = {
				appeal_reference_number: appeal.reference,
				lpa_reference: appeal.applicationReference || '',
				site_address: siteAddress,
				start_date: formatDate(new Date(startDate || ''), false),
				appellant_email_address: appellantEmail || '',
				appeal_type: appealType || '',
				procedure_type: PROCEDURE_TYPE_MAP[procedureType || 'written'],
				questionnaire_due_date: formatDate(
					new Date(timetable.lpaQuestionnaireDueDate || ''),
					false
				),
				local_planning_authority: appeal.lpa?.name || '',
				due_date: formatDate(new Date(timetable.lpaQuestionnaireDueDate || ''), false),
				comment_deadline: formatDate(new Date(timetable.commentDeadline || ''), false),
				lpa_statement_deadline: formatDate(new Date(timetable.lpaStatementDueDate || ''), false),
				ip_comments_deadline: formatDate(new Date(timetable.ipCommentsDueDate || ''), false),
				final_comments_deadline: formatDate(new Date(timetable.finalCommentsDueDate || ''), false)
			};

			if (appellantEmail) {
				await notifySend({
					templateName: appellantTemplate,
					notifyClient,
					recipientEmail: appellantEmail,
					personalisation: {
						...commonEmailVariables,
						we_will_email_when: weWillEmailWhen,
						site_visit: appeal.procedureType?.key === APPEAL_CASE_PROCEDURE.WRITTEN,
						costs_info: appeal.procedureType?.key === APPEAL_CASE_PROCEDURE.WRITTEN
					}
				});
			}

			if (lpaEmail) {
				await notifySend({
					templateName: lpaTemplate,
					notifyClient,
					recipientEmail: lpaEmail,
					personalisation: {
						...commonEmailVariables,
						...(appeal.appealType?.key === APPEAL_CASE_TYPE.W && {
							statement_of_common_ground_deadline: formatDate(
								new Date(timetable.statementOfCommonGroundDueDate || ''),
								false
							),
							planning_obligation_deadline: formatDate(
								new Date(timetable.planningObligationDueDate || ''),
								false
							)
						})
					}
				});
			}

			await transitionState(
				appeal.id,
				azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
			);

			await broadcasters.broadcastAppeal(appeal.id);
			return { success: true, timetable };
		}
	} catch (error) {
		logger.error(`Error starting case for appeal ID ${appeal.id}: ${error}`);
	}

	return { success: false };
};

/**
 * @param {Appeal} appeal
 * @param {object} body
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const updateAppealTimetable = async (appeal, body, notifyClient, azureAdUserId) => {
	const processedBody = Object.fromEntries(
		Object.entries(body).map(([item, value]) => [
			item,
			setTimeInTimeZone(value, DEADLINE_HOUR, DEADLINE_MINUTE).toISOString()
		])
	);

	// @ts-ignore
	const result = await appealTimetableRepository.updateAppealTimetableById(
		// @ts-ignore
		appeal.appealTimetable.id,
		// @ts-ignore
		processedBody
	);
	let details = 'Timetable updated';
	if (result) {
		Object.keys(processedBody).map(async (key) => {
			details +=
				'\n' +
				stringTokenReplacement(AUDIT_TRAIL_TIMETABLE_DUE_DATE_CHANGED, [
					// @ts-ignore
					dueDateToAppealTimetableTextMapper[key],
					dateISOStringToDisplayDate(processedBody[key])
				]);
		});

		await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId,
			details
		});

		if (shouldSendNotify(appeal.appealType?.key, appeal.procedureType?.key)) {
			await sendTimetableUpdateNotify(appeal, processedBody, notifyClient);
		}
		await broadcasters.broadcastAppeal(appeal.id);
	}
};

const dueDateToAppealTimetableTextMapper = {
	lpaQuestionnaireDueDate: 'LPA questionnaire',
	ipCommentsDueDate: 'Interested party comments',
	lpaStatementDueDate: 'LPA statement',
	finalCommentsDueDate: 'Final comments'
};

/**
 * @param {Appeal} appeal
 * @param {object} processedBody
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @returns {Promise<void>}
 */
const sendTimetableUpdateNotify = async (appeal, processedBody, notifyClient) => {
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	const personalisation = {
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		site_address: siteAddress,
		lpa_questionnaire_due_date: formatDate(
			new Date(
				// @ts-ignore
				dateISOStringToDisplayDate(processedBody['lpaQuestionnaireDueDate']) ||
					appeal.appealTimetable?.lpaQuestionnaireDueDate
			),
			false
		),
		lpa_statement_due_date: formatDate(
			new Date(
				// @ts-ignore
				dateISOStringToDisplayDate(processedBody['lpaStatementDueDate']) ||
					appeal.appealTimetable?.lpaStatementDueDate
			),
			false
		),
		ip_comments_due_date: formatDate(
			new Date(
				// @ts-ignore
				dateISOStringToDisplayDate(processedBody['ipCommentsDueDate']) ||
					appeal.appealTimetable?.ipCommentsDueDate
			),
			false
		),
		final_comments_due_date: formatDate(
			new Date(
				// @ts-ignore
				dateISOStringToDisplayDate(processedBody['finalCommentsDueDate']) ||
					appeal.appealTimetable?.finalCommentsDueDate
			),
			false
		)
	};

	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	const lpaEmail = appeal.lpa?.email || '';
	const templateName =
		appeal.appealType?.key === APPEAL_TYPE_SHORTHAND_HAS
			? 'has-appeal-timetable-updated'
			: 'appeal-timetable-updated';

	if (recipientEmail) {
		await notifySend({
			templateName,
			notifyClient,
			recipientEmail,
			personalisation
		});
	}

	if (lpaEmail) {
		await notifySend({
			templateName,
			notifyClient,
			recipientEmail: lpaEmail,
			personalisation
		});
	}
};

/**
 * @param {string | undefined} appealTypeShorthand
 * @param {string | undefined} procedureType
 * @returns {boolean}
 */
const shouldSendNotify = (appealTypeShorthand, procedureType) => {
	return (
		appealTypeShorthand === APPEAL_TYPE_SHORTHAND_HAS ||
		(appealTypeShorthand === 'W' && procedureType === APPEAL_CASE_PROCEDURE.WRITTEN) ||
		(appealTypeShorthand === 'Y' && procedureType === APPEAL_CASE_PROCEDURE.WRITTEN) ||
		procedureType === undefined
	);
};

export { checkAppealTimetableExists, startCase, updateAppealTimetable };
