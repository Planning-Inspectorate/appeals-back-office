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
import { getFormattedReasons } from '#utils/appeal-formatter.js';
import config from '#config/config.js';

/** @typedef {import('express').RequestHandler} RequestHandler */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateLPAQuestionnaireValidationOutcomeParams} UpdateLPAQuestionnaireValidationOutcomeParams */

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

	const { id: appealId, appealStatus, appealType, applicationReference: lpaReference } = appeal;
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
			timetable
		})
	});

	if (!isOutcomeIncomplete(validationOutcome.name)) {
		await transitionState(
			appealId,
			appealType,
			azureAdUserId,
			appealStatus,
			validationOutcome.name
		);
	} else {
		createAuditTrail({
			appealId,
			azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['LPA questionnaire'])
		});
	}

	if (isOutcomeComplete(validationOutcome.name)) {
		const recipientEmail = appeal.lpa?.email;
		if (!recipientEmail) {
			throw new Error(ERROR_NO_RECIPIENT_EMAIL);
		}
		try {
			await notifyClient.sendEmail(config.govNotify.template.lpaqComplete, recipientEmail, {
				appeal_reference_number: appeal.reference,
				lpa_reference: appeal.applicationReference || '',
				site_address: siteAddress
			});
		} catch (error) {
			if (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}
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
				// @ts-ignore
				updatedLpaQuestionnaire?.lpaQuestionnaireIncompleteReasonsSelected
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

export { checkLPAQuestionnaireExists, updateLPAQuestionnaireValidationOutcome };
