import { simpleHtmlComponent } from '#lib/mappers/components/html.js';

/** @typedef {import("../../../../../../appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */

const redactedSubheadingMarkup = `
<h3>	
  Redacted comment
</h3>
`;

/**
 * @param {Representation} comment
 * @returns {PageComponent[]}
 */
export const redactInput = (comment) => [
	simpleHtmlComponent(redactedSubheadingMarkup),
	{
		type: 'textarea',
		parameters: {
			name: 'redactedRepresentation',
			id: 'redact-textarea',
			value: comment.redactedRepresentation || comment.originalRepresentation
		}
	}
];
