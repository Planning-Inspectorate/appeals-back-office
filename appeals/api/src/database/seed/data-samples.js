/**
 * Sample data used for development and testing
 */

import { sub } from 'date-fns';
import {
	APPEAL_EIA_ENVIRONMENTAL_IMPACT_SCHEDULE,
	APPEAL_EIA_DEVELOPMENT_DESCRIPTION,
	APPEAL_LPA_PROCEDURE_PREFERENCE,
	APPEAL_APPELLANT_PROCEDURE_PREFERENCE,
	APPEAL_DEVELOPMENT_TYPE,
	APPEAL_CASE_TYPE,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from 'pins-data-model';
import { randomBool, randomEnumValue, randomArrayValue } from './data-utilities.js';

/**
 * @typedef {import('@pins/appeals.api').Schema.LPAQuestionnaire} LPAQuestionnaire
 * @typedef {import('@pins/appeals.api').Schema.AppellantCase} AppellantCase
 * @typedef {import('@pins/appeals.api').Appeals.AppealSite} AppealSite
 */

const procedureDurationPossibleValues = [1, 2, 5, 10, 99, null];

export const personList = [
	{
		firstName: 'Lee',
		lastName: 'Thornton',
		company: 'Lee Thornton Ltd',
		email: 'test1@example.com',
		telephone: '01234567891'
	},
	{
		firstName: 'Haley',
		lastName: 'Eland',
		company: null,
		email: 'test2@example.com',
		telephone: '01234567891'
	},
	{
		firstName: 'Roger',
		lastName: 'Simmons',
		company: 'Roger Simmons Ltd',
		email: 'test3@example.com',
		telephone: '01234567891'
	},
	{
		firstName: 'Sophie',
		lastName: 'Skinner',
		company: null,
		email: 'test4@example.com',
		telephone: '01234567891'
	},
	{
		firstName: 'Ryan',
		lastName: 'Marshall',
		company: 'Ryan Marshall Ltd',
		email: 'test5@example.com',
		telephone: '01234567891'
	},
	{
		firstName: 'Fiona',
		lastName: 'Burgess',
		company: null,
		email: 'test6@example.com',
		telephone: '01234567891'
	},
	{
		firstName: 'Kevin',
		lastName: 'Fowler',
		company: 'Kevin Fowler Ltd',
		email: 'test7@example.com',
		telephone: '01234567891'
	},
	{
		firstName: 'Bob',
		lastName: 'Ross',
		company: null,
		email: 'test8@example.com',
		telephone: '01234567891'
	},
	{
		firstName: 'Eva',
		lastName: 'Sharma',
		company: 'Eva Sharma Ltd',
		email: 'test9@example.com',
		telephone: '01234567891'
	},
	{
		firstName: 'Elaine',
		lastName: 'Madsen',
		company: null,
		email: 'test10@example.com',
		telephone: '01234567891'
	}
];

/**
 * An array of appellants, each containing a name and email address.
 */
export const appellantsList = personList.map(({ firstName, lastName, company, email }) => ({
	firstName,
	lastName,
	organisationName: company,
	email
}));

/**
 * An array of appellants, each containing a name and email address.
 */
export const agentsList = personList.map(({ firstName, lastName, company, email }) => ({
	firstName,
	lastName,
	organisationName: company,
	email
}));

/** @type {AppealSite[]} */
export const addressesList = [
	{
		addressLine1: '96 The Avenue',
		addressLine2: 'Maidstone',
		county: 'Kent',
		postCode: 'MD21 5XY'
	},
	{
		addressLine1: '55 Butcher Street',
		town: 'Thurnscoe',
		postCode: 'S63 0RB'
	},
	{
		addressLine1: '8 The Chase',
		town: 'Findon',
		postCode: 'BN14 0TT'
	},
	{
		addressLine1: '96 The Avenue',
		addressLine2: 'Maidstone',
		county: 'Kent',
		postCode: 'MD21 5XY'
	},
	{
		addressLine1: '44 Rivervale',
		town: 'Bridport',
		postCode: 'DT6 5RN'
	},
	{
		addressLine1: '92 Huntsmoor Road',
		town: 'Tadley',
		postCode: 'RG26 4BX'
	},
	{
		addressLine1: '1 Grove Cottage',
		addressLine2: 'Shotesham Road',
		town: 'Woodton',
		postCode: 'NR35 2ND'
	},
	{
		addressLine1: '19 Beauchamp Road',
		town: 'Bristol',
		postCode: 'BS7 8LQ'
	},
	{
		addressLine1: '92 Huntsmoor Road',
		county: 'Tadley',
		postCode: 'RG26 4BX'
	},
	{
		addressLine1: '72 Clapham High St',
		county: 'Wandsworth',
		postCode: 'SW4 7UL'
	},
	{
		addressLine1: '21 The Pavement',
		county: 'Wandsworth',
		postCode: 'SW4 0HY'
	},
	{
		addressLine1: 'Copthalls',
		addressLine2: 'Clevedon Road',
		town: 'West Hill',
		postCode: 'BS48 1PN'
	}
];

export const addressListForTrainers = addressesList.map((address) => ({
	...address,
	addressLine1: 'FOR TRAINERS ONLY',
	addressLine2: address.addressLine1
}));

/**
 * An array of objects representing LPA questionnaire lists.
 * @param {string} appealTypeShorthand
 * @returns {import('#db-client').Prisma.LPAQuestionnaireCreateWithoutAppealInput | undefined}
 */
/* eslint-disable no-fallthrough */
export function createLPAQuestionnaireForAppealType(appealTypeShorthand) {
	switch (appealTypeShorthand) {
		case APPEAL_CASE_TYPE.D:
			return {
				siteSafetyDetails: 'There may be no mobile reception at the site',
				siteAccessDetails:
					'There is a tall hedge around the site which obstructs the view of the site',
				inConservationArea: true,
				isCorrectAppealType: true,
				lpaStatement: null,
				newConditionDetails: null,
				lpaCostsAppliedFor: false,
				lpaqCreatedDate: new Date(2023, 4, 9),
				lpaQuestionnaireSubmittedDate: new Date(2023, 4, 9),
				isGreenBelt: randomBool()
			};
		case APPEAL_CASE_TYPE.W:
			return {
				siteSafetyDetails: 'There may be no mobile reception at the site',
				siteAccessDetails:
					'There is a tall hedge around the site which obstructs the view of the site',
				inConservationArea: true,
				isCorrectAppealType: true,
				lpaStatement: null,
				newConditionDetails: null,
				lpaCostsAppliedFor: false,
				lpaqCreatedDate: new Date(2023, 4, 9),
				lpaQuestionnaireSubmittedDate: new Date(2023, 4, 9),
				isGreenBelt: randomBool(),
				isAonbNationalLandscape: randomBool(),
				affectsScheduledMonument: randomBool(),
				hasProtectedSpecies: randomBool(),
				isGypsyOrTravellerSite: randomBool(),
				eiaColumnTwoThreshold: randomBool(),
				eiaRequiresEnvironmentalStatement: randomBool(),
				hasInfrastructureLevy: randomBool(),
				isInfrastructureLevyFormallyAdopted: randomBool(),
				infrastructureLevyAdoptedDate: randomBool() ? new Date(2023, 4, 9) : null,
				infrastructureLevyExpectedDate: randomBool() ? new Date(2023, 4, 9) : null,
				eiaEnvironmentalImpactSchedule: randomEnumValue(APPEAL_EIA_ENVIRONMENTAL_IMPACT_SCHEDULE),
				eiaDevelopmentDescription: randomEnumValue(APPEAL_EIA_DEVELOPMENT_DESCRIPTION, false),
				lpaProcedurePreference: randomEnumValue(APPEAL_LPA_PROCEDURE_PREFERENCE),
				lpaProcedurePreferenceDetails: randomArrayValue(['Need for a detailed examination', null]),
				lpaProcedurePreferenceDuration: randomArrayValue(procedureDurationPossibleValues),
				eiaSensitiveAreaDetails: randomArrayValue(['test sensitive area details text', null]),
				consultedBodiesDetails: randomArrayValue(['test consulted bodies details text', null]),
				reasonForNeighbourVisits: randomArrayValue(['test reason for neighbour visits text', null]),
				designatedSiteNameCustom: 'A custom value'
			};
		case APPEAL_CASE_TYPE.Y:
			return {
				siteSafetyDetails: 'There may be no mobile reception at the site',
				siteAccessDetails:
					'There is a tall hedge around the site which obstructs the view of the site',
				inConservationArea: true,
				isCorrectAppealType: true,
				lpaStatement: null,
				newConditionDetails: null,
				lpaCostsAppliedFor: false,
				lpaqCreatedDate: new Date(2023, 4, 9),
				lpaQuestionnaireSubmittedDate: new Date(2023, 4, 9),
				isGreenBelt: randomBool(),
				eiaColumnTwoThreshold: randomBool(),
				eiaRequiresEnvironmentalStatement: randomBool(),
				hasInfrastructureLevy: randomBool(),
				preserveGrantLoan: randomBool(),
				historicEnglandConsultation: randomBool(),
				isAonbNationalLandscape: randomBool(),
				affectsScheduledMonument: randomBool(),
				hasProtectedSpecies: randomBool(),
				isGypsyOrTravellerSite: randomBool(),
				isInfrastructureLevyFormallyAdopted: randomBool(),
				infrastructureLevyAdoptedDate: randomBool() ? new Date(2023, 4, 9) : null,
				infrastructureLevyExpectedDate: randomBool() ? new Date(2023, 4, 9) : null,
				eiaEnvironmentalImpactSchedule: randomEnumValue(APPEAL_EIA_ENVIRONMENTAL_IMPACT_SCHEDULE),
				eiaDevelopmentDescription: randomEnumValue(APPEAL_EIA_DEVELOPMENT_DESCRIPTION, false),
				lpaProcedurePreference: randomEnumValue(APPEAL_LPA_PROCEDURE_PREFERENCE),
				lpaProcedurePreferenceDetails: randomArrayValue(['Need for a detailed examination', null]),
				lpaProcedurePreferenceDuration: randomArrayValue(procedureDurationPossibleValues),
				eiaSensitiveAreaDetails: randomArrayValue(['test sensitive area details text', null]),
				consultedBodiesDetails: randomArrayValue(['test consulted bodies details text', null]),
				reasonForNeighbourVisits: randomArrayValue(['test reason for neighbour visits text', null]),
				designatedSiteNameCustom: 'A custom value'
			};
		default:
			return;
	}
}
/* eslint-disable no-fallthrough */

/**
 * Sample incomplete review questionnaire data.
 *
 * @typedef {object} IncompleteReviewQuestionnaire
 * @property {Date} createdAt - The date when the questionnaire was created.
 * @property {boolean} complete - Indicates whether the questionnaire is complete or not.
 * @property {boolean} applicationPlanningOfficersReportMissingOrIncorrect - Indicates if the planning officer's report is missing or incorrect.
 * @property {boolean} applicationPlansToReachDecisionMissingOrIncorrect - Indicates if the plans to reach decision are missing or incorrect.
 * @property {string} applicationPlansToReachDecisionMissingOrIncorrectDescription - The description of the missing or incorrect plans to reach decision.
 * @property {boolean} policiesStatutoryDevelopmentPlanPoliciesMissingOrIncorrect - Indicates if the statutory development plan policies are missing or incorrect.
 * @property {boolean} policiesOtherRelevantPoliciesMissingOrIncorrect - Indicates if other relevant policies are missing or incorrect.
 * @property {boolean} policiesSupplementaryPlanningDocumentsMissingOrIncorrect - Indicates if the supplementary planning documents are missing or incorrect.
 * @property {boolean} siteConservationAreaMapAndGuidanceMissingOrIncorrect - Indicates if the conservation area map and guidance are missing or incorrect.
 * @property {boolean} siteListedBuildingDescriptionMissingOrIncorrect - Indicates if the listed building description is missing or incorrect.
 * @property {boolean} thirdPartyApplicationNotificationMissingOrIncorrect - Indicates if the third party application notification is missing or incorrect.
 * @property {boolean} thirdPartyApplicationPublicityMissingOrIncorrect - Indicates if the third party application publicity is missing or incorrect.
 * @property {boolean} thirdPartyRepresentationsMissingOrIncorrect - Indicates if the third party representations are missing or incorrect.
 * @property {boolean} thirdPartyAppealNotificationMissingOrIncorrect - Indicates if the third party appeal notification is missing or incorrect.
 */
export const incompleteReviewQuestionnaireSample = {
	createdAt: new Date(2022, 3, 20),
	complete: false,
	applicationPlanningOfficersReportMissingOrIncorrect: false,
	applicationPlansToReachDecisionMissingOrIncorrect: true,
	applicationPlansToReachDecisionMissingOrIncorrectDescription: 'Missing Documents XYZ',
	policiesStatutoryDevelopmentPlanPoliciesMissingOrIncorrect: false,
	policiesOtherRelevantPoliciesMissingOrIncorrect: false,
	policiesSupplementaryPlanningDocumentsMissingOrIncorrect: false,
	siteConservationAreaMapAndGuidanceMissingOrIncorrect: false,
	siteListedBuildingDescriptionMissingOrIncorrect: false,
	thirdPartyApplicationNotificationMissingOrIncorrect: false,
	thirdPartyApplicationPublicityMissingOrIncorrect: false,
	thirdPartyRepresentationsMissingOrIncorrect: false,
	thirdPartyAppealNotificationMissingOrIncorrect: false
};

/**
 * An array of objects representing appeal case details provided by the appellant.
 * @type {Object<string, import('#db-client').Prisma.AppellantCaseCreateWithoutAppealInput>}
 */
export const appellantCaseList = {
	[APPEAL_CASE_TYPE.D]: {
		siteAreaSquareMetres: 30.9,
		floorSpaceSquareMetres: 9.7,
		ownsAllLand: true,
		ownsSomeLand: false,
		hasAdvertisedAppeal: false,
		originalDevelopmentDescription: 'lorem ipsum',
		changedDevelopmentDescription: false,
		isGreenBelt: randomBool(),
		applicationDecisionDate: sub(new Date(), { months: 1 }),
		applicationDate: sub(new Date(), { weeks: 6 }),
		typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.HOUSEHOLDER_PLANNING
	},
	[APPEAL_CASE_TYPE.W]: {
		siteAreaSquareMetres: 30.9,
		floorSpaceSquareMetres: 9.7,
		ownsAllLand: true,
		ownsSomeLand: false,
		hasAdvertisedAppeal: false,
		originalDevelopmentDescription: 'lorem ipsum',
		changedDevelopmentDescription: false,
		isGreenBelt: randomBool(),
		planningObligation: true,
		statusPlanningObligation: null,
		agriculturalHolding: randomBool(),
		tenantAgriculturalHolding: false,
		otherTenantsAgriculturalHolding: false,
		informedTenantsAgriculturalHolding: false,
		appellantProcedurePreference: randomEnumValue(APPEAL_APPELLANT_PROCEDURE_PREFERENCE),
		appellantProcedurePreferenceDetails: randomArrayValue([
			'Need for a detailed examination',
			null
		]),
		appellantProcedurePreferenceDuration: randomArrayValue(procedureDurationPossibleValues),
		appellantProcedurePreferenceWitnessCount: 1,
		applicationDecisionDate: sub(new Date(), { months: 1 }),
		applicationDate: sub(new Date(), { weeks: 6 }),
		developmentType: randomEnumValue(APPEAL_DEVELOPMENT_TYPE),
		typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
	},
	[APPEAL_CASE_TYPE.Y]: {
		siteAreaSquareMetres: 30.9,
		floorSpaceSquareMetres: 9.7,
		ownsAllLand: true,
		ownsSomeLand: false,
		hasAdvertisedAppeal: false,
		originalDevelopmentDescription: 'lorem ipsum',
		changedDevelopmentDescription: false,
		isGreenBelt: randomBool(),
		planningObligation: true,
		statusPlanningObligation: null,
		agriculturalHolding: randomBool(),
		tenantAgriculturalHolding: false,
		otherTenantsAgriculturalHolding: false,
		informedTenantsAgriculturalHolding: false,
		appellantProcedurePreference: randomEnumValue(APPEAL_APPELLANT_PROCEDURE_PREFERENCE),
		appellantProcedurePreferenceDetails: randomArrayValue([
			'Need for a detailed examination',
			null
		]),
		appellantProcedurePreferenceDuration: randomArrayValue(procedureDurationPossibleValues),
		appellantProcedurePreferenceWitnessCount: 1,
		applicationDecisionDate: sub(new Date(), { months: 1 }),
		applicationDate: sub(new Date(), { weeks: 6 }),
		developmentType: randomEnumValue(APPEAL_DEVELOPMENT_TYPE),
		typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.LISTED_BUILDING
	},
	[APPEAL_CASE_TYPE.Z]: {
		siteAreaSquareMetres: 30.9,
		floorSpaceSquareMetres: 9.7,
		ownsAllLand: true,
		ownsSomeLand: false,
		hasAdvertisedAppeal: false,
		originalDevelopmentDescription: 'lorem ipsum',
		changedDevelopmentDescription: false,
		isGreenBelt: randomBool(),
		planningObligation: true,
		statusPlanningObligation: null,
		agriculturalHolding: randomBool(),
		tenantAgriculturalHolding: false,
		otherTenantsAgriculturalHolding: false,
		informedTenantsAgriculturalHolding: false,
		appellantProcedurePreference: randomEnumValue(APPEAL_APPELLANT_PROCEDURE_PREFERENCE),
		appellantProcedurePreferenceDetails: randomArrayValue([
			'Need for a detailed examination',
			null
		]),
		appellantProcedurePreferenceDuration: randomArrayValue(procedureDurationPossibleValues),
		appellantProcedurePreferenceWitnessCount: 1,
		applicationDecisionDate: sub(new Date(), { months: 1 }),
		applicationDate: sub(new Date(), { weeks: 6 }),
		developmentType: randomEnumValue(APPEAL_DEVELOPMENT_TYPE),
		typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.MINOR_COMMERCIAL_DEVELOPMENT
	}
};

/**
 * @param {string} appealTypeShorthand
 * @returns {import('#db-client').Prisma.AppellantCaseCreateWithoutAppealInput}
 */
export const getRandomisedAppellantCaseCreateInput = (appealTypeShorthand) => {
	const appellantCaseCreateInput = {
		...appellantCaseList[appealTypeShorthand]
	};

	switch (appealTypeShorthand) {
		case APPEAL_CASE_TYPE.W:
			appellantCaseCreateInput.agriculturalHolding = randomBool();
			appellantCaseCreateInput.tenantAgriculturalHolding =
				appellantCaseCreateInput.agriculturalHolding && randomBool();
			appellantCaseCreateInput.otherTenantsAgriculturalHolding =
				appellantCaseCreateInput.agriculturalHolding && randomBool();
			appellantCaseCreateInput.informedTenantsAgriculturalHolding = true;
		default:
			break;
	}

	return appellantCaseCreateInput;
};

/**
 * An object representing a sample of an incomplete validation decision.
 *
 * @typedef {object} IncompleteValidationDecisionSample
 * @property {string} decision - The decision status, which should be "incomplete".
 * @property {boolean} namesDoNotMatch - Indicates if the names do not match.
 * @property {boolean} sensitiveInfo - Indicates if there is sensitive information missing.
 * @property {boolean} missingApplicationForm - Indicates if the application form is missing.
 * @property {boolean} missingDecisionNotice - Indicates if the decision notice is missing.
 * @property {boolean} missingGroundsForAppeal - Indicates if the grounds for appeal are missing.
 * @property {boolean} missingSupportingDocuments - Indicates if the supporting documents are missing.
 * @property {boolean} inflammatoryComments - Indicates if there are any inflammatory comments.
 * @property {boolean} openedInError - Indicates if the decision was opened in error.
 * @property {boolean} wrongAppealTypeUsed - Indicates if the wrong appeal type was used.
 * @property {string} otherReasons - Any other reasons for the incomplete decision.
 */
export const incompleteValidationDecisionSample = {
	decision: 'incomplete',
	namesDoNotMatch: true,
	sensitiveInfo: true,
	missingApplicationForm: true,
	missingDecisionNotice: true,
	missingGroundsForAppeal: true,
	missingSupportingDocuments: true,
	inflammatoryComments: true,
	openedInError: true,
	wrongAppealTypeUsed: true,
	otherReasons: 'Some reason'
};

/**
 * An object representing a sample of an invalid validation decision.
 *
 * @typedef {object} InvalidValidationDecisionSample
 * @property {string} decision - The decision status, which should be "invalid".
 * @property {boolean} outOfTime - Indicates if the appeal is out of time.
 * @property {boolean} noRightOfAppeal - Indicates if there is no right of appeal.
 * @property {boolean} notAppealable - Indicates if the decision is not appealable.
 * @property {boolean} lPADeemedInvalid - Indicates if the Local Planning Authority deemed the appeal invalid.
 * @property {string} otherReasons - Any other reasons for the invalid decision.
 */
export const invalidValidationDecisionSample = {
	decision: 'invalid',
	outOfTime: true,
	noRightOfAppeal: true,
	notAppealable: true,
	lPADeemedInvalid: true,
	otherReasons: 'Some reason'
};

/**
 * An object representing a sample of a complete validation decision.
 *
 * @typedef {object} CompleteValidationDecisionSample
 * @property {string} decision - The decision status, which should be "complete".
 * @property {string} descriptionOfDevelopment - The description of the development.
 */
export const completeValidationDecisionSample = {
	decision: 'complete',
	descriptionOfDevelopment: 'Some Description'
};

export const representations = [
	{
		status: 'VALID',
		originalRepresentation:
			'Yes, we have a good representation here.. We Will Send more data - See attached files.',
		redactedRepresentation:
			'Yes, we have a good representation here.. We Will Send more data - See attached files.',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'FAMILY_GROUP',
					organisationName: 'Árni G',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		},
		representationActions: {
			create: [
				{
					type: 'STATUS',
					status: 'VALID',
					previousStatus: 'AWAITING_REVIEW',
					redactStatus: true,
					previousRedactStatus: false,
					invalidReason: '',
					referredTo: '',
					actionBy: '',
					actionDate: new Date(2022, 3, 1),
					notes: ''
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			"This will increase the level of noise Not to mention pollution And also drainage issues And less I forget,  <span class='redacted'></span>  heritage",
		redactedRepresentation:
			"This will increase the level of noise Not to mention pollution And also drainage issues And less I forget,  <span class='redacted'></span>  heritage",
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'Tom',
					lastName: 'Tom',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			"There are already 3 incinerators within one mile. Big increase in NO2 emissions which is a big cause of Ozone depletion and has a number of recognised ill effects on human health, The rubbish will need to travel hundreds of miles, increase HGV emissions Wheelabrator are in breach of their planning consent SW/10/444 Over one million tons of rubbish per year will have to use the already congested A249 alone and gridock at the B2002 junction 47692 HGV movements a week This will discourage recycling Many Wheelabrator incinerators in the United States have been closed down on environmental grounds. K3 and WKN are very near houses The water discharge will not be to the Swale but to Milton Creek The planning inspectorate use email as it is more environmentaly friendly ------------------------------------------------- I have studied the consultation report, section 4.1 The obvious first comment is why didn't Wheelabrator apply for a 75Mw incinerator in the first place. My conclusion is that as they and DS Smith have done in the past is to mislead gullible councillors, apply for a smaller incinerator and once planning consent has been agreed suddenly find they want to increase the input of rubbish to be incinerated by over 100,000 tons . They simply cannot be trusted. If at the planning stage of K3 they didn't realise the facility could take in an extra 100000 tons of waste a year they are not a fit and proper organisation to be operating incinerators. Where is all the rubbishing going to come from ? It wont be from Kent and it wont be from other South East areas Surrey County Council is currently producing a new Waste Local Plan and the Draft Submission Plan will be published in mid-January 2019 for a Regulation 19 consultation. Surrey County Council note that they and other authorities in the south east are planning on the basis of net self-sufficiency and not on the basis that Surrey’s requirements will be met by facilities in Kent 6.2.1 Several of the their American incinerators have been closed down on environmental grounds. Their plans for another incinerator to join the 4 already at Ridham and on the DS Smith site simply do not add up. There is no need for it as there are already more incinerator in the UK than are needed. Incineration discourages recycling. 5.2.4 why was the plan for WKN only identified much later then the application for K3 ?It is obvious the plan was to mislead, I cannot believe planning permission for a one million ton incinerator would have been given for reasons which I shall expand on later Wheelabrator wilfully mislead local people in the leaflet dated March 2017. Page 10 paragraph 6.1 states “there will be no change to the types and quantum of fuel throughput. 6.3.1 I dispute the Kemsley Mill is a “ substantial industrial complex” 6.3. This contradicts 5.1 of the March 2017 booklet to residents available at the various exhibitions that have been held. Never art any time have DS Smith and Wheelabrator mentioned burning an extra 105000 tons of rubbish a year, it was always an internal reconfiguration. I feel Wheelabrator and DS Smith have deliberately lied over their true intentions from day b1 8 My view is that Wheelabrator and DS Smith have deliberately set out to confuse those affected by their plans. Mentioning various sections of the planning acts will be lost on most people who do not have the time and patience to investigate further. 8.1.12 I fundamentally disagree. K3 and WKN are completely separate issues and should be treated as such 9 I can see no reason to object to an internal reconfiguration to improve the output of K3 which is what Wheelabrator and DS Smith said would happen with no increase in rubbish burnt. In my view deliberate misrepresentation. They knew from the start this would not be possible without an increase of rubbish to the facility. I dispute the interpretation of feedback. I specifically raised the issue of air pollution which doesn't get a mention 9.7.1 none of the issues have been resolved and I do not know of anyone who is in favour. Wishful thinking on the part of WTI and DS Smith 11.8 I wholeheartedly agreed with the objections of Minister on sea parish council, 100.000 extra diesel powered HGVs using the already polluting and congested A249 mostly during peak hours is environmentally unacceptable, especially given Swale Borough Council have declared a climate emergency. At present there is no intention to transport heavy material via the river for construction. A Rail and Water Transportation Strategy is provided for both K3(Document 4.8)and WKN(Document 4.9) as part of the application which deals with the longer term potential for transporting waste to K3 and/or WKN via rail or barge, but at present the necessary contracts do not exist which would allow that to be possible. The intention is for that position to be reviewed regularly in the future. site via alternative means, of waste contracts available . This is of course nonsense. None of the SouthEast waste authorities will use these facilities, there is no infrastructure on the rail network or handle waste by rail and the idea of sending if by sea is laughable. All the rubbish will have to come by road from hundreds of miles away Waste should be dealt with where it is produced. Sittingbourne cannot become the waste repository of England 15.1.2 I was invited to visit the KJ3 site and it is impressive. The issues which have not been addressed though is the pollution and traffic chaos which 100,000 plus HGVs will cause and air pollution. I do accept technology on incineration has improved but nevertheless incineration is not the answer. 15.3 very disappointing how few feedback forms were received. 15.5.2 I would hardly call the K3 and WKN facilities small, they're truly massive. Another example of trying to mislead people is truly unbelievable, Just ask anyone who uses the A249. 15.8.1 Unless there is a massive canal building programme, waste will not arrive by barge. 15.8.2 The Rail and Water Transportation Strategies make provision for that situation to be reviewed every five years. Given the expected life of K3 and WKN reviews should take place at least yearly, but it just wont happen, As I have pointed out before the infrastructure just isn't available 15.9.2 Many WTI sites in the United States have been closed down on environmental grounds At best this is highly optimistic. 15.11.2 There will be serious visual impact both to the Milton Creek country park and the Saxon Shore Way LDP 15.14.2 The community fund may be well meant, Id call it a bribe….. 15.19.2 I suggest the extremely low response is due to the fact that working people do not have time to either visit or respond fully. The simple question should be “Do you want another 2 massive incinerators in Sittingbourne, Yes or No ? “ 17.6 No one can disagree with the concerns of Bobbing Parish Council. It exactly sums up why the increase in waste burnt at K3 and the development of WKN should not be allowed I would like to summarise our objections as follows Although incinerator technology has advanced there are still far to many questions concerning air pollution and the effect on local peoples health WTI cannot call incineration clean or renewable energy because it isn't. It is still burning fossil fuels by another name There are already more than enough incinerators in the UK Incineration actively discourages recycling, for example once plastic ( obtained by fossil fuel ) has been incinerated it cannot be recycled. And extra 200,000 HGV movements along the A249 each year is environmental vandalism and completely unaccepted able. There is no infrastructure on the rail network and the idea of bring in wast by barge is in fantasy land. SouthEast waste authorities will not use the facilities, the waste will have to travel a considerable distance by HGV Pre treatment relies on people putting waste into the correct bin no one knows what will be going up the stacks and being sprayed onto the local area There are far more environmentally friendly ways of deal with waste, The most obvious solution is to produce less of it and what cannot be recycled should be dealt with where it is produced and not transported hundreds of miles in diesel powered HGVs Furans and Dioxins are highly damaging to health and are carcinogenic. I accept WTI will do their best to avoid this escaping but accidents do happen, as as already been pointed out many WTI plants have been closed on environmental grounds A part from the major gases mentioned, a huge variety of other gases are emitted during the incineration of trash. On this large list, the most present volatiles are: sulphur dioxide, hydrochloric acid, fine particles and heavy metals Waste incineration systems produce a wide variety of pollutants which are detrimental to human health. Such systems are expensive and do not eliminate or adequately control the toxic emissions from chemically complex MSW. Even new incinerators release toxic metals, dioxins, and acid gases. Far from eliminating the need for a landfill, waste incinerator systems produce toxic ash and other residues. The waste-to-energy program to maximize energy recovery is technologically incompatible with reducing dioxins emissions. Dioxins are the most lethal Persistent Organic Pollutants (POPs) which have irreparable environmental health consequences. The affected populace includes those living near the incinerator as well as those living in the broader region. People are exposed to toxics compounds in several ways: By breathing the air which affects both workers in the plant and people who live nearby; By eating locally produced foods or water that have been contaminated by air pollutants from the incinerator; and Dioxin is a highly toxic compound which may cause cancer and neurological damage, and disrupt reproductive systems, thyroid systems, respiratory systems etc. Toxics are created at various stages of such thermal technologies, and not only at the end of the stack. These can be created during the process, in the stack pipes, as residues in ash, scrubber water and filters, and in fact even in air plumes which leave the stack. There are no safe ways of avoiding their production or destroying them, and at best they can be trapped at extreme cost in sophisticated filters or in the ash. The ultimate release is unavoidable, and if trapped in ash or filters, these become hazardous wastes themselves. The pollutants which are created, even if trapped, reside in filters and ash, which need special landfills for disposal. In case energy recovery is attempted, it requires heat exchangers which operate at temperatures which maximize dioxin production. If the gases are quenched, it goes against energy recovery. Such projects disperse incinerator ash throughout the environment which subsequently enter our food chain. No one can give a categoric assurance that incinerators are safe in that they do not pollute the air and the local area, until this guarantee can be given incineration is not the answer. There are already 4 incinerators with one mile at Ridham. That is more than enough and I hope the plans for an increase in rubbish burnt at K3 and the proposed WKN are rejected",
		redactedRepresentation:
			"There are already 3 incinerators within one mile. Big increase in NO2 emissions which is a big cause of Ozone depletion and has a number of recognised ill effects on human health, The rubbish will need to travel hundreds of miles, increase HGV emissions Wheelabrator are in breach of their planning consent SW/10/444 Over one million tons of rubbish per year will have to use the already congested A249 alone and gridock at the B2002 junction 47692 HGV movements a week This will discourage recycling Many Wheelabrator incinerators in the United States have been closed down on environmental grounds. K3 and WKN are very near houses The water discharge will not be to the Swale but to Milton Creek The planning inspectorate use email as it is more environmentaly friendly ------------------------------------------------- I have studied the consultation report, section 4.1 The obvious first comment is why didn't Wheelabrator apply for a 75Mw incinerator in the first place. My conclusion is that as they and DS Smith have done in the past is to mislead gullible councillors, apply for a smaller incinerator and once planning consent has been agreed suddenly find they want to increase the input of rubbish to be incinerated by over 100,000 tons . They simply cannot be trusted. If at the planning stage of K3 they didn't realise the facility could take in an extra 100000 tons of waste a year they are not a fit and proper organisation to be operating incinerators. Where is all the rubbishing going to come from ? It wont be from Kent and it wont be from other South East areas Surrey County Council is currently producing a new Waste Local Plan and the Draft Submission Plan will be published in mid-January 2019 for a Regulation 19 consultation. Surrey County Council note that they and other authorities in the south east are planning on the basis of net self-sufficiency and not on the basis that Surrey’s requirements will be met by facilities in Kent 6.2.1 Several of the their American incinerators have been closed down on environmental grounds. Their plans for another incinerator to join the 4 already at Ridham and on the DS Smith site simply do not add up. There is no need for it as there are already more incinerator in the UK than are needed. Incineration discourages recycling. 5.2.4 why was the plan for WKN only identified much later then the application for K3 ?It is obvious the plan was to mislead, I cannot believe planning permission for a one million ton incinerator would have been given for reasons which I shall expand on later Wheelabrator wilfully mislead local people in the leaflet dated March 2017. Page 10 paragraph 6.1 states “there will be no change to the types and quantum of fuel throughput. 6.3.1 I dispute the Kemsley Mill is a “ substantial industrial complex” 6.3. This contradicts 5.1 of the March 2017 booklet to residents available at the various exhibitions that have been held. Never art any time have DS Smith and Wheelabrator mentioned burning an extra 105000 tons of rubbish a year, it was always an internal reconfiguration. I feel Wheelabrator and DS Smith have deliberately lied over their true intentions from day b1 8 My view is that Wheelabrator and DS Smith have deliberately set out to confuse those affected by their plans. Mentioning various sections of the planning acts will be lost on most people who do not have the time and patience to investigate further. 8.1.12 I fundamentally disagree. K3 and WKN are completely separate issues and should be treated as such 9 I can see no reason to object to an internal reconfiguration to improve the output of K3 which is what Wheelabrator and DS Smith said would happen with no increase in rubbish burnt. In my view deliberate misrepresentation. They knew from the start this would not be possible without an increase of rubbish to the facility. I dispute the interpretation of feedback. I specifically raised the issue of air pollution which doesn't get a mention 9.7.1 none of the issues have been resolved and I do not know of anyone who is in favour. Wishful thinking on the part of WTI and DS Smith 11.8 I wholeheartedly agreed with the objections of Minister on sea parish council, 100.000 extra diesel powered HGVs using the already polluting and congested A249 mostly during peak hours is environmentally unacceptable, especially given Swale Borough Council have declared a climate emergency. At present there is no intention to transport heavy material via the river for construction. A Rail and Water Transportation Strategy is provided for both K3(Document 4.8)and WKN(Document 4.9) as part of the application which deals with the longer term potential for transporting waste to K3 and/or WKN via rail or barge, but at present the necessary contracts do not exist which would allow that to be possible. The intention is for that position to be reviewed regularly in the future. site via alternative means, of waste contracts available . This is of course nonsense. None of the SouthEast waste authorities will use these facilities, there is no infrastructure on the rail network or handle waste by rail and the idea of sending if by sea is laughable. All the rubbish will have to come by road from hundreds of miles away Waste should be dealt with where it is produced. Sittingbourne cannot become the waste repository of England 15.1.2 I was invited to visit the KJ3 site and it is impressive. The issues which have not been addressed though is the pollution and traffic chaos which 100,000 plus HGVs will cause and air pollution. I do accept technology on incineration has improved but nevertheless incineration is not the answer. 15.3 very disappointing how few feedback forms were received. 15.5.2 I would hardly call the K3 and WKN facilities small, they're truly massive. Another example of trying to mislead people is truly unbelievable, Just ask anyone who uses the A249. 15.8.1 Unless there is a massive canal building programme, waste will not arrive by barge. 15.8.2 The Rail and Water Transportation Strategies make provision for that situation to be reviewed every five years. Given the expected life of K3 and WKN reviews should take place at least yearly, but it just wont happen, As I have pointed out before the infrastructure just isn't available 15.9.2 Many WTI sites in the United States have been closed down on environmental grounds At best this is highly optimistic. 15.11.2 There will be serious visual impact both to the Milton Creek country park and the Saxon Shore Way LDP 15.14.2 The community fund may be well meant, Id call it a bribe….. 15.19.2 I suggest the extremely low response is due to the fact that working people do not have time to either visit or respond fully. The simple question should be “Do you want another 2 massive incinerators in Sittingbourne, Yes or No ? “ 17.6 No one can disagree with the concerns of Bobbing Parish Council. It exactly sums up why the increase in waste burnt at K3 and the development of WKN should not be allowed I would like to summarise our objections as follows Although incinerator technology has advanced there are still far to many questions concerning air pollution and the effect on local peoples health WTI cannot call incineration clean or renewable energy because it isn't. It is still burning fossil fuels by another name There are already more than enough incinerators in the UK Incineration actively discourages recycling, for example once plastic ( obtained by fossil fuel ) has been incinerated it cannot be recycled. And extra 200,000 HGV movements along the A249 each year is environmental vandalism and completely unaccepted able. There is no infrastructure on the rail network and the idea of bring in wast by barge is in fantasy land. SouthEast waste authorities will not use the facilities, the waste will have to travel a considerable distance by HGV Pre treatment relies on people putting waste into the correct bin no one knows what will be going up the stacks and being sprayed onto the local area There are far more environmentally friendly ways of deal with waste, The most obvious solution is to produce less of it and what cannot be recycled should be dealt with where it is produced and not transported hundreds of miles in diesel powered HGVs Furans and Dioxins are highly damaging to health and are carcinogenic. I accept WTI will do their best to avoid this escaping but accidents do happen, as as already been pointed out many WTI plants have been closed on environmental grounds A part from the major gases mentioned, a huge variety of other gases are emitted during the incineration of trash. On this large list, the most present volatiles are: sulphur dioxide, hydrochloric acid, fine particles and heavy metals Waste incineration systems produce a wide variety of pollutants which are detrimental to human health. Such systems are expensive and do not eliminate or adequately control the toxic emissions from chemically complex MSW. Even new incinerators release toxic metals, dioxins, and acid gases. Far from eliminating the need for a landfill, waste incinerator systems produce toxic ash and other residues. The waste-to-energy program to maximize energy recovery is technologically incompatible with reducing dioxins emissions. Dioxins are the most lethal Persistent Organic Pollutants (POPs) which have irreparable environmental health consequences. The affected populace includes those living near the incinerator as well as those living in the broader region. People are exposed to toxics compounds in several ways: By breathing the air which affects both workers in the plant and people who live nearby; By eating locally produced foods or water that have been contaminated by air pollutants from the incinerator; and Dioxin is a highly toxic compound which may cause cancer and neurological damage, and disrupt reproductive systems, thyroid systems, respiratory systems etc. Toxics are created at various stages of such thermal technologies, and not only at the end of the stack. These can be created during the process, in the stack pipes, as residues in ash, scrubber water and filters, and in fact even in air plumes which leave the stack. There are no safe ways of avoiding their production or destroying them, and at best they can be trapped at extreme cost in sophisticated filters or in the ash. The ultimate release is unavoidable, and if trapped in ash or filters, these become hazardous wastes themselves. The pollutants which are created, even if trapped, reside in filters and ash, which need special landfills for disposal. In case energy recovery is attempted, it requires heat exchangers which operate at temperatures which maximize dioxin production. If the gases are quenched, it goes against energy recovery. Such projects disperse incinerator ash throughout the environment which subsequently enter our food chain. No one can give a categoric assurance that incinerators are safe in that they do not pollute the air and the local area, until this guarantee can be given incineration is not the answer. There are already 4 incinerators with one mile at Ridham. That is more than enough and I hope the plans for an increase in rubbish burnt at K3 and the proposed WKN are rejected",
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'Michael',
					lastName: 'Vick',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'I am completing this form for the organisation I work for, either on a paid or voluntary basis, to give its views.',
		redactedRepresentation:
			'I am completing this form for the organisation I work for, either on a paid or voluntary basis, to give its views.',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'ORGANISATION',
					organisationName: 'Test Organisation for John',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation: 'This is a Rel rep on behalf',
		redactedRepresentation: 'This is a Rel rep on behalf',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'FAMILY_GROUP',
					organisationName: 'Test Organisation for John Wick 2',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation: 'This is my Rel Rep completed by self',
		redactedRepresentation: 'This is my Rel Rep completed by self',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'Vijaya',
					lastName: 'Krishna',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation: 'This is my second rel rep as an organisation',
		redactedRepresentation: 'This is my second rel rep as an organisation',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'ORGANISATION',
					organisationName: 'Test Organisation',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'AWAITING_REVIEW',
		originalRepresentation:
			'The Infrastructure Planning Commission Temple Quay House (2 The Square) Temple Quay Bristol Avon BS1 6PN Our ref: KT/2019/126312/01-L01 Your ref: EN010083 Date: 19 November 2019 Dear Sir/Madam Proposed application by Wheelabrator Technologies Inc. for a Development Consent Order - The Wheelabrator Kemsley K3 generating station and Wheelabrator Kemsley North (WKN) waste to energy facility, Sittingbourne, Kent Having reviewed the application details for the above proposal we have the following relevant representation to make: The Role of the Environment Agency The Environment Agency has a responsibility for protecting and improving the environment, as well as contributing to sustainable development. We have three main roles: We are an environmental regulator – we take a risk-based approach and target our effort to maintain and improve environmental standards and to minimise unnecessary burdens on business. We issue a range of permits and consents. We are an environmental operator – we are a national organisation that operates locally. We work with people and communities across England to protect and improve the environment in and integrated way. We provide a vital incident response capability. We are an environmental advisor – we compile and assess the best available evidence and use this to report on the state of the environment. We use our own monitoring information and that of others to inform this activity. We provide technical information and advice to national and local governments to support their roles in policy and decision-making. One of our specific functions is as a Flood Risk Management Authority. We have a general supervisory duty relating to specific flood risk management matters in respect of flood risk arising from Main Rivers or the sea. Outstanding information and issues of concern Our relevant representation outlines where further work, clarification or mitigation is required to ensure that the proposal has no detrimental impact on the environment. Please do not hesitate to contact me if you require any further information. We look forward to continuing to work with the applicant to resolve the matters outlined above, and to ensure the best environmental outcome for this project. Yours faithfully Ms Jennifer Wilson Planning Specialist Direct dial 0208 474 6711 Direct e-mail kslplanning@environment-agency.gov.uk Relevant Representations On behalf of the Environment Agency Draft Development Consent Order • Interpretation, point 2. The applicant lists legislation in the draft Development Consent Order and refers to the “the 2016 Regulations” as the Environmental Permitting (England and Wales) Regulations 2016. These Regulations have been amended a number of times since then including by an amendment that has yet to commence. The current version of these Regulations is The Environmental Permitting (England and Wales) (Amendment) (No. 2) Regulations 2018 at http://www.legislation.gov.uk/uksi/2018/428/schedule/made SI 2019/428. • Contaminated land and groundwater - Requirement 19 The title “Contaminated Land and groundwater” should actually state “Land contamination and groundwater”. Flood Risk We have no objections to the Flood Risk Assessment (FRA) submitted as part of the DCO application. Flood mitigation in the form of land raising has been maintained as per the previous application. This is considered appropriate in this location for the type of development. We have updated the flood modelling for the North Kent Coast which is referred to within the FRA, and therefore this updated data is available to inform the application. However, the update will not affect the application site, and the flood levels used in the FRA remain the same in the updated modelling. Groundwater and Contaminated Land Baseline ground conditions have been addressed for this site previously under earlier permissions from Kent County Council and under the relevant IED permit for energy plant. Additional assessment of ground conditions will be undertaken before, during after operational activities under a new permit if/when issued. The site geological setting is on strata that is not of significant sensitivity for groundwater protection and provided surface management and materials handling are undertaken in accordance with permit requirements ground quality and associated controlled waters should not be at significant risk. Environmental Permitting K3 has a permit application submitted to increase the waste input from 550 000 Tpa to 657 000 Tpa. This is a substantial variation and as such the modelling assessments etc. will be undertaken during the permitting process. There are no planned changes to the process. The upgrade for the power to 75MWe has triggered the NSIP. WKN is a planned new waste to energy facility capable of processing 390 000 TPa with a generating capacity of 42MW. This is not an NSIP due to being &lt;50MWe but a development consent is required. Again we do not have any comments at this stage. This plant will require an environmental permit as the applicant have inferred within the application.',
		redactedRepresentation: null,
		redacted: false,
		received: new Date(),
		contacts: {
			create: [
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'ORGANISATION',
					organisationName: 'Environment Agency',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'ORGANISATION',
					organisationName: 'Vijaya Krishna Vasantha',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: 'Bart',
					lastName: 'Simms',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: 'Paul',
					lastName: 'test',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: 'Mrs',
					lastName: 'Test',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'ORGANISATION',
					organisationName: 'Association Fields Allotment Association',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'FAMILY_GROUP',
					organisationName: 'Local Highways ',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: 'Peter',
					lastName: 'Testerer',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'ORGANISATION',
					organisationName: 'Test2  Planning Alliance (Community Planning Alliance)',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: 'Mrs',
					lastName: 'F',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: 'Road',
					lastName: 'Test',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'AWAITING_REVIEW',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation: null,
		redacted: false,
		received: new Date(),
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: 'James',
					lastName: 'Test',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'ORGANISATION',
					organisationName: 'Test Association (Church Fields Allotment Association)',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'FAMILY_GROUP',
					organisationName: 'National Highways (National Highways)',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: 'Peter',
					lastName: 'Test',
					under18: true,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: true,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'ORGANISATION',
					organisationName: 'Test Planning Alliance (Community Planning Alliance)',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'AWAITING_REVIEW',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation: null,
		redacted: false,
		received: new Date(),
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: 'Mrs',
					lastName: 'Sue',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'I wish to object to this planning application by Scottish Power Renewables for the following reasons:- • The irreparable damage to the countryside, the coastline, the local environment and to wildlife habitats is totally unacceptable at a time when we are being warned repeatedly about the impact on us all of the industrialisation and loss of such natural landscapes. • The impact on the local community is out of proportion to the benefits and is not an acceptable price to pay. • The traffic and noise pollution generated will damage people’s health and this in an area that is promoted by government bodies for health and recreation. • Years of investment in the tourism industry by the taxpayer and private individuals is at risk of being wasted as people stop coming to the area. This will damage the health, wealth and well-being of local people. • The assertion that this application will deliver ‘green energy’ is false as the associated destruction of the countryside and people’s way of life is not a sustainable or justifiable way to provide power to the UK. • There are alternative ways to deliver this energy that do not leave a legacy of damage to our countryside and way of life.',
		redactedRepresentation:
			'I wish to object to this planning application by Scottish Power Renewables for the following reasons:- • The irreparable damage to the countryside, the coastline, the local environment and to wildlife habitats is totally unacceptable at a time when we are being warned repeatedly about the impact on us all of the industrialisation and loss of such natural landscapes. • The impact on the local community is out of proportion to the benefits and is not an acceptable price to pay. • The traffic and noise pollution generated will damage people’s health and this in an area that is promoted by government bodies for health and recreation. • Years of investment in the tourism industry by the taxpayer and private individuals is at risk of being wasted as people stop coming to the area. This will damage the health, wealth and well-being of local people. • The assertion that this application will deliver ‘green energy’ is false as the associated destruction of the countryside and people’s way of life is not a sustainable or justifiable way to provide power to the UK. • There are alternative ways to deliver this energy that do not leave a legacy of damage to our countryside and way of life.',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: 'Pearl',
					lastName: 'Test',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: false,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: 'Arthur',
					lastName: 'Test',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: true,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: '',
					lastName: '',
					under18: false,
					type: 'FAMILY_GROUP',
					organisationName: 'Nina Test',
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	},
	{
		status: 'VALID',
		originalRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redactedRepresentation:
			'The proposals size, loss of food producing land, battery storage size and technology, joined up thinking between DCO applications',
		redacted: true,
		siteVisitRequested: true,
		received: new Date(),
		user: {
			connectOrCreate: {
				create: {
					azureReference: 1
				},
				where: {
					azureReference: 1
				}
			}
		},
		contacts: {
			create: [
				{
					firstName: 'James',
					lastName: 'Bond',
					under18: false,
					type: 'AGENT',
					organisationName: '',
					email: 'test-agent@example.com',
					phoneNumber: '01234 567890'
				},
				{
					firstName: 'Jimbo',
					lastName: 'Test',
					under18: false,
					type: 'PERSON',
					organisationName: null,
					email: 'test@example.com',
					phoneNumber: '01234 567890'
				}
			]
		}
	}
];
