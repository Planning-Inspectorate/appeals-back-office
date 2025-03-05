import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
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
 * @param {string|null|undefined} representationStatus
 * @param {RepresentationType} representationType
 * @returns {string} action link html
 */
export function mapRepresentationDocumentSummaryActionLink(
	currentRoute,
	documentationStatus,
	representationStatus,
	representationType
) {
	if (documentationStatus !== 'received') {
		return '';
	}

	const reviewRequired = [
		APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
		APPEAL_REPRESENTATION_STATUS.INCOMPLETE
	].includes(representationStatus);

	/** @type {Record<RepresentationType, string>} */
	const visuallyHiddenTexts = {
		'lpa-statement': 'LPA statement',
		'appellant-final-comments': 'appellant final comments',
		'lpa-final-comments': 'L P A final comments'
	};

	/** @type {Record<RepresentationType, string>} */
	const hrefs = {
		'lpa-statement': `${currentRoute}/lpa-statement`,
		'lpa-final-comments': `${currentRoute}/final-comments/lpa`,
		'appellant-final-comments': `${currentRoute}/final-comments/appellant`
	};

	return `<a href="${hrefs[representationType]}" data-cy="${
		reviewRequired ? 'review' : 'view'
	}-${representationType}" class="govuk-link">${
		reviewRequired ? 'Review' : 'View'
	}<span class="govuk-visually-hidden"> ${visuallyHiddenTexts[representationType]}</span></a>`;
}

/**
 * @param {string|undefined} documentationStatus
 * @param {string|null|undefined} representationStatus
 * @returns {string}
 */
export function mapRepresentationDocumentSummaryStatus(documentationStatus, representationStatus) {
	if (documentationStatus !== 'received' || !representationStatus) {
		return 'Not received';
	}

	switch (representationStatus) {
		case APPEAL_REPRESENTATION_STATUS.VALID:
			return 'Accepted';
		case APPEAL_REPRESENTATION_STATUS.INVALID:
			return 'Rejected';
		case APPEAL_REPRESENTATION_STATUS.PUBLISHED:
			return 'Shared';
		case APPEAL_REPRESENTATION_STATUS.INCOMPLETE:
			return 'Incomplete';
		default:
			return 'Received';
	}
}
