import {
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate,
	dateIsInThePast
} from '#lib/dates.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { mapRepresentationDocumentSummaryActionLink } from '#lib/representation-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaStatement = ({ appealDetails, currentRoute, request }) => {
	const { status, representationStatus, isRedacted } =
		appealDetails.documentationSummary?.lpaStatement ?? {};

	const statusText = (() => {
		if (!appealDetails.startedAt) {
			return 'Awaiting start date';
		}

		if (status === 'not_received') {
			return appealDetails.appealTimetable?.lpaStatementDueDate &&
				dateIsInThePast(
					dateISOStringToDayMonthYearHourMinute(appealDetails.appealTimetable.lpaStatementDueDate)
				)
				? 'Overdue'
				: 'Awaiting statement';
		}

		switch (representationStatus?.toLowerCase()) {
			case 'awaiting_review':
				return 'Ready to review';
			case 'valid':
				return isRedacted ? 'Redacted and accepted' : 'Accepted';
			case 'incomplete':
				return 'Incomplete';
			case 'published':
				return 'Shared';
			default:
				return '';
		}
	})();

	const receivedText = (() => {
		if (!appealDetails.startedAt) {
			return 'Not applicable';
		}

		if (appealDetails.documentationSummary?.lpaStatement?.status === 'not_received') {
			return `Due by ${dateISOStringToDisplayDate(
				appealDetails.appealTimetable?.lpaStatementDueDate
			)}`;
		}

		const receivedAt =
			appealDetails.documentationSummary?.lpaStatement?.receivedAt instanceof Date
				? appealDetails.documentationSummary.lpaStatement.receivedAt.toDateString()
				: appealDetails.documentationSummary.lpaStatement?.receivedAt;

		return dateISOStringToDisplayDate(receivedAt);
	})();

	return documentationFolderTableItem({
		id: 'lpa-statement',
		text: 'LPA statement',
		statusText,
		receivedText,
		actionHtml: mapRepresentationDocumentSummaryActionLink(
			currentRoute,
			appealDetails?.documentationSummary?.lpaStatement?.status,
			appealDetails?.documentationSummary?.lpaStatement?.representationStatus,
			'lpa-statement',
			request
		)
	});
};
