import {
	isOutcomeIncomplete,
	isOutcomeInvalid,
	isOutcomeValid
} from '#utils/check-validation-outcome.js';

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
import { getFormattedReasons } from '#utils/appeal-formatter.js';

/** @typedef {import('@pins/appeals.api').Appeals.UpdateAppellantCaseValidationOutcomeParams} UpdateAppellantCaseValidationOutcomeParams */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Response | void}
 */
const checkAppellantCaseExists = (req, res, next) => {
	const {
		appeal,
		params: { appellantCaseId }
	} = req;
	const hasAppellantCase = appeal.appellantCase?.id === Number(appellantCaseId);

	if (!hasAppellantCase) {
		res.status(404).send({ errors: { appellantCaseId: ERROR_NOT_FOUND } });
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
		appealId,
		appellantCaseId,
		validationOutcomeId: validationOutcome.id,
		...(isOutcomeIncomplete(validationOutcome.name) && { incompleteReasons, appealDueDate }),
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
				site_address: siteAddress,
				lpa_reference: appeal.applicationReference
			});
		} catch (error) {
			if (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}
	}

	const updatedAppeal = await appealRepository.getAppealById(Number(appealId));
	if (updatedAppeal) {
		const { caseExtensionDate: updatedDueDate, appellantCase: updatedAppellantCase } =
			updatedAppeal;

		if (isOutcomeIncomplete(validationOutcome.name)) {
			const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
			if (!recipientEmail) {
				throw new Error(ERROR_NO_RECIPIENT_EMAIL);
			}

			const incompleteReasonsList = getFormattedReasons(
				// @ts-ignore
				updatedAppellantCase?.appellantCaseIncompleteReasonsSelected
			);

			if (updatedDueDate) {
				try {
					await notifyClient.sendEmail(config.govNotify.template.appealIncomplete, recipientEmail, {
						appeal_reference_number: appeal.reference,
						lpa_reference: appeal.applicationReference,
						site_address: siteAddress,
						due_date: formatDate(new Date(updatedDueDate), false),
						reasons: incompleteReasonsList
					});
				} catch (error) {
					if (error) {
						throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
					}
				}
			}
		}

		if (isOutcomeInvalid(validationOutcome.name)) {
			const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
			if (!recipientEmail) {
				throw new Error(ERROR_NO_RECIPIENT_EMAIL);
			}

			const invalidReasonsList = getFormattedReasons(
				updatedAppellantCase?.appellantCaseInvalidReasonsSelected
			);

			try {
				await notifyClient.sendEmail(config.govNotify.template.appealInvalid, recipientEmail, {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: siteAddress,
					reasons: invalidReasonsList
				});
			} catch (error) {
				if (error) {
					throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
				}
			}
		}
	}
};

export { checkAppellantCaseExists, updateAppellantCaseValidationOutcome };
