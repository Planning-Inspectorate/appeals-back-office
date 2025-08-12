import { countBy } from 'lodash-es';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import formatAddress from '#utils/format-address.js';
import isFPA from '@pins/appeals/utils/is-fpa.js';
import {
	formatAppellantCaseDocumentationStatus,
	formatLpaQuestionnaireDocumentationStatus,
	formatLpaStatementStatus
} from '#utils/format-documentation-status.js';
import { add, addBusinessDays } from 'date-fns';
import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_STAGE,
	APPEAL_CASE_STATUS
} from '@planning-inspectorate/data-model';
import {
	DOCUMENT_STATUS_NOT_RECEIVED,
	DOCUMENT_STATUS_RECEIVED
} from '@pins/appeals/constants/support.js';
import { calculateIssueDecisionDeadline } from '#endpoints/appeals/appeals.service.js';
import { currentStatus } from '#utils/current-status.js';
import appealRepository from '#repositories/appeal.repository.js';
import { isAwaitingLinkedAppeal } from '#utils/is-awaiting-linked-appeal.js';
import { getFoldersForAppeal } from '#endpoints/documents/documents.service.js';

const approxStageCompletion = {
	STATE_TARGET_READY_TO_START: 5,
	STATE_TARGET_LPA_QUESTIONNAIRE_DUE: 10,
	STATE_TARGET_ASSIGN_CASE_OFFICER: 15,
	STATE_TARGET_ISSUE_DETERMINATION: 30,
	STATE_TARGET_ISSUE_DETERMINATION_AFTER_SITE_VISIT: 40,
	STATE_TARGET_STATEMENT_REVIEW: 55,
	STATE_TARGET_FINAL_COMMENT_REVIEW: 60
};

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */
/** @typedef {import('@pins/appeals.api').Schema.AppealRelationship} AppealRelationship */
/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/** @typedef {import('@pins/appeals.api').Appeals.AppealListResponse} AppealListResponse */
/** @typedef {import('@pins/appeals.api').Appeals.AppealTimetable} AppealTimetable */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAppealDetailsResponse} SingleAppealDetailsResponse */
/** @typedef {import('@pins/appeals').CostsDecision} CostsDecision */
/** @typedef {import('#endpoints/appeals').DocumentationSummary} DocumentationSummary */
/** @typedef {import('#db-client').AppealStatus} AppealStatus */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */
/** @typedef {import('#repositories/appeal-lists.repository.js').DBAppeals} DBAppeals */
/** @typedef {DBAppeals[0]} DBAppeal */
/** @typedef {import('#repositories/appeal-lists.repository.js').DBUserAppeal} DBUserAppeal */

/**
 * @param {DBAppeal & {costsDecision?: CostsDecision}} appeal
 * @param {AppealRelationship[]} linkedAppeals
 * @returns {AppealListResponse}
 */
const formatAppeal = (appeal, linkedAppeals) => {
	return {
		appealId: appeal.id,
		appealReference: appeal.reference,
		appealSite: formatAddress(appeal.address),
		appealStatus: currentStatus(appeal),
		appealType: appeal.appealType?.type,
		procedureType: appeal.procedureType?.name,
		createdAt: appeal.caseCreatedDate,
		localPlanningDepartment: appeal.lpa?.name || '',
		dueDate: null,
		documentationSummary: formatDocumentationSummary(appeal),
		appealTimetable: formatAppealTimetable(appeal),
		isParentAppeal: linkedAppeals.filter((link) => link.parentRef === appeal.reference).length > 0,
		isChildAppeal: linkedAppeals.filter((link) => link.childRef === appeal.reference).length > 0,
		planningApplicationReference: appeal.applicationReference,
		isHearingSetup: !!appeal.hearing,
		hasHearingAddress: !!appeal.hearing?.addressId,
		awaitingLinkedAppeal: null,
		numberOfResidencesNetChange: appeal.appellantCase?.numberOfResidencesNetChange || null
	};
};

