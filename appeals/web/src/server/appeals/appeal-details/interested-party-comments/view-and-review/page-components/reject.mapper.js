import { dateISOStringToDisplayDate, addBusinessDays } from '#lib/dates.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';
import { simpleHtmlComponent } from '#lib/mappers/components/page-components/html.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { ensureArray } from '#lib/array-utilities.js';
import { rejectionReasonHtml } from '#appeals/appeal-details/representations/common/components/reject-reasons.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */
/** @typedef {import("#appeals/appeal-details/representations/types.js").RepresentationRejectionReason} RepresentationRejectionReason */
/** @typedef {import("#appeals/appeal-details/representations/types.js").RejectionReasonUpdateInput} RejectionReasonUpdateInput */
/** @typedef {import("#appeals/appeal-details/representations/types.js").RejectionReasons} RejectionReasons */

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
 * @param {import('@pins/express').Session} [session]
 * @returns {Promise<PageContent>}
 * */
export async function rejectAllowResubmitPage(apiClient, appealDetails, comment, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const deadline = await addBusinessDays(apiClient, new Date(), 7);
	const deadlineString = dateISOStringToDisplayDate(deadline.toISOString());

	const sessionValue = (() => {
		if (session?.rejectIpComment?.commentId !== comment.id) {
			return null;
		}

		return session?.rejectIpComment?.allowResubmit;
	})();

	/** @type {PageContent} */
	const pageContent = {
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/reject/select-reason`,
		preHeading: `Appeal ${shortReference}`,
		headingClasses: 'govuk-heading-l',
		submitButtonProperties: {
			text: 'Continue'
		},
		pageComponents: [
			yesNoInput({
				name: 'allowResubmit',
				value: sessionValue,
				legendText: 'Do you want to allow the interested party to resubmit a comment?',
				legendIsPageHeading: true,
				hint: `The interested party can resubmit their comment by ${deadlineString}.`
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
	const userProvidedEmail = Boolean(comment.represented.email);

	const commentHtml = (() => {
		if (comment.originalRepresentation) {
			return `<div class="pins-show-more">${comment.originalRepresentation}</div>`;
		}

		if (comment.attachments.length > 0) {
			return 'Added as a document';
		}

		return '';
	})();

	const attachmentsList =
		comment.attachments.length > 0
			? buildHtmUnorderedList(
					comment.attachments.map((a) => `<a href="#">${a.documentVersion.document.name}</a>`)
			  )
			: null;

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
						html: commentHtml
					}
				},
				...(attachmentsList
					? [
							{
								key: {
									text: 'Supporting documents'
								},
								value: { html: attachmentsList }
							}
					  ]
					: []),
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
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/review`,
								visuallyHiddenText: 'review decision'
							}
						]
					}
				},
				{
					key: {
						text: 'Why are you rejecting the comment?'
					},
					value: {
						html: rejectionReasonHtml(payload.rejectionReasons, rejectionReasons)
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/reject/select-reason`,
								visuallyHiddenText: 'why you are rejecting the comment'
							}
						]
					}
				},
				...(userProvidedEmail
					? [
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
											href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/reject/allow-resubmit`,
											visuallyHiddenText:
												'if you want to allow the interested party to resubmit a comment'
										}
									]
								}
							}
					  ]
					: [])
			]
		}
	};

	/** @type {PageComponent} */
	const bottomText = simpleHtmlComponent(
		'p',
		{ class: 'govuk-body' },
		userProvidedEmail
			? 'We will send an email to the interested party to explain why you rejected their comment.'
			: 'We will not send an email to explain why you rejected the comment, as the interested party did not give their email address.'
	);

	const backLinkPath = userProvidedEmail ? 'allow-resubmit' : 'select-reason';

	/** @type {PageContent} */
	const pageContent = {
		heading: 'Check details and reject comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/reject/${backLinkPath}`,
		preHeading: `Appeal ${shortReference}`,
		headingClasses: 'govuk-heading-l',
		submitButtonProperties: {
			text: 'Reject comment'
		},
		pageComponents: [summaryListComponent, bottomText]
	};

	return pageContent;
}

/**
 * @param {Representation} comment
 * @param {RepresentationRejectionReason[]} rejectionReasonOptions
 * @param {import('@pins/express').Session} session
 * @param {{ optionId: number, message: string }} [error]
 * @returns {import('../../../../../appeals/appeals.types.js').CheckboxItemParameter[]}
 */
export function mapRejectionReasonOptionsToCheckboxItemParameters(
	comment,
	rejectionReasonOptions,
	session,
	error
) {
	const rejectionReasons = comment.rejectionReasons || [];
	const rejectionReasonMap = new Map(rejectionReasons.map((reason) => [reason.id, reason]));

	const selectedReasons = (() => {
		const value = session.rejectIpComment?.rejectionReason;
		if (!value) {
			return [];
		}

		return ensureArray(value);
	})();

	return rejectionReasonOptions.map((reason) => {
		const selectedReason = rejectionReasonMap.get(reason.id);
		const id = reason.id.toString();

		const selectedTextItems = (() => {
			const value = session.rejectIpComment?.[`rejectionReason-${reason.id}`];
			if (!value || session.rejectIpComment?.commentId !== comment.id) {
				return null;
			}

			return ensureArray(value);
		})();

		return {
			value: id,
			text: reason.name,
			checked:
				error?.optionId === reason.id || Boolean(selectedReason) || selectedReasons.includes(id),
			error: error?.message,
			hasText: reason.hasText,
			textItems: selectedReason?.text || selectedTextItems || ['']
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

	const reasonsArray = ensureArray(rejectionReason);
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
				const texts = ensureArray(value);
				const trimmedTexts = texts
					.filter((text) => typeof text === 'string' && text.trim() !== '')
					.map((text) => (typeof text === 'string' ? text.trim() : ''));

				if (trimmedTexts.length > 0 || reasonsArray.includes(String(id))) {
					addReason(id);
					mappedReasons[id].text = texts
						.filter((text) => typeof text === 'string' && text.trim() !== '')
						.map((text) => text?.toString().trim() ?? '');
				}
			}
		}
	});

	return Object.values(mappedReasons);
}
