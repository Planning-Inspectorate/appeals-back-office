import { completedStateList, currentStatus } from '#utils/current-status.js';
import formatAddress from '#utils/format-address.js';
import { formatCostsDecision } from '#utils/format-costs-decision.js';
import {
	formatAppellantCaseDocumentationStatus,
	formatLpaQuestionnaireDocumentationStatus,
	formatRepresentationStatus
} from '#utils/format-documentation-status.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import {
	DOCUMENT_STATUS_NOT_RECEIVED,
	DOCUMENT_STATUS_RECEIVED
} from '@pins/appeals/constants/support.js';
import isExpeditedAppealType from '@pins/appeals/utils/is-expedited-appeal-type.js';
import { getSingularRepresentation } from '@pins/appeals/utils/representations.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { countBy } from 'lodash-es';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */
/** @typedef {import('@pins/appeals.api').Schema.AppealRelationship} AppealRelationship */
/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/** @typedef {import('@pins/appeals.api').Appeals.AppealListResponse} AppealListResponse */
/** @typedef {import('@pins/appeals.api').Appeals.AppealTimetable} AppealTimetable */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAppealDetailsResponse} SingleAppealDetailsResponse */
/** @typedef {import('@pins/appeals').CostsDecision} CostsDecision */
/** @typedef {import('#endpoints/appeals').DocumentationSummary} DocumentationSummary */
/** @typedef {import('#db-client/client.ts').AppealStatus} AppealStatus */
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
		completedStateList: completedStateList(appeal),
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
		numberOfResidencesNetChange: appeal.appellantCase?.numberOfResidencesNetChange || null,
		isInquirySetup: !!appeal.inquiry,
		hasInquiryAddress: !!appeal.inquiry?.addressId
	};
};

/**
 *
 * @param {Object} options
 * @param {number} options.appealId
 * @param {DBUserAppeal} options.appeal
 * @param {Date} options.dueDate
 * @param {String} options.linkType
 * @param {Boolean} [options.awaitingLinkedAppeal]
 * @returns {Promise<AppealListResponse>}
 */
const formatPersonalListItem = async ({
	appealId,
	appeal,
	dueDate,
	linkType,
	awaitingLinkedAppeal = false
}) => {
	const {
		reference,
		lpaQuestionnaire,
		appellantCase,
		hearing,
		procedureType,
		appealType,
		inquiry
	} = appeal;
	const appealStatus = currentStatus(appeal);
	const appealIsCompleteOrWithdrawn =
		appealStatus === APPEAL_CASE_STATUS.COMPLETE || appealStatus === APPEAL_CASE_STATUS.WITHDRAWN;

	return {
		appealId,
		appealReference: reference,
		appealSite: formatAddress(appeal.address),
		appealStatus,
		completedStateList: completedStateList(appeal),
		appealType: appealType?.type,
		procedureType: procedureType?.name,
		createdAt: appeal.caseCreatedDate,
		localPlanningDepartment: appeal.lpa?.name || '',
		lpaQuestionnaireId: lpaQuestionnaire?.id ?? null,
		documentationSummary: formatDocumentationSummary(appeal),
		dueDate,
		appealTimetable: formatAppealTimetable(appeal),
		isParentAppeal: linkType === 'parent',
		isChildAppeal: linkType === 'child',
		planningApplicationReference: appeal.applicationReference,
		isHearingSetup: !!hearing,
		hasHearingAddress: !!hearing?.addressId,
		awaitingLinkedAppeal,
		costsDecision: appealIsCompleteOrWithdrawn ? await formatCostsDecision(appeal) : null,
		numberOfResidencesNetChange: appellantCase?.numberOfResidencesNetChange ?? null,
		isInquirySetup: !!inquiry,
		hasInquiryAddress: !!inquiry?.addressId
	};
};

/**
 * @param {DBAppeal | DBUserAppeal} appeal
 * @returns {DocumentationSummary}
 * */
