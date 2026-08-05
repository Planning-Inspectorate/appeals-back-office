import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { appealTypeMap } from '#endpoints/appeal-timetables/appeal-timetables.utils.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { generateNotifyPreview } from '#notify/emulate-notify.js';
import { notifySend, renderTemplate } from '#notify/notify-send.js';
import appealTimetableRepository from '#repositories/appeal-timetable.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import transitionState from '#state/transition-state.js';
import { isLinkedAppealsActive } from '#utils/is-linked-appeal.js';
import { getChildEnforcementsWithGrounds } from '#utils/link-appeals.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { trimAppealType } from '#utils/string-utils.js';
import { updatePersonalList } from '#utils/update-personal-list.js';
import {
	PROCEDURE_TYPE_ID_MAP,
	PROCEDURE_TYPE_KEY,
	PROCEDURE_TYPE_MAP
} from '@pins/appeals/constants/common.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import {
	AUDIT_TRAIL_CASE_STARTED,
	AUDIT_TRAIL_CASE_TIMELINE_CREATED,
	AUDIT_TRAIL_HEARING_SET_UP,
	AUDIT_TRAIL_SYSTEM_UUID,
	AUDIT_TRAIL_TIMETABLE_DUE_DATE_CHANGED,
	CASE_RELATIONSHIP_LINKED,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import {
	beforeExpeditedOriginalApplicationCutOff,
	isEnforcementCaseType,
	isExpeditedAppealType,
	isS78ExpeditedAppealType
} from '@pins/appeals/utils/appeal-type-checks.js';
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
 * @param {string | undefined} procedureType
 * @returns {string}
 */
const mapProcedureTypeForAudit = (procedureType) => {
	if (procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_1) {
		return 'Part 1';
	}

	return procedureType || APPEAL_CASE_PROCEDURE.WRITTEN;
};

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
 * @param {string | undefined} procedureType
 * @param {string} appealTypeKey
 * @param {string | undefined} hearingStartTime
 * @param {boolean} caseIsStarted
 * @returns {{ lpaTemplate: string, appellantTemplate: string }}
 */
const getNotifyTemplateNames = (procedureType, appealTypeKey, hearingStartTime, caseIsStarted) => {
	const appealTypeNotifyTemplate = appealTypeMap(appealTypeKey);
	const baseTemplate = caseIsStarted
		? 'appeal-start-date-change-'
		: `appeal-valid-start-case-${appealTypeNotifyTemplate}${appealTypeNotifyTemplate ? '-' : ''}`;

	const getSuffixes = () => {
		switch (procedureType) {
			case APPEAL_CASE_PROCEDURE.INQUIRY:
				return { lpa: APPEAL_CASE_PROCEDURE.INQUIRY, appellant: APPEAL_CASE_PROCEDURE.INQUIRY };

			case APPEAL_CASE_PROCEDURE.HEARING: {
				const hearingPrefix = !caseIsStarted && hearingStartTime ? 'hearing-' : '';
				return { lpa: `${hearingPrefix}lpa`, appellant: `${hearingPrefix}appellant` };
			}

			case APPEAL_CASE_PROCEDURE.WRITTEN_PART_1:
			case PROCEDURE_TYPE_KEY.WRITTEN_PART_1:
				if (appealTypeNotifyTemplate) {
					return { lpa: 'expedited-lpa', appellant: 'expedited-appellant' };
				}
				return { lpa: 'lpa', appellant: 'appellant' };

			case APPEAL_CASE_PROCEDURE.WRITTEN_PART_2:
			case PROCEDURE_TYPE_KEY.WRITTEN_PART_2:
			default:
				return { lpa: 'lpa', appellant: 'appellant' };
		}
	};

	const { lpa, appellant } = getSuffixes();

	return {
		lpaTemplate: `${baseTemplate}${lpa}`,
		appellantTemplate: `${baseTemplate}${appellant}`
	};
};

/**
 * @param {Object} params
 * @param {Appeal} params.appeal
 * @param {string} params.startDate
 * @param {import('#endpoints/appeals.js').NotifyClient} params.notifyClient
 * @param {string} params.siteAddress
 * @param {string} params.azureAdUserId
 * @param {TimetableDeadlineDate} params.timetable
 * @param {string} [params.procedureType]
 * @param {string} [params.hearingStartTime]
 * @param {string | number} [params.hearingEstimatedDays]
 * @param {any} [params.inquiry]
 * @param {string | null | undefined} params.inspectorName
 * @returns
 */
