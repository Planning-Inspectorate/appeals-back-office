import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { generateNotifyPreview } from '#notify/emulate-notify.js';
import { notifySend, renderTemplate } from '#notify/notify-send.js';
import appealTimetableRepository from '#repositories/appeal-timetable.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import transitionState from '#state/transition-state.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { trimAppealType } from '#utils/string-utils.js';
import { updatePersonalList } from '#utils/update-personal-list.js';
import {
	FEATURE_FLAG_NAMES,
	PROCEDURE_TYPE_ID_MAP,
	PROCEDURE_TYPE_MAP
} from '@pins/appeals/constants/common.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import {
	APPEAL_TYPE_SHORTHAND_HAS,
	AUDIT_TRAIL_CASE_STARTED,
	AUDIT_TRAIL_CASE_TIMELINE_CREATED,
	AUDIT_TRAIL_HEARING_SET_UP,
	AUDIT_TRAIL_SYSTEM_UUID,
	AUDIT_TRAIL_TIMETABLE_DUE_DATE_CHANGED,
	CASE_RELATIONSHIP_LINKED,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import {
	calculateTimetable,
	recalculateDateIfNotBusinessDay,
	setTimeInTimeZone
} from '@pins/appeals/utils/business-days.js';
import formatDate, {
	dateISOStringToDisplayDate,
	formatTime12h
} from '@pins/appeals/utils/date-formatter.js';
import { loadEnvironment } from '@pins/platform';
import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE
} from '@planning-inspectorate/data-model';
import { mapValues } from 'lodash-es';

const environment = loadEnvironment(process.env.NODE_ENV);

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */
/** @typedef {import('@pins/appeals.api').Appeals.TimetableDeadlineDate} TimetableDeadlineDate */

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
 * Map appeal type to template value
 * @param {string | undefined | null} appealType
 * @returns {string}
 */
const appealTypeMap = (appealType) => {
	switch (appealType) {
		case 'W':
			return '-s78-';
		case 'Y':
			return '-s78-';
		case 'H':
			return '-s78-';
		default:
			return '-';
	}
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} startDate
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @param {TimetableDeadlineDate} timetable
 * @param {string} [procedureType]
 * @param {string} [hearingStartTime]
 * @returns
 */
