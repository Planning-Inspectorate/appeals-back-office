import { batchDelete } from '../prisma.batch-delete.js';

/**
 * @param {import('../../server/utils/db-client/index.js').PrismaClient} databaseConnector
 */
export async function deleteAllRecords(databaseConnector) {
	const deleteRepsText = databaseConnector.representationRejectionReasonText.deleteMany();
	const deleteRepsSelected = databaseConnector.representationRejectionReasonsSelected.deleteMany();
	const deleteRepsAttachments = databaseConnector.representationAttachment.deleteMany();
	const deleteRepsInvalidReasons = databaseConnector.representationRejectionReason.deleteMany();
	const deleteReps = databaseConnector.representation.deleteMany();
	const deleteDecisions = databaseConnector.inspectorDecision.deleteMany();
	const deleteDocAudits = databaseConnector.documentVersionAudit.deleteMany();
	const deleteLPAs = databaseConnector.lPA.deleteMany();
	const deleteAudits = databaseConnector.auditTrail.deleteMany();
	const deleteFolders = databaseConnector.folder.deleteMany();
	const deleteAppeals = databaseConnector.appeal.deleteMany();
	const deleteCaseNotes = databaseConnector.caseNote.deleteMany();
	const deleteUsers = databaseConnector.user.deleteMany();
	const deleteAddresses = databaseConnector.address.deleteMany();
	const deleteAppellantCase = databaseConnector.appellantCase.deleteMany();
	const deleteAppealStatus = databaseConnector.appealStatus.deleteMany();
	const deleteAppealTimetable = databaseConnector.appealTimetable.deleteMany();
	const deleteInspectorDecision = databaseConnector.inspectorDecision.deleteMany();
	const deleteLPAQuestionnaire = databaseConnector.lPAQuestionnaire.deleteMany();
	const deleteSiteVisit = databaseConnector.siteVisit.deleteMany();
	const deleteServiceCustomers = databaseConnector.serviceUser.deleteMany();
	const deleteDocuments = databaseConnector.document.deleteMany();
	const deleteLPANotificationSelected =
		databaseConnector.lPANotificationMethodsSelected.deleteMany();
	const deleteAppellantCaseIncompleteReasonOnAppellantCase =
		databaseConnector.appellantCaseIncompleteReasonsSelected.deleteMany();
	const deleteAppellantCaseInvalidReasonOnAppellantCase =
		databaseConnector.appellantCaseInvalidReasonsSelected.deleteMany();
	const deleteLPAQuestionnaireIncompleteReasonOnLPAQuestionnaire =
		databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.deleteMany();
	const deleteNeighbouringSites = databaseConnector.neighbouringSite.deleteMany();
	const deleteAppellantCaseIncompleteReasonText =
		databaseConnector.appellantCaseIncompleteReasonText.deleteMany();
	const deleteAppellantCaseInvalidReasonText =
		databaseConnector.appellantCaseInvalidReasonText.deleteMany();
	const deleteLPAQuestionnaireIncompleteReasonText =
		databaseConnector.lPAQuestionnaireIncompleteReasonText.deleteMany();
	const deleteListedBuildingDetails = databaseConnector.listedBuildingSelected.deleteMany();

	// and reference data tables
	const deleteAppealTypes = databaseConnector.appealType.deleteMany();
	const deletelpaNotificationMethods = databaseConnector.lPANotificationMethods.deleteMany();
	const knowledgeOfOtherLandowners = databaseConnector.knowledgeOfOtherLandowners.deleteMany();
	const deleteAppellantCaseIncompleteReason =
		databaseConnector.appellantCaseIncompleteReason.deleteMany();
	const deleteAppellantCaseInvalidReason =
		databaseConnector.appellantCaseInvalidReason.deleteMany();
	const deleteAppellantCaseValidationOutcome =
		databaseConnector.appellantCaseValidationOutcome.deleteMany();
	const deleteLPAQuestionnaireValidationOutcome =
		databaseConnector.lPAQuestionnaireValidationOutcome.deleteMany();
	const deleteAppealAllocationLevels = databaseConnector.appealAllocation.deleteMany();
	const deleteAppealRelationships = databaseConnector.appealRelationship.deleteMany();
	const deleteAppealSpecialisms = databaseConnector.appealSpecialism.deleteMany();
	const deleteSpecialisms = databaseConnector.specialism.deleteMany();
	const deleteLPAQUestionnaireIncompleteReason =
		databaseConnector.lPAQuestionnaireIncompleteReason.deleteMany();
	const deleteLPAQSelectedDesignatedNames = databaseConnector.designatedSiteSelected.deleteMany();
	const deleteAllDesignatedNames = databaseConnector.designatedSite.deleteMany();
	const deleteAllNotifications = databaseConnector.appealNotification.deleteMany();
	const deleteHearings = databaseConnector.hearing.deleteMany();
	const deleteInquiries = databaseConnector.inquiry.deleteMany();
	const deleteHearingEstimates = databaseConnector.hearingEstimate.deleteMany();
	const deleteInquiryEstimates = databaseConnector.inquiryEstimate.deleteMany();

	await databaseConnector.$queryRawUnsafe(`
		UPDATE Document SET latestVersionId = NULL;
		UPDATE Appeal SET inspectorUserId = NULL, caseOfficerUserId = NULL;
		UPDATE Representation SET lpaCode = NULL, representedId = NULL, representativeId = NULL;
		UPDATE Appeal SET appellantId = NULL, agentId = NULL;
		DELETE FROM DocumentVersionAvScan;
	`);

	await databaseConnector.$transaction([
		deleteRepsAttachments,
		deleteRepsText,
		deleteDecisions,
		deleteDocAudits,
		deleteAudits,
		deleteAllNotifications,
		deleteHearings,
		deleteHearingEstimates,
		deleteInquiries,
		deleteInquiryEstimates
	]);

	await batchDelete(
		databaseConnector.documentVersion.findMany.bind(databaseConnector.documentVersion),
		databaseConnector.documentVersion.deleteMany.bind(databaseConnector.documentVersion),
		500
	);

	await databaseConnector.$transaction([
		deleteLPAQSelectedDesignatedNames,
		deleteAllDesignatedNames,
		deleteDocuments,
		deleteRepsSelected,
		deleteReps,
		deleteCaseNotes,
		deleteUsers,
		deleteAppealAllocationLevels,
		deleteAppealSpecialisms,
		deleteAppealRelationships,
		deleteAppellantCaseIncompleteReasonText,
		deleteAppellantCaseIncompleteReasonOnAppellantCase,
		deleteAppellantCaseInvalidReasonText,
		deleteAppellantCaseInvalidReasonOnAppellantCase,
		deleteAppellantCase,
		deleteAppealStatus,
		deleteLPANotificationSelected,
		deleteLPAQuestionnaireIncompleteReasonText,
		deleteLPAQuestionnaireIncompleteReasonOnLPAQuestionnaire,
		deleteNeighbouringSites,
		deleteLPAQuestionnaire,
		deleteSiteVisit,
		deleteAppealTimetable,
		deleteInspectorDecision,
		deleteServiceCustomers,
		deleteFolders,
		deleteAppeals,
		deleteAddresses,
		deleteLPAs,
		deleteListedBuildingDetails
	]);

	await databaseConnector.$transaction([
		deleteLPANotificationSelected,
		deleteLPAQuestionnaireIncompleteReasonText,
		deleteLPAQuestionnaireIncompleteReasonOnLPAQuestionnaire,
		deleteNeighbouringSites,
		deleteLPAQuestionnaire,
		deleteSiteVisit,
		deleteAppealTimetable,
		deleteInspectorDecision,
		deleteServiceCustomers,
		deleteFolders,
		deleteAppeals,
		deleteAddresses,
		deleteLPAs,
		deleteListedBuildingDetails
	]);

	await databaseConnector.$transaction([
		deleteAppealTypes,
		deletelpaNotificationMethods,
		knowledgeOfOtherLandowners,
		deleteAppellantCaseIncompleteReason,
		deleteAppellantCaseInvalidReason,
		deleteAppellantCaseValidationOutcome,
		deleteLPAQuestionnaireValidationOutcome,
		deleteSpecialisms,
		deleteLPAQUestionnaireIncompleteReason,
		deleteRepsInvalidReasons
	]);
}
