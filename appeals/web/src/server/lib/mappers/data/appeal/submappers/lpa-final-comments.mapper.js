import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import {
	dateISOStringToDisplayDate,
	dateISOStringToDayMonthYearHourMinute,
	dateIsInThePast
} from '#lib/dates.js';
import {
	mapRepresentationDocumentSummaryActionLink,
	mapFinalCommentRepresentationStatusToLabelText
} from '#lib/representation-utilities.js';
import { APPEAL_CASE_PROCEDURE } from 'pins-data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapLPAFinalComments = ({ appealDetails, currentRoute, request }) => {
	const { status, isRedacted } = appealDetails.documentationSummary?.lpaFinalComments ?? {};

	const statusText = (() => {
		if (!appealDetails.startedAt) {
			return 'Awaiting start date';
		}

		if (status === 'not_received') {
			return appealDetails.appealTimetable?.finalCommentsDueDate &&
				dateIsInThePast(
					dateISOStringToDayMonthYearHourMinute(appealDetails.appealTimetable.finalCommentsDueDate)
				)
				? 'No final comments'
				: 'Awaiting final comments';
		}

		return mapFinalCommentRepresentationStatusToLabelText(
			appealDetails.documentationSummary?.lpaFinalComments?.representationStatus,
			isRedacted
		);
	})();

	const receivedText = (() => {
		const { status, representationStatus, receivedAt } =
			appealDetails.documentationSummary?.lpaFinalComments ?? {};

		if (!appealDetails.startedAt) {
			return 'Not applicable';
		}

		if (
			status === 'not_received' ||
			representationStatus === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
		) {
			return `Due by ${dateISOStringToDisplayDate(
				appealDetails.appealTimetable?.finalCommentsDueDate
			)}`;
		}

		return dateISOStringToDisplayDate(receivedAt);
	})();


	return documentationFolderTableItem({
		id: 'lpa-final-comments',
		text: 'LPA final comments',
		statusText: mapRepresentationDocumentSummaryStatus(
			appealDetails?.documentationSummary?.lpaFinalComments?.status,
			appealDetails?.documentationSummary?.lpaFinalComments?.representationStatus,
			APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
		),
		receivedText:
			dateISOStringToDisplayDate(
				appealDetails?.documentationSummary?.lpaFinalComments?.receivedAt
			) || 'Not applicable',
		statusText,
		receivedText,
		actionHtml: mapRepresentationDocumentSummaryActionLink(
			currentRoute,
			appealDetails?.documentationSummary?.lpaFinalComments?.status,
			appealDetails?.documentationSummary?.lpaFinalComments?.counts,
			'lpa-final-comments'
		)
	});

	if (appealDetails?.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.HEARING) {
		const id = 'start-case-date';
		return { id, display: {} };
	} else {
		return documentationFolderTableItem({
			id: 'lpa-final-comments',
			text: 'LPA final comments',
			statusText,
			receivedText,
			actionHtml: mapRepresentationDocumentSummaryActionLink(
				currentRoute,
				appealDetails?.documentationSummary?.lpaFinalComments?.status,
				appealDetails?.documentationSummary?.lpaFinalComments?.representationStatus,
				'lpa-final-comments',
				request
			)
		});
	}
};
