import {
	isOutcomeIncomplete,
	isOutcomeInvalid,
	isOutcomeValid
} from '#utils/check-validation-outcome.js';
import { getFeedbackLinkFromAppealTypeKey } from '#utils/feedback-form-link.js';
import { APPEAL_TYPE, FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';
import * as CONSTANTS from '@pins/appeals/constants/support.js';
import {
	AUDIT_TRAIL_ENFORCEMENT_NOTICE_CONTACT_ADDRESS,
	AUDIT_TRAIL_SUBMISSION_INCOMPLETE,
	AUDIT_TRAIL_SUBMISSION_INVALID,
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
import commonRepository from '#repositories/common.repository.js';
import * as documentRepository from '#repositories/document.repository.js';
import auditApplicationDecisionMapper from '#utils/audit-application-decision-mapper.js';
import { buildListOfLinkedAppeals } from '#utils/build-list-of-linked-appeals.js';
import { Prisma } from '#utils/db-client/client.js';
import { getFormattedReasons } from '#utils/email-formatter.js';
import { formatContactDetails } from '#utils/format-contact-details.js';
import { formatReasonsToHtmlList } from '#utils/format-reasons-to-html-list.js';
import { allAppellantCaseOutcomesAreComplete } from '#utils/is-awaiting-linked-appeal.js';
import { isChildAppeal, isLinkedAppeal, isParentAppeal } from '#utils/is-linked-appeal.js';
import { getChildAppeals, getLeadAppeal } from '#utils/link-appeals.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	addressToString,
	camelToScreamingSnake,
	capitalizeFirstLetter,
	trimAppealType
} from '#utils/string-utils.js';
import {
	APPEAL_DEVELOPMENT_TYPES,
	PLANNING_OBLIGATION_STATUSES
} from '@pins/appeals/constants/appellant-cases.constants.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { EventType } from '@pins/event-client';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { add } from 'date-fns';
import transitionState from '../../state/transition-state.js';

/** @typedef {import('@pins/appeals.api').Appeals.UpdateAppellantCaseValidationOutcomeParams} UpdateAppellantCaseValidationOutcomeParams */
/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppellantCaseUpdateRequest} AppellantCaseUpdateRequest */
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
 *
 * @param {number} appellantCaseId
 * @param {AppellantCaseUpdateRequest} data
 * @param {Appeal} appeal
 */
export const updateAppellantCaseData = async (appellantCaseId, data, appeal) => {
	await appellantCaseRepository.updateAppellantCaseById(appellantCaseId, data);
	// Only sync the child appellant case with the parent when the appeal type is enforcement notice or enforcement listed building
	if (
		!isParentAppeal(appeal) ||
		appeal.appealType?.type !== APPEAL_TYPE.ENFORCEMENT_NOTICE ||
		appeal.appealType?.type !== APPEAL_TYPE.ENFORCEMENT_NOTICE
	) {
		return;
	}
	// eslint-disable-next-line no-unused-vars
	const { interestInLand, writtenOrVerbalPermission, ...childData } = data;

	// Now keep linked children in sync with their parent
	for (const childAppeal of getChildAppeals(appeal)) {
		await appellantCaseRepository.updateAppellantCaseById(
			// @ts-ignore
			childAppeal?.appellantCase?.id,
			childData
		);
	}
};

/**
 * @param {{ id: number, text?: string[] | undefined }[] | undefined} enforcementInvalidReasons
 * @returns {Record<string, string> | undefined}
 */