const getStartCaseNotifyParams = async ({
	appeal,
	startDate,
	notifyClient,
	siteAddress,
	azureAdUserId,
	timetable,
	procedureType,
	hearingStartTime,
	hearingEstimatedDays,
	inquiry,
	inspectorName = null
}) => {
	const { type = '', key: appealTypeKey = APPEAL_CASE_TYPE.D } = appeal.appealType || {};
	const appealType = trimAppealType(type);
	const caseIsStarted = Boolean(appeal.caseStartedDate);

	const { lpaTemplate: formattedLPATemplate, appellantTemplate: formattedAppellantTemplate } =
		getNotifyTemplateNames(procedureType, appealTypeKey, hearingStartTime, caseIsStarted);

	const appellantEmail = appeal.appellant?.email || appeal.agent?.email;
	const lpaEmail = appeal.lpa?.email || '';

	const teamEmail = await getTeamEmailFromAppealId(appeal.id);
	const childEnforcementsWithGrounds = await getChildEnforcementsWithGrounds(appeal);

	/** @param {string | Date | null | undefined} dateStr */
	const formatDeadline = (dateStr) => (dateStr ? formatDate(new Date(dateStr), false) : '');

	const isWrittenReps =
		!procedureType ||
		procedureType === APPEAL_CASE_PROCEDURE.WRITTEN ||
		procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_1;

	// Note that those properties not used within the specified template will be ignored
	const commonEmailVariables = {
		appeal_reference_number: appeal.reference,
		inspector_name: inspectorName ? inspectorName : null,
		lpa_reference: appeal.applicationReference || '',
		site_address: siteAddress,
		start_date: formatDeadline(startDate),
		appellant_email_address: appellantEmail || '',
		appeal_type: appealType || '',
		procedure_type: PROCEDURE_TYPE_MAP[procedureType || 'written'],
		questionnaire_due_date: formatDeadline(timetable.lpaQuestionnaireDueDate),
		local_planning_authority: appeal.lpa?.name || '',
		due_date: formatDeadline(timetable.lpaQuestionnaireDueDate),
		comment_deadline: formatDeadline(timetable.commentDeadline),
		lpa_statement_deadline: formatDeadline(
			timetable.lpaStatementDueDate || timetable.statementDueDate
		),
		ip_comments_deadline: formatDeadline(timetable.ipCommentsDueDate),
		final_comments_deadline: formatDeadline(timetable.finalCommentsDueDate),
		statement_of_common_ground_deadline: formatDeadline(timetable.statementOfCommonGroundDueDate),
		...(inquiry && {
			proof_of_evidence_and_witnesses_deadline: formatDeadline(
				timetable.proofOfEvidenceAndWitnessesDueDate
			)
		}),
		...(inquiry && {
			case_management_conference_deadline: formatDeadline(timetable.caseManagementConferenceDueDate)
		}),
		...(inquiry && {
			planning_obligation_deadline: formatDeadline(timetable.planningObligationDueDate)
		}),
		child_appeals:
			appeal.childAppeals
				?.filter((appeal) => appeal.type === CASE_RELATIONSHIP_LINKED)
				.map((appeal) => appeal.childRef) || [],
		team_email_address: teamEmail,
		...(hearingStartTime && {
			hearing_date: formatDeadline(hearingStartTime),
			hearing_time: formatTime12h(hearingStartTime)
		}),
		...(hearingEstimatedDays && {
			hearing_expected_days: hearingEstimatedDays
		}),
		...(inquiry && {
			inquiry_date: formatDeadline(inquiry.inquiryStartTime),
			inquiry_time: formatTime12h(inquiry.inquiryStartTime),
			inquiry_address: inquiry.inquiryAddress,
			inquiry_expected_days: inquiry.inquiryEstimationDays
		}),
		...(isEnforcementCaseType(appeal.appealType?.key) && {
			appeal_grounds: appeal.appealGrounds?.map((ground) => ground.ground?.groundRef).sort() || [],
			other_appeals_grounds_group: childEnforcementsWithGrounds,
			enforcement_reference: appeal.appellantCase?.enforcementReference
		})
	};

	return {
		...(appellantEmail && {
			appellant: {
				azureAdUserId,
				templateName: formattedAppellantTemplate,
				notifyClient,
				recipientEmail: appellantEmail,
				personalisation: {
					...commonEmailVariables,
					...(inquiry && { is_lpa: false }),
					site_visit: isWrittenReps,
					costs_info: isWrittenReps,
					...(isEnforcementCaseType(appeal.appealType?.key) &&
						appeal.appellantCase?.planningObligation && {
							planning_obligation_deadline: formatDeadline(timetable.planningObligationDueDate)
						})
				}
			}
		}),
		...(lpaEmail && {
			lpa: {
				azureAdUserId,
				templateName: formattedLPATemplate,
				notifyClient,
				recipientEmail: lpaEmail,
				personalisation: {
					...commonEmailVariables,
					...(inquiry && { is_lpa: true }),
					...(appeal.appealType?.key === APPEAL_CASE_TYPE.W && {
						statement_of_common_ground_deadline: formatDeadline(
							timetable.statementOfCommonGroundDueDate
						),
						planning_obligation_deadline: formatDeadline(timetable.planningObligationDueDate)
					})
				}
			}
		})
	};
};

