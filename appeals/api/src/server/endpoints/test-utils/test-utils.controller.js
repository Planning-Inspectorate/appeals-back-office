import { startAppeal } from '#endpoints/appeal-timetables/appeal-timetables.controller.js';
import { updateCompletedEvents } from '#endpoints/appeals/appeals.service.js';
import { updateLPAQuestionnaireById } from '#endpoints/lpa-questionnaires/lpa-questionnaires.controller.js';
import { getAppealNotifications } from '#repositories/appeal-notification.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import { databaseConnector } from '#utils/database-connector.js';
import { APPEAL_START_RANGE } from '@pins/appeals/constants/common.js';
import { AUDIT_TRAIL_SYSTEM_UUID } from '@pins/appeals/constants/support.js';
import { sub } from 'date-fns';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const simulateSiteVisitElapsed = async (req, res) => {
	const { appealReference } = req.params;
	const reference = Number(appealReference);
	const appealId = reference - APPEAL_START_RANGE;

	const event = await databaseConnector.siteVisit.findFirst({
		where: { appealId }
	});

	if (event !== null) {
		const { id, ...siteVisitData } = event;

		siteVisitData.visitDate = sub(new Date(), { days: 3 });
		if (siteVisitData.visitStartTime !== null) {
			siteVisitData.visitStartTime = sub(new Date(), { days: 3 });
		}
		if (siteVisitData.visitEndTime !== null) {
			siteVisitData.visitEndTime = sub(new Date(), { days: 3 });
		}

		await databaseConnector.siteVisit.update({
			where: { id },
			data: siteVisitData
		});

		await updateCompletedEvents(AUDIT_TRAIL_SYSTEM_UUID);
		return res.send(true);
	}

	return res.send(false);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const simulateStatementsElapsed = async (req, res) => {
	const { appealReference } = req.params;
	const reference = Number(appealReference);
	const appealId = reference - APPEAL_START_RANGE;

	const timetable = await databaseConnector.appealTimetable.findFirst({
		where: { appealId }
	});

	if (timetable !== null) {
		const { id } = timetable;
		const ipCommentsDueDate = sub(new Date(), { days: 3 });
		const lpaStatementDueDate = sub(new Date(), { days: 3 });
		const appellantStatementDueDate = sub(new Date(), { days: 3 });

		await databaseConnector.appealTimetable.update({
			where: { id },
			data: {
				ipCommentsDueDate,
				lpaStatementDueDate,
				appellantStatementDueDate
			}
		});

		return res.send(true);
	}

	return res.send(false);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const simulateFinalCommentsElapsed = async (req, res) => {
	const { appealReference } = req.params;
	const reference = Number(appealReference);
	const appealId = reference - APPEAL_START_RANGE;

	const timetable = await databaseConnector.appealTimetable.findFirst({
		where: { appealId }
	});

	if (timetable !== null) {
		const { id } = timetable;
		const finalCommentsDueDate = sub(new Date(), { days: 3 });

		await databaseConnector.appealTimetable.update({
			where: { id },
			data: {
				finalCommentsDueDate
			}
		});

		return res.send(true);
	}

	return res.send(false);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const simulateProofOfEvidenceElapsed = async (req, res) => {
	const { appealReference } = req.params;
	const reference = Number(appealReference);
	const appealId = reference - APPEAL_START_RANGE;

	const timetable = await databaseConnector.appealTimetable.findFirst({
		where: { appealId }
	});

	if (timetable !== null) {
		const { id } = timetable;
		const proofOfEvidenceAndWitnessesDueDate = sub(new Date(), { days: 3 });

		await databaseConnector.appealTimetable.update({
			where: { id },
			data: {
				proofOfEvidenceAndWitnessesDueDate
			}
		});

		return res.send(true);
	}

	return res.send(false);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const retrieveNotifyEmails = async (req, res) => {
	const { appealReference } = req.params;
	const notifications = await getAppealNotifications(appealReference);

	return res.status(200).send(notifications);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const simulateHearingElapsed = async (req, res) => {
	const { appealReference } = req.params;
	const reference = Number(appealReference);
	const appealId = reference - APPEAL_START_RANGE;

	const event = await databaseConnector.hearing.findFirst({
		where: { appealId }
	});

	if (event !== null) {
		const { id, ...hearingData } = event;

		if (hearingData.hearingStartTime !== null) {
			hearingData.hearingStartTime = sub(new Date(), { days: 3 });
		}
		if (hearingData.hearingEndTime !== null) {
			hearingData.hearingEndTime = sub(new Date(), { days: 3 });
		}

		await databaseConnector.hearing.update({
			where: { id },
			data: hearingData
		});

		await updateCompletedEvents(AUDIT_TRAIL_SYSTEM_UUID);
		return res.send(true);
	}

	return res.send(false);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const simulateInquiryElapsed = async (req, res) => {
	const { appealReference } = req.params;
	const reference = Number(appealReference);
	const appealId = reference - APPEAL_START_RANGE;

	const event = await databaseConnector.inquiry.findFirst({
		where: { appealId }
	});

	if (event !== null) {
		const { id, ...inquiryData } = event;

		if (inquiryData.inquiryStartTime !== null) {
			inquiryData.inquiryStartTime = sub(new Date(), { days: 3 });
		}
		if (inquiryData.inquiryEndTime !== null) {
			inquiryData.inquiryEndTime = sub(new Date(), { days: 3 });
		}

		await databaseConnector.inquiry.update({
			where: { id },
			data: inquiryData
		});

		await updateCompletedEvents(AUDIT_TRAIL_SYSTEM_UUID);
		return res.send(true);
	}

	return res.send(false);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const deleteAppeals = async (req, res) => {
	const { appealIds } = req.body;
	await appealRepository.deleteAppealsByIds(appealIds);
	return res.send(true);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const simulateStartAppeal = async (req, res) => {
	const { appealReference } = req.params;
	const appeal = await databaseConnector.appeal.findUnique({
		where: { reference: appealReference },
		include: { procedureType: true, appealType: true, appealStatus: true }
	});

	if (!appeal) return res.status(400).send(false);

	req.body = {
		startDate: new Date().toISOString(),
		procedureType: appeal.procedureType?.key || 'written'
	};

	req.appeal = appeal;

	const response = await startAppeal(req, res);

	return response ? response : res.status(400).send(false);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const simulateReviewLPAQ = async (req, res) => {
	const { appealReference } = req.params;

	const appeal = await databaseConnector.appeal.findUnique({
		where: { reference: appealReference },
		include: {
			appealStatus: true,
			lpa: true,
			appellant: true,
			lpaQuestionnaire: {
				include: {
					listedBuildingDetails: {
						include: {
							listedBuilding: true
						}
					},
					designatedSiteNames: {
						include: {
							designatedSite: true
						}
					},
					lpaNotificationMethods: {
						include: {
							lpaNotificationMethod: true
						}
					},
					lpaQuestionnaireIncompleteReasonsSelected: {
						include: {
							lpaQuestionnaireIncompleteReason: true,
							lpaQuestionnaireIncompleteReasonText: true
						}
					},
					lpaQuestionnaireValidationOutcome: true
				}
			}
		}
	});

	const validationOutcome = await databaseConnector.lPAQuestionnaireValidationOutcome.findUnique({
		where: {
			name: 'complete'
		}
	});

	if (!appeal || !appeal.lpaQuestionnaire || !validationOutcome) return res.status(400).send(false);

	req.appeal = appeal;
	req.body = {
		lpaStatement: appeal.lpaQuestionnaire.lpaStatement,
		siteAccessDetails: appeal.lpaQuestionnaire.siteAccessDetails,
		siteSafetyDetails: appeal.lpaQuestionnaire.siteSafetyDetails,
		extraConditions: appeal.lpaQuestionnaire.newConditionDetails,
		lpaCostsAppliedFor: appeal.lpaQuestionnaire.lpaCostsAppliedFor,
		isConservationArea: appeal.lpaQuestionnaire.inConservationArea,
		isCorrectAppealType: appeal.lpaQuestionnaire.isCorrectAppealType,
		isGreenBelt: appeal.lpaQuestionnaire.isGreenBelt,
		lpaNotificationMethods: appeal.lpaQuestionnaire.lpaNotificationMethods,
		eiaColumnTwoThreshold: appeal.lpaQuestionnaire.eiaColumnTwoThreshold,
		eiaRequiresEnvironmentalStatement: appeal.lpaQuestionnaire.eiaRequiresEnvironmentalStatement,
		eiaEnvironmentalImpactSchedule: appeal.lpaQuestionnaire.eiaEnvironmentalImpactSchedule,
		eiaDevelopmentDescription: appeal.lpaQuestionnaire.eiaDevelopmentDescription,
		affectsScheduledMonument: appeal.lpaQuestionnaire.affectsScheduledMonument,
		hasProtectedSpecies: appeal.lpaQuestionnaire.hasProtectedSpecies,
		isAonbNationalLandscape: appeal.lpaQuestionnaire.isAonbNationalLandscape,
		isGypsyOrTravellerSite: appeal.lpaQuestionnaire.isGypsyOrTravellerSite,
		hasInfrastructureLevy: appeal.lpaQuestionnaire.hasInfrastructureLevy,
		isInfrastructureLevyFormallyAdopted:
			appeal.lpaQuestionnaire.isInfrastructureLevyFormallyAdopted,
		infrastructureLevyAdoptedDate: appeal.lpaQuestionnaire.infrastructureLevyAdoptedDate,
		infrastructureLevyExpectedDate: appeal.lpaQuestionnaire.infrastructureLevyExpectedDate,
		lpaProcedurePreference: appeal.lpaQuestionnaire.lpaProcedurePreference,
		lpaProcedurePreferenceDetails: appeal.lpaQuestionnaire.lpaProcedurePreferenceDetails,
		lpaProcedurePreferenceDuration: appeal.lpaQuestionnaire.lpaProcedurePreferenceDuration,
		eiaSensitiveAreaDetails: appeal.lpaQuestionnaire.eiaSensitiveAreaDetails,
		consultedBodiesDetails: appeal.lpaQuestionnaire.consultedBodiesDetails,
		reasonForNeighbourVisits: appeal.lpaQuestionnaire.reasonForNeighbourVisits,
		designatedSiteNames: appeal.lpaQuestionnaire.designatedSiteNames,
		preserveGrantLoan: appeal.lpaQuestionnaire.preserveGrantLoan,
		isSiteInAreaOfSpecialControlAdverts:
			appeal.lpaQuestionnaire.isSiteInAreaOfSpecialControlAdverts,
		wasApplicationRefusedDueToHighwayOrTraffic:
			appeal.lpaQuestionnaire.wasApplicationRefusedDueToHighwayOrTraffic,
		didAppellantSubmitCompletePhotosAndPlans:
			appeal.lpaQuestionnaire.didAppellantSubmitCompletePhotosAndPlans
	};
	req.validationOutcome = validationOutcome;
	req.params = { lpaQuestionnaireId: String(appeal.lpaQuestionnaire.id) };
	return updateLPAQuestionnaireById(req, res);
};
