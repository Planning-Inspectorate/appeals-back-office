import {
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate,
	dateIsInThePast
} from '#lib/dates.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapIpComments = ({ appealDetails, currentRoute, request }) => {
	const actionText = (() => {
		const { status, counts } = appealDetails?.documentationSummary?.ipComments ?? {};

		if (status === 'not_received') {
			return 'Add';
		}

		if (counts?.[APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW] ?? 0 > 0) {
			return 'Review';
		}

		return 'View';
	})();

	const { status, counts, receivedAt } = appealDetails.documentationSummary?.ipComments ?? {};

	const statusText = (() => {
		if (!appealDetails.startedAt) {
			return 'Awaiting start date';
		}

		if (status === 'not_received') {
			return appealDetails.appealTimetable?.ipCommentsDueDate &&
				dateIsInThePast(
					dateISOStringToDayMonthYearHourMinute(appealDetails.appealTimetable.ipCommentsDueDate)
				)
				? 'No interested party comments received'
				: 'Awaiting interested party comments';
		}

		const counts = appealDetails.documentationSummary?.ipComments?.counts ?? {};

		if (counts[APPEAL_REPRESENTATION_STATUS.PUBLISHED] > 0) {
			return 'Shared';
		}

		if (counts[APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW] > 0) {
			return 'Ready to review';
		}

		const numComments = counts[APPEAL_REPRESENTATION_STATUS.VALID] ?? 0;

		return `${numComments} interested party comment${numComments !== 1 ? 's' : ''}`;
	})();

	const receivedText = (() => {
		if (!appealDetails.startedAt) {
			return 'Not applicable';
		}

		const { ipCommentsDueDate } = appealDetails.appealTimetable ?? {};

		if (dateIsInThePast(dateISOStringToDayMonthYearHourMinute(ipCommentsDueDate))) {
			return `Deadline on ${dateISOStringToDisplayDate(ipCommentsDueDate)}`;
		}

		if (status === 'not_received') {
			return `Due by ${dateISOStringToDisplayDate(
				appealDetails.appealTimetable?.ipCommentsDueDate
			)}`;
		}

		if (
			(counts?.[APPEAL_REPRESENTATION_STATUS.VALID] ?? 0) === 0 &&
			(counts?.[APPEAL_REPRESENTATION_STATUS.INVALID] ?? 0) === 0
		) {
			return dateISOStringToDisplayDate(receivedAt);
		}

		return 'Not applicable';
	})();

	return documentationFolderTableItem({
		id: 'ip-comments',
		text: 'Interested party comments',
		statusText,
		receivedText,
		actionHtml: `<a href="${addBackLinkQueryToUrl(
			request,
			`${currentRoute}/interested-party-comments${
				status === 'not_received' ? '/add/ip-details' : ''
			}`
		)}" data-cy="review-ip-comments" class="govuk-link">${actionText}<span class="govuk-visually-hidden"> interested party comments</span></a>`
	});
};
