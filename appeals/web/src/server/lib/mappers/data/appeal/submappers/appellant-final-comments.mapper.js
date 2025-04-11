import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import {
	dateISOStringToDisplayDate,
	dateISOStringToDayMonthYearHourMinute,
	dateIsInThePast
} from '#lib/dates.js';
import { mapRepresentationDocumentSummaryActionLink } from '#lib/representation-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantFinalComments = ({ appealDetails, currentRoute }) => {
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

		const counts = appealDetails.documentationSummary?.appellantFinalComments?.counts ?? {};

		if (counts[APPEAL_REPRESENTATION_STATUS.PUBLISHED] > 0) {
			return 'Shared';
		}

		if (counts[APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW] > 0) {
			return 'Ready to review';
		}

		if (counts[APPEAL_REPRESENTATION_STATUS.VALID] > 0) {
			return isRedacted ? 'Redacted and accepted' : 'Accepted';
		}

		if (counts[APPEAL_REPRESENTATION_STATUS.INVALID] > 0) {
			return 'Rejected';
		}

		return '';
	})();

	const receivedText = (() => {
		const { status, counts } = appealDetails.documentationSummary?.appellantFinalComments ?? {};

		if (!appealDetails.startedAt) {
			return 'Not applicable';
		}

		if (
			status === 'not_received' ||
			(counts?.[APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW] ?? 0 > 0)
		) {
			return `Due by ${dateISOStringToDisplayDate(
				appealDetails.appealTimetable?.finalCommentsDueDate
			)}`;
		}

		return dateISOStringToDisplayDate(appealDetails.appealTimetable?.finalCommentsDueDate);
	})();

	return documentationFolderTableItem({
		id: 'appellant-final-comments',
		text: 'Appellant final comments',
		statusText,
		receivedText,
		actionHtml: mapRepresentationDocumentSummaryActionLink(
			currentRoute,
			appealDetails?.documentationSummary?.appellantFinalComments?.status,
			appealDetails?.documentationSummary?.appellantFinalComments?.representationStatus,
			'appellant-final-comments'
		)
	});
};
