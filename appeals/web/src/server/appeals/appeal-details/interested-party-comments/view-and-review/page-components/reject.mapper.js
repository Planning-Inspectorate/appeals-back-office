import { addBusinessDays } from 'date-fns';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */
/** @typedef {import("#appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").RepresentationRejectionReason} RepresentationRejectionReason */
/** @typedef {import("#appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").RejectionReasonUpdateInput} RejectionReasonUpdateInput */
/** @typedef {import("#appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").RejectionReasons} RejectionReasons */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @returns {PageContent}
 */
export function rejectInterestedPartyCommentPage(appealDetails, comment) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const pageContent = {
		heading: 'Why are you rejecting the comment?',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/review`,
		preHeading: `Appeal ${shortReference}`,
		hint: 'Select all that apply.',
		headingClasses: 'govuk-heading-l'
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @returns {PageContent}
 * */
export function rejectAllowResubmitPage(appealDetails, comment) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const deadline = dateISOStringToDisplayDate(addBusinessDays(new Date(), 7).toISOString());

	/** @type {PageContent} */
	const pageContent = {
		heading: 'Do you want to allow the interested party to resubmit a comment?',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/reject-reason`,
		preHeading: `Appeal ${shortReference}`,
		headingClasses: 'govuk-heading-l',
		hint: `The interested party can resubmit their comment by ${deadline}.`,
		submitButtonProperties: {
			text: 'Continue'
		},
		pageComponents: [
			yesNoInput({
				name: 'allowResubmit',
				id: 'allowResubmit'
			})
		]
	};

	return pageContent;
}

/**
 * @param {Representation} comment
 * @param {RepresentationRejectionReason[]} rejectionReasonOptions
 * @returns {import('../../../../../appeals/appeals.types.js').CheckboxItemParameter[]}
 */
export function mapRejectionReasonOptionsToCheckboxItemParameters(comment, rejectionReasonOptions) {
	const rejectionReasons = comment.rejectionReasons || [];
	const rejectionReasonMap = new Map(rejectionReasons.map((reason) => [reason.id, reason]));

	return rejectionReasonOptions.map((reason) => {
		const selectedReason = rejectionReasonMap.get(reason.id);
		return {
			value: reason.id.toString(),
			text: reason.name,
			checked: Boolean(selectedReason),
			hasText: reason.hasText,
			textItems: selectedReason?.text || ['']
		};
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
