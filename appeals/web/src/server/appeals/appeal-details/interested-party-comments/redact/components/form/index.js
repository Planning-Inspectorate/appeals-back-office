import { wrapComponents } from '#lib/mappers/components/html.js';
import { buttons } from './buttons.js';
import { originalComment } from './original-comment.js';
import { redactInput } from './redact-input.js';

/** @typedef {import("#appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */

/**
 * @param {Representation} comment
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageComponent}
 */
export const form = (comment, session) =>
	wrapComponents(
		[
			wrapComponents(
				[
					wrapComponents(redactInput(comment, session), {
						opening: '<div class="govuk-grid-column-one-half">',
						closing: '</div>'
					}),
					wrapComponents(originalComment(comment), {
						opening: '<div class="govuk-grid-column-one-half">',
						closing: '</div>'
					}),
					wrapComponents(buttons, {
						opening: '<div class="govuk-grid-column-full">',
						closing: '</div>'
					})
				],
				{
					opening: '<div class="govuk-grid-row">',
					closing: '</div>'
				}
			)
		],
		{
			opening: '<form method="POST">',
			closing: '</form>'
		}
	);
