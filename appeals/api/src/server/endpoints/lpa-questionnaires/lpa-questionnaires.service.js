import lpaQuestionnaireRepository from '#repositories/lpa-questionnaire.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import { recalculateDateIfNotBusinessDay } from '#utils/business-days.js';
import { isOutcomeComplete, isOutcomeIncomplete } from '#utils/check-validation-outcome.js';
import transitionState from '#state/transition-state.js';
import {
	AUDIT_TRAIL_SUBMISSION_INCOMPLETE,
	ERROR_NOT_FOUND,
	ERROR_NO_RECIPIENT_EMAIL
} from '@pins/appeals/constants/support.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import formatDate from '#utils/date-formatter.js';
import { getFormattedReasons } from '#utils/email-formatter.js';
import * as documentRepository from '#repositories/document.repository.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { EventType } from '@pins/event-client';
import { notifySend } from '#notify/notify-send.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

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
		await transitionState(appealId, azureAdUserId, validationOutcome.name);
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

		await sendLpaqCompleteEmailToLPA(notifyClient, appeal, siteAddress);
		await sendLpaqCompleteEmailToAppellant(notifyClient, appeal, siteAddress);
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
 * */
function sendLpaqCompleteEmailToLPA(notifyClient, appeal, siteAddress) {
	const email = appeal.lpa?.email;
	return sendLpaqCompleteEmail(notifyClient, appeal, siteAddress, 'lpaq-complete-lpa', email);
}

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {Appeal} appeal
 * @param {string} siteAddress
 * */
function sendLpaqCompleteEmailToAppellant(notifyClient, appeal, siteAddress) {
	const email = appeal.appellant?.email ?? appeal.agent?.email;
	const templateName =
		appeal.appealType?.type === APPEAL_TYPE.HOUSEHOLDER
			? 'lpaq-complete-has-appellant'
			: 'lpaq-complete-appellant';
	return sendLpaqCompleteEmail(notifyClient, appeal, siteAddress, templateName, email);
}

/**
 *
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {Appeal} appeal
 * @param {string} siteAddress
 * @param {string} templateName
 * @param {string | null | undefined} recipientEmail
 */
async function sendLpaqCompleteEmail(
	notifyClient,
	appeal,
	siteAddress,
	templateName,
	recipientEmail
) {
	const personalisation = {
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		site_address: siteAddress
	};

	await notifySend({
		templateName,
		notifyClient,
		recipientEmail,
		personalisation
	});
}

export { checkLPAQuestionnaireExists, updateLPAQuestionnaireValidationOutcome };
