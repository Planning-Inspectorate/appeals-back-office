import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { mapNotificationBannersFromSession } from '#lib/mappers/index.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {number} appealId
 * @param {Representation} lpaStatement
 * @param {{ isReview: boolean }} options
 * @returns {PageComponent}
 * */
export function baseSummaryList(appealId, lpaStatement, { isReview }) {
	const attachmentsList =
		lpaStatement.attachments.length > 0
			? buildHtmUnorderedList(
					lpaStatement.attachments.map(
						(a) => `<a class="govuk-link" href="#">${a.documentVersion.document.name}</a>`
					)
			  )
			: null;

	const folderId = lpaStatement.attachments?.[0]?.documentVersion?.document?.folderId ?? null;

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
									text: lpaStatement.redactedRepresentation || lpaStatement.originalRepresentation,
									labelText: 'Statement'
								}
							}
						]
					},
					actions: {
						items: [
							...(isReview
								? []
								: [
										{
											text: 'Redact',
											href: `/appeals-service/appeal-details/${appealId}/lpa-statement/redact`,
											visuallyHiddenText: 'redact statement'
										}
								  ])
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
											href: `/appeals-service/appeal-details/${appealId}/lpa-statement/manage-documents/${folderId}`,
											visuallyHiddenText: 'supporting documents'
										}
								  ]
								: []),
							{
								text: 'Add',
								href: `/appeals-service/appeal-details/${appealId}/lpa-statement/add-document`,
								visuallyHiddenText: 'supporting documents'
							}
						]
					}
				}
			]
		}
	};

	return lpaStatementSummaryList;
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} lpaStatement
 * @param {import('express-session').Session & Partial<import('express-session').SessionData>} session
 * @returns {PageContent}
 * */
export function viewLpaStatementPage(appealDetails, lpaStatement, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const lpaStatementSummaryList = baseSummaryList(appealDetails.appealId, lpaStatement, {
		isReview: false
	});

	const pageComponents = [
		...mapNotificationBannersFromSession(session, 'lpaStatement', appealDetails.appealId),
		lpaStatementSummaryList
	];
	preRenderPageComponents(pageComponents);

	const pageContent = {
		title: 'LPA statement',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'LPA statement',
		pageComponents
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} lpaStatement
 * @param {import('express-session').Session & Partial<import('express-session').SessionData>} session
 * @returns {PageContent}
 */
export function reviewLpaStatementPage(appealDetails, lpaStatement, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const lpaStatementSummaryList = baseSummaryList(appealDetails.appealId, lpaStatement, {
		isReview: true
	});

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
					checked: session.lpaStatement?.status === COMMENT_STATUS.VALID
				},
				{
					value: COMMENT_STATUS.VALID_REQUIRES_REDACTION,
					text: 'Redact and accept statement'
				},

				{
					value: COMMENT_STATUS.INCOMPLETE,
					text: 'Statement incomplete',
					checked: session.lpaStatement?.status === COMMENT_STATUS.INCOMPLETE
				}
			]
		}
	};

	const pageComponents = [
		...mapNotificationBannersFromSession(session, 'lpaStatement', appealDetails.appealId),
		lpaStatementSummaryList,
		lpaStatementValidityRadioButtons
	];
	preRenderPageComponents(pageComponents);

	const pageContent = {
		title: 'Review LPA statement',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Review LPA statement',
		submitButtonText: 'Continue',
		pageComponents
	};

	return pageContent;
}
