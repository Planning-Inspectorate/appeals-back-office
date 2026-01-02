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
 * @param {Representation} rule6PartyStatement
 * @param {{ isReview: boolean }} options
 * @param {string} rule6PartyId
 * @returns {PageComponent}
 * */
export function baseSummaryList(appealId, rule6PartyStatement, { isReview }, rule6PartyId) {
	const filteredAttachments = rule6PartyStatement.attachments?.filter((attachment) => {
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

	const folderId =
		rule6PartyStatement.attachments?.[0]?.documentVersion?.document?.folderId ?? null;
	//check if the redacted statement is the same as the original - if it is the same onlyt show original statement
	const shouldShowRedactedRow = checkRedactedText(
		rule6PartyStatement.originalRepresentation,
		rule6PartyStatement.redactedRepresentation
	);
	/** @type {PageComponent} */
	const rule6PartyStatementSummaryList = {
		type: 'summary-list',
		parameters: {
			rows: [
				...(rule6PartyStatement.redactedRepresentation && shouldShowRedactedRow
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
												html: newLine2LineBreak(rule6PartyStatement.originalRepresentation),
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
												html: newLine2LineBreak(rule6PartyStatement.redactedRepresentation),
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
														href: `/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/redact`,
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
												html: newLine2LineBreak(rule6PartyStatement.originalRepresentation),
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
														href: `/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/redact`,
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
											href: `/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/manage-documents/${folderId}`,
											visuallyHiddenText: 'supporting documents'
										}
								  ]
								: []),
							{
								text: 'Add',
								href: `/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/add-document`,
								visuallyHiddenText: 'supporting documents'
							}
						]
					}
				}
			]
		}
	};

	return rule6PartyStatementSummaryList;
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} rule6PartyStatement
 * @param {import('express-session').Session & Partial<import('express-session').SessionData>} session
 * @param {string | undefined} backUrl
 * @param {string} rule6PartyId
 * @returns {PageContent}
 * */
export function viewRule6PartyStatementPage(
	appealDetails,
	rule6PartyStatement,
	session,
	backUrl,
	rule6PartyId
) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const rule6PartyStatementSummaryList = baseSummaryList(
		appealDetails.appealId,
		rule6PartyStatement,
		{
			isReview: false
		},
		rule6PartyId
	);

	const pageComponents = [
		...mapNotificationBannersFromSession(session, 'rule6PartyStatement', appealDetails.appealId),
		rule6PartyStatementSummaryList
	];
	preRenderPageComponents(pageComponents);

	const pageContent = {
		title: `${rule6PartyStatement.author} statement`,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortReference}`,
		heading: `${rule6PartyStatement.author} statement`,
		pageComponents
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} rule6PartyStatement
 * @param {import('express-session').Session & Partial<import('express-session').SessionData>} session
 * @param {string | undefined} backUrl
 * @param {string} rule6PartyId
 * @returns {PageContent}
 */
export function reviewRule6PartyStatementPage(
	appealDetails,
	rule6PartyStatement,
	session,
	backUrl,
	rule6PartyId
) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const rule6PartyStatementSummaryList = baseSummaryList(
		appealDetails.appealId,
		rule6PartyStatement,
		{
			isReview: true
		},
		rule6PartyId
	);

	const { status } = session.rule6PartyStatement?.[appealDetails.appealId] ?? {};

	/** @type {PageComponent} */
	const rule6PartyStatementValidityRadioButtons = {
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
				rule6PartyStatement.originalRepresentation
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
		...mapNotificationBannersFromSession(session, 'rule6PartyStatement', appealDetails.appealId),
		rule6PartyStatementSummaryList
	];
	preRenderPageComponents(prePageComponents);

	const pageContent = {
		title: `Review ${rule6PartyStatement.author} statement`,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Review ${rule6PartyStatement.author} statement`,
		submitButtonText: 'Continue',
		formWrapperColumnClass: 'govuk-grid-column-two-thirds',
		prePageComponents,
		pageComponents: [rule6PartyStatementValidityRadioButtons]
	};

	return pageContent;
}
