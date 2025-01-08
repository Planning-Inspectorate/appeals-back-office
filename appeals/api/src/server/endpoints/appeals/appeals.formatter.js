import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
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
import { DOCUMENT_STATUS_NOT_RECEIVED, DOCUMENT_STATUS_RECEIVED } from '#endpoints/constants.js';

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
/** @typedef {import('#endpoints/appeals').DocumentationSummary} DocumentationSummary */
/** @typedef {import('#db-client').AppealStatus} AppealStatus */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */

/**
 * @param {Appeal} appeal
 * @param {AppealRelationship[]} linkedAppeals
 * @param {Record<string, number>} commentCounts
 * @returns {AppealListResponse}}
 */
const formatAppeals = (appeal, linkedAppeals, commentCounts) => ({
	appealId: appeal.id,
	appealReference: appeal.reference,
	appealSite: formatAddress(appeal.address),
	appealStatus: appeal.appealStatus[0].status,
	appealType: appeal.appealType?.type,
	createdAt: appeal.caseCreatedDate,
	localPlanningDepartment: appeal.lpa?.name || '',
	dueDate: null,
	documentationSummary: formatDocumentationSummary(appeal),
	isParentAppeal: linkedAppeals.filter((link) => link.parentRef === appeal.reference).length > 0,
	isChildAppeal: linkedAppeals.filter((link) => link.childRef === appeal.reference).length > 0,
	commentCounts
});

/**
 * @param {Appeal} appeal
 * @param {AppealRelationship[]} linkedAppeals
 * @param {Record<string, number>} commentCounts
 * @returns {AppealListResponse}}
 */
const formatMyAppeals = (appeal, linkedAppeals, commentCounts) => ({
	appealId: appeal.id,
	appealReference: appeal.reference,
	appealSite: formatAddress(appeal.address),
	appealStatus: appeal.appealStatus[0].status,
	appealType: appeal.appealType?.type,
	createdAt: appeal.caseCreatedDate,
	localPlanningDepartment: appeal.lpa?.name || '',
	lpaQuestionnaireId: appeal.lpaQuestionnaire?.id || null,
	documentationSummary: formatDocumentationSummary(appeal),
	dueDate: mapAppealToDueDate(
		appeal,
		appeal.appellantCase?.appellantCaseValidationOutcome?.name || '',
		appeal.caseExtensionDate
	),
	appealTimetable: appeal.appealTimetable
		? {
				appealTimetableId: appeal.appealTimetable.id,
				lpaQuestionnaireDueDate:
					appeal.appealTimetable.lpaQuestionnaireDueDate?.toISOString() || null,
				caseResubmissionDueDate:
					appeal.appealTimetable.caseResubmissionDueDate?.toISOString() || null,
				...(isFPA(appeal.appealType?.key || '') && {
					ipCommentsDueDate: appeal.appealTimetable.ipCommentsDueDate?.toISOString() || null,
					appellantStatementDueDate:
						appeal.appealTimetable.appellantStatementDueDate?.toISOString() || null,
					lpaStatementDueDate: appeal.appealTimetable.lpaStatementDueDate?.toISOString() || null,
					appellantFinalCommentsDueDate:
						appeal.appealTimetable.appellantFinalCommentsDueDate?.toISOString() || null,
					lpaFinalCommentsDueDate:
						appeal.appealTimetable.lpaFinalCommentsDueDate?.toISOString() || null,
					s106ObligationDueDate:
						appeal.appealTimetable.s106ObligationDueDate?.toISOString() || null,
					issueDeterminationDate:
						appeal.appealTimetable.issueDeterminationDate?.toISOString() || null
				})
		  }
		: undefined,
	isParentAppeal: linkedAppeals.filter((link) => link.parentRef === appeal.reference).length > 0,
	isChildAppeal: linkedAppeals.filter((link) => link.childRef === appeal.reference).length > 0,
	commentCounts
});

/**
 * @param {Appeal} appeal
 * @returns {DocumentationSummary}
 * */
const formatDocumentationSummary = (appeal) => {
	const lpaStatement = appeal.representations?.find(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT
	);
	const lpaFinalComments = appeal.representations?.find(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
	);
	const appellantFinalComments = appeal.representations?.find(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
	);

	return {
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
		},
		ipComments: {
			status:
				appeal.representations?.length > 0 ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED
		},
		lpaStatement: {
			status: lpaStatement ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
			receivedAt: lpaStatement?.dateCreated
		},
		lpaFinalComments: {
			status: lpaFinalComments ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
			receivedAt: lpaFinalComments
				? lpaFinalComments?.dateCreated && lpaFinalComments?.dateCreated.toISOString()
				: null
		},
		appellantFinalComments: {
			status: appellantFinalComments ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
			receivedAt: appellantFinalComments
				? appellantFinalComments?.dateCreated && appellantFinalComments?.dateCreated.toISOString()
				: null
		}
	};
};

