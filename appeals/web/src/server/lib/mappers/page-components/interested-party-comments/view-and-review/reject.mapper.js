import { appealShortReference } from '#lib/appeals-formatter.js';

/** @typedef {import("../../../../../appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../../../../../appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */
/** @typedef {import("../../../../../appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").RepresentationRejectionReason} RepresentationRejectionReason */
/** @typedef {import("../../../../../appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").RejectionReasonUpdateInput} RejectionReasonUpdateInput */
/** @typedef {import("../../../../../appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").RejectionReasons} RejectionReasons */

/**
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 */
export function rejectInterestedPartyCommentPage(appealDetails) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const pageContent = {
		heading: 'Why are you rejecting the comment?',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/review`,
		preHeading: `Appeal ${shortReference}`,
		hint: 'Select all that apply.',
		headingClasses: 'govuk-heading-l'
	};

	return pageContent;
}

/**
 * @param {Representation} comment - The comment containing the selected rejection reasons.
 * @param {RepresentationRejectionReason[]} rejectionReasonOptions - The available rejection reason options.
 * @returns {import('../../../../../appeals/appeals.types.js').CheckboxItemParameter[]}
 */
export function mapRejectionReasonOptionsToCheckboxItemParameters(comment, rejectionReasonOptions) {
	const existingReasonIds = comment.rejectionReasons.map((reason) => reason.id);

	return rejectionReasonOptions.map((reason) => {
		const isChecked = existingReasonIds.includes(reason.id);
		const selectedReason = comment.rejectionReasons.find((r) => r.id === reason.id);
		const existingText = selectedReason?.text || [''];

		const item = {
			value: reason.id.toString(),
			text: reason.name,
			checked: isChecked,
			hasText: reason.hasText,
			textItems: existingText
		};

		return item;
	});
}

/**
 * @param {RejectionReasons} rejectionReasons
 * @returns {RejectionReasonUpdateInput[]}
 */
export function mapRejectionReasonPayload(rejectionReasons) {
	const { rejectionReason, ...otherReasons } = rejectionReasons;

	/** @type {Record<number, RejectionReasonUpdateInput>} */
	const mappedReasons = {};

	/** @param {string | number} id */
	const addReason = (id) => {
		const numId = parseInt(String(id), 10);
		if (!isNaN(numId) && !mappedReasons[numId]) {
			mappedReasons[numId] = { id: numId, text: [] };
		}
	};

	const reasonsArray = Array.isArray(rejectionReason)
		? rejectionReason
		: [rejectionReason].filter(Boolean);
	reasonsArray.forEach((id) => {
		if (typeof id === 'string' || typeof id === 'number') {
			addReason(id);
		}
	});

	Object.entries(otherReasons).forEach(([key, value]) => {
		const match = key.match(/^rejectionReason-(\d+)$/);
		if (match) {
			const id = parseInt(match[1], 10);
			if (!isNaN(id)) {
				addReason(id);

				const texts = Array.isArray(value) ? value : [value];
				mappedReasons[id].text = texts
					.filter((text) => typeof text === 'string' && text.trim() !== '')
					.map((text) => (typeof text === 'string' ? text.trim() : ''));
			}
		}
	});

	return Object.values(mappedReasons);
}
