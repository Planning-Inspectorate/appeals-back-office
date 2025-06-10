import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
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
export const mapAppellantFinalComments = ({ appealDetails, currentRoute, request }) => {
	const { status, isRedacted } = appealDetails.documentationSummary?.appellantFinalComments ?? {};

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
			appealDetails.documentationSummary?.appellantFinalComments?.representationStatus,
			isRedacted
		);
	})();

	const receivedText = (() => {
		const { status, representationStatus, receivedAt } =
			appealDetails.documentationSummary?.appellantFinalComments ?? {};

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

	if (appealDetails?.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.HEARING) {
		const id = 'start-case-date';
		return { id, display: {} };
	} else {
		return documentationFolderTableItem({
			id: 'appellant-final-comments',
			text: 'Appellant final comments',
			statusText,
			receivedText,
			actionHtml: mapRepresentationDocumentSummaryActionLink(
				currentRoute,
				appealDetails?.documentationSummary?.appellantFinalComments?.status,
				appealDetails?.documentationSummary?.appellantFinalComments?.representationStatus,
				'appellant-final-comments',
				request
			)
		});
	}
};
