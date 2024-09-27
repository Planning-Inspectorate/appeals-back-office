import formatAddress from '#utils/format-address.js';
import isFPA from '#utils/is-fpa.js';
import { formatLinkedAppeals, formatRelatedAppeals } from '#utils/format-linked-appeals.js';
import {
	formatAppellantCaseDocumentationStatus,
	formatLpaQuestionnaireDocumentationStatus
} from '#utils/format-documentation-status.js';
import { add } from 'date-fns';
import { formatFolder } from '#endpoints/documents/documents.formatter.js';
import { APPEAL_CASE_STATUS, APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from 'pins-data-model';

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
/** @typedef {import('@pins/appeals.api').Appeals.SingleAppealDetailsResponse} SingleAppealDetailsResponse */
/** @typedef {import('#db-client').AppealStatus} AppealStatus */
/**
 * @param {Appeal} appeal
 * @param {AppealRelationship[]} linkedAppeals
 * @returns {AppealListResponse}}
 */
const formatAppeals = (appeal, linkedAppeals) => ({
	appealId: appeal.id,
	appealReference: appeal.reference,
	appealSite: formatAddress(appeal.address),
	appealStatus: appeal.appealStatus[0].status,
	appealType: appeal.appealType?.type,
	createdAt: appeal.caseCreatedDate,
	localPlanningDepartment: appeal.lpa?.name || '',
	appellantCaseStatus: '',
	lpaQuestionnaireStatus: '',
	dueDate: null,
	isParentAppeal: linkedAppeals.filter((link) => link.parentRef === appeal.reference).length > 0,
	isChildAppeal: linkedAppeals.filter((link) => link.childRef === appeal.reference).length > 0
});

/**
 * @param {Appeal} appeal
 * @param {AppealRelationship[]} linkedAppeals
 * @returns {AppealListResponse}}
 */
const formatMyAppeals = (appeal, linkedAppeals) => ({
	appealId: appeal.id,
	appealReference: appeal.reference,
	appealSite: formatAddress(appeal.address),
	appealStatus: appeal.appealStatus[0].status,
	appealType: appeal.appealType?.type,
	createdAt: appeal.caseCreatedDate,
	localPlanningDepartment: appeal.lpa?.name || '',
	lpaQuestionnaireId: appeal.lpaQuestionnaire?.id || null,
	appealTimetable: appeal.appealTimetable
		? {
				appealTimetableId: appeal.appealTimetable.id,
				lpaQuestionnaireDueDate: appeal.appealTimetable.lpaQuestionnaireDueDate || null,
				caseResubmissionDueDate: appeal.appealTimetable.caseResubmissionDueDate || null,
				...(isFPA(appeal.appealType?.key || '') && {
					finalCommentReviewDate: appeal.appealTimetable.finalCommentReviewDate || null,
					statementReviewDate: appeal.appealTimetable.statementReviewDate || null,
					issueDeterminationDate: appeal.appealTimetable.issueDeterminationDate || null
				})
		  }
		: undefined,
	appellantCaseStatus: appeal?.appellantCase?.appellantCaseValidationOutcome?.name || '',
	lpaQuestionnaireStatus: appeal.lpaQuestionnaire?.lpaQuestionnaireValidationOutcome?.name || '',
	dueDate: mapAppealToDueDate(
		appeal,
		appeal.appellantCase?.appellantCaseValidationOutcome?.name || '',
		appeal.caseExtensionDate
	),
	isParentAppeal: linkedAppeals.filter((link) => link.parentRef === appeal.reference).length > 0,
	isChildAppeal: linkedAppeals.filter((link) => link.childRef === appeal.reference).length > 0
});

/**
 * @param {Appeal} appeal
 * @param {Folder[]} rootFolders
 * @param {{ transferredAppealType: string, transferredAppealReference: string } | null} transferAppealTypeInfo
 * @param {{ letterDate: Date|null, virusCheckStatus: string|null } | null} decisionInfo
 * @param { Appeal[] | null} referencedAppeals
 * @returns {SingleAppealDetailsResponse | void}}
 */
const formatAppeal = (
	appeal,
	rootFolders,
	transferAppealTypeInfo = null,
	decisionInfo = null,
	referencedAppeals = null
) => {
	if (appeal) {
		const decisionFolder = formatFolder(
			rootFolders.find(
				(f) =>
					f.path ===
					`${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
			)
		);

		const appealFolders = {
			costs: {
				appellantApplicationFolder: formatFolder(
					rootFolders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_APPLICATION}`
					)
				),
				appellantWithdrawalFolder: formatFolder(
					rootFolders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_WITHDRAWAL}`
					)
				),
				appellantCorrespondenceFolder: formatFolder(
					rootFolders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_CORRESPONDENCE}`
					)
				),
				lpaApplicationFolder: formatFolder(
					rootFolders.find(
						(f) =>
							f.path === `${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_APPLICATION}`
					)
				),
				lpaWithdrawalFolder: formatFolder(
					rootFolders.find(
						(f) =>
							f.path === `${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_WITHDRAWAL}`
					)
				),
				lpaCorrespondenceFolder: formatFolder(
					rootFolders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_CORRESPONDENCE}`
					)
				),
				decisionFolder: formatFolder(
					rootFolders.find(
						(f) =>
							f.path === `${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.COSTS_DECISION_LETTER}`
					)
				)
			},
			internalCorrespondence: {
				crossTeam: formatFolder(
					rootFolders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.CROSS_TEAM_CORRESPONDENCE}`
					)
				),
				inspector: formatFolder(
					rootFolders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.INSPECTOR_CORRESPONDENCE}`
					)
				)
			},
			withdrawal: {
				withdrawalFolder: formatFolder(
					rootFolders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_WITHDRAWAL_LETTER}`
					)
				),
				withdrawalRequestDate: appeal.withdrawalRequestDate
			}
		};

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
			...appealFolders,
			neighbouringSites:
				appeal.neighbouringSites?.map((site) => {
					return {
						siteId: site.id,
						source: site.source,
						address: formatAddress(site.address)
					};
				}) || [],
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
						lpaQuestionnaireDueDate:
							(appeal.appealTimetable.lpaQuestionnaireDueDate &&
								appeal.appealTimetable.lpaQuestionnaireDueDate) ||
							null,
						caseResubmissionDueDate: appeal.appealTimetable.caseResubmissionDueDate || null,
						...(isFPA(appeal.appealType?.key || '') && {
							finalCommentReviewDate:
								(appeal.appealTimetable.finalCommentReviewDate &&
									appeal.appealTimetable.finalCommentReviewDate) ||
								null,
							statementReviewDate:
								(appeal.appealTimetable.statementReviewDate &&
									appeal.appealTimetable.statementReviewDate) ||
								null
						})
				  }
				: null,
			appealType: appeal.appealType?.type,
			...(appeal.caseResubmittedTypeId && {
				resubmitTypeId: appeal.caseResubmittedTypeId
			}),
			appellantCaseId: appeal.appellantCase?.id || 0,
			caseOfficer: appeal.caseOfficer?.azureAdUserId || null,
			decision:
				decisionInfo &&
				appeal.inspectorDecision?.outcome &&
				appeal.inspectorDecision?.decisionLetterGuid
					? {
							folderId: decisionFolder?.folderId,
							outcome: appeal.inspectorDecision.outcome,
							documentId: appeal.inspectorDecision?.decisionLetterGuid,
							letterDate:
								(decisionInfo.letterDate && decisionInfo.letterDate) || null,
							virusCheckStatus: decisionInfo.virusCheckStatus
					  }
					: {
							folderId: decisionFolder?.folderId
					  },
			healthAndSafety: {
				appellantCase: {
					details: appeal.appellantCase?.siteSafetyDetails,
					hasIssues:
						appeal.appellantCase?.siteSafetyDetails !== undefined
							? !!appeal.appellantCase?.siteSafetyDetails
							: undefined
				},
				lpaQuestionnaire: {
					details: appeal.lpaQuestionnaire?.siteSafetyDetails,
					hasIssues:
						appeal.lpaQuestionnaire?.siteSafetyDetails !== undefined
							? !!appeal.lpaQuestionnaire?.siteSafetyDetails
							: undefined
				}
			},
			inspector: appeal.inspector?.azureAdUserId || null,
			inspectorAccess: {
				appellantCase: {
					details: appeal.appellantCase?.siteAccessDetails,
					isRequired:
						appeal.appellantCase?.siteAccessDetails !== undefined
							? !!appeal.appellantCase?.siteAccessDetails
							: undefined
				},
				lpaQuestionnaire: {
					details: appeal.lpaQuestionnaire?.siteAccessDetails,
					isRequired:
						appeal.lpaQuestionnaire?.siteAccessDetails !== undefined
							? !!appeal.lpaQuestionnaire?.siteAccessDetails
							: undefined
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
			localPlanningDepartment: appeal.lpa?.name || '',
			isGreenBelt: appeal.appellantCase?.isGreenBelt,
			isAffectingNeighbouringSites: appeal.lpaQuestionnaire?.isAffectingNeighbouringSites,
			lpaQuestionnaireId: appeal.lpaQuestionnaire?.id || null,
			planningApplicationReference: appeal.applicationReference || '',
			procedureType: appeal.procedureType?.name || 'Written',
			...(appeal.siteVisit?.id && {
				siteVisit: {
					siteVisitId: appeal.siteVisit.id,
					visitDate: appeal.siteVisit.visitDate?.toISOString() || null,
					visitStartTime: appeal.siteVisit.visitStartTime,
					visitEndTime: appeal.siteVisit.visitEndTime || null,
					visitType: appeal.siteVisit.siteVisitType.name
				}
			}),
			appellantProcedurePreference: appeal.appellantCase?.appellantProcedurePreference,
			appellantProcedurePreferenceDetails:
				appeal.appellantCase?.appellantProcedurePreferenceDetails,
			appellantProcedurePreferenceDuration:
				appeal.appellantCase?.appellantProcedurePreferenceDuration,
			inquiryHowManyWitnesses: appeal.appellantCase?.inquiryHowManyWitnesses,
			createdAt: appeal.caseCreatedDate.toISOString(),
			startedAt: appeal.caseStartedDate && appeal.caseStartedDate?.toISOString(),
			validAt: appeal.caseValidDate && appeal.caseValidDate?.toISOString(),
			documentationSummary: {
				appellantCase: {
					status: formatAppellantCaseDocumentationStatus(appeal),
					dueDate: appeal.caseExtensionDate && appeal.caseExtensionDate?.toISOString(),
					receivedAt: appeal.caseCreatedDate.toISOString()
				},
				lpaQuestionnaire: {
					status: formatLpaQuestionnaireDocumentationStatus(appeal),
					dueDate:
						appeal.appealTimetable?.lpaQuestionnaireDueDate &&
						appeal.appealTimetable?.lpaQuestionnaireDueDate.toISOString(),
					receivedAt:
						appeal.lpaQuestionnaire?.lpaqCreatedDate &&
						appeal.lpaQuestionnaire?.lpaqCreatedDate.toISOString()
				}
			}
		};

		// @ts-ignore
		return formattedAppeal;
	}
};

