import {
	formatAppellantCaseDocumentationStatus,
	formatLpaQuestionnaireDocumentationStatus
} from '#utils/format-documentation-status.js';
import {
	APPEAL_REPRESENTATION_TYPE,
	APPEAL_REPRESENTATION_STATUS
} from '@pins/appeals/constants/common.js';
import { DOCUMENT_STATUS_NOT_RECEIVED, DOCUMENT_STATUS_RECEIVED } from '#endpoints/constants.js';
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
				status:
					appeal.representations?.length > 0
						? DOCUMENT_STATUS_RECEIVED
						: DOCUMENT_STATUS_NOT_RECEIVED
			},
			lpaStatement: {
				status: appeal.representations?.find(
					(rep) =>
						rep.representationType === APPEAL_REPRESENTATION_TYPE.STATEMENT &&
						rep.status === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
				)
					? DOCUMENT_STATUS_RECEIVED
					: DOCUMENT_STATUS_NOT_RECEIVED
			},
			appellantFinalComments: {
				status: appeal.representations?.find(
					(rep) =>
						rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT &&
						rep.status === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
				)
					? DOCUMENT_STATUS_RECEIVED
					: DOCUMENT_STATUS_NOT_RECEIVED
			},
			lpaFinalComments: {
				status: appeal.representations?.find(
					(rep) =>
						rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT &&
						rep.status === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
				)
					? DOCUMENT_STATUS_RECEIVED
					: DOCUMENT_STATUS_NOT_RECEIVED
			}
		})
	};
};