/**
 * @param {Object} options
 * @param {DBUserAppeal} options.appeal
 * @param {Boolean} [options.isParentAppeal]
 * @param {Boolean} [options.isChildAppeal]
 * @param {Boolean} [options.awaitingLinkedAppeal]
 * @returns {Promise<AppealListResponse>}
 */
const formatMyAppeal = async ({
	appeal,
	isParentAppeal = false,
	isChildAppeal = false,
	awaitingLinkedAppeal = false
}) => {
	const costsDecision = await formatCostsDecision(appeal);
	return {
		appealId: appeal.id,
		appealReference: appeal.reference,
		appealSite: formatAddress(appeal.address),
		appealStatus: currentStatus(appeal),
		appealType: appeal.appealType?.type,
		procedureType: appeal.procedureType?.name,
		createdAt: appeal.caseCreatedDate,
		localPlanningDepartment: appeal.lpa?.name || '',
		lpaQuestionnaireId: appeal.lpaQuestionnaire?.id || null,
		documentationSummary: formatDocumentationSummary(appeal),
		dueDate: await mapAppealToDueDate(
			appeal,
			appeal.appellantCase?.appellantCaseValidationOutcome?.name || '',
			appeal.caseExtensionDate,
			costsDecision
		),
		appealTimetable: formatAppealTimetable(appeal),
		isParentAppeal,
		isChildAppeal,
		planningApplicationReference: appeal.applicationReference,
		isHearingSetup: !!appeal.hearing,
		hasHearingAddress: !!appeal.hearing?.addressId,
		awaitingLinkedAppeal,
		costsDecision,
		numberOfResidencesNetChange: appeal.appellantCase?.numberOfResidencesNetChange ?? null
	};
};

/**
 * @param {DBAppeal | DBUserAppeal | Appeal} appeal
 * @returns {Promise<CostsDecision>}
 * */
const formatCostsDecision = async (appeal) => {
	const costsFolders = await getFoldersForAppeal(appeal.id, APPEAL_CASE_STAGE.COSTS);
	const costsDecision = costsFolders.reduce((costsDecision, folder) => {
		const costsType = folder.path.replace('costs/', '');
		const hasDocuments = folder.documents?.filter((doc) => !doc.isDeleted).length > 0;
		return { ...costsDecision, [costsType]: hasDocuments };
	}, {});
	const {
		// @ts-ignore
		appellantCostsApplication = false,
		// @ts-ignore
		appellantCostsWithdrawal = false,
		// @ts-ignore
		appellantCostsDecisionLetter = false,
		// @ts-ignore
		lpaCostsApplication = false,
		// @ts-ignore
		lpaCostsWithdrawal = false,
		// @ts-ignore
		lpaCostsDecisionLetter = false
	} = (currentStatus(appeal) === APPEAL_CASE_STATUS.COMPLETE && costsDecision) || {};

	const awaitingAppellantCostsDecision =
		!appellantCostsDecisionLetter && appellantCostsApplication && !appellantCostsWithdrawal;
	const awaitingLpaCostsDecision =
		!lpaCostsDecisionLetter && lpaCostsApplication && !lpaCostsWithdrawal;

	return { awaitingAppellantCostsDecision, awaitingLpaCostsDecision };
};

/**
 * @param {DBAppeal | DBUserAppeal} appeal
 * @returns {DocumentationSummary}
 * */
