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

	const visuallyHiddenText = getRepresentationVisuallyHiddenText(representationType, rule6Party);
	const href = getRepresentationHref(representationType, currentRoute, reviewRequired, rule6Party);
	const addLink = `<a href="${href}/add-document" data-cy="add-${representationType}" class="govuk-link">Add<span class="govuk-visually-hidden"> ${visuallyHiddenText}</span></a>`;
	const reviewViewLink = `<a href="${addBackLinkQueryToUrl(request, href)}" data-cy="${
		reviewRequired ? 'review' : 'view'
	}-${representationType}" class="govuk-link">${
		reviewRequired ? 'Review' : 'View'
	}<span class="govuk-visually-hidden"> ${visuallyHiddenText}</span></a>`;

	if (
		![
			'appellant-final-comments',
			'lpa-final-comments',
			'lpa-statement',
			'appellant-statement'
		].includes(representationType) &&
		documentationStatus !== 'received'
	) {
		return addLink;
	}

	if (documentationStatus !== 'received') {
		return isFeatureActive(FEATURE_FLAG_NAMES.MANUALLY_ADD_REPS) &&
			representationDueDate != undefined &&
			dateIsInThePastIsoString(representationDueDate) &&
			isInCorrectCaseStatusOrLater(request.currentAppeal, representationType)
			? addLink
			: '';
	} else if (
		representationStatus === APPEAL_REPRESENTATION_STATUS.INVALID &&
		isFeatureActive(FEATURE_FLAG_NAMES.MANUALLY_ADD_REPS)
	) {
		return `${addLink} | ${reviewViewLink}`;
	}

	return reviewViewLink;
}

/**
 * @param {RepresentationType} representationType
 * @param {{ id: number, serviceUser: { organisationName: string } }} [rule6Party]
 * @returns {string}
 */
const getRepresentationVisuallyHiddenText = (representationType, rule6Party) => {
	switch (representationType) {
		case 'lpa-statement':
			return 'LPA statement';
		case 'rule-6-party-statement':
			return `${rule6Party?.serviceUser?.organisationName} statement`;
		case 'appellant-final-comments':
			return 'Appellant final comments';
		case 'lpa-final-comments':
			return 'LPA final comments';
		case 'appellant-proofs-evidence':
			return 'Appellant proof of evidence';
		case 'lpa-proofs-evidence':
			return 'LPA proof of evidence';
		case 'rule-6-party-proofs-evidence':
			return `${rule6Party?.serviceUser?.organisationName} proof of evidence`;
		case 'appellant-statement':
			return 'Appellant statement';
		default:
			return '';
	}
};

/**
 * @param {RepresentationType} representationType
 * @param {string} currentRoute
 * @param {boolean} reviewRequired
 * @param {{ id: number, serviceUser: { organisationName: string } }} [rule6Party]
 * @returns {string}
 */
const getRepresentationHref = (representationType, currentRoute, reviewRequired, rule6Party) => {
	switch (representationType) {
		case 'lpa-statement':
			return `${currentRoute}/lpa-statement`;
		case 'rule-6-party-statement':
			return `${currentRoute}/rule-6-party-statement/${rule6Party?.id}`;
		case 'lpa-final-comments':
			return `${currentRoute}/final-comments/lpa`;
		case 'appellant-final-comments':
			return `${currentRoute}/final-comments/appellant`;
		case 'appellant-proofs-evidence':
			return reviewRequired
				? `${currentRoute}/proof-of-evidence/appellant`
				: `${currentRoute}/proof-of-evidence/appellant/manage-documents`;
		case 'lpa-proofs-evidence':
			return reviewRequired
				? `${currentRoute}/proof-of-evidence/lpa`
				: `${currentRoute}/proof-of-evidence/lpa/manage-documents`;
		case 'rule-6-party-proofs-evidence':
			return reviewRequired
				? `${currentRoute}/proof-of-evidence/rule-6-party/${rule6Party?.id}`
				: `${currentRoute}/proof-of-evidence/rule-6-party/${rule6Party?.id}/manage-documents`;
		case 'appellant-statement':
			return `${currentRoute}/appellant-statement`;
		default:
			return '';
	}
};

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
		'rule-6-party-proofs-evidence': `${currentRoute}/proof-of-evidence/rule-6-party/${rule6Party?.id}/add-representation`,
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
		case 'appellant-statement':
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
