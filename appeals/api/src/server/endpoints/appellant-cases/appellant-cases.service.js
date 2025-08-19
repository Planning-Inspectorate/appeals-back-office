import * as CONSTANTS from '@pins/appeals/constants/support.js';
import {
	AUDIT_TRAIL_SUBMISSION_INCOMPLETE,
	ERROR_NO_RECIPIENT_EMAIL,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import {
	isOutcomeIncomplete,
	isOutcomeInvalid,
	isOutcomeValid
} from '#utils/check-validation-outcome.js';

import appellantCaseRepository from '#repositories/appellant-case.repository.js';
import transitionState from '../../state/transition-state.js';
import appealRepository from '#repositories/appeal.repository.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { getFormattedReasons } from '#utils/email-formatter.js';
import { camelToScreamingSnake, capitalizeFirstLetter } from '#utils/string-utils.js';
import * as documentRepository from '#repositories/document.repository.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { EventType } from '@pins/event-client';
import { notifySend } from '#notify/notify-send.js';
import {
	APPEAL_DEVELOPMENT_TYPES,
	PLANNING_OBLIGATION_STATUSES
} from '@pins/appeals/constants/appellant-cases.constants.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import auditApplicationDecisionMapper from '#utils/audit-application-decision-mapper.js';
import { isLinkedAppeal } from '#utils/is-linked-appeal.js';
import { buildListOfLinkedAppeals } from '#utils/build-list-of-linked-appeals.js';
import { allValidationOutcomesAreComplete } from '#utils/is-awaiting-linked-appeal.js';
import { AUDIT_TRAIL_SUBMISSION_INVALID } from '@pins/appeals/constants/support.js';

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
export const checkAppellantCaseExists = (req, res, next) => {
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
export const updateAppellantCaseValidationOutcome = async (
	{ appeal, appellantCaseId, azureAdUserId, data, validationOutcome, validAt, siteAddress },
	notifyClient
) => {
	const { id: appealId } = appeal;
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
		if (!isLinkedAppeal(appeal)) {
			await transitionState(appealId, azureAdUserId, validationOutcome.name);
		} else {
			// @ts-ignore
			const linkedAppeals = await buildListOfLinkedAppeals(appeal);
			if (allValidationOutcomesAreComplete(linkedAppeals)) {
				await Promise.all(
					linkedAppeals.map((appeal) => {
						const validationOutcome = appeal.appellantCase?.appellantCaseValidationOutcome;
						if (validationOutcome) {
							return transitionState(appeal.id, azureAdUserId, validationOutcome?.name);
						}
					})
				);
			}
		}
	} else {
		createAuditTrail({
			appealId,
			azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['appellant case'])
		});
	}

	if (isOutcomeValid(validationOutcome.name)) {
		const documentsUpdated = await documentRepository.setRedactionStatusOnValidation(appeal.id);
		for (const documentUpdated of documentsUpdated) {
			await broadcasters.broadcastDocument(
				documentUpdated.documentGuid,
				documentUpdated.version,
				EventType.Update
			);
		}

		const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
		if (!recipientEmail) {
			throw new Error(ERROR_NO_RECIPIENT_EMAIL);
		}
		const personalisation = {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			feedback_link:
				appeal.appealType.type === APPEAL_TYPE.S78
					? 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UQzg1SlNPQjA3V0FDNUFJTldHMlEzMDdMRS4u'
					: 'https://forms.office.com/r/9U4Sq9rEff'
		};
		await notifySend({
			azureAdUserId,
			templateName: 'appeal-confirmed',
			notifyClient,
			recipientEmail,
			personalisation
		});
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
				updatedAppellantCase?.appellantCaseIncompleteReasonsSelected ?? []
			);

			if (updatedDueDate) {
				const personalisation = {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: siteAddress,
					due_date: formatDate(new Date(updatedDueDate), false),
					reasons: incompleteReasonsList
				};

				await notifySend({
					azureAdUserId,
					templateName: 'appeal-incomplete',
					notifyClient,
					recipientEmail,
					personalisation
				});
			}
		}

		if (isOutcomeInvalid(validationOutcome.name)) {
			const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
			if (!recipientEmail) {
				throw new Error(ERROR_NO_RECIPIENT_EMAIL);
			}

			const invalidReasonsList = getFormattedReasons(
				updatedAppellantCase?.appellantCaseInvalidReasonsSelected ?? []
			);
			const personalisation = {
				appeal_reference_number: appeal.reference,
				lpa_reference: appeal.applicationReference,
				site_address: siteAddress,
				reasons: invalidReasonsList
			};
			await notifySend({
				azureAdUserId,
				templateName: 'appeal-invalid',
				notifyClient,
				recipientEmail,
				personalisation
			});

			if (updatedAppeal.lpa?.email) {
				await notifySend({
					azureAdUserId,
					templateName: 'appeal-invalid-lpa',
					notifyClient,
					recipientEmail: updatedAppeal.lpa.email,
					personalisation
				});
			}

			let details = AUDIT_TRAIL_SUBMISSION_INVALID;
			invalidReasonsList.forEach((invalidReason) => {
				details += `\n• ${invalidReason}`;
			});
			createAuditTrail({
				appealId,
				azureAdUserId,
				details
			});
		}
	}
};