const formatDocumentationSummary = (appeal) => {
	const ipComments =
		appeal.representations?.filter(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.COMMENT
		) ?? [];

	const lpaStatement = appeal.representations?.find(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT
	);
	const lpaFinalComments =
		appeal.representations?.filter(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
		) ?? [];
	const appellantFinalComments =
		appeal.representations?.filter(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
		) ?? [];

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
			status: ipComments.length > 0 ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
			counts: countBy(ipComments, 'status'),
			isRedacted: ipComments.some((comment) => Boolean(comment.redactedRepresentation))
		},
		lpaStatement: {
			status: formatLpaStatementStatus(lpaStatement ?? null),
			representationStatus: lpaStatement?.status ?? null,
			receivedAt: lpaStatement?.dateCreated,
			isRedacted: Boolean(lpaStatement?.redactedRepresentation)
		},
		lpaFinalComments: {
			status: lpaFinalComments.length > 0 ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
			receivedAt: lpaFinalComments[0]?.dateCreated
				? lpaFinalComments[0].dateCreated.toISOString()
				: null,
			representationStatus: lpaFinalComments[0]?.status ?? null,
			isRedacted: lpaFinalComments.some((comment) => Boolean(comment.redactedRepresentation))
		},
		appellantFinalComments: {
			status:
				appellantFinalComments.length > 0 ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
			receivedAt: appellantFinalComments[0]?.dateCreated
				? appellantFinalComments[0].dateCreated.toISOString()
				: null,
			representationStatus: appellantFinalComments[0]?.status ?? null,
			isRedacted: appellantFinalComments.some((comment) => Boolean(comment.redactedRepresentation))
		}
	};
};

/**
 * @param {DBAppeal | DBUserAppeal} appeal
 * @returns {AppealTimetable | undefined}
 * */
function formatAppealTimetable(appeal) {
	if (!appeal.appealTimetable) {
		return undefined;
	}

	return {
		appealTimetableId: appeal.appealTimetable.id,
		lpaQuestionnaireDueDate: appeal.appealTimetable.lpaQuestionnaireDueDate?.toISOString() || null,
		caseResubmissionDueDate: appeal.appealTimetable.caseResubmissionDueDate?.toISOString() || null,
		...(isFPA(appeal.appealType?.key || '') && {
			ipCommentsDueDate: appeal.appealTimetable.ipCommentsDueDate?.toISOString() || null,
			appellantStatementDueDate:
				appeal.appealTimetable.appellantStatementDueDate?.toISOString() || null,
			lpaStatementDueDate: appeal.appealTimetable.lpaStatementDueDate?.toISOString() || null,
			finalCommentsDueDate: appeal.appealTimetable.finalCommentsDueDate?.toISOString() || null,
			s106ObligationDueDate: appeal.appealTimetable.s106ObligationDueDate?.toISOString() || null,
			issueDeterminationDate: appeal.appealTimetable.issueDeterminationDate?.toISOString() || null
		})
	};
}

/**
 * Map each appeal to include a due date.
 * @param {DBAppeal | DBUserAppeal} appeal
 * @param {string} appellantCaseStatus
 * @param {Date | null} appellantCaseDueDate
 * @param {CostsDecision} costsDecision
 * @returns {Promise<Date | null | undefined>}
 */
