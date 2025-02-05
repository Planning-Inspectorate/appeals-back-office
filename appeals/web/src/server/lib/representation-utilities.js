import { APPEAL_REPRESENTATION_STATUS } from 'pins-data-model';

/**
 * @param {string} representationStatus
 * @returns {boolean}
 */
export function isRepresentationReviewRequired(representationStatus) {
	return representationStatus === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW;
}

/**
 * @param {string} currentRoute
 * @param {string|undefined} documentationStatus
 * @param {string|null|undefined} representationStatus
 * @param {'appellant'|'lpa'} finalCommentsType
 * @returns {string} action link html
 */
export function mapRepresentationDocumentSummaryActionLink(
	currentRoute,
	documentationStatus,
	representationStatus,
	finalCommentsType
) {
	if (documentationStatus === 'received' && representationStatus) {
		const reviewRequired = isRepresentationReviewRequired(representationStatus);

		return `<a href="${currentRoute}/final-comments/${finalCommentsType}" data-cy="${
			reviewRequired ? 'review' : 'view'
		}-${finalCommentsType}-final-comments" class="govuk-link">${
			reviewRequired ? 'Review' : 'View'
		} <span class="govuk-visually-hidden">${
			finalCommentsType === 'lpa' ? 'L P A' : finalCommentsType
		} final comments</span></a>`;
	}

	return '';
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
		case APPEAL_REPRESENTATION_STATUS.PUBLISHED:
			return 'Shared';
		default:
			return 'Received';
	}
}
