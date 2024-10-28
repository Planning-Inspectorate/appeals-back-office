/** @typedef {import("../../../../../../appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */

import { simpleHtmlComponent } from '#lib/mappers/components/html.js';

/**
 * @param {string} originalRepresentation
 * @returns {string}
 */
const generateOriginalRepresentationMarkup = (originalRepresentation) => `
<p>${originalRepresentation}</p>
`;

const originalSubheadingMarkup = `
<h3>	
  Original comment
</h3>
`;

/**
 * @param {Representation} comment
 * @returns {PageComponent[]}
 */
export const originalComment = (comment) => [
	simpleHtmlComponent(originalSubheadingMarkup),
	simpleHtmlComponent(generateOriginalRepresentationMarkup(comment.originalRepresentation))
];