/**
 * @param {Appeal} appeal
 * @param {Folder[]} rootFolders
 * @param {{ transferredAppealType: string, transferredAppealReference: string } | null} transferAppealTypeInfo
 * @param {{ letterDate: Date|null, documentName: string|null, virusCheckStatus: string|null } | null} decisionInfo
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
	if (!appeal) {
		return;
	}

	// TODO: This if statement shouldn't be needed because appeal is non-optional
	// Need to make sure removing it doesn't break anything though
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
							appeal.appealTimetable.lpaQuestionnaireDueDate.toISOString()) ||
						null,
					caseResubmissionDueDate: appeal.appealTimetable.caseResubmissionDueDate
						? appeal.appealTimetable.caseResubmissionDueDate.toISOString()
						: null,
					...(isFPA(appeal.appealType?.key || '') && {
						ipCommentsDueDate:
							(appeal.appealTimetable.ipCommentsDueDate &&
								appeal.appealTimetable.ipCommentsDueDate.toISOString()) ||
							null,
						appellantStatementDueDate:
							(appeal.appealTimetable.appellantStatementDueDate &&
								appeal.appealTimetable.appellantStatementDueDate.toISOString()) ||
							null,
						lpaStatementDueDate:
							(appeal.appealTimetable.lpaStatementDueDate &&
								appeal.appealTimetable.lpaStatementDueDate.toISOString()) ||
							null,
						appellantFinalCommentsDueDate:
							(appeal.appealTimetable.appellantFinalCommentsDueDate &&
								appeal.appealTimetable.appellantFinalCommentsDueDate.toISOString()) ||
							null,
						lpaFinalCommentsDueDate:
							(appeal.appealTimetable.lpaFinalCommentsDueDate &&
								appeal.appealTimetable.lpaFinalCommentsDueDate.toISOString()) ||
							null,
						s106ObligationDueDate:
							(appeal.appealTimetable.s106ObligationDueDate &&
								appeal.appealTimetable.s106ObligationDueDate.toISOString()) ||
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
						documentName: decisionInfo.documentName,
						letterDate: (decisionInfo.letterDate && decisionInfo.letterDate) || null,
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
			(appeal.linkedAppeals || []).filter((link) => link.parentRef === appeal.reference).length > 0,
		isChildAppeal:
			(appeal.linkedAppeals || []).filter((link) => link.childRef === appeal.reference).length > 0,
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
				visitStartTime: appeal.siteVisit.visitStartTime ? appeal.siteVisit.visitStartTime : null,
				visitEndTime: appeal.siteVisit.visitEndTime ? appeal.siteVisit.visitEndTime : null,
				visitType: appeal.siteVisit.siteVisitType.name
			}
		}),
		appellantProcedurePreference: appeal.appellantCase?.appellantProcedurePreference,
		appellantProcedurePreferenceDetails: appeal.appellantCase?.appellantProcedurePreferenceDetails,
		appellantProcedurePreferenceDuration:
			appeal.appellantCase?.appellantProcedurePreferenceDuration,
		appellantProcedurePreferenceWitnessCount:
			appeal.appellantCase?.appellantProcedurePreferenceWitnessCount,
		createdAt: appeal.caseCreatedDate.toISOString(),
		startedAt: appeal.caseStartedDate && appeal.caseStartedDate?.toISOString(),
		validAt: appeal.caseValidDate && appeal.caseValidDate?.toISOString(),
		documentationSummary: formatDocumentationSummary(appeal),
		eiaScreeningRequired: appeal.eiaScreeningRequired
	};

	// @ts-ignore
	return formattedAppeal;
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
		case APPEAL_CASE_STATUS.STATEMENTS: {
			if (appeal.appealTimetable?.appellantStatementDueDate) {
				return new Date(appeal.appealTimetable?.appellantStatementDueDate);
			}
			if (appeal.appealTimetable?.lpaStatementDueDate) {
				return new Date(appeal.appealTimetable?.lpaStatementDueDate);
			}
			if (appeal.appealTimetable?.ipCommentsDueDate) {
				return new Date(appeal.appealTimetable?.ipCommentsDueDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_STATEMENT_REVIEW
			});
		}
		case APPEAL_CASE_STATUS.FINAL_COMMENTS: {
			if (appeal.appealTimetable?.appellantFinalCommentsDueDate) {
				return new Date(appeal.appealTimetable?.appellantFinalCommentsDueDate);
			}
			if (appeal.appealTimetable?.lpaFinalCommentsDueDate) {
				return new Date(appeal.appealTimetable?.lpaFinalCommentsDueDate);
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
