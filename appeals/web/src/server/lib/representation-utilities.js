import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/**
 * @param {string} representationStatus
 * @returns {boolean}
 */
export function isRepresentationReviewRequired(representationStatus) {
	return representationStatus === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW;
}

/**
 * @typedef {'appellant-final-comments'|'lpa-final-comments'|'lpa-statement'} RepresentationType
 *
 * @param {string} currentRoute
 * @param {string|undefined} documentationStatus
 * @param {string|Record<string, number>|null|undefined} representationStatus
 * @param {RepresentationType} representationType
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {string} action link html
 */
export function mapRepresentationDocumentSummaryActionLink(
	currentRoute,
	documentationStatus,
	representationStatus,
	representationType,
	request
) {
	if (documentationStatus !== 'received') {
		return '';
	}

	const reviewRequired = (() => {
		if (typeof representationStatus === 'string') {
			return [
				APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
				APPEAL_REPRESENTATION_STATUS.INCOMPLETE
			].includes(representationStatus);
		}

		if (typeof representationStatus === 'object' && representationStatus !== null) {
			return representationStatus[APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW] ?? 0 > 0;
		}

		return false;
	})();

	/** @type {Record<RepresentationType, string>} */
	const visuallyHiddenTexts = {
		'lpa-statement': 'LPA statement',
		'appellant-final-comments': 'appellant final comments',
		'lpa-final-comments': 'LPA final comments'
	};

	/** @type {Record<RepresentationType, string>} */
	const hrefs = {
		'lpa-statement': `${currentRoute}/lpa-statement`,
		'lpa-final-comments': `${currentRoute}/final-comments/lpa`,
		'appellant-final-comments': `${currentRoute}/final-comments/appellant`
	};

	return `<a href="${addBackLinkQueryToUrl(request, hrefs[representationType])}" data-cy="${
		reviewRequired ? 'review' : 'view'
	}-${representationType}" class="govuk-link">${
		reviewRequired ? 'Review' : 'View'
	}<span class="govuk-visually-hidden"> ${visuallyHiddenTexts[representationType]}</span></a>`;
}
