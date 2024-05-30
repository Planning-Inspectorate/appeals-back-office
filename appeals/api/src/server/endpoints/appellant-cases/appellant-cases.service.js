import {
	isOutcomeIncomplete,
	isOutcomeInvalid,
	isOutcomeValid
} from '#utils/check-validation-outcome.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';

import {
	AUDIT_TRAIL_SUBMISSION_INCOMPLETE,
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL,
	ERROR_NOT_FOUND,
	ERROR_NO_RECIPIENT_EMAIL
} from '#endpoints/constants.js';

import appellantCaseRepository from '#repositories/appellant-case.repository.js';
import transitionState from '../../state/transition-state.js';
import appealRepository from '#repositories/appeal.repository.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import config from '#config/config.js';
import formatDate from '#utils/date-formatter.js';

/** @typedef {import('express').RequestHandler} RequestHandler */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateAppellantCaseValidationOutcomeParams} UpdateAppellantCaseValidationOutcomeParams */

/**
 * @type {RequestHandler}
 * @returns {object | void}
 */
const checkAppellantCaseExists = (req, res, next) => {
	const {
		appeal,
		params: { appellantCaseId }
	} = req;
	const hasAppellantCase = appeal.appellantCase?.id === Number(appellantCaseId);

	if (!hasAppellantCase) {
		return res.status(404).send({ errors: { appellantCaseId: ERROR_NOT_FOUND } });
	}

	next();
};

/**
 * @param {UpdateAppellantCaseValidationOutcomeParams} param0
 * @param { import('#endpoints/appeals.js').NotifyClient } notifyClient
 */
const updateAppellantCaseValidationOutcome = async (
	{ appeal, appellantCaseId, azureAdUserId, data, validationOutcome, validAt, siteAddress },
	notifyClient
) => {
	const { appealStatus, appealType, id: appealId } = appeal;
	const { appealDueDate, incompleteReasons, invalidReasons } = data;

	await appellantCaseRepository.updateAppellantCaseValidationOutcome({
		appellantCaseId,
		validationOutcomeId: validationOutcome.id,
		...(isOutcomeIncomplete(validationOutcome.name) && { incompleteReasons }),
		...(isOutcomeInvalid(validationOutcome.name) && { invalidReasons }),
		...(isOutcomeValid(validationOutcome.name) && { appealId, validAt })
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
			details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['appellant case'])
		});
	}

	if (isOutcomeValid(validationOutcome.name)) {
		const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
		if (!recipientEmail) {
			throw new Error(ERROR_NO_RECIPIENT_EMAIL);
		}
		try {
			await notifyClient.sendEmail(config.govNotify.template.appealConfirmed, recipientEmail, {
				appeal_reference_number: appeal.reference,
				site_address: siteAddress
			});
		} catch (error) {
			if (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}
	}

	const updatedAppeal = await appealRepository.getAppealById(Number(appealId));
	``;
	if (isOutcomeIncomplete(validationOutcome.name) && updatedAppeal) {
		const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
		if (!recipientEmail) {
			throw new Error(ERROR_NO_RECIPIENT_EMAIL);
		}

		const newIncompleteReasons =
			updatedAppeal.appellantCase?.appellantCaseIncompleteReasonsOnAppellantCases;
		if (!newIncompleteReasons) {
			throw new Error(ERROR_NOT_FOUND);
		}

		const incompleteReasonsList = newIncompleteReasons.flatMap((item) => {
			if (item.appellantCaseIncompleteReasonText.length > 0) {
				return item.appellantCaseIncompleteReasonText.map(
					(textItem) => `${item.appellantCaseIncompleteReason.name}: ${textItem.text}`
				);
			} else {
				return [item.appellantCaseIncompleteReason.name];
			}
		});

		const appealDueDateAsDateObject = new Date(appealDueDate);

		try {
			await notifyClient.sendEmail(config.govNotify.template.appealIncomplete, recipientEmail, {
				appeal_reference_number: appeal.reference,
				site_address: siteAddress,
				due_date: formatDate(appealDueDateAsDateObject, false),
				reasons: incompleteReasonsList
			});
		} catch (error) {
			if (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}
	}

	if (appealDueDate) {
		await appealRepository.updateAppealById(appealId, { dueDate: appealDueDate });
	}

	await broadcasters.broadcastAppeal(appealId);
};

export { checkAppellantCaseExists, updateAppellantCaseValidationOutcome };