const getStartCaseNotifyParams = async (
	appeal,
	startDate,
	notifyClient,
	siteAddress,
	azureAdUserId,
	timetable,
	procedureType,
	hearingStartTime
) => {
	const hearingSuffix = hearingStartTime ? '-hearing' : '';

	const { type = '', key: appealTypeKey = 'D' } = appeal.appealType || {};
	const appealType = trimAppealType(type);

	const appellantTemplate = appeal.caseStartedDate
		? 'appeal-start-date-change-appellant'
		: `appeal-valid-start-case${[appealTypeMap(appealTypeKey)]}appellant${hearingSuffix}`;

	const lpaTemplate = appeal.caseStartedDate
		? 'appeal-start-date-change-lpa'
		: `appeal-valid-start-case${[appealTypeMap(appealTypeKey)]}lpa${hearingSuffix}`;

	const appellantEmail = appeal.appellant?.email || appeal.agent?.email;
	const lpaEmail = appeal.lpa?.email || '';

	const weWillEmailWhen =
		procedureType === APPEAL_CASE_PROCEDURE.HEARING
			? [
					'to let you know when you can view information from other parties in the appeals service',
					'when we set up your hearing'
			  ]
			: 'when you can view information from other parties in the appeals service.';

	const teamEmail = await getTeamEmailFromAppealId(appeal.id);

	// Note that those properties not used within the specified template will be ignored
	const commonEmailVariables = {
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		site_address: siteAddress,
		start_date: formatDate(new Date(startDate || ''), false),
		appellant_email_address: appellantEmail || '',
		appeal_type: appealType || '',
		procedure_type: PROCEDURE_TYPE_MAP[procedureType || 'written'],
		questionnaire_due_date: formatDate(new Date(timetable.lpaQuestionnaireDueDate || ''), false),
		local_planning_authority: appeal.lpa?.name || '',
		due_date: formatDate(new Date(timetable.lpaQuestionnaireDueDate || ''), false),
		comment_deadline: formatDate(new Date(timetable.commentDeadline || ''), false),
		lpa_statement_deadline: formatDate(new Date(timetable.lpaStatementDueDate || ''), false),
		ip_comments_deadline: formatDate(new Date(timetable.ipCommentsDueDate || ''), false),
		final_comments_deadline: formatDate(new Date(timetable.finalCommentsDueDate || ''), false),
		statement_of_common_ground_deadline: formatDate(
			new Date(timetable.statementOfCommonGroundDueDate || ''),
			false
		),
		child_appeals:
			appeal.childAppeals
				?.filter((appeal) => appeal.type === CASE_RELATIONSHIP_LINKED)
				.map((appeal) => appeal.childRef) || [],
		team_email_address: teamEmail
	};

	return {
		...(appellantEmail && {
			appellant: {
				azureAdUserId,
				templateName: appellantTemplate,
				notifyClient,
				recipientEmail: appellantEmail,
				personalisation: {
					...commonEmailVariables,
					we_will_email_when: weWillEmailWhen,
					site_visit:
						procedureType === APPEAL_CASE_PROCEDURE.WRITTEN || procedureType === undefined, //undefined procedure types are treated as written
					costs_info:
						procedureType === APPEAL_CASE_PROCEDURE.WRITTEN || procedureType === undefined,
					...(hearingStartTime && {
						hearing_date: formatDate(new Date(hearingStartTime), false),
						hearing_time: formatTime12h(hearingStartTime)
					})
				}
			}
		}),
		...(lpaEmail && {
			lpa: {
				azureAdUserId,
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
					}),
					...(hearingStartTime && {
						hearing_date: formatDate(new Date(hearingStartTime), false),
						hearing_time: formatTime12h(hearingStartTime)
					})
				}
			}
		})
	};
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} startDate
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @param {TimetableDeadlineDate} timetable
 * @param {string} [procedureType]
 * @param {string} [hearingStartTime]
 * @returns
 */
const sendStartCaseNotifies = async (
	appeal,
	startDate,
	notifyClient,
	siteAddress,
	azureAdUserId,
	timetable,
	procedureType,
	hearingStartTime
) => {
	const { appellant, lpa } = await getStartCaseNotifyParams(
		appeal,
		startDate,
		notifyClient,
		siteAddress,
		azureAdUserId,
		timetable,
		procedureType,
		hearingStartTime
	);

	if (appellant) {
		await notifySend(appellant);
	}

	if (lpa) {
		await notifySend(lpa);
	}
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} startDate
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @param {TimetableDeadlineDate} timetable
 * @param {string} [procedureType]
 * @param {string} [hearingStartTime]
 * @returns {Promise<{appellant?: string, lpa?: string}>}
 */
const generateStartCaseNotifyPreviews = async (
	appeal,
	startDate,
	notifyClient,
	siteAddress,
	azureAdUserId,
	timetable,
	procedureType,
	hearingStartTime
) => {
	const { appellant, lpa } = await getStartCaseNotifyParams(
		appeal,
		startDate,
		notifyClient,
		siteAddress,
		azureAdUserId,
		timetable,
		procedureType,
		hearingStartTime
	);

	const commonPersonalisation = {
		front_office_url: environment.FRONT_OFFICE_URL || ''
	};
	const appellantTemplate = appellant
		? renderTemplate(`${appellant.templateName}.content.md`, {
				...appellant.personalisation,
				...commonPersonalisation
		  })
		: '';
	const lpaTemplate = lpa
		? renderTemplate(`${lpa.templateName}.content.md`, {
				...lpa.personalisation,
				...commonPersonalisation
		  })
		: '';

	return {
		...(appellant && { appellant: generateNotifyPreview(appellantTemplate) }),
		...(lpa && { lpa: generateNotifyPreview(lpaTemplate) })
	};
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} startDate
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @param {string} [procedureType]
 * @param {string} [hearingStartTime]
 * @returns
 */
