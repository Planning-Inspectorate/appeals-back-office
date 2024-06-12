import formatAddress from '#utils/format-address.js';
import isFPA from '#utils/is-fpa.js';
import { formatLinkedAppeals, formatRelatedAppeals } from '#utils/format-linked-appeals.js';
import {
	formatAppellantCaseDocumentationStatus,
	formatLpaQuestionnaireDocumentationStatus
} from '#utils/format-documentation-status.js';
import { add } from 'date-fns';
import {
	STATE_TARGET_FINAL_COMMENT_REVIEW,
	STATE_TARGET_STATEMENT_REVIEW,
	STATE_TARGET_ISSUE_DETERMINATION,
	STATE_TARGET_LPA_QUESTIONNAIRE_DUE,
	STATE_TARGET_READY_TO_START,
	STATE_TARGET_ASSIGN_CASE_OFFICER,
	STATE_TARGET_COMPLETE
} from '#endpoints/constants.js';

const approxStageCompletion = {
	STATE_TARGET_READY_TO_START: 5,
	STATE_TARGET_LPA_QUESTIONNAIRE_DUE: 10,
	STATE_TARGET_ASSIGN_CASE_OFFICER: 15,
	STATE_TARGET_ISSUE_DETERMINATION: 30,
	STATE_TARGET_STATEMENT_REVIEW: 55,
	STATE_TARGET_FINAL_COMMENT_REVIEW: 60
};

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */
/** @typedef {import('@pins/appeals.api').Schema.AppealRelationship} AppealRelationship */
/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/** @typedef {import('@pins/appeals.api').Appeals.AppealListResponse} AppealListResponse */
/** @typedef {import('@pins/appeals.api').Appeals.RepositoryGetAllResultItem} RepositoryGetAllResultItem */
/** @typedef {import('@pins/appeals.api').Appeals.RepositoryGetByIdResultItem} RepositoryGetByIdResultItem */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAppealDetailsResponse} SingleAppealDetailsResponse */
/** @typedef {import('#db-client').AppealStatus} AppealStatus */
/**
 * @param {RepositoryGetAllResultItem} appeal
 * @param {AppealRelationship[]} linkedAppeals
 * @returns {AppealListResponse}}
 */
const formatAppeals = (appeal, linkedAppeals) => ({
	appealId: appeal.id,
	appealReference: appeal.reference,
	appealSite: formatAddress(appeal.address),
	appealStatus: appeal.appealStatus[0].status,
	appealType: appeal.appealType?.type,
	createdAt: appeal.createdAt,
	localPlanningDepartment: appeal.lpa.name,
	appellantCaseStatus: '',
	lpaQuestionnaireStatus: '',
	dueDate: null,
	isParentAppeal: linkedAppeals.filter((link) => link.parentRef === appeal.reference).length > 0,
	isChildAppeal: linkedAppeals.filter((link) => link.childRef === appeal.reference).length > 0
});

/**
 * @param {RepositoryGetAllResultItem} appeal
 * @param {AppealRelationship[]} linkedAppeals
 * @returns {AppealListResponse}}
 */
const formatMyAppeals = (appeal, linkedAppeals) => ({
	appealId: appeal.id,
	appealReference: appeal.reference,
	appealSite: formatAddress(appeal.address),
	appealStatus: appeal.appealStatus[0].status,
	appealType: appeal.appealType?.type,
	createdAt: appeal.createdAt,
	localPlanningDepartment: appeal.lpa.name,
	lpaQuestionnaireId: appeal.lpaQuestionnaire?.id || null,
	appealTimetable: appeal.appealTimetable
		? {
				appealTimetableId: appeal.appealTimetable.id,
				lpaQuestionnaireDueDate: appeal.appealTimetable.lpaQuestionnaireDueDate || null,
				...(isFPA(appeal.appealType) && {
					finalCommentReviewDate: appeal.appealTimetable.finalCommentReviewDate || null,
					statementReviewDate: appeal.appealTimetable.statementReviewDate || null,
					issueDeterminationDate: appeal.appealTimetable.issueDeterminationDate || null
				})
		  }
		: undefined,
	appellantCaseStatus: appeal?.appellantCase?.appellantCaseValidationOutcome?.name || null,
	lpaQuestionnaireStatus: appeal.lpaQuestionnaire?.lpaQuestionnaireValidationOutcome?.name || null,
	dueDate: mapAppealToDueDate(
		appeal,
		appeal?.appellantCase?.appellantCaseValidationOutcome?.name,
		appeal.dueDate
	),
	isParentAppeal: linkedAppeals.filter((link) => link.parentRef === appeal.reference).length > 0,
	isChildAppeal: linkedAppeals.filter((link) => link.childRef === appeal.reference).length > 0
});

/**
 * @param {RepositoryGetByIdResultItem} appeal
 * @param {Folder[]} decisionFolders
 * @param {Folder[]} costsFolders
 * @param {{ transferredAppealType: string, transferredAppealReference: string } | null} transferAppealTypeInfo
 * @param {{ letterDate: Date|null, virusCheckStatus: string|null } | null} decisionInfo
 * @param { RepositoryGetAllResultItem[] | null} referencedAppeals
 * @returns {SingleAppealDetailsResponse | void}}
 */
