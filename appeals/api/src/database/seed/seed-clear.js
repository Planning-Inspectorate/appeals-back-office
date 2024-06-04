/**
 * @param {import('../../server/utils/db-client/index.js').PrismaClient} databaseConnector
 */
export async function deleteAllRecords(databaseConnector) {
	const deleteDecisions = databaseConnector.inspectorDecision.deleteMany();
	const deleteDocAudits = databaseConnector.documentVersionAudit.deleteMany();
	const deleteDocAvScans = databaseConnector.documentVersionAvScan.deleteMany();
	const deleteLPAs = databaseConnector.lPA.deleteMany();
	const deleteAudits = databaseConnector.auditTrail.deleteMany();
	const deleteFolders = databaseConnector.folder.deleteMany();
	const deleteAppeals = databaseConnector.appeal.deleteMany();
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
	const deleteDocumentsVersions = databaseConnector.documentVersion.deleteMany();
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

	// delete document versions, documents, and THEN the folders.  Has to be in this order for integrity constraints
	// TODO: Currently an issue with cyclic references, hence this hack to clear the latestVersionId
	await databaseConnector.$queryRawUnsafe(`UPDATE Document SET latestVersionId = NULL;`);
	// delete references to external users on appeals
	await databaseConnector.$queryRawUnsafe(
		`UPDATE Appeal SET inspectorUserId = NULL, caseOfficerUserId = NULL;`
	);
	// delete references to internal users on appeals
	await databaseConnector.$queryRawUnsafe(`UPDATE Appeal SET appellantId = NULL, agentId = NULL;`);
  await deleteDocAvScans;
	await deleteDecisions;
	await deleteDocAudits;
	await deleteDocumentsVersions;
	await deleteDocuments;

	await databaseConnector.$transaction([
		deleteAudits,
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

	// after deleting the case data, can delete the reference lookup tables
	await deleteAppealTypes;
	await deletelpaNotificationMethods;
	await knowledgeOfOtherLandowners;
	await deleteAppellantCaseIncompleteReason;
	await deleteAppellantCaseInvalidReason;
	await deleteAppellantCaseValidationOutcome;
	await deleteLPAQuestionnaireValidationOutcome;
	await deleteSpecialisms;
	await deleteLPAQUestionnaireIncompleteReason;
}