/**
 * @param {Appeal} appeal
 * @param {string} startDate
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @param {TimetableDeadlineDate} timetable
 * @param {string} [procedureType]
 * @param {string} [hearingStartTime]
 * @param {string | number} [hearingEstimatedDays]
 * @param {string | null | undefined} inspectorName
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
	hearingStartTime,
	hearingEstimatedDays,
	inspectorName = null
) => {
	const { appellant, lpa } = await getStartCaseNotifyParams({
		appeal,
		startDate,
		notifyClient,
		siteAddress,
		azureAdUserId,
		timetable,
		procedureType,
		hearingStartTime,
		hearingEstimatedDays,
		inspectorName
	});

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
 * @param {string | number} [hearingEstimatedDays]
 * @param {string} [inquiry]
 * @param {string | null | undefined} inspectorName
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
	hearingStartTime,
	hearingEstimatedDays,
	inquiry,
	inspectorName = null
) => {
	const { appellant, lpa } = await getStartCaseNotifyParams({
		appeal,
		startDate,
		notifyClient,
		siteAddress,
		azureAdUserId,
		timetable,
		procedureType,
		hearingStartTime,
		hearingEstimatedDays,
		inquiry,
		inspectorName
	});

	const commonPersonalisation = {
		front_office_url: environment.FRONT_OFFICE_URL || '',
		inspectorName: inspectorName ? inspectorName : null
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
 * @param {Appeal} appeal
 * @param {string | undefined} procedureType
 * @returns {string}
 */
const getEffectiveProcedureType = (appeal, procedureType) => {
	if (procedureType) {
		return procedureType;
	}

	const rawAppDate = appeal.appellantCase?.applicationDate;
	const applicationDateStr = rawAppDate instanceof Date ? rawAppDate.toISOString() : rawAppDate;

	const isHasOrCasPart1 =
		isExpeditedAppealType(appeal.appealType?.key) &&
		Boolean(applicationDateStr) &&
		!beforeExpeditedOriginalApplicationCutOff(applicationDateStr);

	return isHasOrCasPart1 ? APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 : (appeal.procedureType?.key ?? '');
};

/**
 * @param {Object} params
 * @param {number} params.appealId
 * @param {string | undefined} params.azureAdUserId
 * @param {string} params.procedureType
 * @param {string} [params.hearingStartTime]
 */
const createStartCaseAuditTrails = async ({
	appealId,
	azureAdUserId,
	procedureType,
	hearingStartTime
}) => {
	await createAuditTrail({
		appealId,
		azureAdUserId,
		details: AUDIT_TRAIL_CASE_TIMELINE_CREATED
	});

	await createAuditTrail({
		appealId,
		azureAdUserId,
		details: stringTokenReplacement(AUDIT_TRAIL_CASE_STARTED, [
			mapProcedureTypeForAudit(procedureType)
		])
	});

	if (hearingStartTime) {
		await createAuditTrail({
			appealId,
			azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_HEARING_SET_UP, [
				dateISOStringToDisplayDate(hearingStartTime)
			])
		});
	}
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} startDate
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @param {string} [procedureType]
 * @param {string} [hearingStartTime]
 * @param {string} [hearingEstimatedDays]
 * @param {string | null | undefined} inspectorName
 * @returns {Promise<{ success: boolean, timetable?: any }>}
 */