export const mapAppealToDueDate = async (
	appeal,
	appellantCaseStatus,
	appellantCaseDueDate,
	costsDecision
) => {
	switch (currentStatus(appeal)) {
		case APPEAL_CASE_STATUS.READY_TO_START:
			if (appellantCaseStatus === 'Incomplete' && appellantCaseDueDate) {
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
			if (appeal.siteVisit) {
				return await calculateIssueDecisionDeadline(
					new Date(appeal.siteVisit.visitEndTime || appeal.siteVisit.visitDate || 0),
					approxStageCompletion.STATE_TARGET_ISSUE_DETERMINATION_AFTER_SITE_VISIT
				);
			}
			return await calculateIssueDecisionDeadline(
				new Date(appeal.caseCreatedDate),
				approxStageCompletion.STATE_TARGET_ISSUE_DETERMINATION
			);
		}
		case APPEAL_CASE_STATUS.COMPLETE: {
			if (costsDecision.awaitingAppellantCostsDecision || costsDecision.awaitingLpaCostsDecision) {
				const appealStatus = appeal.appealStatus.find(
					(state) => state.status === APPEAL_CASE_STATUS.COMPLETE
				);
				return addBusinessDays(new Date(appealStatus?.createdAt || ''), 5);
			}
			return null;
		}
		case APPEAL_CASE_STATUS.STATEMENTS: {
			if (
				appeal.appealTimetable?.lpaStatementDueDate &&
				appeal.appealTimetable?.ipCommentsDueDate
			) {
				const lpaDate = new Date(appeal.appealTimetable.lpaStatementDueDate);
				const ipDate = new Date(appeal.appealTimetable.ipCommentsDueDate);

				return lpaDate < ipDate ? lpaDate : ipDate;
			}
			if (appeal.appealTimetable?.lpaStatementDueDate) {
				return new Date(appeal.appealTimetable?.lpaStatementDueDate);
			}
			if (appeal.appealTimetable?.ipCommentsDueDate) {
				return new Date(appeal.appealTimetable?.ipCommentsDueDate);
			}
			if (appeal.appealTimetable?.appellantStatementDueDate) {
				return new Date(appeal.appealTimetable?.appellantStatementDueDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_STATEMENT_REVIEW
			});
		}
		case APPEAL_CASE_STATUS.FINAL_COMMENTS: {
			if (appeal.appealTimetable?.finalCommentsDueDate) {
				return new Date(appeal.appealTimetable?.finalCommentsDueDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_FINAL_COMMENT_REVIEW
			});
		}
		case APPEAL_CASE_STATUS.AWAITING_EVENT: {
			if (appeal.procedureType?.key === APPEAL_CASE_PROCEDURE.HEARING) {
				return appeal.hearing ? new Date(appeal.hearing?.hearingStartTime || 0) : undefined;
			}
			return appeal.siteVisit ? new Date(appeal.siteVisit?.visitDate || 0) : undefined;
		}
		case APPEAL_CASE_STATUS.EVENT: {
			return new Date(
				appeal.appealTimetable?.finalCommentsDueDate ||
					appeal.appealTimetable?.lpaQuestionnaireDueDate ||
					0
			);
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
			relevantIds.indexOf(relation.parentId) === -1
		) {
			relevantIds.push(relation.parentId);
		}
		if (
			relation.parentRef === currentAppealRef &&
			relation.childId &&
			relevantIds.indexOf(relation.childId) === -1
		) {
			relevantIds.push(relation.childId);
		}
	});

	return relevantIds;
};

/**
 *
 * @param {DBUserAppeal} appeal
 * @param {AppealRelationship[]} linkedAppeals
 * @param {boolean} isParentAppeal
 * @param {boolean} isChildAppeal
 * @returns {Promise<*[]|[{appeal, isParentAppeal, isChildAppeal, awaitingLinkedAppeal}]>}
 */
const formatLinkedAppealData = async function (
	appeal,
	linkedAppeals,
	isParentAppeal,
	isChildAppeal
) {
	// Do not add child appeals here as they will be grouped with their parent appeals below
	const myAppealData = isChildAppeal
		? []
		: [{ appeal, isParentAppeal, isChildAppeal, awaitingLinkedAppeal: false }];
	if (isParentAppeal) {
		const childAppeals = isChildAppeal
			? []
			: await Promise.all(
					linkedAppeals.map(async (linkedAppeal) => {
						if (linkedAppeal.childId) {
							const childAppeal = await appealRepository.getAppealById(
								Number(linkedAppeal.childId)
							);
							return {
								// @ts-ignore
								appeal: childAppeal,
								isParentAppeal: false,
								// @ts-ignore
								isChildAppeal: true
							};
						}
					})
			  );
		if (childAppeals?.length) {
			// @ts-ignore
			myAppealData.push(...childAppeals);
		}
	}
	return myAppealData
		.filter((appealData) => appealData)
		.map((appealData) => ({
			...appealData,
			awaitingLinkedAppeal: isAwaitingLinkedAppeal(appealData.appeal, myAppealData)
		}));
};

export {
	formatAppeal,
	formatMyAppeal,
	getIdsOfReferencedAppeals,
	formatLinkedAppealData,
	formatCostsDecision
};
