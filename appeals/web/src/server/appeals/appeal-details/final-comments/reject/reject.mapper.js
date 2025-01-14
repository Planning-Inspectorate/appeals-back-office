import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { mapReasonsToReasonsListHtml } from '#lib/reasons-formatter.js';
import { formatFinalCommentsTypeText } from '../view-and-review/view-and-review.mapper.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption} ReasonOption
 */

/**
 * @param {Appeal} appealDetails
 * @param {string} finalCommentsType
 * @returns {PageContent}
 */
export function rejectFinalCommentsPage(appealDetails, finalCommentsType) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const pageContent = {
		heading: 'Why are you rejecting the comment?',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}`,
		preHeading: `Appeal ${shortReference}`,
		hint: 'Select all that apply.',
		headingClasses: 'govuk-heading-l'
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {string} finalCommentsType
 * @param {import('@pins/express').Session} session
 * @param {ReasonOption[]} reasonOptions
 * @returns {PageContent}
 */
export const confirmRejectFinalCommentPage = (
	appealDetails,
	comment,
	finalCommentsType,
	session,
	reasonOptions
) => {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const { rejectionReason } = session.rejectFinalComments;
	const otherOptionId = reasonOptions.find((reasonOption) => reasonOption.hasText === true)?.id;
	const otherReasonsText = otherOptionId &&
		session.rejectFinalComments[`rejectionReason-${otherOptionId}`] && {
			[otherOptionId]: session.rejectFinalComments[`rejectionReason-${otherOptionId}`]
		};

	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			type: 'summary-list',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				rows: [
					{
						key: { text: 'Final comments' },
						value: {
							html: '',
							pageComponents: [
								{
									type: 'show-more',
									parameters: {
										text: comment.originalRepresentation,
										labelText: 'Read more'
									}
								}
							]
						}
					},
					{
						key: { text: 'Supporting documents' },
						value: { text: '' } // TODO: blocked by A2-1765 (need a way to add documents for testing)
					},
					{
						key: { text: 'Review decision' },
						value: { text: 'Reject final comments' },
						actions: {
							items: [
								{
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}`,
									text: 'Change',
									visuallyHiddenText: 'review decision'
								}
							]
						}
					},
					{
						key: {
							text: `Why are you rejecting the ${formatFinalCommentsTypeText(
								finalCommentsType
							)}'s final comments?`
						},
						value: {
							html: mapReasonsToReasonsListHtml(reasonOptions, rejectionReason, otherReasonsText)
						},
						actions: {
							items: [
								{
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/reject`,
									text: 'Change',
									visuallyHiddenText: 'rejections reasons'
								}
							]
						}
					}
				]
			}
		}
	];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Confirm rejection',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/reject`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Check details and reject ${formatFinalCommentsTypeText(
			finalCommentsType
		)} final comments`,
		headingClasses: 'govuk-heading-l',
		forceRenderSubmitButton: true,
		submitButtonText: `Reject ${formatFinalCommentsTypeText(finalCommentsType)} final comments`,
		pageComponents
	};

	return pageContent;
};
