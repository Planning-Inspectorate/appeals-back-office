
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';
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
 * @param {string|null|undefined} representationStatus
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

/**
 *
 * @param {string|undefined} documentationStatus
 * @param {string|null|undefined} representationStatus
 * @param {'comment' | 'lpa_statement' | 'appellant_statement' | 'lpa_final_comment' | 'appellant_final_comment'} representationType
 * @returns {string}
 */
export function mapRepresentationDocumentSummaryStatus(
	documentationStatus,
	representationStatus,
	representationType
) {
	if (documentationStatus !== 'received' || !representationStatus) {
		let representationRowText =
			representationType === APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT ||
			representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
				? 'No final comments'
				: 'Not received';
		return representationRowText;
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

/**
 * @param {string|null|undefined} representationStatus
 * @param {boolean|undefined} isRedacted
 * @returns
 */
export function mapFinalCommentRepresentationStatusToLabelText(representationStatus, isRedacted) {
	switch (representationStatus) {
		case APPEAL_REPRESENTATION_STATUS.PUBLISHED: {
			return 'Shared';
		}
		case APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW: {
			return 'Ready to review';
		}
		case APPEAL_REPRESENTATION_STATUS.VALID: {
			return isRedacted ? 'Redacted and accepted' : 'Accepted';
		}
		case APPEAL_REPRESENTATION_STATUS.INVALID: {
			return 'Rejected';
		}
		default: {
			return '';
		}
	}
}
