import { dateISOStringToDisplayDate, addBusinessDays } from '#lib/dates.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';

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
 * @param {import('got').Got} apiClient
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @returns {Promise<PageContent>}
 * */
export async function rejectAllowResubmitPage(apiClient, appealDetails, comment) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const deadline = await addBusinessDays(apiClient, new Date(), 7);
	const deadlineString = dateISOStringToDisplayDate(deadline.toISOString());

	/** @type {PageContent} */
	const pageContent = {
		heading: 'Do you want to allow the interested party to resubmit a comment?',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/reject/select-reason`,
		preHeading: `Appeal ${shortReference}`,
		headingClasses: 'govuk-heading-l',
		hint: `The interested party can resubmit their comment by ${deadlineString}.`,
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
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {import('@pins/appeals.api').Appeals.RepresentationRejectionReason[]} rejectionReasons
 * @param {{ rejectionReasons: string[], allowResubmit: boolean }} payload
 * @returns {PageContent}
 * */
export function rejectCheckYourAnswersPage(appealDetails, comment, rejectionReasons, payload) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const attachmentsList =
		comment.attachments.length > 0
			? buildHtmUnorderedList(
					comment.attachments.map((a) => `<a href="#">${a.documentVersion.document.name}</a>`)
			  )
			: null;

	/** @type {string[]} */
	const reasonNames = payload.rejectionReasons.map(
		(reasonId) => rejectionReasons.find((r) => r.id === parseInt(reasonId))?.name ?? ''
	);

	const rejectionReasonHtml = buildHtmUnorderedList(
		reasonNames,
		0,
		'govuk-list govuk-!-margin-top-0 govuk-!-padding-left-0 govuk-list--bullet'
	);

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Interested party'
					},
					value: {
						text: comment.represented.name
					}
				},
				{
					key: {
						text: 'Comment'
					},
					value: {
						text: comment.originalRepresentation
					}
				},
				{
					key: {
						text: 'Supporting documents'
					},
					value: attachmentsList ? { html: attachmentsList } : { text: 'Not provided' }
				},
				{
					key: {
						text: 'Review decision'
					},
					value: {
						text: 'Comment rejected'
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/review`
							}
						]
					}
				},
				{
					key: {
						text: 'Why are you rejecting the comment?'
					},
					value: {
						html: rejectionReasonHtml
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/reject/select-reason`
							}
						]
					}
				},
				{
					key: {
						text: 'Do you want to allow the interested party to resubmit a comment?'
					},
					value: {
						text: payload.allowResubmit ? 'Yes' : 'No'
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/reject/allow-resubmit`
							}
						]
					}
				}
			]
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		heading: 'Check details and reject comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/reject/allow-resubmit`,
		preHeading: `Appeal ${shortReference}`,
		headingClasses: 'govuk-heading-l',
		submitButtonProperties: {
			text: 'Reject comment'
		},
		pageComponents: [summaryListComponent]
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
