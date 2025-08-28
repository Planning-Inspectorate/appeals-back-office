import lpaQuestionnaireRepository from '#repositories/lpa-questionnaire.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import { recalculateDateIfNotBusinessDay } from '@pins/appeals/utils/business-days.js';
import { isOutcomeComplete, isOutcomeIncomplete } from '#utils/check-validation-outcome.js';
import transitionState from '#state/transition-state.js';
import {
	AUDIT_TRAIL_SUBMISSION_INCOMPLETE,
	ERROR_NO_RECIPIENT_EMAIL,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { getFormattedReasons } from '#utils/email-formatter.js';
import * as documentRepository from '#repositories/document.repository.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { EventType } from '@pins/event-client';
import { notifySend } from '#notify/notify-send.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import logger from '#utils/logger.js';
import { isCurrentStatus } from '#utils/current-status.js';
import { buildListOfLinkedAppeals } from '#utils/build-list-of-linked-appeals.js';
import { allLpaQuestionnaireOutcomesAreComplete } from '#utils/is-awaiting-linked-appeal.js';
import { isLinkedAppeal } from '#utils/is-linked-appeal.js';

/** @typedef {import('express').RequestHandler} RequestHandler */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateLPAQuestionnaireValidationOutcomeParams} UpdateLPAQuestionnaireValidationOutcomeParams */
/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.LpaQuestionnaire} LpaQuestionnaire */

/**
 * @type {RequestHandler}
 * @returns {object | void}
 */
const checkLPAQuestionnaireExists = (req, res, next) => {
	const {
		appeal,
		params: { lpaQuestionnaireId }
	} = req;
	const hasLPAQuestionnaire = appeal.lpaQuestionnaire?.id === Number(lpaQuestionnaireId);

	if (!hasLPAQuestionnaire) {
		return res.status(404).send({ errors: { lpaQuestionnaireId: ERROR_NOT_FOUND } });
	}

	next();
};

/**
 * @param {UpdateLPAQuestionnaireValidationOutcomeParams} param0
 * @param { import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @returns {Promise<Date | undefined>}
 */
