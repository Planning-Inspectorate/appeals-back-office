import lpaQuestionnaireRepository from '#repositories/lpa-questionnaire.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import { recalculateDateIfNotBusinessDay } from '#utils/business-days.js';
import { isOutcomeComplete, isOutcomeIncomplete } from '#utils/check-validation-outcome.js';
import transitionState from '#state/transition-state.js';
import {
	AUDIT_TRAIL_SUBMISSION_INCOMPLETE,
	ERROR_NOT_FOUND,
	ERROR_NO_RECIPIENT_EMAIL,
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL
} from '../constants.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import formatDate from '#utils/date-formatter.js';
import { getFormattedReasons } from '#utils/email-formatter.js';
import * as documentRepository from '#repositories/document.repository.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import config from '#config/config.js';
import logger from '#utils/logger.js';
import { EventType } from '@pins/event-client';

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

			try {
				await notifyClient.sendEmail(config.govNotify.template.lpaqIncomplete, recipientEmail, {
					appeal_reference_number: appeal.reference,
					lpa_reference: lpaReference || '',
					site_address: siteAddress,
					due_date: formatDate(new Date(lpaQuestionnaireDueDate), false),
					reasons: incompleteReasonsList
				});
			} catch (error) {
				if (error) {
					throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
				}
			}
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
	if (!email) {
		throw new Error(ERROR_NO_RECIPIENT_EMAIL);
	}

	return sendLpaqCompleteEmail(
		notifyClient,
		appeal,
		siteAddress,
		config.govNotify.template.lpaqComplete.lpa,
		email
	);
}

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {Appeal} appeal
 * @param {string} siteAddress
 * */
function sendLpaqCompleteEmailToAppellant(notifyClient, appeal, siteAddress) {
	const email = appeal.appellant?.email ?? appeal.agent?.email;
	if (!email) {
		throw new Error(ERROR_NO_RECIPIENT_EMAIL);
	}

	return sendLpaqCompleteEmail(
		notifyClient,
		appeal,
		siteAddress,
		config.govNotify.template.lpaqComplete.appellant,
		email
	);
}

/**
 *
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {Appeal} appeal
 * @param {string} siteAddress
 * @param {import('#endpoints/appeals.js').NotifyTemplate} template
 * @param {string} recipientEmail
 */
async function sendLpaqCompleteEmail(notifyClient, appeal, siteAddress, template, recipientEmail) {
	try {
		await notifyClient.sendEmail(template, recipientEmail, {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress
		});
	} catch (error) {
		logger.error(error);
		throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
	}
}

export { checkLPAQuestionnaireExists, updateLPAQuestionnaireValidationOutcome };
