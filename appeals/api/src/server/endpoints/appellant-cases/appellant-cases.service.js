import {
	isOutcomeIncomplete,
	isOutcomeInvalid,
	isOutcomeValid
} from '#utils/check-validation-outcome.js';
import { getFeedbackLinkFromAppealTypeKey } from '#utils/feedback-form-link.js';
import { FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';
import * as CONSTANTS from '@pins/appeals/constants/support.js';
import {
	AUDIT_TRAIL_SUBMISSION_INCOMPLETE,
	ERROR_NO_RECIPIENT_EMAIL,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';

import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { notifySend } from '#notify/notify-send.js';
import addressRepository from '#repositories/address.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import appellantCaseRepository from '#repositories/appellant-case.repository.js';
import * as documentRepository from '#repositories/document.repository.js';
import auditApplicationDecisionMapper from '#utils/audit-application-decision-mapper.js';
import { buildListOfLinkedAppeals } from '#utils/build-list-of-linked-appeals.js';
import { Prisma } from '#utils/db-client/client.js';
import { getFormattedReasons } from '#utils/email-formatter.js';
import { formatReasonsToHtmlList } from '#utils/format-reasons-to-html-list.js';
import { allAppellantCaseOutcomesAreValid } from '#utils/is-awaiting-linked-appeal.js';
import { isLinkedAppeal } from '#utils/is-linked-appeal.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	addressToString,
	camelToScreamingSnake,
	capitalizeFirstLetter
} from '#utils/string-utils.js';
import {
	APPEAL_DEVELOPMENT_TYPES,
	PLANNING_OBLIGATION_STATUSES
} from '@pins/appeals/constants/appellant-cases.constants.js';
import {
	AUDIT_TRAIL_ENFORCEMENT_NOTICE_CONTACT_ADDRESS,
	AUDIT_TRAIL_SUBMISSION_INVALID
} from '@pins/appeals/constants/support.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { EventType } from '@pins/event-client';
import transitionState from '../../state/transition-state.js';

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
	const {
		appealDueDate,
		incompleteReasons,
		invalidReasons,
		groundABarred,
		otherInformation,
		enforcementNoticeInvalid,
		otherLiveAppeals,
		enforcementInvalidReasons
	} = data;
	const teamEmail = await getTeamEmailFromAppealId(appealId);

	await appellantCaseRepository.updateAppellantCaseValidationOutcome({
		appealId,
		appellantCaseId,
		validationOutcomeId: validationOutcome.id,
		...(isOutcomeIncomplete(validationOutcome.name) && { incompleteReasons, appealDueDate }),
		...(isOutcomeInvalid(validationOutcome.name) && {
			invalidReasons,
			...(otherInformation && { otherInformation }),
			...(enforcementNoticeInvalid && { enforcementNoticeInvalid }),
			...(otherLiveAppeals && { otherLiveAppeals }),
			...(enforcementInvalidReasons && { enforcementInvalidReasons })
		}),
		...(isOutcomeValid(validationOutcome.name) && {
			appealId,
			validAt,
			...(groundABarred && { groundABarred }),
			...(otherInformation && { otherInformation })
		})
	});

	if (!isOutcomeIncomplete(validationOutcome.name)) {
		if (!isLinkedAppeal(appeal)) {
			await transitionState(appealId, azureAdUserId, validationOutcome.name);
		} else {
			// @ts-ignore
			const linkedAppeals = await buildListOfLinkedAppeals(appeal);
			if (allAppellantCaseOutcomesAreValid(linkedAppeals, appealId, validationOutcome)) {
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
	}

	if (isOutcomeValid(validationOutcome.name)) {
		const latestDocumentVersionsUpdated = await documentRepository.setRedactionStatusOnValidation(
			appeal.id
		);
		for (const documentUpdated of latestDocumentVersionsUpdated) {
			await broadcasters.broadcastDocument(
				documentUpdated.documentGuid,
				documentUpdated.version,
				EventType.Update
			);
		}

		// Don't send for enforcement notice
		if (groundABarred === undefined) {
			const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
			if (!recipientEmail) {
				throw new Error(ERROR_NO_RECIPIENT_EMAIL);
			}
			const personalisation = {
				appeal_reference_number: appeal.reference,
				lpa_reference: appeal.applicationReference || '',
				site_address: siteAddress,
				feedback_link: getFeedbackLinkFromAppealTypeKey(appeal.appealType.key),
				team_email_address: teamEmail
			};
			await notifySend({
				azureAdUserId,
				templateName: 'appeal-confirmed',
				notifyClient,
				recipientEmail,
				personalisation
			});
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
				updatedAppellantCase?.appellantCaseIncompleteReasonsSelected ?? []
			);

			const details = `${
				stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['Appeal']) + '\n'
			}${formatReasonsToHtmlList(incompleteReasonsList)}`;

			createAuditTrail({
				appealId,
				azureAdUserId,
				details
			});

			if (updatedDueDate) {
				const personalisation = {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: siteAddress,
					due_date: formatDate(new Date(updatedDueDate), false),
					reasons: incompleteReasonsList,
					team_email_address: teamEmail
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
			const reasonsToFormat = updatedAppellantCase?.appellantCaseInvalidReasonsSelected?.length
				? updatedAppellantCase?.appellantCaseInvalidReasonsSelected
				: updatedAppellantCase?.appellantCaseEnforcementInvalidReasonsSelected?.length
				? updatedAppellantCase?.appellantCaseEnforcementInvalidReasonsSelected
				: [];

			const invalidReasonsList = getFormattedReasons(reasonsToFormat);
			if (!enforcementNoticeInvalid) {
				const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
				if (!recipientEmail) {
					throw new Error(ERROR_NO_RECIPIENT_EMAIL);
				}

				const personalisation = {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: siteAddress,
					reasons: invalidReasonsList,
					team_email_address: teamEmail
				};
				await notifySend({
					azureAdUserId,
					templateName: 'appeal-invalid',
					notifyClient,
					recipientEmail,
					personalisation: {
						...personalisation,
						feedback_link: getFeedbackLinkFromAppealTypeKey(appeal.appealType.key)
					}
				});

				if (updatedAppeal.lpa?.email) {
					await notifySend({
						azureAdUserId,
						templateName: 'appeal-invalid-lpa',
						notifyClient,
						recipientEmail: updatedAppeal.lpa.email,
						personalisation: {
							...personalisation,
							feedback_link: FEEDBACK_FORM_LINKS.LPA
						}
					});
				}
			}

			const details = `${AUDIT_TRAIL_SUBMISSION_INVALID}\n${formatReasonsToHtmlList(
				invalidReasonsList
			)}`;

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

	if (
		['validationOutcome', 'validAt', 'groundABarred', 'otherInformation'].every((key) =>
			dataKeys.includes(key)
		)
	) {
		return stringTokenReplacement(CONSTANTS.AUDIT_TRAIL_ENFORCEMENT_SUBMISSION_VALID, [
			formatDate(new Date(/** @type {string} */ (data.validAt)), false),
			data.otherInformation === 'No' ? '' : data.otherInformation
		]);
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
		AUDIT_TRAIL_HIGHWAY_LAND_UPDATED: () => (data.highwayLand ? 'Yes' : 'No'),
		AUDIT_TRAIL_IS_GREEN_BELT_UPDATED: () => (data.isGreenBelt ? 'Yes' : 'No'),
		AUDIT_TRAIL_ADVERT_IN_POSITION_UPDATED: () => (data.advertInPosition ? 'Yes' : 'No'),
		AUDIT_TRAIL_LANDOWNER_PERMISSION_UPDATED: () => (data.landownerPermission ? 'Yes' : 'No'),
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
		AUDIT_TRAIL_ENFORCEMENT_NOTICE_UPDATED: () => (data.enforcementNotice ? 'Yes' : 'No'),
		AUDIT_TRAIL_ENFORCEMENT_NOTICE_LISTED_BUILDING_UPDATED: () =>
			data.enforcementNoticeListedBuilding ? 'Yes' : 'No',
		AUDIT_TRAIL_ENFORCEMENT_ISSUE_DATE_UPDATED: () =>
			data.enforcementIssueDate
				? formatDate(new Date(/** @type {string} */ (data.enforcementIssueDate)), false)
				: undefined,
		AUDIT_TRAIL_ENFORCEMENT_EFFECTIVE_DATE_UPDATED: () =>
			data.enforcementEffectiveDate
				? formatDate(new Date(/** @type {string} */ (data.enforcementEffectiveDate)), false)
				: undefined,
		AUDIT_TRAIL_CONTACT_PLANNING_INSPECTORATE_DATE_UPDATED: () =>
			data.contactPlanningInspectorateDate
				? formatDate(new Date(/** @type {string} */ (data.contactPlanningInspectorateDate)), false)
				: undefined,
		AUDIT_TRAIL_APPEAL_DECISION_DATE_UPDATED: () =>
			data.appealDecisionDate
				? formatDate(new Date(/** @type {string} */ (data.appealDecisionDate)), false)
				: undefined,

		AUDIT_TRAIL_ENFORCEMENT_REFERENCE_UPDATED: () => data.enforcementReference,
		AUDIT_TRAIL_DESCRIPTION_OF_ALLEGED_BREACH_UPDATED: () => data.descriptionOfAllegedBreach,
		AUDIT_TRAIL_APPLICATION_DEVELOPMENT_ALL_OR_PART_UPDATED: () =>
			capitalizeFirstLetter(
				/** @type {string} */ (data.applicationDevelopmentAllOrPart || '').replaceAll('-', ' ')
			),
		AUDIT_TRAIL_STATUS_PLANNING_OBLIGATION_UPDATED: () =>
			PLANNING_OBLIGATION_STATUSES.find(
				(/** @type {{value: string, label: string}} */ item) =>
					item.value === data.statusPlanningObligation
			)?.label || 'Not applicable',
		AUDIT_TRAIL_WRITTEN_OR_VERBAL_PERMISSION_UPDATED: () => data.writtenOrVerbalPermission,
		AUDIT_TRAIL_INTEREST_IN_LAND_UPDATED: () =>
			capitalizeFirstLetter(/** @type {string} */ (data.interestInLand))
	};

	if (!auditTrailParameters[constantKey]) {
		return constantKey in auditTrailParameters ? CONSTANTS[constantKey] : genericResult;
	}

	return stringTokenReplacement(
		CONSTANTS[constantKey],
		[auditTrailParameters[constantKey]()].flat()
	);
}

/**
 * @typedef {object} body
 * @property {string} [addressLine1]
 * @property {string} [addressLine2]
 * @property {string} [addressCounty]
 * @property {string} [postcode]
 * @property {string} [addressTown]
 *
 * @param {object} params
 * @param {number} params.appellantCaseId
 * @param {number} params.appealId
 * @param {string} params.azureAdUserId
 * @param {number | undefined} [params.addressId]
 * @param {body} params.body
 */
export const putContactAddress = async (params) => {
	try {
		const { appealId, appellantCaseId, addressId, azureAdUserId, body } = params;
		const contactAddress = addressId
			? await addressRepository.updateAppellantCaseContactAddressById({
					id: addressId,
					appealId,
					appellantCaseId,
					data: body
			  })
			: await addressRepository.createAppellantCaseContactAddress({
					appealId,
					appellantCaseId,
					data: body
			  });

		const addressDetails = addressToString(contactAddress);
		const details = stringTokenReplacement(AUDIT_TRAIL_ENFORCEMENT_NOTICE_CONTACT_ADDRESS, [
			addressDetails
		]);
		await createAuditTrail({
			appealId,
			azureAdUserId,
			details
		});

		return contactAddress;
	} catch (error) {
		logger.error(error);
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				throw new Error(ERROR_NOT_FOUND);
			}
		}
		throw error;
	}
};
