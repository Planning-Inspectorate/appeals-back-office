import { countBy, maxBy } from 'lodash-es';
import {
	formatAppellantCaseDocumentationStatus,
	formatLpaQuestionnaireDocumentationStatus
} from '#utils/format-documentation-status.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import {
	DOCUMENT_STATUS_NOT_RECEIVED,
	DOCUMENT_STATUS_RECEIVED
} from '@pins/appeals/constants/support.js';
import isFPA from '#utils/is-fpa.js';

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

	const appellantFinalComments =
		appeal.representations?.find(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
		) ?? null;
	const lpaFinalComments =
		appeal.representations?.find(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
		) ?? null;

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
		...(isFPA(appeal.appealType?.key || '') && {
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
			}
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