/**
 * Map each appeal to include a due date.
 * @param {Appeal} appeal
 * @param {string} appellantCaseStatus
 * @param {Date | null} appellantCaseDueDate
 * @returns { Date | null | undefined }
 */
export const mapAppealToDueDate = (appeal, appellantCaseStatus, appellantCaseDueDate) => {
	switch (appeal.appealStatus[0].status) {
		case APPEAL_CASE_STATUS.READY_TO_START:
			if (appellantCaseStatus == 'Incomplete' && appellantCaseDueDate) {
				return new Date(appellantCaseDueDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_READY_TO_START
			});
		case APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE:
			if (appeal.appealTimetable?.lpaQuestionnaireDueDate) {
				return new Date(appeal.appealTimetable?.lpaQuestionnaireDueDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_LPA_QUESTIONNAIRE_DUE
			});
		case APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER:
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_ASSIGN_CASE_OFFICER
			});
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION: {
			if (appeal.appealTimetable?.issueDeterminationDate) {
				return new Date(appeal.appealTimetable?.issueDeterminationDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_ISSUE_DETERMINATION
			});
		}
		case APPEAL_CASE_STATUS.COMPLETE: {
			return null;
		}
		//TODO: S78
		case 'statement_review': {
			if (appeal.appealTimetable?.statementReviewDate) {
				return new Date(appeal.appealTimetable?.statementReviewDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_STATEMENT_REVIEW
			});
		}
		case 'final_comment_review': {
			if (appeal.appealTimetable?.finalCommentReviewDate) {
				return new Date(appeal.appealTimetable?.finalCommentReviewDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_FINAL_COMMENT_REVIEW
			});
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
			relation.parentId &&
			relation.parentId !== null &&
			relevantIds.indexOf(relation.parentId) === -1
		) {
			relevantIds.push(relation.parentId);
		}
		if (
			relation.parentRef === currentAppealRef &&
			relation.childId &&
			relation.childId !== null &&
			relevantIds.indexOf(relation.childId) === -1
		) {
			relevantIds.push(relation.childId);
		}
	});

	return relevantIds;
};

export { formatAppeal, formatAppeals, formatMyAppeals, getIdsOfReferencedAppeals };
