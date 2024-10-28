import { appealShortReference } from '#lib/appeals-formatter.js';
import { simpleHtmlComponent } from '#lib/mappers/components/html.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/** @typedef {import("../../../../appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../../../../appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */

const subtitleMarkup = `
<h2>	
  Make redactions
</h2>
`;

const instructionsListMarkup = `
<ol class="govuk-list govuk-list--number">
  <li>
    Use the ‘redacted comment’ box to select the words you want to redact.
  </li>
  <li>
    Select ‘redact’ to confirm your redaction. Repeat until you have finished.  
  </li>
  <li>
    Select ‘continue’ when you have finished redacting.
  </li>
</ol>
`;

/**
 * @param {string} originalRepresentation
 * @returns {string}
 */
const generateOriginalRepresentationMarkup = (originalRepresentation) => `
<p>${originalRepresentation}</p>
`;

const redactedSubheadingMarkup = `
<h3>	
  Redacted comment
</h3>
`;

const originalSubheadingMarkup = `
<h3>	
  Original comment
</h3>
`;

const formStartMarkup = `<form method="POST">`;
const formEndMarkup = `</form>`;

/**
 * @param {PageComponent[]} pageComponents
 * @param {PageComponent['wrapperHtml']} wrapperHtml
 */
const wrapComponents = (pageComponents, wrapperHtml) => ({
	type: 'html',
	wrapperHtml,
	parameters: {
		html: '',
		pageComponents
	}
});

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @returns {PageContent}
 */
export const redactInterestedPartyCommentPage = (appealDetails, comment) => {
	const shortReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent[]} */
	const pageComponents = [
		simpleHtmlComponent(subtitleMarkup),
		simpleHtmlComponent(instructionsListMarkup),
		{
			type: 'html',
			wrapperHtml: {
				opening: formStartMarkup,
				closing: formEndMarkup
			},
			parameters: {
				html: '',
				pageComponents: [
					simpleHtmlComponent(redactedSubheadingMarkup),
					{
						type: 'textarea',
						parameters: {
							name: 'redactedRepresentation',
							id: 'redact-textarea',
							value: comment.redactedRepresentation || comment.originalRepresentation
						}
					},
					simpleHtmlComponent(originalSubheadingMarkup),
					simpleHtmlComponent(generateOriginalRepresentationMarkup(comment.originalRepresentation)),
					{
						type: 'button',
						parameters: {
							text: 'Redact',
							id: 'redact-button',
							classes: 'govuk-button--secondary'
						},
						wrapperHtml: {
							opening: '<div class="govuk-button-group">',
							closing: '</div>'
						}
					},
					{
						type: 'button',
						parameters: {
							text: 'Confirm',
							type: 'submit'
						}
					}
				]
			}
		}
	];

	/** @type {PageContent} */
	const pageContent = {
		title: 'Redact comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/${comment.id}/review`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Redact comment from ${comment.author}`,
		headingClasses: 'govuk-heading-l',
		pageComponents: pageComponents
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
};