const updateLPAQuestionnaireValidationOutcome = async (
	{ appeal, azureAdUserId, data, lpaQuestionnaireId, validationOutcome, siteAddress },
	notifyClient
) => {
	let timetable = undefined;

	const { id: appealId, applicationReference: lpaReference } = appeal;
	const { lpaQuestionnaireDueDate, incompleteReasons } = data;

	if (!isCurrentStatus(appeal, APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE)) {
		logger.error('LPAQ already validated');
		throw new Error('LPAQ already validated');
	}

	if (lpaQuestionnaireDueDate) {
		timetable = {
			lpaQuestionnaireDueDate: await recalculateDateIfNotBusinessDay(
				new Date(lpaQuestionnaireDueDate).toISOString()
			)
		};
	}

	await lpaQuestionnaireRepository.updateLPAQuestionnaireById(lpaQuestionnaireId, {
		validationOutcomeId: validationOutcome.id,
		...(isOutcomeIncomplete(validationOutcome.name) && {
			appealId,
			incompleteReasons,
			timetable: timetable
				? {
						lpaQuestionnaireDueDate: timetable.lpaQuestionnaireDueDate.toISOString()
				  }
				: undefined
		})
	});

	if (!isOutcomeIncomplete(validationOutcome.name)) {
		if (!isLinkedAppeal(appeal)) {
			await transitionState(appealId, azureAdUserId, validationOutcome.name);
		} else {
			const linkedAppeals = await buildListOfLinkedAppeals(appeal);
			if (allLpaQuestionnaireOutcomesAreComplete(linkedAppeals)) {
				await Promise.all(
					linkedAppeals.map((appeal) => {
						const validationOutcome = appeal.lpaQuestionnaire?.lpaQuestionnaireValidationOutcome;
						if (validationOutcome) {
							return transitionState(appeal.id, azureAdUserId, validationOutcome.name);
						}
					})
				);
			}
		}
	} else {
		createAuditTrail({
			appealId,
			azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['LPA questionnaire'])
		});
	}

	if (isOutcomeComplete(validationOutcome.name)) {
		const documentsUpdated = await documentRepository.setRedactionStatusOnValidation(appeal.id);
		for (const documentUpdated of documentsUpdated) {
			await broadcasters.broadcastDocument(
				documentUpdated.documentGuid,
				documentUpdated.version,
				EventType.Update
			);
		}

		await sendLpaqCompleteEmailToLPA(notifyClient, appeal, siteAddress, azureAdUserId);
		await sendLpaqCompleteEmailToAppellant(notifyClient, appeal, siteAddress, azureAdUserId);
	}

	const updatedAppeal = await appealRepository.getAppealById(Number(appealId));
	if (updatedAppeal) {
		const { lpaQuestionnaire: updatedLpaQuestionnaire } = updatedAppeal;

		if (isOutcomeIncomplete(validationOutcome.name)) {
			const recipientEmail = appeal.lpa?.email;
			if (!recipientEmail) {
				throw new Error(ERROR_NO_RECIPIENT_EMAIL);
			}

			const incompleteReasonsList = getFormattedReasons(
				updatedLpaQuestionnaire?.lpaQuestionnaireIncompleteReasonsSelected ?? []
			);

			const personalisation = {
				appeal_reference_number: appeal.reference,
				lpa_reference: lpaReference || '',
				site_address: siteAddress,
				due_date: formatDate(new Date(lpaQuestionnaireDueDate), false),
				reasons: incompleteReasonsList
			};

			await notifySend({
				azureAdUserId,
				templateName: 'lpaq-incomplete',
				notifyClient,
				recipientEmail,
				personalisation
			});
		}
	}

	return timetable?.lpaQuestionnaireDueDate;
};

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {Appeal} appeal
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * */
function sendLpaqCompleteEmailToLPA(notifyClient, appeal, siteAddress, azureAdUserId) {
	const email = appeal.lpa?.email;
	return sendLpaqCompleteEmail(
		notifyClient,
		appeal,
		{ site_address: siteAddress },
		'lpaq-complete-lpa',
		email,
		azureAdUserId
	);
}

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {Appeal} appeal
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * */
function sendLpaqCompleteEmailToAppellant(notifyClient, appeal, siteAddress, azureAdUserId) {
	const email = appeal.appellant?.email ?? appeal.agent?.email;
	const whatHappensNext =
		'We will send you another email when the local planning authority submits their statement ' +
		'and we receive any comments from interested parties.';
	const fields = { site_address: siteAddress };
	const s78Fields = { ...fields, what_happens_next: whatHappensNext };
	const s78Template = 'lpaq-complete-appellant';

	switch (appeal.appealType?.type) {
		case APPEAL_TYPE.HOUSEHOLDER:
		case APPEAL_TYPE.CAS_PLANNING:
			return sendLpaqCompleteEmail(
				notifyClient,
				appeal,
				fields,
				'lpaq-complete-has-appellant',
				email,
				azureAdUserId
			);
		case APPEAL_TYPE.S78:
			if (String(appeal.procedureType) === APPEAL_CASE_PROCEDURE.HEARING) {
				const hearingStartTime = appeal.hearing?.hearingStartTime;
				const hearingDate = hearingStartTime ? formatDate(hearingStartTime, false) : undefined;
				return sendLpaqCompleteEmail(
					notifyClient,
					appeal,
					{
						...s78Fields,
						hearing_date: hearingDate,
						what_happens_next: 'We will contact you if we need any more information.'
					},
					s78Template,
					email,
					azureAdUserId
				);
			}
			return sendLpaqCompleteEmail(
				notifyClient,
				appeal,
				s78Fields,
				s78Template,
				email,
				azureAdUserId
			);
		default:
			return sendLpaqCompleteEmail(
				notifyClient,
				appeal,
				s78Fields,
				s78Template,
				email,
				azureAdUserId
			);
	}
}

/**
 *
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {Appeal} appeal
 * @param {Record<string, string | undefined>} fields
 * @param {string} templateName
 * @param {string | null | undefined} recipientEmail
 * @param {string | undefined} azureAdUserId
 */
async function sendLpaqCompleteEmail(
	notifyClient,
	appeal,
	fields,
	templateName,
	recipientEmail,
	azureAdUserId
) {
	const personalisation = {
		...fields,
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || ''
	};

	await notifySend({
		azureAdUserId,
		templateName,
		notifyClient,
		recipientEmail,
		personalisation
	});
}

export { checkLPAQuestionnaireExists, updateLPAQuestionnaireValidationOutcome };