const startCase = async (
	appeal,
	startDate,
	notifyClient,
	azureAdUserId,
	procedureType,
	hearingStartTime,
	hearingEstimatedDays,
	inspectorName = null
) => {
	try {
		const appealType = appeal.appealType || null;
		if (!appealType) {
			throw new Error('Appeal type is required to start a case.');
		}

		const isChildAppeal =
			isLinkedAppealsActive(appeal) &&
			Boolean(
				appeal?.parentAppeals?.filter(
					(parentAppeal) => parentAppeal.type === CASE_RELATIONSHIP_LINKED
				).length
			);

		const startedAt = await recalculateDateIfNotBusinessDay(startDate);
		const isS78Expedited = isS78ExpeditedAppealType(
			appealType.type,
			appeal.appellantCase?.applicationDate,
			appeal.appellantCase?.applicationDecision,
			appeal.appellantCase?.typeOfPlanningApplication
		);

		const effectiveProcedureType = getEffectiveProcedureType(appeal, procedureType);

		const timetable = await calculateTimetable(
			appealType.key,
			startedAt,
			effectiveProcedureType,
			null,
			isS78Expedited
		);

		if (!timetable) {
			return { success: false };
		}

		const startDateWithTimeCorrection = setTimeInTimeZone(startedAt, 0, 0);
		const procedureTypeId = effectiveProcedureType && PROCEDURE_TYPE_ID_MAP[effectiveProcedureType];

		await Promise.all([
			// @ts-ignore
			appealTimetableRepository.upsertAppealTimetableById(appeal.id, timetable),
			appealRepository.updateAppealById(appeal.id, {
				caseStartedDate: startDateWithTimeCorrection.toISOString(),
				...(procedureTypeId && { procedureTypeId }),
				...(hearingStartTime && { hearingStartTime }),
				...(hearingEstimatedDays && { hearingEstimatedDays })
			})
		]);

		await transitionState(
			appeal.id,
			azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
			APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
		);

		await createStartCaseAuditTrails({
			appealId: appeal.id,
			azureAdUserId,
			procedureType: effectiveProcedureType,
			hearingStartTime
		});

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
				effectiveProcedureType,
				hearingStartTime,
				hearingEstimatedDays,
				inspectorName
			);
		}

		await broadcasters.broadcastAppeal(appeal.id);
		return { success: true, timetable };
	} catch (error) {
		logger.error(`Error starting case for appeal ID ${appeal.id}: ${error}`);
		return { success: false };
	}
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} startDate
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @param {string} [procedureType]
 * @param {string} [hearingStartTime]
 * @param {string | number} [hearingEstimatedDays]
 * @param {any} [inquiry]
 * @param {string | null | undefined} inspectorName
 * @returns {Promise<{appellant?: string, lpa?: string}>}
 */
const getStartCaseNotifyPreviews = async (
	appeal,
	startDate,
	notifyClient,
	azureAdUserId,
	procedureType,
	hearingStartTime,
	hearingEstimatedDays,
	inquiry,
	inspectorName = null
) => {
	try {
		const isChildAppeal =
			isLinkedAppealsActive(appeal) &&
			Boolean(
				appeal?.parentAppeals?.filter(
					(parentAppeal) => parentAppeal.type === CASE_RELATIONSHIP_LINKED
				).length
			);

		const appealType = appeal.appealType || null;
		if (!appealType) {
			throw new Error('Appeal type is required to start a case.');
		}

		const startedAt = await recalculateDateIfNotBusinessDay(startDate);
		let timetable;
		if (procedureType === APPEAL_CASE_PROCEDURE.INQUIRY && inquiry) {
			timetable = inquiry.timetable;
		} else {
			timetable = await calculateTimetable(appealType.key, startedAt, procedureType);
		}
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
			hearingStartTime,
			hearingEstimatedDays,
			inquiry,
			inspectorName
		);
	} catch (/** @type {any} */ error) {
		logger.error(`Error generating notify previews for appeal ID ${appeal.id}: ${error}`);
		throw error;
	}
};

/**
 * @param {Omit<Appeal, 'documents' | 'representations'>} appeal
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
 * @param {Date|null} [inquiryDate]
 */
const calculateAppealTimetable = async (appeal, startDate, procedureType, inquiryDate = null) => {
	const startedAt = await recalculateDateIfNotBusinessDay(startDate);
	const timetable = await calculateTimetable(
		appeal.appealType?.key,
		startedAt,
		procedureType,
		inquiryDate
	);

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
	planningObligationDueDate: 'Planning obligation',
	proofOfEvidenceAndWitnessesDueDate: 'Proof of evidence and witnesses',
	caseManagementConferenceDueDate: 'Case management conference'
};

