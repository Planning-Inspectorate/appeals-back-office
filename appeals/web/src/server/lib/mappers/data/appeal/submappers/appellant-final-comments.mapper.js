import {
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate,
	dateIsInThePast
} from '#lib/dates.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import {
	mapFinalCommentRepresentationStatusToLabelText,
	mapRepresentationDocumentSummaryActionLink
} from '#lib/representation-utilities.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { doNotDisplayFinalComments } from '../common.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

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

	if (doNotDisplayFinalComments(appealDetails)) {
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
				request,
				undefined,
				appealDetails.appealTimetable?.finalCommentsDueDate || ''
			)
		});
	}
};
