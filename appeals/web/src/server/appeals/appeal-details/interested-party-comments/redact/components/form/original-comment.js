/** @typedef {import("#appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */

import { simpleHtmlComponent } from '#lib/mappers/components/html.js';

/**
 * @param {string} originalRepresentation
 * @returns {string}
 */
const generateOriginalRepresentationMarkup = (originalRepresentation) => `
<p class="govuk-body">${originalRepresentation}</p>
`;

/**
 * @param {Representation} comment
 * @returns {PageComponent[]}
 */
export const originalComment = (comment) => [
	simpleHtmlComponent(`
    <h3>	
      Original comment
    </h3>
`),
	simpleHtmlComponent(generateOriginalRepresentationMarkup(comment.originalRepresentation))
];
