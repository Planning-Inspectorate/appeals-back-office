import {
	formatAppellantCaseDocumentationStatus,
	formatLpaQuestionnaireDocumentationStatus
} from '#utils/format-documentation-status.js';
import {
	APPEAL_REPRESENTATION_TYPE,
	APPEAL_REPRESENTATION_STATUS
} from '@pins/appeals/constants/common.js';
import {
	DOCUMENT_STATUS_NOT_RECEIVED,
	DOCUMENT_STATUS_RECEIVED
} from '@pins/appeals/constants/support.js';
import isFPA from '#utils/is-fpa.js';
import count from '#utils/count-array.js';

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

	const appellantFinalComments = appeal.representations?.find(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
	);
	const lpaFinalComments = appeal.representations?.find(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
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
				counts: {
					[APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW]: count(
						ipComments,
						(rep) => rep.status === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
					),
					[APPEAL_REPRESENTATION_STATUS.VALID]: count(
						ipComments,
						(rep) => rep.status === APPEAL_REPRESENTATION_STATUS.VALID
					),
					[APPEAL_REPRESENTATION_STATUS.PUBLISHED]: count(
						ipComments,
						(rep) => rep.status === APPEAL_REPRESENTATION_STATUS.PUBLISHED
					)
				}
			},
			lpaStatement: {
				status: lpaStatement ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: lpaStatement?.dateCreated.toISOString() ?? null,
				representationStatus: lpaStatement?.status ?? null
			},
			lpaFinalComments: {
				status: lpaFinalComments ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: lpaFinalComments
					? lpaFinalComments?.dateCreated && lpaFinalComments?.dateCreated.toISOString()
					: null,
				representationStatus: lpaFinalComments?.status ?? null
			},
			appellantFinalComments: {
				status: appellantFinalComments ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: appellantFinalComments
					? appellantFinalComments?.dateCreated && appellantFinalComments?.dateCreated.toISOString()
					: null,
				representationStatus: appellantFinalComments?.status ?? null
			}
		})
	};
};