/**
 * @param {Omit<Appeal, 'documents' | 'representations'>} appeal
 * @param {object} processedBody
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const sendTimetableUpdateNotify = async (appeal, processedBody, notifyClient, azureAdUserId) => {
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	/** @param {string | undefined} isoDate */
	const optionalDate = (isoDate) => {
		if (!isoDate) return '';
		return formatDate(new Date(isoDate), false) || '';
	};

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
		// @ts-ignore
		statement_of_common_ground_due_date: optionalDate(
			// @ts-ignore
			processedBody['statementOfCommonGroundDueDate'] ||
				appeal.appealTimetable?.statementOfCommonGroundDueDate
		),
		// @ts-ignore
		proof_of_evidence_and_witnesses_due_date: optionalDate(
			// @ts-ignore
			processedBody['proofOfEvidenceAndWitnessesDueDate'] ||
				appeal.appealTimetable?.proofOfEvidenceAndWitnessesDueDate
		),
		// @ts-ignore
		planning_obligation_due_date: optionalDate(
			// @ts-ignore
			processedBody['planningObligationDueDate'] ||
				appeal.appealTimetable?.planningObligationDueDate
		),
		// @ts-ignore
		case_management_conference_due_date: optionalDate(
			// @ts-ignore
			processedBody['caseManagementConferenceDueDate'] ||
				appeal.appealTimetable?.caseManagementConferenceDueDate
		),
		team_email_address: await getTeamEmailFromAppealId(appeal.id)
	};

	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	const lpaEmail = appeal.lpa?.email || '';
	const templateName = getTimetableUpdatedTemplateName(
		appeal.appealType?.key,
		appeal.procedureType?.key
	);

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

	if (appeal.appealRule6Parties && appeal.appealRule6Parties.length > 0) {
		appeal.appealRule6Parties.forEach(async (party) => {
			if (party.serviceUser?.email) {
				await notifySend({
					azureAdUserId,
					templateName,
					notifyClient,
					recipientEmail: party.serviceUser.email,
					personalisation
				});
			}
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
		appealTypeShorthand === APPEAL_CASE_TYPE.D ||
		appealTypeShorthand === APPEAL_CASE_TYPE.ZP ||
		appealTypeShorthand === APPEAL_CASE_TYPE.ZA ||
		appealTypeShorthand === APPEAL_CASE_TYPE.H ||
		appealTypeShorthand === APPEAL_CASE_TYPE.X ||
		(appealTypeShorthand === APPEAL_CASE_TYPE.W &&
			(procedureType === APPEAL_CASE_PROCEDURE.WRITTEN ||
				procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 ||
				procedureType === APPEAL_CASE_PROCEDURE.INQUIRY ||
				procedureType === APPEAL_CASE_PROCEDURE.HEARING)) ||
		(appealTypeShorthand === APPEAL_CASE_TYPE.Y &&
			(procedureType === APPEAL_CASE_PROCEDURE.WRITTEN ||
				procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 ||
				procedureType === APPEAL_CASE_PROCEDURE.INQUIRY ||
				procedureType === APPEAL_CASE_PROCEDURE.HEARING)) ||
		(appealTypeShorthand === APPEAL_CASE_TYPE.C &&
			(procedureType === APPEAL_CASE_PROCEDURE.WRITTEN ||
				procedureType === APPEAL_CASE_PROCEDURE.INQUIRY ||
				procedureType === APPEAL_CASE_PROCEDURE.HEARING)) ||
		(appealTypeShorthand === APPEAL_CASE_TYPE.F &&
			(procedureType === APPEAL_CASE_PROCEDURE.WRITTEN ||
				procedureType === APPEAL_CASE_PROCEDURE.INQUIRY ||
				procedureType === APPEAL_CASE_PROCEDURE.HEARING)) ||
		procedureType === undefined
	);
};

/**
 * @param {import('@planning-inspectorate/data-model').APPEAL_CASE_TYPE | string | undefined} appealTypeKey
 * @param {string | undefined} procedureType
 * @returns {string}
 */
const getTimetableUpdatedTemplateName = (appealTypeKey, procedureType) => {
	switch (appealTypeKey) {
		case APPEAL_CASE_TYPE.H:
		case APPEAL_CASE_TYPE.X:
			return 'advertisement-appeal-timetable-updated';

		case APPEAL_CASE_TYPE.D:
		case APPEAL_CASE_TYPE.ZP:
		case APPEAL_CASE_TYPE.ZA:
			return 'has-appeal-timetable-updated';

		default:
			if (procedureType === APPEAL_CASE_PROCEDURE.INQUIRY) {
				return 'appeal-timetable-updated-inquiry';
			}
			if (procedureType === APPEAL_CASE_PROCEDURE.HEARING) {
				return 'appeal-timetable-updated-hearing';
			}
			return 'appeal-timetable-updated';
	}
};

export {
	calculateAppealTimetable,
	checkAppealTimetableExists,
	getStartCaseNotifyParams,
	getStartCaseNotifyPreviews,
	startCase,
	updateAppealTimetable
};
