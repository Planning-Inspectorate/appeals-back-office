import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} lpaStatement
 * @returns {PageContent}
 */
export function reviewLpaStatementPage(appealDetails, lpaStatement) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const attachmentsList =
		lpaStatement.attachments.length > 0
			? buildHtmUnorderedList(
					lpaStatement.attachments.map(
						(a) => `<a class="govuk-link" href="#">${a.documentVersion.document.name}</a>`
					)
			  )
			: null;

	/** @type {PageComponent} */
	const lpaStatementSummaryList = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			rows: [
				{
					key: { text: 'Statement' },
					value: {
						html: '',
						pageComponents: [
							{
								type: 'show-more',
								parameters: {
									text: lpaStatement.originalRepresentation,
									labelText: 'Statement'
								}
							}
						]
					}
				},
				{
					key: { text: 'Supporting documents' },
					value: attachmentsList ? { html: attachmentsList } : { text: 'Not provided' },
					actions: {
						items: [
							...(lpaStatement.attachments?.length > 0
								? [
										{
											text: 'Manage',
											href: `#`,
											visuallyHiddenText: 'supporting documents'
										}
								  ]
								: []),
							{
								text: 'Add',
								href: `#`,
								visuallyHiddenText: 'supporting documents'
							}
						]
					}
				}
			]
		}
	};

	/** @type {PageComponent} */
	const lpaStatementValidityRadioButtons = {
		type: 'radios',
		parameters: {
			name: 'status',
			idPrefix: 'status',
			fieldset: {
				legend: {
					text: 'Review decision',
					isPageHeading: false,
					classes: 'govuk-fieldset__legend--m'
				}
			},
			items: [
				{
					value: COMMENT_STATUS.VALID,
					text: 'Accept statement',
					checked: lpaStatement?.status === COMMENT_STATUS.VALID
				},
				{
					value: COMMENT_STATUS.VALID_REQUIRES_REDACTION,
					text: 'Redact and accept statement',
					checked: false // This status isn't persisted so will always be unchecked
				},

				{
					value: COMMENT_STATUS.INCOMPLETE,
					text: 'Statement incomplete',
					checked: lpaStatement?.status === COMMENT_STATUS.INCOMPLETE
				}
			]
		}
	};

	const pageComponents = [lpaStatementSummaryList, lpaStatementValidityRadioButtons];
	preRenderPageComponents(pageComponents);

	const pageContent = {
		title: 'Review LPA statement',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Review LPA statement',
		headingClasses: 'govuk-heading-l',
		submitButtonText: 'continue',
		pageComponents
	};

	return pageContent;
}