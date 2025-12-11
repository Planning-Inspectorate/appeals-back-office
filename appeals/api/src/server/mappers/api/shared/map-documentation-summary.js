import {
	formatAppellantCaseDocumentationStatus,
	formatLpaQuestionnaireDocumentationStatus
} from '#utils/format-documentation-status.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import {
	DOCUMENT_STATUS_NOT_RECEIVED,
	DOCUMENT_STATUS_RECEIVED
} from '@pins/appeals/constants/support.js';
import isExpeditedAppealType from '@pins/appeals/utils/is-expedited-appeal-type.js';
import { countBy, maxBy, reduce } from 'lodash-es';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.DocumentationSummary} DocumentationSummary */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {DocumentationSummary}
 */
export const mapDocumentationSummary = (data) => {
	const { appeal } = data;

	const ipComments =
		appeal.representations?.filter(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.COMMENT
		) ?? [];

	const lpaStatement =
		appeal.representations?.find(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT
		) ?? null;

	const rule6PartyStatements =
		appeal.representations?.filter(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT
		) ?? [];

	const appellantFinalComments =
		appeal.representations?.find(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
		) ?? null;
	const lpaFinalComments =
		appeal.representations?.find(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
		) ?? null;

	const lpaProofOfEvidence =
		appeal.representations?.find(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE
		) ?? null;

	const appellantProofOfEvidence =
		appeal.representations?.find(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE
		) ?? null;

	const rule6PartyProofs =
		appeal.representations?.filter(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
		) ?? [];

	const mostRecentIpComment = maxBy(ipComments, (comment) => new Date(comment.dateCreated));

	const redactLPAStatementMatching = checkRedactedText(
		lpaStatement?.redactedRepresentation || '',
		lpaStatement?.originalRepresentation || ''
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
		...(!isExpeditedAppealType(appeal.appealType?.key || '') && {
			ipComments: {
				status: ipComments.length > 0 ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: mostRecentIpComment?.dateCreated.toISOString() ?? null,
				counts: countBy(ipComments, 'status'),
				isRedacted: ipComments.some((comment) => Boolean(comment.redactedRepresentation))
			},
			lpaStatement: {
				status: lpaStatement ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: lpaStatement?.dateCreated.toISOString() ?? null,
				representationStatus: lpaStatement?.status ?? null,
				isRedacted: Boolean(lpaStatement?.redactedRepresentation && redactLPAStatementMatching)
			},
			rule6PartyStatements: reduce(
				appeal.appealRule6Parties,
				(acc, rule6Party) => {
					const statement = rule6PartyStatements?.find(
						(statement) => statement.representedId === rule6Party.serviceUserId
					);
					acc[String(rule6Party.serviceUserId)] = {
						status: statement ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
						receivedAt: statement?.dateCreated.toISOString() ?? null,
						representationStatus: statement?.status ?? null,
						isRedacted: Boolean(statement?.redactedRepresentation && redactLPAStatementMatching)
					};
					return acc;
				},
				/** @type {Record<string, any>} */ ({})
			),
			lpaFinalComments: {
				status: lpaFinalComments ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: lpaFinalComments?.dateCreated
					? lpaFinalComments.dateCreated.toISOString()
					: null,
				representationStatus: lpaFinalComments?.status ?? null
			},
			appellantFinalComments: {
				status: appellantFinalComments ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: appellantFinalComments?.dateCreated
					? appellantFinalComments.dateCreated.toISOString()
					: null,
				representationStatus: appellantFinalComments?.status ?? null
			},
			appellantProofOfEvidence: {
				status: appellantProofOfEvidence ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: appellantProofOfEvidence?.dateCreated
					? appellantProofOfEvidence.dateCreated.toISOString()
					: null,
				representationStatus: appellantProofOfEvidence?.status ?? null
			},
			lpaProofOfEvidence: {
				status: lpaProofOfEvidence ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: lpaProofOfEvidence?.dateCreated
					? lpaProofOfEvidence.dateCreated.toISOString()
					: null,
				representationStatus: lpaProofOfEvidence?.status ?? null
			},
			rule6PartyProofs: reduce(
				appeal.appealRule6Parties,
				(acc, rule6Party) => {
					const proof = rule6PartyProofs?.find(
						(proof) => proof.representedId === rule6Party.serviceUserId
					);
					acc[String(rule6Party.serviceUserId)] = {
						status: proof ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
						receivedAt: proof?.dateCreated.toISOString() ?? null,
						representationStatus: proof?.status ?? null,
						isRedacted: Boolean(proof?.redactedRepresentation && redactLPAStatementMatching)
					};
					return acc;
				},
				/** @type {Record<string, any>} */ ({})
			)
		})
	};
};
/**
 * @param {string} originalRepresentation
 * @param {string | undefined} redactedRepresentation
 * @returns {boolean}
 */
export const checkRedactedText = (originalRepresentation, redactedRepresentation) => {
	const normalizeNewlines = (/** @type {string | undefined} */ str) =>
		(str || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	const normalizedOriginal = normalizeNewlines(originalRepresentation);
	const normalizedRedacted = normalizeNewlines(redactedRepresentation);
	return normalizedOriginal !== normalizedRedacted;
};
