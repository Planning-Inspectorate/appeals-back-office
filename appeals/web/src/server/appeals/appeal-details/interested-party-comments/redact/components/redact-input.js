import { simpleHtmlComponent } from '#lib/mappers/index.js';

/** @typedef {import("#appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */

/**
 * @param {Representation} comment
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageComponent[]}
 */
export const redactInput = (comment, session) => [
	simpleHtmlComponent('h3', {}, 'Redacted comment'),
	{
		type: 'textarea',
		parameters: {
			name: 'redactedRepresentation',
			id: 'redact-textarea',
			value:
				session?.redactedRepresentation ||
				comment.redactedRepresentation ||
				comment.originalRepresentation
		}
	}
];