const formatAppeal = (
	appeal,
	decisionFolders,
	costsFolders,
	transferAppealTypeInfo = null,
	decisionInfo = null,
	referencedAppeals = null
) => {
	if (appeal) {
		const formattedAppeal = {
			...(appeal.agent && {
				agent: {
					serviceUserId: appeal.agent.id,
					firstName: appeal.agent.firstName || '',
					lastName: appeal.agent.lastName || '',
					organisationName: appeal.agent.organisationName || null,
					email: appeal.agent.email,
					phoneNumber: appeal.agent.phoneNumber
				}
			}),
			...(appeal.appellant && {
				appellant: {
					serviceUserId: appeal.appellant.id,
					firstName: appeal.appellant.firstName || '',
					lastName: appeal.appellant.lastName || '',
					organisationName: appeal.appellant.organisationName || null,
					email: appeal.appellant?.email || null,
					phoneNumber: appeal.appellant.phoneNumber || null
				}
			}),
			allocationDetails: appeal.allocation
				? {
						level: appeal.allocation.level,
						band: appeal.allocation.band,
						specialisms: appeal.specialisms?.map((s) => s.specialism?.name) || []
				  }
				: null,
			appealId: appeal.id,
			appealReference: appeal.reference,
			appealSite: { addressId: appeal.address?.id, ...formatAddress(appeal.address) },
			neighbouringSites: appeal.neighbouringSites?.map((site) => {
				return {
					siteId: site.id,
					source: site.source,
					address: formatAddress(site.address)
				};
			}),
			isAffectingNeighbouringSites: appeal.lpaQuestionnaire?.isAffectingNeighbouringSites,
			appealStatus: appeal.appealStatus[0].status,
			...(transferAppealTypeInfo && {
				transferStatus: {
					transferredAppealType: transferAppealTypeInfo.transferredAppealType,
					transferredAppealReference: transferAppealTypeInfo.transferredAppealReference
				}
			}),
			appealTimetable: appeal.appealTimetable
				? {
						appealTimetableId: appeal.appealTimetable.id,
						lpaQuestionnaireDueDate: appeal.appealTimetable.lpaQuestionnaireDueDate || null,
						...(isFPA(appeal.appealType) && {
							finalCommentReviewDate: appeal.appealTimetable.finalCommentReviewDate || null,
							statementReviewDate: appeal.appealTimetable.statementReviewDate || null
						})
				  }
				: null,
			appealType: appeal.appealType?.type,
			...(appeal.resubmitTypeId && {
				resubmitTypeId: appeal.resubmitTypeId
			}),
			appellantCaseId: appeal.appellantCase?.id || 0,
			caseOfficer: appeal.caseOfficer?.azureAdUserId || null,
			costs: {
				appellantFolder: costsFolders.find((f) => f.path.endsWith('appellant')),
				lpaFolder: costsFolders.find((f) => f.path.endsWith('lpa')),
				decisionFolder: costsFolders.find((f) => f.path.endsWith('decision'))
			},
			decision:
				decisionInfo &&
				appeal.inspectorDecision?.outcome &&
				appeal.inspectorDecision?.decisionLetterGuid
					? {
							folderId: decisionFolders[0].id,
							outcome: appeal.inspectorDecision.outcome,
							documentId: appeal.inspectorDecision?.decisionLetterGuid,
							letterDate: decisionInfo.letterDate,
							virusCheckStatus: decisionInfo.virusCheckStatus
					  }
					: {
							folderId: decisionFolders[0].id
					  },
			healthAndSafety: {
				appellantCase: {
					details: appeal.appellantCase?.healthAndSafetyIssues || null,
					hasIssues: appeal.appellantCase?.hasHealthAndSafetyIssues
				},
				lpaQuestionnaire: {
					details: appeal.lpaQuestionnaire?.healthAndSafetyDetails || null,
					hasIssues: appeal.lpaQuestionnaire?.doesSiteHaveHealthAndSafetyIssues
				}
			},
			inspector: appeal.inspector?.azureAdUserId || null,
			inspectorAccess: {
				appellantCase: {
					details: appeal.appellantCase?.inspectorAccessDetails || null,
					isRequired: appeal.appellantCase?.doesSiteRequireInspectorAccess
				},
				lpaQuestionnaire: {
					details: appeal.lpaQuestionnaire?.inspectorAccessDetails || null,
					isRequired: appeal.lpaQuestionnaire?.doesSiteRequireInspectorAccess
				}
			},
			otherAppeals: formatRelatedAppeals(appeal.relatedAppeals || [], appeal.id, referencedAppeals),
			linkedAppeals: formatLinkedAppeals(
				appeal.linkedAppeals || [],
				appeal.reference,
				referencedAppeals
			),
			isParentAppeal:
				(appeal.linkedAppeals || []).filter((link) => link.parentRef === appeal.reference).length >
				0,
			isChildAppeal:
				(appeal.linkedAppeals || []).filter((link) => link.childRef === appeal.reference).length >
				0,
			localPlanningDepartment: appeal.lpa.name,
			lpaQuestionnaireId: appeal.lpaQuestionnaire?.id || null,
			planningApplicationReference: appeal.planningApplicationReference,
			procedureType: appeal.lpaQuestionnaire?.procedureType?.name || 'Written',
			siteVisit: {
				siteVisitId: appeal.siteVisit?.id || null,
				visitDate: appeal.siteVisit?.visitDate || null,
				visitStartTime: appeal.siteVisit?.visitStartTime || null,
				visitEndTime: appeal.siteVisit?.visitEndTime || null,
				visitType: appeal.siteVisit?.siteVisitType?.name || null
			},
			createdAt: appeal.createdAt,
			startedAt: appeal.startedAt,
			validAt: appeal.validAt,
			documentationSummary: {
				appellantCase: {
					status: formatAppellantCaseDocumentationStatus(appeal),
					dueDate: appeal.dueDate,
					receivedAt: appeal.createdAt
				},
				lpaQuestionnaire: {
					status: formatLpaQuestionnaireDocumentationStatus(appeal),
					dueDate: appeal.appealTimetable?.lpaQuestionnaireDueDate || null,
					receivedAt: appeal.lpaQuestionnaire?.receivedAt || null
				}
			}
		};

		// @ts-ignore
		return formattedAppeal;
	}
};

