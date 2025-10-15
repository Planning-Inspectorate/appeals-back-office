import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';

/**
 * @param {string} representationStatus
 * @returns {boolean}
 */
export function isRepresentationReviewRequired(representationStatus) {
	return representationStatus === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW;
}

/**
 * @typedef {'appellant-final-comments'|'lpa-final-comments'|'lpa-statement' |'appellant-proofs-evidence' |'lpa-proofs-evidence'} RepresentationType
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
				!['appellant-proofs-evidence', 'lpa-proofs-evidence'].includes(representationType)
					? APPEAL_REPRESENTATION_STATUS.INCOMPLETE
					: ''
			].includes(representationStatus);
		}

		return false;
	})();

	/** @type {Record<RepresentationType, string>} */
	const visuallyHiddenTexts = {
		'lpa-statement': 'LPA statement',
		'appellant-final-comments': 'Appellant final comments',
		'lpa-final-comments': 'LPA final comments',
		'appellant-proofs-evidence': 'Appellant proof of evidence',
		'lpa-proofs-evidence': 'LPA proof of evidence'
	};

	/** @type {Record<RepresentationType, string>} */
	const hrefs = {
		'lpa-statement': `${currentRoute}/lpa-statement`,
		'lpa-final-comments': `${currentRoute}/final-comments/lpa`,
		'appellant-final-comments': `${currentRoute}/final-comments/appellant`,
		'appellant-proofs-evidence': reviewRequired
			? `${currentRoute}/proof-of-evidence/appellant`
			: `${currentRoute}/proof-of-evidence/appellant/manage-documents`,
		'lpa-proofs-evidence': reviewRequired
			? `${currentRoute}/proof-of-evidence/lpa`
			: `${currentRoute}/proof-of-evidence/lpa/manage-documents`
	};

	return `<a href="${addBackLinkQueryToUrl(request, hrefs[representationType])}" data-cy="${
		reviewRequired ? 'review' : 'view'
	}-${representationType}" class="govuk-link">${
		reviewRequired ? 'Review' : 'View'
	}<span class="govuk-visually-hidden"> ${visuallyHiddenTexts[representationType]}</span></a>`;
}

/**
 * @param {string} currentRoute
 * @param {RepresentationType} representationType
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {string} action link html
 */
export function mapAddRepresentationSummaryActionLink(currentRoute, representationType, request) {
	/** @type {Record<string, string>} */
	const visuallyHiddenTexts = {
		'appellant-proofs-evidence': 'Appellant proof of evidence',
		'lpa-proofs-evidence': 'LPA proof of evidence'
	};

	/** @type {Record<string, string>} */
	const hrefs = {
		'appellant-proofs-evidence': `${currentRoute}/proof-of-evidence/appellant/add-representation`,
		'lpa-proofs-evidence': `${currentRoute}/proof-of-evidence/lpa/add-representation`
	};

	return `<a href="${addBackLinkQueryToUrl(
		request,
		hrefs[representationType]
	)}" data-cy="add-${representationType}" class="govuk-link">Add<span class="govuk-visually-hidden"> ${
		visuallyHiddenTexts[representationType]
	}</span></a>`;
}

/**
 *
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
