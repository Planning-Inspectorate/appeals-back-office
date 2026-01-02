import { appealShortReference } from '#lib/appeals-formatter.js';
import { ensureArray } from '#lib/array-utilities.js';
import { buttonComponent, simpleHtmlComponent, wrapComponents } from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { newLine2LineBreak } from '#lib/string-utilities.js';
import { checkRedactedText } from '#lib/validators/redacted-text.validator.js';
import {
	APPEAL_REPRESENTATION_STATUS,
	REVERT_BUTTON_TEXT
} from '@pins/appeals/constants/common.js';
import { redactInput } from '../../common/components/redact-input.js';
import { getAttachmentList } from '../../common/document-attachment-list.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */
/** @typedef {import('../../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} rule6PartyStatement
 * @param {string} rule6PartyId
 * @param {import('express-session').Session & Record<string, string> & { redactRule6PartyStatement?: { redactedRepresentation: string, rule6PartyStatementId: number, allocationLevelAndSpecialisms: string, allocationLevel: string, allocationSpecialisms: string[] } }} [session]
 * @returns {PageContent}
 */
export function redactRule6PartyStatementPage(
	appealDetails,
	rule6PartyStatement,
	rule6PartyId,
	session
) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	if (
		session &&
		session.redactRule6PartyStatement?.rule6PartyStatementId !== rule6PartyStatement.id
	) {
		delete session.redactRule6PartyStatement;
	}

	/** @type {PageComponent[]} */
	const pageComponents = [
		wrapComponents(
			[
				simpleHtmlComponent(
					'p',
					{
						class: 'govuk-body govuk-!-margin-bottom-0'
					},
					'Original statement:'
				),
				{
					type: 'inset-text',
					parameters: {
						html: newLine2LineBreak(rule6PartyStatement.originalRepresentation),
						id: 'original-comment',
						classes: 'govuk-!-margin-top-2'
					}
				},
				...redactInput({
					representation: rule6PartyStatement,
					labelText: 'Redacted statement',
					session,
					redactedRepresentation: session?.redactRule6PartyStatement?.redactedRepresentation,
					buttonText: REVERT_BUTTON_TEXT.RULE_6_PARTY_STATEMENT
				}),
				buttonComponent(
					'Continue',
					{ type: 'submit' },
					{
						wrapperHtml: {
							opening: '<div class="govuk-button-group">',
							closing: '</div>'
						}
					}
				)
			],
			{
				opening:
					'<div class="govuk-grid-row"><form method="POST" class="govuk-grid-column-two-thirds">',
				closing: '</form></div>'
			}
		)
	];

	preRenderPageComponents(pageComponents);

	return {
		title: `Redact ${rule6PartyStatement.author} statement`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Redact ${rule6PartyStatement.author} statement`,
		pageComponents
	};
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} rule6PartyStatement
 * @param {import('#lib/api/allocation-details.api.js').AllocationDetailsSpecialism[]} specialismData
 * @param {string} rule6PartyId
 * @param {SessionWithAuth & { redactRule6PartyStatement?: { redactedRepresentation: string, allocationLevelAndSpecialisms: string, allocationLevel: string, allocationSpecialisms: string[], forcedAllocation: boolean } }} session
 * @returns {PageContent}
 */
export function redactConfirmPage(
	appealDetails,
	rule6PartyStatement,
	specialismData,
	rule6PartyId,
	session
) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const sessionData = session.redactRule6PartyStatement;
	const updatingAllocation = sessionData?.allocationLevelAndSpecialisms === 'yes';

	const specialisms = (() => {
		if (!sessionData?.allocationSpecialisms) {
			return [];
		}

		const items = ensureArray(sessionData.allocationSpecialisms);

		return items.map((item) => specialismData.find((s) => s.id === parseInt(item))?.name);
	})();

	const attachmentsList = getAttachmentList(rule6PartyStatement);

	const folderId =
		rule6PartyStatement.attachments?.[0]?.documentVersion?.document?.folderId ?? null;

	//check if the redacted statement is the same as the original
	const shouldShowRedactedRow = checkRedactedText(
		rule6PartyStatement.originalRepresentation,
		session?.redactRule6PartyStatement?.redactedRepresentation
	);
	const isPublished = rule6PartyStatement.status === APPEAL_REPRESENTATION_STATUS.PUBLISHED;

	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			type: 'summary-list',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				rows: [
					{
						key: { text: shouldShowRedactedRow ? 'Original statement' : 'Statement' },
						value: {
							html: '',
							pageComponents: [
								{
									type: 'show-more',
									parameters: {
										html: newLine2LineBreak(rule6PartyStatement.originalRepresentation)
									}
								}
							]
						},

						...(!shouldShowRedactedRow && {
							actions: {
								items: [
									{
										href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/redact`,
										text: 'Redact',
										visuallyHiddenText: 'Redact statement'
									}
								]
							}
						})
					},
					...(shouldShowRedactedRow
						? [
								{
									key: { text: 'Redacted statement' },
									value: {
										html: '',
										pageComponents: [
											{
												type: 'show-more',
												parameters: {
													text: session?.redactRule6PartyStatement?.redactedRepresentation
												}
											}
										]
									},
									actions: {
										items: [
											{
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/redact`,
												text: 'Change',
												visuallyHiddenText: 'redacted statement'
											}
										]
									}
								}
						  ]
						: []),

					...(isPublished
						? []
						: [
								{
									key: { text: 'Supporting documents' },
									value: attachmentsList ? { html: attachmentsList } : { text: 'Not provided' },
									actions: {
										items: [
											...(rule6PartyStatement.attachments?.length > 0
												? [
														{
															text: 'Manage',
															href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/manage-documents/${folderId}?backUrl=/rule-6-party-statement/redact/confirm`,
															visuallyHiddenText: 'supporting documents'
														}
												  ]
												: []),
											{
												text: 'Add',
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/add-document?backUrl=/rule-6-party-statement/redact/confirm`,
												visuallyHiddenText: 'supporting documents'
											}
										]
									}
								},
								{
									key: { text: 'Review decision' },
									value: {
										text: shouldShowRedactedRow ? 'Redact and accept statement' : 'Accept statement'
									},
									actions: {
										items: [
											{
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}`,
												text: 'Change',
												visuallyHiddenText: 'review decision'
											}
										]
									}
								},
								...(sessionData?.forcedAllocation
									? []
									: [
											{
												key: {
													text: 'Do you need to update the allocation level and specialisms?'
												},
												value: { text: updatingAllocation ? 'Yes' : 'No' },
												actions: {
													items: [
														{
															text: 'Change',
															href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/redact/allocation-check`,
															visuallyHiddenText: 'allocation level and specialisms'
														}
													]
												}
											}
									  ]),
								...(sessionData?.allocationLevel && specialisms.length
									? [
											{
												key: { text: 'Allocation level' },
												value: { text: sessionData.allocationLevel },
												actions: {
													items: [
														{
															text: 'Change',
															href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/redact/allocation-level`,
															visuallyHiddenText: 'allocation level'
														}
													]
												}
											},
											{
												key: { text: 'Allocation specialisms' },
												value: {
													html:
														specialisms.length === 1
															? specialisms[0]
															: `<ul class="govuk-list govuk-list--bullet">
												${specialisms.map((s) => `<li>${s}</li>`).join('')}
											</ul>`
												},
												actions: {
													items: [
														{
															text: 'Change',
															href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/redact/allocation-specialisms`,
															visuallyHiddenText: 'allocation specialisms'
														}
													]
												}
											}
									  ]
									: [])
						  ])
				]
			}
		}
	];

	preRenderPageComponents(pageComponents);

	return {
		title: shouldShowRedactedRow ? 'Check details and accept statement' : 'Accept statement',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/redact`,
		preHeading: `Appeal ${shortReference}`,
		heading: shouldShowRedactedRow ? 'Check details and accept statement' : 'Accept statement',
		forceRenderSubmitButton: true,
		submitButtonText: shouldShowRedactedRow ? 'Redact and accept statement' : 'Accept statement',
		pageComponents
	};
}