const getEnforcementInvalidReasonsParams = (enforcementInvalidReasons) => {
	return enforcementInvalidReasons?.reduce(
		(acc, reason) => ({
			...acc,
			[`reason_${reason.id}`]: reason.text?.[0] || ''
		}),
		{}
	);
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
		enforcementInvalidReasons,
		enforcementMissingDocuments,
		enforcementGroundsMismatchFacts,
		feeReceiptDueDate
	} = data;

	const teamEmail = await getTeamEmailFromAppealId(appealId);
	const incompleteAppealDueDate =
		appealDueDate ?? (enforcementNoticeInvalid ? add(new Date(), { days: 7 }) : undefined);

	const validationOutcomeData = {
		appealId,
		appellantCaseId,
		validationOutcomeId: validationOutcome.id,
		...(isOutcomeIncomplete(validationOutcome.name) && {
			incompleteReasons,
			appealDueDate: incompleteAppealDueDate,
			...(otherInformation && { otherInformation }),
			...(enforcementNoticeInvalid && { enforcementNoticeInvalid }),
			...(enforcementInvalidReasons && { enforcementInvalidReasons }),
			...(enforcementMissingDocuments && { enforcementMissingDocuments }),
			...(enforcementGroundsMismatchFacts && { enforcementGroundsMismatchFacts }),
			...(feeReceiptDueDate && { groundAFeeReceiptDueDate: feeReceiptDueDate })
		}),
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
	};
	const leadAppeal = getLeadAppeal(appeal);

	const isEnforcementAppealType = appeal.appealType?.key === APPEAL_CASE_TYPE.C;
	const isChildEnforcement = isEnforcementAppealType && isChildAppeal(appeal);
	const isParentEnforcement = isEnforcementAppealType && isParentAppeal(appeal);

	const leadOutcomeId =
		leadAppeal?.appellantCase?.appellantCaseValidationOutcome?.id ?? validationOutcome.id;

	await appellantCaseRepository.updateAppellantCaseValidationOutcome({
		...validationOutcomeData,
		validationOutcomeId: isChildEnforcement ? leadOutcomeId : validationOutcome.id
	});

	if (isParentEnforcement) {
		// Keep linked enforcement children in sync with their parent
		for (const childAppeal of getChildAppeals(appeal)) {
			const childHasOutcome = Boolean(childAppeal.appellantCase?.appellantCaseValidationOutcome);

			await appellantCaseRepository.updateAppellantCaseValidationOutcome({
				...validationOutcomeData,
				appealId: childAppeal?.id,
				// @ts-ignore
				appellantCaseId: childAppeal?.appellantCase?.id,
				// Only set the outcome if one already exists (indicates the child had been confirmed)
				validationOutcomeId: childHasOutcome ? validationOutcome.id : undefined
			});
		}
	}

	if (!isOutcomeIncomplete(validationOutcome.name)) {
		if (!isLinkedAppeal(appeal)) {
			await transitionState(appealId, azureAdUserId, validationOutcome.name);
		} else {
			// @ts-ignore
			const linkedAppeals = await buildListOfLinkedAppeals(appeal);
			let leadAppellantCaseValidationOutcome = {};
			if (allAppellantCaseOutcomesAreComplete(linkedAppeals, appealId, validationOutcome)) {
				// @ts-ignore
				leadAppellantCaseValidationOutcome =
					leadAppeal?.appellantCase?.appellantCaseValidationOutcome;
				for (const appeal of linkedAppeals) {
					if (
						appeal.appealType?.key === APPEAL_CASE_TYPE.C &&
						appeal.id === leadAppeal?.id &&
						appeal.appellantCase?.appellantCaseValidationOutcome?.id !==
							// @ts-ignore
							leadAppellantCaseValidationOutcome?.id
					) {
						await appellantCaseRepository.updateAppellantCaseValidationOutcome({
							// @ts-ignore
							appellantCaseId: appeal.appellantCase?.id,
							// @ts-ignore
							appellantCaseValidationOutcomeId: leadAppellantCaseValidationOutcome?.id
						});
					}
					// @ts-ignore
					await transitionState(appeal.id, azureAdUserId, leadAppellantCaseValidationOutcome?.name);
				}
			}
		}
	}

	const updatedAppeal = await appealRepository.getAppealById(Number(appealId));

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

		if (!isChildEnforcement) {
			const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
			if (!recipientEmail) {
				throw new Error(ERROR_NO_RECIPIENT_EMAIL);
			}
			const isEnforcement = appeal.appealType.key === APPEAL_CASE_TYPE.C;
			const personalisation = {
				appeal_reference_number: appeal.reference,
				lpa_reference: appeal.applicationReference || '',
				site_address: siteAddress,
				team_email_address: teamEmail,
				...(isEnforcement && {
					local_planning_authority: updatedAppeal?.lpa?.name || '',
					appeal_type: trimAppealType(appeal.appealType.type),
					enforcement_reference: updatedAppeal?.appellantCase?.enforcementReference || '',
					appeal_grounds:
						updatedAppeal?.appealGrounds?.map((ground) => ground.ground?.groundRef || '').sort() ||
						[],
					ground_a_barred: groundABarred || false,
					other_info: otherInformation || ''
				})
			};
			await notifySend({
				azureAdUserId,
				templateName: isEnforcement ? 'appeal-confirmed-enforcement-appellant' : 'appeal-confirmed',
				notifyClient,
				recipientEmail,
				personalisation: {
					...personalisation,
					feedback_link: getFeedbackLinkFromAppealTypeKey(appeal.appealType.key)
				}
			});
			if (isEnforcement) {
				const { agent, appellant } = updatedAppeal || {};
				await notifySend({
					azureAdUserId,
					templateName: 'appeal-confirmed-enforcement-lpa',
					notifyClient,
					recipientEmail: updatedAppeal?.lpa?.email,
					personalisation: {
						...personalisation,
						agent_contact_details: agent ? formatContactDetails(agent) : '',
						appellant_contact_details: appellant ? formatContactDetails(appellant) : ''
					}
				});
			}
		}
	}

	if (updatedAppeal) {
		const { caseExtensionDate: updatedDueDate, appellantCase: updatedAppellantCase } =
			updatedAppeal;

		if (isOutcomeIncomplete(validationOutcome.name)) {
			const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
			if (!recipientEmail) {
				throw new Error(ERROR_NO_RECIPIENT_EMAIL);
			}

			if (
				updatedAppeal.appealType?.type === APPEAL_TYPE.ENFORCEMENT_NOTICE &&
				updatedAppeal.enforcementNoticeAppealOutcome?.enforcementNoticeInvalid === 'no'
			) {
				const reasonsToFormat = [];
				const { appellantCase, enforcementNoticeAppealOutcome } = updatedAppeal;
				if (appellantCase?.appellantCaseEnforcementMissingDocumentsSelected?.length) {
					reasonsToFormat.push('Missing information');
				}
				if (appellantCase?.appellantCaseEnforcementGroundsMismatchSelected?.length) {
					reasonsToFormat.push('Grounds mismatch');
				}
				if (enforcementNoticeAppealOutcome.groundAFeeReceiptDueDate) {
					reasonsToFormat.push('Ground (a) fee receipt due date');
				}

				const details = `${
					stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['Appeal']) + '\n'
				}${formatReasonsToHtmlList(reasonsToFormat)}`;

				await createAuditTrail({
					appealId,
					azureAdUserId,
					details
				});

				if (incompleteAppealDueDate) {
					if (!isChildEnforcement) {
						const missingDocumentOptions = await commonRepository.getLookupList(
							'appellantCaseEnforcementMissingDocument'
						);
						const groundsMismatchOptions = await commonRepository.getLookupList(
							'appellantCaseEnforcementGroundsMismatchFacts'
						);
						const personalisation = {
							appeal_reference_number: appeal.reference,
							site_address: siteAddress,
							enforcement_reference: updatedAppeal?.appellantCase?.enforcementReference || '',
							missing_documents: enforcementMissingDocuments
								? enforcementMissingDocuments.map(
										(document) =>
											`${missingDocumentOptions.find((option) => option.id === document.id)?.name}: ${document.text?.[0] || ''}`
									)
								: [],
							fee_due_date: updatedAppeal?.enforcementNoticeAppealOutcome?.groundAFeeReceiptDueDate
								? formatDate(
										new Date(updatedAppeal.enforcementNoticeAppealOutcome.groundAFeeReceiptDueDate)
									)
								: '',
							grounds_and_facts: enforcementGroundsMismatchFacts
								? enforcementGroundsMismatchFacts.map(
										(ground) =>
											`${groundsMismatchOptions.find((option) => option.id === ground.id)?.name}: ${ground.text?.[0] || ''}`
									)
								: [],
							local_planning_authority: updatedAppeal?.lpa?.name || '',
							other_info:
								incompleteReasons?.find((reason) => reason.id === 10)?.['text']?.[0] || '',
							team_email_address: teamEmail,
							due_date: formatDate(new Date(incompleteAppealDueDate), false),
							appeal_grounds:
								updatedAppeal?.appealGrounds
									?.map((ground) => ground.ground?.groundRef || '')
									.sort() || []
						};
						await notifySend({
							azureAdUserId,
							templateName: 'enforcement-appeal-incomplete-appellant',
							notifyClient,
							recipientEmail,
							personalisation
						});
						if (updatedAppeal.lpa?.email) {
							await notifySend({
								azureAdUserId,
								templateName: 'enforcement-appeal-incomplete-lpa',
								notifyClient,
								recipientEmail: updatedAppeal?.lpa?.email,
								personalisation
							});
						}
					}
				}
			} else {
				const reasonsToFormat = updatedAppellantCase?.appellantCaseIncompleteReasonsSelected?.length
					? updatedAppellantCase?.appellantCaseIncompleteReasonsSelected
					: updatedAppellantCase?.appellantCaseEnforcementInvalidReasonsSelected?.length
						? updatedAppellantCase?.appellantCaseEnforcementInvalidReasonsSelected
						: [];

				const incompleteReasonsList = getFormattedReasons(reasonsToFormat);

				if (otherInformation && otherInformation !== 'no') {
					incompleteReasonsList.push(otherInformation);
				}

				const details = `${
					stringTokenReplacement(AUDIT_TRAIL_SUBMISSION_INCOMPLETE, ['Appeal']) + '\n'
				}${formatReasonsToHtmlList(incompleteReasonsList)}`;

				await createAuditTrail({
					appealId,
					azureAdUserId,
					details
				});
				if (!isChildEnforcement) {
					if (updatedDueDate) {
						if (!enforcementNoticeInvalid) {
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
						} else if (enforcementNoticeInvalid === 'yes') {
							const personalisation = {
								appeal_reference_number: appeal.reference,
								enforcement_reference: updatedAppeal?.appellantCase?.enforcementReference || '',
								site_address: siteAddress,
								...getEnforcementInvalidReasonsParams(enforcementInvalidReasons),
								other_info: otherInformation || '',
								team_email_address: teamEmail,
								due_date: formatDate(new Date(updatedDueDate), false)
							};
							if (updatedAppeal.lpa?.email) {
								await notifySend({
									azureAdUserId,
									templateName: 'enforcement-notice-incomplete-lpa',
									notifyClient,
									recipientEmail: updatedAppeal?.lpa?.email,
									personalisation
								});
							}
						}
					}
				}
			}
		}

		if (isOutcomeInvalid(validationOutcome.name)) {
			const reasonsToFormat = updatedAppellantCase?.appellantCaseInvalidReasonsSelected?.length
				? updatedAppellantCase?.appellantCaseInvalidReasonsSelected
				: updatedAppellantCase?.appellantCaseEnforcementInvalidReasonsSelected?.length
					? updatedAppellantCase?.appellantCaseEnforcementInvalidReasonsSelected
					: [];

			const invalidReasonsList = getFormattedReasons(reasonsToFormat);

			if (!isChildEnforcement) {
				const applicantEmail = appeal.agent?.email || appeal.appellant?.email;

				if (!enforcementNoticeInvalid) {
					if (!applicantEmail) {
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
						recipientEmail: applicantEmail,
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
				} else if (enforcementNoticeInvalid === 'yes') {
					const personalisation = {
						appeal_reference_number: appeal.reference,
						enforcement_reference: updatedAppeal?.appellantCase?.enforcementReference || '',
						site_address: siteAddress,
						...getEnforcementInvalidReasonsParams(enforcementInvalidReasons),
						other_info: otherInformation || '',
						team_email_address: teamEmail
					};
					await notifySend({
						azureAdUserId,
						templateName: 'enforcement-notice-invalid-appellant',
						notifyClient,
						recipientEmail: applicantEmail,
						personalisation
					});
					if (updatedAppeal.lpa?.email) {
						await notifySend({
							azureAdUserId,
							templateName: 'enforcement-notice-invalid-lpa',
							notifyClient,
							recipientEmail: updatedAppeal.lpa.email,
							personalisation
						});
					}
				} else if (enforcementNoticeInvalid === 'no' && isEnforcementAppealType) {
					if (!applicantEmail) {
						throw new Error(ERROR_NO_RECIPIENT_EMAIL);
					}

					const GROUND_A_BARRED_REASON_ID = 7;

					const personalisation = {
						appeal_reference_number: appeal.reference,
						enforcement_reference: updatedAppeal?.appellantCase?.enforcementReference || '',
						site_address: siteAddress,
						reasons: invalidReasonsList,
						team_email_address: teamEmail,
						ground_a_barred: reasonsToFormat.some(
							(reason) => reason.appellantCaseInvalidReasonId === GROUND_A_BARRED_REASON_ID
						),
						other_live_appeals: otherLiveAppeals === 'yes',
						effective_date: updatedAppeal.appellantCase?.enforcementEffectiveDate
							? formatDate(new Date(updatedAppeal.appellantCase.enforcementEffectiveDate), false)
							: undefined
					};

					await notifySend({
						azureAdUserId,
						templateName: 'enforcement-appeal-invalid-appellant',
						notifyClient,
						recipientEmail: applicantEmail,
						personalisation
					});

					if (updatedAppeal.lpa?.email) {
						await notifySend({
							azureAdUserId,
							templateName: 'enforcement-appeal-invalid-lpa',
							notifyClient,
							recipientEmail: updatedAppeal.lpa.email,
							personalisation
						});
					}
				}
			}

			if (otherInformation && otherInformation !== 'no') {
				invalidReasonsList.push(otherInformation);
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
		AUDIT_TRAIL_RETROSPECTIVE_APPLICATION_UPDATED: () =>
			data.retrospectiveApplication ? 'Yes' : 'No',
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
			capitalizeFirstLetter(/** @type {string} */ (data.interestInLand)),
		AUDIT_TRAIL_SITE_USE_AT_TIME_OF_APPLICATION_UPDATED: () => data.siteUseAtTimeOfApplication,
		AUDIT_TRAIL_APPLICATION_MADE_UNDER_ACT_SECTION_UPDATED: () =>
			capitalizeFirstLetter(
				/** @type {string} */ (data.applicationMadeUnderActSection || '').replaceAll('-', ' ')
			)
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