/**
 * Map each appeal to include a due date.
 * @param {RepositoryGetAllResultItem} appeal
 * @param {string} appellantCaseStatus
 * @param {Date | null} appellantCaseDueDate
 * @returns { Date | null | undefined }
 */
export const mapAppealToDueDate = (appeal, appellantCaseStatus, appellantCaseDueDate) => {
	switch (appeal.appealStatus[0].status) {
		case STATE_TARGET_READY_TO_START:
			if (appellantCaseStatus == 'Incomplete' && appellantCaseDueDate) {
				return new Date(appellantCaseDueDate);
			}
			return add(new Date(appeal.createdAt), {
				days: approxStageCompletion.STATE_TARGET_READY_TO_START
			});
		case STATE_TARGET_LPA_QUESTIONNAIRE_DUE:
			if (appeal.appealTimetable?.lpaQuestionnaireDueDate) {
				return new Date(appeal.appealTimetable?.lpaQuestionnaireDueDate);
			}
			return add(new Date(appeal.createdAt), {
				days: approxStageCompletion.STATE_TARGET_LPA_QUESTIONNAIRE_DUE
			});
		case STATE_TARGET_ASSIGN_CASE_OFFICER:
			return add(new Date(appeal.createdAt), {
				days: approxStageCompletion.STATE_TARGET_ASSIGN_CASE_OFFICER
			});
		case STATE_TARGET_ISSUE_DETERMINATION: {
			if (appeal.appealTimetable?.issueDeterminationDate) {
				return new Date(appeal.appealTimetable?.issueDeterminationDate);
			}
			return add(new Date(appeal.createdAt), {
				days: approxStageCompletion.STATE_TARGET_ISSUE_DETERMINATION
			});
		}
		case STATE_TARGET_STATEMENT_REVIEW: {
			if (appeal.appealTimetable?.statementReviewDate) {
				return new Date(appeal.appealTimetable?.statementReviewDate);
			}
			return add(new Date(appeal.createdAt), {
				days: approxStageCompletion.STATE_TARGET_STATEMENT_REVIEW
			});
		}
		case STATE_TARGET_FINAL_COMMENT_REVIEW: {
			if (appeal.appealTimetable?.finalCommentReviewDate) {
				return new Date(appeal.appealTimetable?.finalCommentReviewDate);
			}
			return add(new Date(appeal.createdAt), {
				days: approxStageCompletion.STATE_TARGET_FINAL_COMMENT_REVIEW
			});
		}
		case STATE_TARGET_COMPLETE: {
			return null;
		}
		default: {
			return undefined;
		}
	}
};

/**
 * @param {AppealRelationship[]} otherAppeals
 * @param {string} currentAppealRef
 * @returns {number[]}
 */
const getIdsOfReferencedAppeals = (otherAppeals, currentAppealRef) => {
	/**
	 * @type {number[]}
	 */
	const relevantIds = [];
	otherAppeals.map((relation) => {
		if (
			relation.childRef === currentAppealRef &&
			relation.parentId !== null &&
			relevantIds.indexOf(relation.parentId) === -1
		) {
			relevantIds.push(relation.parentId);
		}
		if (
			relation.parentRef === currentAppealRef &&
			relation.childId !== null &&
			relevantIds.indexOf(relation.childId) === -1
		) {
			relevantIds.push(relation.childId);
		}
	});

	return relevantIds;
};

export { formatAppeal, formatAppeals, formatMyAppeals, getIdsOfReferencedAppeals };