const formatDocumentationSummary = (appeal) => {
	const representations = appeal.representations;

	const ipComments =
		representations?.filter(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.COMMENT
		) ?? [];
	const lpaStatement = getSingularRepresentation(
		representations,
		APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT
	);
	const lpaFinalComment = getSingularRepresentation(
		representations,
		APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
	);
	const appellantFinalComment = getSingularRepresentation(
		representations,
		APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
	);
	const lpaProofOfEvidence =
		representations?.filter(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE
		) ?? [];
	const appellantProofOfEvidence =
		representations?.filter(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE
		) ?? [];
	const appellantStatement =
		representations?.filter(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT
		) ?? [];

	return {
		appellantCase: {
			status: formatAppellantCaseDocumentationStatus(appeal),
			dueDate: appeal.caseExtensionDate && appeal.caseExtensionDate?.toISOString(),
			receivedAt: appeal.caseCreatedDate?.toISOString()
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
			status: formatRepresentationStatus(lpaStatement ?? null),
			representationStatus: lpaStatement?.status ?? null,
			receivedAt: lpaStatement?.dateCreated,
			isRedacted: Boolean(lpaStatement?.redactedRepresentation)
		},
		lpaFinalComments: {
			status: formatRepresentationStatus(lpaFinalComment ?? null),
			representationStatus: lpaFinalComment?.status ?? null,
			receivedAt: lpaFinalComment?.dateCreated,
			isRedacted: Boolean(lpaFinalComment?.redactedRepresentation)
		},
		appellantFinalComments: {
			status: formatRepresentationStatus(appellantFinalComment ?? null),
			representationStatus: appellantFinalComment?.status ?? null,
			receivedAt: appellantFinalComment?.dateCreated,
			isRedacted: Boolean(appellantFinalComment?.redactedRepresentation)
		},
		lpaProofOfEvidence: {
			status:
				lpaProofOfEvidence.length > 0 ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
			representationStatus: lpaProofOfEvidence[0]?.status ?? null,
			receivedAt: lpaProofOfEvidence[0]?.dateCreated,
			isRedacted: Boolean(lpaProofOfEvidence[0]?.redactedRepresentation)
		},
		appellantProofOfEvidence: {
			status:
				appellantProofOfEvidence.length > 0
					? DOCUMENT_STATUS_RECEIVED
					: DOCUMENT_STATUS_NOT_RECEIVED,
			representationStatus: appellantProofOfEvidence[0]?.status ?? null,
			receivedAt: appellantProofOfEvidence[0]?.dateCreated,
			isRedacted: Boolean(appellantProofOfEvidence[0]?.redactedRepresentation)
		},
		appellantStatement: {
			status:
				appellantStatement.length > 0 ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
			representationStatus: appellantStatement[0]?.status ?? null,
			receivedAt: appellantStatement[0]?.dateCreated,
			isRedacted: Boolean(appellantStatement[0]?.redactedRepresentation)
		},
		rule6PartyProofs:
			(appeal.appealRule6Parties || []).reduce((/** @type {Object<string, any>} */ acc, party) => {
				const rule6RepFromParty = appeal.representations?.filter(
					(rep) =>
						rep.representationType === APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE &&
						rep.representedId === party.serviceUserId
				);

				if (rule6RepFromParty && rule6RepFromParty.length > 0) {
					acc[party.serviceUserId] = {
						status: DOCUMENT_STATUS_RECEIVED,
						representationStatus: rule6RepFromParty[0].status,
						receivedAt: rule6RepFromParty[0].dateCreated,
						isRedacted: Boolean(rule6RepFromParty[0].redactedRepresentation),
						organisationName: party.serviceUser?.organisationName,
						rule6PartyId: party.id
					};
				} else {
					acc[party.serviceUserId] = {
						status: DOCUMENT_STATUS_NOT_RECEIVED,
						representationStatus: null,
						receivedAt: null,
						isRedacted: false,
						organisationName: party.serviceUser?.organisationName,
						rule6PartyId: party.id
					};
				}
				return acc;
			}, {}) || {},
		rule6PartyStatements:
			(appeal.appealRule6Parties || []).reduce((/** @type {Object<string, any>} */ acc, party) => {
				const rule6RepFromParty = appeal.representations?.filter(
					(rep) =>
						rep.representationType === APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT &&
						String(rep.representedId) === String(party.serviceUserId)
				);

				if (rule6RepFromParty && rule6RepFromParty.length > 0) {
					acc[party.serviceUserId] = {
						status: DOCUMENT_STATUS_RECEIVED,
						representationStatus: rule6RepFromParty[0].status,
						receivedAt: rule6RepFromParty[0].dateCreated,
						isRedacted: Boolean(rule6RepFromParty[0].redactedRepresentation),
						organisationName: party.serviceUser?.organisationName,
						rule6PartyId: party.id
					};
				} else {
					acc[party.serviceUserId] = {
						status: DOCUMENT_STATUS_NOT_RECEIVED,
						representationStatus: null,
						receivedAt: null,
						isRedacted: false,
						rule6PartyId: party.id,
						organisationName: party.serviceUser?.organisationName
					};
				}
				return acc;
			}, {}) || {}
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
		...(!isExpeditedAppealType(appeal.appealType?.key || '') && {
			ipCommentsDueDate: appeal.appealTimetable.ipCommentsDueDate?.toISOString() || null,
			lpaStatementDueDate: appeal.appealTimetable.lpaStatementDueDate?.toISOString() || null,
			finalCommentsDueDate: appeal.appealTimetable.finalCommentsDueDate?.toISOString() || null,
			s106ObligationDueDate: appeal.appealTimetable.s106ObligationDueDate?.toISOString() || null,
			issueDeterminationDate: appeal.appealTimetable.issueDeterminationDate?.toISOString() || null,
			proofOfEvidenceAndWitnessesDueDate:
				appeal.appealTimetable.proofOfEvidenceAndWitnessesDueDate?.toISOString() || null,
			caseManagementConferenceDueDate:
				appeal.appealTimetable.caseManagementConferenceDueDate?.toISOString() || null
		})
	};
}

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

export {
	formatAppeal,
	formatDocumentationSummary,
	formatPersonalListItem,
	getIdsOfReferencedAppeals
};
