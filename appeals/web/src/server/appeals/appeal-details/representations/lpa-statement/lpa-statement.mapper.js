import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { mapNotificationBannersFromSession } from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { newLine2LineBreak } from '#lib/string-utilities.js';
import { checkRedactedText } from '#lib/validators/redacted-text.validator.js';
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
	const filteredAttachments = lpaStatement.attachments?.filter((attachment) => {
		const { isDeleted, latestVersionId } = attachment?.documentVersion?.document ?? {};
		return latestVersionId === attachment.version && !isDeleted;
	});

	const attachmentsList = filteredAttachments?.length
		? buildHtmlList({
				items: filteredAttachments.map(
					(a) =>
						`<a class="govuk-link" href="${mapDocumentDownloadUrl(
							a.documentVersion.document.caseId,
							a.documentVersion.document.guid,
							a.documentVersion.document.name
						)}" target="_blank">${a.documentVersion.document.name}</a>`
				),
				isOrderedList: true,
				isNumberedList: filteredAttachments.length > 1
		  })
		: null;

	const folderId = lpaStatement.attachments?.[0]?.documentVersion?.document?.folderId ?? null;
	//check if the redacted statement is the same as the original - if it is the same onlyt show original statement
	const shouldShowRedactedRow = checkRedactedText(
		lpaStatement.originalRepresentation,
		lpaStatement.redactedRepresentation
	);
	/** @type {PageComponent} */
	const lpaStatementSummaryList = {
		type: 'summary-list',
		parameters: {
			rows: [
				...(lpaStatement.redactedRepresentation && shouldShowRedactedRow
					? [
							{
								key: { text: 'Original statement' },
								classes: 'govuk-summary-list__row--no-actions',
								value: {
									html: '',
									pageComponents: [
										{
											type: 'show-more',
											parameters: {
												html: newLine2LineBreak(lpaStatement.originalRepresentation),
												labelText: 'Original statement'
											}
										}
									]
								}
							},
							{
								key: { text: 'Redacted statement' },
								classes: isReview ? 'govuk-summary-list__row--no-actions' : '',
								value: {
									html: '',
									pageComponents: [
										{
											type: 'show-more',
											parameters: {
												html: newLine2LineBreak(lpaStatement.redactedRepresentation),
												labelText: 'Redacted statement'
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
														visuallyHiddenText: 'statement'
													}
											  ])
									]
								}
							}
					  ]
					: [
							{
								key: { text: 'Statement' },
								classes: isReview ? 'govuk-summary-list__row--no-actions' : '',
								value: {
									html: '',
									pageComponents: [
										{
											type: 'show-more',
											parameters: {
												html: newLine2LineBreak(lpaStatement.originalRepresentation),
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
														visuallyHiddenText: 'statement'
													}
											  ])
									]
								}
							}
					  ]),
				{
					key: { text: 'Supporting documents' },
					value: attachmentsList ? { html: attachmentsList } : { text: 'No documents' },
					actions: {
						items: [
							...(filteredAttachments.length > 0
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
 * @param {string | undefined} backUrl
 * @returns {PageContent}
 * */
export function viewLpaStatementPage(appealDetails, lpaStatement, session, backUrl) {
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
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
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
 * @param {string | undefined} backUrl
 * @returns {PageContent}
 */
export function reviewLpaStatementPage(appealDetails, lpaStatement, session, backUrl) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const lpaStatementSummaryList = baseSummaryList(appealDetails.appealId, lpaStatement, {
		isReview: true
	});

	const { status } = session.lpaStatement?.[appealDetails.appealId] ?? {};

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
					checked: status === COMMENT_STATUS.VALID
				},
				lpaStatement.originalRepresentation
					? {
							value: COMMENT_STATUS.VALID_REQUIRES_REDACTION,
							text: 'Redact and accept statement'
					  }
					: undefined,
				{
					value: COMMENT_STATUS.INCOMPLETE,
					text: 'Statement incomplete',
					checked: status === COMMENT_STATUS.INCOMPLETE
				}
			]
		}
	};

	const prePageComponents = [
		...mapNotificationBannersFromSession(session, 'lpaStatement', appealDetails.appealId),
		lpaStatementSummaryList
	];
	preRenderPageComponents(prePageComponents);

	const pageContent = {
		title: 'Review LPA statement',
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Review LPA statement',
		submitButtonText: 'Continue',
		formWrapperColumnClass: 'govuk-grid-column-two-thirds',
		prePageComponents,
		pageComponents: [lpaStatementValidityRadioButtons]
	};

	return pageContent;
}
