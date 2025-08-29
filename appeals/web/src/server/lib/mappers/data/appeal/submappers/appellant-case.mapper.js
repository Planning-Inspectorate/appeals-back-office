import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantCase = ({ appealDetails, currentRoute, request }) => {
	const { status } = appealDetails.documentationSummary?.appellantCase ?? {};

	const statusText = (() => {
		switch (status?.toLowerCase()) {
			case 'not_received':
				return 'Not received';
			case 'received':
				return 'Ready to review';
			case 'valid':
				return 'Valid';
			case 'invalid':
				return 'Invalid';
			case 'incomplete':
				return 'Incomplete';
			case 'published':
				return 'Shared';
			default:
				return '';
		}
	})();

	const actionHtml = (() => {
		const _status = status?.toLowerCase();

		if (_status === 'not_received') {
			return '';
		}

		return `<a href="${addBackLinkQueryToUrl(
			request,
			`${currentRoute}/appellant-case`
		)}" data-cy="review-appellant-case" class="govuk-link">${
			_status === 'received' ? 'Review' : 'View'
		}<span class="govuk-visually-hidden"> appellant case</span></a>`;
	})();

	return documentationFolderTableItem({
		id: 'appellant-case',
		text: 'Appeal',
		statusText,
		receivedText: dateISOStringToDisplayDate(
			appealDetails?.documentationSummary?.appellantCase?.receivedAt
		),
		actionHtml
	});
};
