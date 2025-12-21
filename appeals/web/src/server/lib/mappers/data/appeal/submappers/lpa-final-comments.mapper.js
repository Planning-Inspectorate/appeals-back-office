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
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapLPAFinalComments = ({ appealDetails, currentRoute, request }) => {
	const { status, isRedacted } = appealDetails.documentationSummary?.lpaFinalComments ?? {};

	const statusText = (() => {
		if (!appealDetails.startedAt) {
			return 'Awaiting start date';
		}

		if (status === 'not_sent') {
			return 'No final comments';
		}

		if (
			status === 'not_received' &&
			appealDetails.appealTimetable?.finalCommentsDueDate &&
			!dateIsInThePast(
				dateISOStringToDayMonthYearHourMinute(appealDetails.appealTimetable.finalCommentsDueDate)
			)
		) {
			return 'Awaiting final comments';
		}

		return mapFinalCommentRepresentationStatusToLabelText(
			appealDetails.documentationSummary?.lpaFinalComments?.representationStatus,
			isRedacted
		);
	})();

	const receivedText = (() => {
		const { status, representationStatus, receivedAt } =
			appealDetails.documentationSummary?.lpaFinalComments ?? {};

		if (!appealDetails.startedAt || status === 'not_sent') {
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
			id: 'lpa-final-comments',
			text: 'LPA final comments',
			statusText,
			receivedText,
			actionHtml:
				status !== 'not_sent'
					? mapRepresentationDocumentSummaryActionLink(
							currentRoute,
							appealDetails?.documentationSummary?.lpaFinalComments?.status,
							appealDetails?.documentationSummary?.lpaFinalComments?.representationStatus,
							'lpa-final-comments',
							request,
							undefined,
							appealDetails.appealTimetable?.finalCommentsDueDate || ''
					  )
					: ''
		});
	}
};