/**
 * @param {Record<string, unknown>} data
 * @returns {string}
 * */
export function renderAuditTrailDetail(data) {
	const genericResult = CONSTANTS.AUDIT_TRAIL_APPELLANT_CASE_UPDATED;

	const dataKeys = Object.keys(data).filter((key) => data[key] !== undefined);
	if (dataKeys.length === 0) {
		return genericResult;
	}

	if (dataKeys.includes('ownsSomeLand') && dataKeys.includes('ownsAllLand')) {
		const parameter = (() => {
			if (data.ownsAllLand) {
				return 'Fully owned';
			}

			if (data.ownsSomeLand) {
				return 'Partially owned';
			}

			return 'Not owned';
		})();

		return stringTokenReplacement(CONSTANTS.AUDIT_TRAIL_SITE_OWNERSHIP_UPDATED, [parameter]);
	}

	if (dataKeys.length !== 1) {
		return genericResult;
	}

	const field = dataKeys[0];
	const constantKey = `AUDIT_TRAIL_${camelToScreamingSnake(field)}_UPDATED`;

	/** @type {Record<string, *>} */
	const auditTrailParameters = {
		AUDIT_TRAIL_DEVELOPMENT_TYPE_UPDATED: () =>
			capitalizeFirstLetter(
				APPEAL_DEVELOPMENT_TYPES.find(
					(/** @type {{value: string, label: string}} */ item) =>
						item.value === data.developmentType
				)?.label || data.developmentType
			),
		AUDIT_TRAIL_SITE_AREA_SQUARE_METRES_UPDATED: () => data.siteAreaSquareMetres,
		AUDIT_TRAIL_IS_GREEN_BELT_UPDATED: () => (data.isGreenBelt ? 'Yes' : 'No'),
		AUDIT_TRAIL_KNOWS_OTHER_OWNERS_UPDATED: () => data.knowsOtherOwners ?? 'No data',
		AUDIT_TRAIL_SITE_ACCESS_DETAILS_UPDATED: () =>
			data.siteAccessDetails ? `Yes\n${data.siteAccessDetails}` : 'No',
		AUDIT_TRAIL_SITE_SAFETY_DETAILS_UPDATED: () =>
			data.siteSafetyDetails ? `Yes\n${data.siteSafetyDetails}` : 'No',
		AUDIT_TRAIL_APPLICATION_DATE_UPDATED: () =>
			data.applicationDate
				? formatDate(new Date(/** @type {string} */ (data.applicationDate)), false)
				: undefined,
		// @ts-ignore
		AUDIT_TRAIL_DEVELOPMENT_DESCRIPTION_UPDATED: () => data.developmentDescription?.details,
		AUDIT_TRAIL_APPLICATION_DECISION_DATE_UPDATED: () =>
			data.applicationDecisionDate
				? formatDate(new Date(/** @type {string} */ (data.applicationDecisionDate)), false)
				: undefined,
		AUDIT_TRAIL_AGRICULTURAL_HOLDING_UPDATED: () => (data.agriculturalHolding ? 'Yes' : 'No'),
		AUDIT_TRAIL_TENANT_AGRICULTURAL_HOLDING_UPDATED: () =>
			data.tenantAgriculturalHolding ? 'Yes' : 'No',
		AUDIT_TRAIL_OTHER_TENANTS_AGRICULTURAL_HOLDING_UPDATED: () =>
			data.otherTenantsAgriculturalHolding ? 'Yes' : 'No',
		AUDIT_TRAIL_APPLICATION_DECISION_UPDATED: () =>
			auditApplicationDecisionMapper(/** @type {string} */ (data.applicationDecision)),
		AUDIT_TRAIL_APPELLANT_PROCEDURE_PREFERENCE_UPDATED: () => data.appellantProcedurePreference,
		AUDIT_TRAIL_APPELLANT_PROCEDURE_PREFERENCE_DETAILS_UPDATED: () =>
			data.appellantProcedurePreferenceDetails,
		AUDIT_TRAIL_APPELLANT_PROCEDURE_PREFERENCE_DURATION_UPDATE: () =>
			data.appellantProcedurePreferenceDuration,
		AUDIT_TRAIL_APPELLANT_PROCEDURE_PREFERENCE_WITNESS_COUNT_UPDATED: () =>
			data.appellantProcedurePreferenceWitnessCount,
		AUDIT_TRAIL_STATUS_PLANNING_OBLIGATION_UPDATED: () =>
			PLANNING_OBLIGATION_STATUSES.find(
				(/** @type {{value: string, label: string}} */ item) =>
					item.value === data.statusPlanningObligation
			)?.label || 'Not applicable'
	};

	if (!auditTrailParameters[constantKey]) {
		return constantKey in auditTrailParameters ? CONSTANTS[constantKey] : genericResult;
	}

	return stringTokenReplacement(CONSTANTS[constantKey], [auditTrailParameters[constantKey]()]);
}
