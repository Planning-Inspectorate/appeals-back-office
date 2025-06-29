import { localPlanningDepartmentList } from './LPAs/training.js';
import { databaseConnector } from '../../server/utils/database-connector.js';

/**
 * @typedef {import('../../server/utils/db-client/index.js').PrismaClient} DatabaseConnector
 */

async function deleteTestRecords() {
	const lpaCodes = localPlanningDepartmentList.map((lpa) => lpa.lpaCode);

	const appeals = await getAppeals(lpaCodes);
	if (appeals.length === 0) {
		console.log('Nothing to delete.');
		return;
	}

	const appealIDs = appeals.map((a) => a.id);
	const appeaRefs = appeals.map((a) => a.reference);
	const representationIDs = await getReps(appealIDs);
	const appellantCaseIDs = await getAppellantCases(appealIDs);
	const lpaqIDs = await getLpaQuestionnaires(appealIDs);
	const docIDs = await getDocuments(appealIDs);

	try {
		await deleteAppealData(
			appealIDs,
			appeaRefs,
			appellantCaseIDs,
			lpaqIDs,
			docIDs,
			representationIDs
		);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
}

/**
 *
 * @param {number[]} appealIDs
 * @param {string[]} appealRefs
 * @param {number[]} appellantCasesIDs
 * @param {number[]} lpaqIDs
 * @param {string[]} documentIDs
 * @param {number[]} representationIDs
 */
const deleteAppealData = async (
	appealIDs,
	appealRefs,
	appellantCasesIDs,
	lpaqIDs,
	documentIDs,
	representationIDs
) => {
	const deleteHearing = databaseConnector.hearing.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const deleteHearingEstimate = databaseConnector.hearingEstimate.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const deleteAppeals = databaseConnector.appeal.deleteMany({
		where: {
			id: {
				in: appealIDs
			}
		}
	});

	const deleteAppealNotifications = databaseConnector.appealNotification.deleteMany({
		where: {
			caseReference: {
				in: appealRefs
			}
		}
	});

	const deleteSiteVisits = databaseConnector.siteVisit.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const deleteTimetables = databaseConnector.appealTimetable.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const deleteNeighbouringSites = databaseConnector.neighbouringSite.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const deleteSpecialisms = databaseConnector.appealSpecialism.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const deleteAllocationLevels = databaseConnector.appealAllocation.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const deleteAppellantCases = databaseConnector.appellantCase.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const deleteAppellantCasesInvalidReasons =
		databaseConnector.appellantCaseInvalidReasonsSelected.deleteMany({
			where: {
				appellantCaseId: {
					in: appellantCasesIDs
				}
			}
		});

	const deleteAppellantCasesInvalidCustomReasons =
		databaseConnector.appellantCaseInvalidReasonText.deleteMany({
			where: {
				appellantCaseId: {
					in: appellantCasesIDs
				}
			}
		});

	const deleteAppellantCasesIncompleteReasons =
		databaseConnector.appellantCaseIncompleteReasonsSelected.deleteMany({
			where: {
				appellantCaseId: {
					in: appellantCasesIDs
				}
			}
		});

	const deleteAppellantCasesIncompleteCustomReasons =
		databaseConnector.appellantCaseIncompleteReasonText.deleteMany({
			where: {
				appellantCaseId: {
					in: appellantCasesIDs
				}
			}
		});

	const deleteLpaQuestionnaires = databaseConnector.lPAQuestionnaire.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const deleteLpaQuestionnairesIncompleteReasons =
		databaseConnector.lPAQuestionnaireIncompleteReasonsSelected.deleteMany({
			where: {
				lpaQuestionnaireId: {
					in: lpaqIDs
				}
			}
		});

	const deleteLpaQuestionnairesIncompleteCustomReasons =
		databaseConnector.lPAQuestionnaireIncompleteReasonText.deleteMany({
			where: {
				lpaQuestionnaireId: {
					in: lpaqIDs
				}
			}
		});

	const deleteLpaQuestionnaireNotificationMethods =
		databaseConnector.lPANotificationMethodsSelected.deleteMany({
			where: {
				lpaQuestionnaireId: {
					in: lpaqIDs
				}
			}
		});

	const deleteLpaQuestionnaireListedBuildings = databaseConnector.listedBuildingSelected.deleteMany(
		{
			where: {
				lpaQuestionnaireId: {
					in: lpaqIDs
				}
			}
		}
	);

	const deleteLpaQuestionnaireDesignatedSites = databaseConnector.designatedSiteSelected.deleteMany(
		{
			where: {
				lpaQuestionnaireId: {
					in: lpaqIDs
				}
			}
		}
	);

	const deleteStatuses = databaseConnector.appealStatus.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const deleteFolders = databaseConnector.$executeRawUnsafe(
		`delete from Folder where caseId IN (${appealIDs.join(',')})`
	);

	const deleteParentRelationships = databaseConnector.appealRelationship.deleteMany({
		where: {
			parentId: {
				in: appealIDs
			}
		}
	});

	const deleteChildRelationships = databaseConnector.appealRelationship.deleteMany({
		where: {
			childId: {
				in: appealIDs
			}
		}
	});

	const deleteDocumentVersions = databaseConnector.documentVersion.deleteMany({
		where: {
			documentGuid: {
				in: documentIDs
			}
		}
	});

	const deleteDocAvScans = databaseConnector.documentVersionAvScan.deleteMany({
		where: {
			documentGuid: {
				in: documentIDs
			}
		}
	});

	const deleteDocuments = databaseConnector.document.deleteMany({
		where: {
			guid: {
				in: documentIDs
			}
		}
	});

	const deleteDocumentAudits = databaseConnector.documentVersionAudit.deleteMany({
		where: {
			documentGuid: {
				in: documentIDs
			}
		}
	});

	const deleteCaseNotes = databaseConnector.caseNote.deleteMany({
		where: {
			caseId: {
				in: appealIDs
			}
		}
	});

	const deleteAudits = databaseConnector.auditTrail.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const deleteReps = databaseConnector.representation.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const deleteRepsInvalidIncomplete =
		databaseConnector.representationRejectionReasonsSelected.deleteMany({
			where: {
				representationId: {
					in: representationIDs
				}
			}
		});

	const deleteRepsInvalidIncompleteCustom =
		databaseConnector.representationRejectionReasonText.deleteMany({
			where: {
				representationId: {
					in: representationIDs
				}
			}
		});

	const deleteRepsAttachments = databaseConnector.representationAttachment.deleteMany({
		where: {
			representationId: {
				in: representationIDs
			}
		}
	});

	const deleteDecisions = databaseConnector.inspectorDecision.deleteMany({
		where: {
			appealId: {
				in: appealIDs
			}
		}
	});

	const updateDocumentVersions = databaseConnector.document.updateMany({
		data: {
			latestVersionId: null
		},
		where: {
			guid: {
				in: documentIDs
			}
		}
	});

	const updateAppeals = databaseConnector.appeal.updateMany({
		data: {
			appellantId: null,
			agentId: null,
			caseOfficerUserId: null,
			inspectorUserId: null
		},
		where: {
			id: {
				in: appealIDs
			}
		}
	});

	await updateAppeals;
	await updateDocumentVersions;
	await deleteDocAvScans;
	await deleteDecisions;
	await deleteDocumentAudits;
	await deleteRepsInvalidIncompleteCustom;
	await deleteRepsInvalidIncomplete;
	await deleteRepsAttachments;
	await deleteReps;
	await deleteDocumentVersions;
	await deleteDocuments;

	if (appealIDs.length > 0) {
		await deleteFolders;
	}

	await databaseConnector.$transaction([
		deleteAppealNotifications,
		deleteCaseNotes,
		deleteAudits,
		deleteSpecialisms,
		deleteAllocationLevels,
		deleteParentRelationships,
		deleteChildRelationships,
		deleteAppellantCasesIncompleteCustomReasons,
		deleteAppellantCasesInvalidCustomReasons,
		deleteAppellantCasesIncompleteReasons,
		deleteAppellantCasesInvalidReasons,
		deleteLpaQuestionnaireDesignatedSites,
		deleteLpaQuestionnairesIncompleteCustomReasons,
		deleteLpaQuestionnairesIncompleteReasons,
		deleteLpaQuestionnaireNotificationMethods,
		deleteLpaQuestionnaireListedBuildings,
		deleteTimetables,
		deleteNeighbouringSites,
		deleteStatuses,
		deleteAppellantCases,
		deleteLpaQuestionnaires,
		deleteSiteVisits,
		deleteReps,
		deleteRepsAttachments,
		deleteHearingEstimate,
		deleteHearing,
		deleteAppeals
	]);
};

/**
 * @param {string[]} lpaCodes
 * @returns {Promise<{id: number, reference: string}[]>}
 */
const getAppeals = async (lpaCodes) => {
	const appeals = await databaseConnector.appeal.findMany({
		where: {
			lpa: {
				lpaCode: {
					in: lpaCodes
				}
			}
		},
		select: {
			id: true,
			reference: true
		}
	});

	return appeals.map((appeal) => {
		return {
			id: appeal.id,
			reference: appeal.reference
		};
	});
};

/**
 * @param {number[]} appealIDs
 * @returns {Promise<number[]>}
 */
const getReps = async (appealIDs) => {
	const reps = await databaseConnector.representation.findMany({
		where: {
			appealId: {
				in: appealIDs
			}
		},
		select: {
			id: true
		}
	});
	return reps.map((rep) => rep.id);
};

/**
 * @param {number[]} appealIDs
 * @returns {Promise<number[]>}
 */
const getAppellantCases = async (appealIDs) => {
	const appellantCases = await databaseConnector.appellantCase.findMany({
		where: {
			appealId: {
				in: appealIDs
			}
		},
		select: {
			id: true
		}
	});

	return appellantCases.map((_) => _.id);
};

/**
 * @param {number[]} appealIDs
 * @returns {Promise<number[]>}
 */
const getLpaQuestionnaires = async (appealIDs) => {
	const lpaQuestionnaires = await databaseConnector.lPAQuestionnaire.findMany({
		where: {
			appealId: {
				in: appealIDs
			}
		},
		select: {
			id: true
		}
	});

	return lpaQuestionnaires.map((_) => _.id);
};

/**
 * @param {number[]} appealIDs
 * @returns {Promise<string[]>}
 */
const getDocuments = async (appealIDs) => {
	const documents = await databaseConnector.document.findMany({
		where: {
			caseId: {
				in: appealIDs
			}
		},
		select: {
			guid: true
		}
	});

	return documents.map((_) => _.guid);
};

await deleteTestRecords();
