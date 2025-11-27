import { isFeatureActive } from '#common/feature-flags.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import {
	APPEAL_REPRESENTATION_STATUS,
	FEATURE_FLAG_NAMES
} from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { isStatePassed } from './appeal-status.js';
import { dateIsInThePastIsoString } from './dates.js';

/** @typedef {import('#appeals/appeal-details/appeal-details.types.d.ts').WebAppeal} WebAppeal */

/**
 * @param {string} representationStatus
 * @returns {boolean}
 */
export function isRepresentationReviewRequired(representationStatus) {
	return representationStatus === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW;
}

/**
 * @typedef {'appellant-final-comments' | 'lpa-final-comments' | 'lpa-statement' | 'rule-6-party-statement' | 'appellant-proofs-evidence' | 'lpa-proofs-evidence' | 'rule-6-party-proofs-evidence' | 'appellant-statement'} RepresentationType
 *
 * @param {string} currentRoute
 * @param {string|undefined} documentationStatus
 * @param {string|null|undefined} representationStatus
 * @param {RepresentationType} representationType
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {{ id: number, serviceUser: { organisationName: string } }} [rule6Party]
 * @param {string} [representationDueDate]
 * @returns {string} action link html
 */
export function mapRepresentationDocumentSummaryActionLink(
	currentRoute,
	documentationStatus,
	representationStatus,
	representationType,
	request,
	rule6Party,
	representationDueDate
) {
	const reviewRequired = (() => {
		if (typeof representationStatus === 'string') {
			return [
				APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
				![
					'appellant-proofs-evidence',
					'lpa-proofs-evidence',
					'rule-6-party-proofs-evidence'
				].includes(representationType)
					? APPEAL_REPRESENTATION_STATUS.INCOMPLETE
					: ''
			].includes(representationStatus);
		}

		return false;
	})();

	/** @type {Record<RepresentationType, string>} */
	const visuallyHiddenTexts = {
		'lpa-statement': 'LPA statement',
		'rule-6-party-statement': `${rule6Party?.serviceUser?.organisationName} statement`,
		'appellant-final-comments': 'Appellant final comments',
		'lpa-final-comments': 'LPA final comments',
		'appellant-proofs-evidence': 'Appellant proof of evidence',
		'lpa-proofs-evidence': 'LPA proof of evidence',
		'rule-6-party-proofs-evidence': `${rule6Party?.serviceUser?.organisationName} proof of evidence`,
		'appellant-statement': 'Appellant statement'
	};

	/** @type {Record<RepresentationType, string>} */
	const hrefs = {
		'lpa-statement': `${currentRoute}/lpa-statement`,
		'rule-6-party-statement': `${currentRoute}/rule-6-party-statement/${rule6Party?.id}`,
		'lpa-final-comments': `${currentRoute}/final-comments/lpa`,
		'appellant-final-comments': `${currentRoute}/final-comments/appellant`,
		'appellant-proofs-evidence': reviewRequired
			? `${currentRoute}/proof-of-evidence/appellant`
			: `${currentRoute}/proof-of-evidence/appellant/manage-documents`,
		'lpa-proofs-evidence': reviewRequired
			? `${currentRoute}/proof-of-evidence/lpa`
			: `${currentRoute}/proof-of-evidence/lpa/manage-documents`,
		'rule-6-party-proofs-evidence': reviewRequired
			? `${currentRoute}/proof-of-evidence/rule-6-party/${rule6Party?.id}`
			: `${currentRoute}/proof-of-evidence/rule-6-party/${rule6Party?.id}/manage-documents`,
		'appellant-statement': `${currentRoute}/appellant-statement`
	};

	if (
		[
			'appellant-proofs-evidence',
			'lpa-proofs-evidence',
			'rule-6-party-proofs-evidence',
			'rule-6-party-statement',
			'appellant-statement'
		].includes(representationType) &&
		documentationStatus !== 'received'
	) {
		return `<a href="${hrefs[representationType]}/add-document" data-cy="add-${representationType}" class="govuk-link">Add<span class="govuk-visually-hidden"> ${visuallyHiddenTexts[representationType]}</span></a>`;
	}

	if (documentationStatus !== 'received') {
		return isFeatureActive(FEATURE_FLAG_NAMES.MANUALLY_ADD_REPS) &&
			representationDueDate != undefined &&
			dateIsInThePastIsoString(representationDueDate) &&
			isInCorrectCaseStatusOrLater(request.currentAppeal, representationType)
			? `<a href="${hrefs[representationType]}/add-document" data-cy="add-${representationType}" class="govuk-link">Add<span class="govuk-visually-hidden"> ${visuallyHiddenTexts[representationType]}</span></a>`
			: '';
	}

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
 * @param {{ id: number, serviceUser: { organisationName: string } }} [rule6Party]
 * @returns {string} action link html
 */
export function mapAddRepresentationSummaryActionLink(
	currentRoute,
	representationType,
	request,
	rule6Party
) {
	/** @type {Record<string, string>} */
	const visuallyHiddenTexts = {
		'appellant-proofs-evidence': 'Appellant proof of evidence',
		'lpa-proofs-evidence': 'LPA proof of evidence',
		'rule-6-party-proofs-evidence': `${rule6Party?.serviceUser?.organisationName} proof of evidence`,
		'appellant-statement': 'Appellant statement'
	};

	/** @type {Record<string, string>} */
	const hrefs = {
		'appellant-proofs-evidence': `${currentRoute}/proof-of-evidence/appellant/add-representation`,
		'lpa-proofs-evidence': `${currentRoute}/proof-of-evidence/lpa/add-representation`,
		'rule-6-party-proofs-evidence': `${currentRoute}/proof-of-evidence/rule-6-party/add-representation`,
		'appellant-statement': `${currentRoute}/appellant-statement`
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

/**
 * @param {WebAppeal} appeal
 * @param {string} representationType
 * @returns {boolean}
 */
const isInCorrectCaseStatusOrLater = (appeal, representationType) => {
	switch (representationType) {
		case 'lpa-statement':
			return (
				appeal.appealStatus === APPEAL_CASE_STATUS.STATEMENTS ||
				isStatePassed(appeal, APPEAL_CASE_STATUS.STATEMENTS)
			);
		case 'lpa-final-comments':
		case 'appellant-final-comments':
			return (
				appeal.appealStatus === APPEAL_CASE_STATUS.FINAL_COMMENTS ||
				isStatePassed(appeal, APPEAL_CASE_STATUS.FINAL_COMMENTS)
			);
		default:
			return false;
	}
};
