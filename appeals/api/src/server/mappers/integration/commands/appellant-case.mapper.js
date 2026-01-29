/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */
/** @typedef {import('@pins/appeals.api').Schema.AppellantCase} AppellantCase */

import { mapContactAddressIn } from '#mappers/integration/commands/address.mapper.js';
import { createSharedS20S78Fields } from '#mappers/integration/shared/s20s78/appellant-case-fields.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

/**
 *
 * @param {Pick<AppellantSubmissionCommand, 'casedata'>} command
 * @returns {Omit<import('#db-client/models.ts').AppellantCaseCreateInput, 'appeal'>}
 */
export const mapAppellantCaseIn = (command) => {
	const casedata = command.casedata;
	const isS78 = casedata.caseType === APPEAL_CASE_TYPE.W;
	const isS20 = casedata.caseType === APPEAL_CASE_TYPE.Y;
	const isAdverts =
		casedata.caseType === APPEAL_CASE_TYPE.ZA || casedata.caseType === APPEAL_CASE_TYPE.H;
	const isFullAdverts = casedata.caseType === APPEAL_CASE_TYPE.H;
	const isEnforcementNotice =
		isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_NOTICE) &&
		casedata.caseType === APPEAL_CASE_TYPE.C;
	const isLDC = casedata.caseType === APPEAL_CASE_TYPE.X;

	// @ts-ignore
	const sharedFields = createSharedS20S78Fields(command);

	const knowsAllOwners = casedata.knowsAllOwners
		? {
				connect: { key: casedata.knowsAllOwners }
			}
		: null;

	const knowsOtherOwners = casedata.knowsOtherOwners
		? {
				connect: { key: casedata.knowsOtherOwners }
			}
		: null;

	const siteAccessDetails =
		casedata.siteAccessDetails != null && casedata.siteAccessDetails.length > 0
			? casedata.siteAccessDetails[0]
			: null;

	const siteSafetyDetails =
		casedata.siteSafetyDetails != null && casedata.siteSafetyDetails.length > 0
			? casedata.siteSafetyDetails[0]
			: null;

	const advertDetails =
		(casedata.caseType === APPEAL_CASE_TYPE.ZA || casedata.caseType === APPEAL_CASE_TYPE.H) &&
		casedata.advertDetails &&
		casedata.advertDetails.length > 0
			? casedata.advertDetails
					.map((detail) => ({
						advertInPosition: detail.isAdvertInPosition,
						highwayLand: detail.isSiteOnHighwayLand
					}))
					.filter(Boolean)
			: null;

	const contactAddress = isEnforcementNotice ? mapContactAddressIn(casedata) : null;

	const procedurePreferenceFields =
		isFullAdverts || isEnforcementNotice || isLDC
			? {
					appellantProcedurePreference: casedata.appellantProcedurePreference,
					appellantProcedurePreferenceDetails: casedata.appellantProcedurePreferenceDetails,
					appellantProcedurePreferenceDuration: casedata.appellantProcedurePreferenceDuration,
					appellantProcedurePreferenceWitnessCount:
						casedata.appellantProcedurePreferenceWitnessCount
				}
			: null;

	const data = {
		applicationDate: casedata.applicationDate,
		applicationDecision: casedata.applicationDecision,
		applicationDecisionDate: casedata.applicationDecisionDate,
		caseSubmittedDate: casedata.caseSubmittedDate,
		caseSubmissionDueDate: casedata.caseSubmissionDueDate,
		siteAccessDetails,
		siteSafetyDetails,
		siteAreaSquareMetres: casedata.siteAreaSquareMetres,
		floorSpaceSquareMetres: casedata.floorSpaceSquareMetres,
		siteGridReferenceEasting: casedata.siteGridReferenceEasting,
		siteGridReferenceNorthing: casedata.siteGridReferenceNorthing,
		ownsAllLand: casedata.ownsAllLand,
		ownsSomeLand: casedata.ownsSomeLand,
		hasAdvertisedAppeal: casedata.advertisedAppeal,
		appellantCostsAppliedFor: casedata.appellantCostsAppliedFor,
		originalDevelopmentDescription: casedata.originalDevelopmentDescription,
		changedDevelopmentDescription: casedata.changedDevelopmentDescription,
		ownersInformed: casedata.ownersInformed,
		...(knowsAllOwners && { knowsAllOwners }),
		...(knowsOtherOwners && { knowsOtherOwners }),
		isGreenBelt: casedata.isGreenBelt,
		typeOfPlanningApplication: casedata.typeOfPlanningApplication,
		...(isS20 && { ...sharedFields }),
		...(isS78 && {
			...sharedFields,
			agriculturalHolding: casedata.agriculturalHolding,
			tenantAgriculturalHolding: casedata.tenantAgriculturalHolding,
			otherTenantsAgriculturalHolding: casedata.otherTenantsAgriculturalHolding,
			informedTenantsAgriculturalHolding: casedata.informedTenantsAgriculturalHolding
		}),
		numberOfResidencesNetChange: casedata.numberOfResidencesNetChange,
		...(isAdverts && {
			appellantCaseAdvertDetails: {
				createMany: {
					data: advertDetails || []
				}
			},
			landownerPermission: casedata.hasLandownersPermission
		}),
		...(isFullAdverts && procedurePreferenceFields),
		...(isEnforcementNotice && {
			...procedurePreferenceFields,
			enforcementNotice: casedata.enforcementNotice,
			enforcementNoticeListedBuilding: casedata.enforcementNoticeListedBuilding,
			enforcementIssueDate: casedata.enforcementIssueDate,
			enforcementEffectiveDate: casedata.enforcementEffectiveDate,
			contactPlanningInspectorateDate: casedata.contactPlanningInspectorateDate,
			enforcementReference: casedata.enforcementReference,
			interestInLand: casedata.interestInLand,
			writtenOrVerbalPermission: casedata.writtenOrVerbalPermission,
			descriptionOfAllegedBreach: casedata.descriptionOfAllegedBreach,
			applicationMadeAndFeePaid: casedata.applicationMadeAndFeePaid,
			applicationDevelopmentAllOrPart: casedata.applicationDevelopmentAllOrPart,
			contactAddress: { create: contactAddress },
			appealDecisionDate: casedata.appealDecisionDate,
			appellantProcedurePreference: command.casedata.appellantProcedurePreference,
			appellantProcedurePreferenceDetails: command.casedata.appellantProcedurePreferenceDetails,
			appellantProcedurePreferenceDuration: command.casedata.appellantProcedurePreferenceDuration,
			appellantProcedurePreferenceWitnessCount:
				command.casedata.appellantProcedurePreferenceWitnessCount,
			planningObligation: command.casedata.planningObligation,
			statusPlanningObligation: command.casedata.statusPlanningObligation,
			siteGridReferenceEasting: command.casedata.siteGridReferenceEasting,
			siteGridReferenceNorthing: command.casedata.siteGridReferenceNorthing
		}),
		...(isLDC && {
			...procedurePreferenceFields,
			siteUseAtTimeOfApplication: command.casedata.siteUseAtTimeOfApplication,
			applicationMadeUnderActSection: command.casedata.applicationMadeUnderActSection
		})
	};

	// @ts-ignore
	return data;
};