const startCase = async (
	appeal,
	startDate,
	notifyClient,
	azureAdUserId,
	procedureType,
	hearingStartTime
) => {
	try {
		const isChildAppeal =
			isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS) && Boolean(appeal?.parentAppeals?.length);

		const appealType = appeal.appealType || null;
		if (!appealType) {
			throw new Error('Appeal type is required to start a case.');
		}

		const startedAt = await recalculateDateIfNotBusinessDay(startDate);
		const timetable = await calculateTimetable(appealType.key, startedAt, procedureType);
		const startDateWithTimeCorrection = setTimeInTimeZone(startedAt, 0, 0);

		const procedureTypeId = procedureType && PROCEDURE_TYPE_ID_MAP[procedureType];

		if (timetable) {
			await Promise.all([
				// @ts-ignore
				appealTimetableRepository.upsertAppealTimetableById(appeal.id, timetable),
				appealRepository.updateAppealById(appeal.id, {
					caseStartedDate: startDateWithTimeCorrection.toISOString(),
					...(procedureTypeId && { procedureTypeId }),
					...(hearingStartTime && { hearingStartTime })
				})
			]);

			await transitionState(
				appeal.id,
				azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
			);

			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId,
				details: AUDIT_TRAIL_CASE_TIMELINE_CREATED
			});

			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId,
				details: stringTokenReplacement(AUDIT_TRAIL_CASE_STARTED, [procedureType || 'written'])
			});

			if (hearingStartTime) {
				await createAuditTrail({
					appealId: appeal.id,
					azureAdUserId,
					details: stringTokenReplacement(AUDIT_TRAIL_HEARING_SET_UP, [
						dateISOStringToDisplayDate(hearingStartTime)
					])
				});
			}

			if (!isChildAppeal) {
				const siteAddress = appeal.address
					? formatAddressSingleLine(appeal.address)
					: 'Address not available';

				await sendStartCaseNotifies(
					appeal,
					startDateWithTimeCorrection,
					notifyClient,
					siteAddress,
					azureAdUserId,
					timetable,
					procedureType,
					hearingStartTime
				);
			}

			await broadcasters.broadcastAppeal(appeal.id);
			return { success: true, timetable };
		}
	} catch (error) {
		logger.error(`Error starting case for appeal ID ${appeal.id}: ${error}`);
	}

	return { success: false };
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} startDate
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @param {string} [procedureType]
 * @param {string} [hearingStartTime]
 * @returns {Promise<{appellant?: string, lpa?: string}>}
 */
const getStartCaseNotifyPreviews = async (
	appeal,
	startDate,
	notifyClient,
	azureAdUserId,
	procedureType,
	hearingStartTime
) => {
	try {
		const isChildAppeal =
			isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS) && Boolean(appeal?.parentAppeals?.length);

		const appealType = appeal.appealType || null;
		if (!appealType) {
			throw new Error('Appeal type is required to start a case.');
		}

		const startedAt = await recalculateDateIfNotBusinessDay(startDate);
		const timetable = await calculateTimetable(appealType.key, startedAt, procedureType);
		const startDateWithTimeCorrection = setTimeInTimeZone(startedAt, 0, 0);

		if (!timetable) {
			throw new Error('Timetable is required to generate notify previews.');
		}

		if (isChildAppeal) {
			throw new Error('Emails are not sent for child appeals.');
		}

		const siteAddress = appeal.address
			? formatAddressSingleLine(appeal.address)
			: 'Address not available';

		return await generateStartCaseNotifyPreviews(
			appeal,
			startDateWithTimeCorrection,
			notifyClient,
			siteAddress,
			azureAdUserId,
			timetable,
			procedureType,
			hearingStartTime
		);
	} catch (/** @type {any} */ error) {
		logger.error(`Error generating notify previews for appeal ID ${appeal.id}: ${error}`);
		throw error;
	}
};

/**
 * @param {Appeal} appeal
 * @param {object} body
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @param {boolean} [isChildAppeal]
 * @returns {Promise<void>}
 */
const updateAppealTimetable = async (
	appeal,
	body,
	notifyClient,
	azureAdUserId,
	isChildAppeal = false
) => {
	const processedBody = Object.fromEntries(
		Object.entries(body).map(([item, value]) => [
			item,
			setTimeInTimeZone(value, DEADLINE_HOUR, DEADLINE_MINUTE).toISOString()
		])
	);

	// @ts-ignore
	const result = await appealTimetableRepository.updateAppealTimetableByAppealId(
		// @ts-ignore
		appeal.id,
		// @ts-ignore
		processedBody
	);

	if (result) {
		await updatePersonalList(appeal.id);

		if (!isChildAppeal) {
			let details = 'Timetable updated:';
			Object.keys(processedBody).map(async (key) => {
				details +=
					'<br>' +
					'• ' +
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
				await sendTimetableUpdateNotify(appeal, processedBody, notifyClient, azureAdUserId);
			}
		}

		await broadcasters.broadcastAppeal(appeal.id);
	}
};

/**
 * @param {Appeal} appeal
 * @param {string} startDate
 * @param {string} procedureType
 */
const calculateAppealTimetable = async (appeal, startDate, procedureType) => {
	const startedAt = await recalculateDateIfNotBusinessDay(startDate);
	const timetable = await calculateTimetable(appeal.appealType?.key, startedAt, procedureType);

	return mapValues(
		{
			...timetable,
			startDate: startedAt
		},
		/** @type {(date: Date) => string} */ (date) => date.toISOString()
	);
};

const dueDateToAppealTimetableTextMapper = {
	lpaQuestionnaireDueDate: 'LPA questionnaire',
	ipCommentsDueDate: 'Interested party comments',
	lpaStatementDueDate: 'Statements',
	finalCommentsDueDate: 'Final comments',
	statementOfCommonGroundDueDate: 'Statement of common ground',
	planningObligationDueDate: 'Planning obligation'
};

/**
 * @param {Appeal} appeal
 * @param {object} processedBody
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const sendTimetableUpdateNotify = async (appeal, processedBody, notifyClient, azureAdUserId) => {
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
		),
		team_email_address: await getTeamEmailFromAppealId(appeal.id)
	};

	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	const lpaEmail = appeal.lpa?.email || '';
	const templateName =
		appeal.appealType?.key === APPEAL_TYPE_SHORTHAND_HAS || appeal.appealType?.key === 'ZP'
			? 'has-appeal-timetable-updated'
			: 'appeal-timetable-updated';

	if (recipientEmail) {
		await notifySend({
			azureAdUserId,
			templateName,
			notifyClient,
			recipientEmail,
			personalisation
		});
	}

	if (lpaEmail) {
		await notifySend({
			azureAdUserId,
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
		appealTypeShorthand === 'ZP' ||
		appealTypeShorthand === 'ZA' ||
		appealTypeShorthand === 'H' ||
		(appealTypeShorthand === 'W' && procedureType === APPEAL_CASE_PROCEDURE.WRITTEN) ||
		(appealTypeShorthand === 'Y' && procedureType === APPEAL_CASE_PROCEDURE.WRITTEN) ||
		procedureType === undefined
	);
};

export {
	calculateAppealTimetable,
	checkAppealTimetableExists,
	getStartCaseNotifyPreviews,
	startCase,
	updateAppealTimetable
};
