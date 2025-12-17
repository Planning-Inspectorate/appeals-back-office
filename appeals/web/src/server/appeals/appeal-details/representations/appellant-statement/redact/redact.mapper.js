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
 * @param {Representation} appellantStatement
 * @param {import('express-session').Session & Record<string, string> & { redactAppellantStatement?: { redactedRepresentation: string, appellantStatementId: number, allocationLevelAndSpecialisms: string, allocationLevel: string, allocationSpecialisms: string[] } }} [session]
 * @returns {PageContent}
 */
export function redactAppellantStatementPage(appealDetails, appellantStatement, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	if (session && session.redactAppellantStatement?.appellantStatementId !== appellantStatement.id) {
		delete session.redactAppellantStatement;
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
						html: newLine2LineBreak(appellantStatement.originalRepresentation),
						id: 'original-comment',
						classes: 'govuk-!-margin-top-2'
					}
				},
				...redactInput({
					representation: appellantStatement,
					labelText: 'Redacted statement',
					session,
					redactedRepresentation: session?.redactAppellantStatement?.redactedRepresentation,
					buttonText: REVERT_BUTTON_TEXT.APPELLANT_STATEMENT
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
		title: 'Redact Appellant statement',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Redact Appellant statement',
		pageComponents
	};
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} appellantStatement
 * @param {import('#lib/api/allocation-details.api.js').AllocationDetailsSpecialism[]} specialismData
 * @param {SessionWithAuth & { redactAppellantStatement?: { redactedRepresentation: string, allocationLevelAndSpecialisms: string, allocationLevel: string, allocationSpecialisms: string[], forcedAllocation: boolean } }} session
 * @returns {PageContent}
 */
export function redactConfirmPage(appealDetails, appellantStatement, specialismData, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const sessionData = session.redactAppellantStatement;
	const updatingAllocation = sessionData?.allocationLevelAndSpecialisms === 'yes';

	const specialisms = (() => {
		if (!sessionData?.allocationSpecialisms) {
			return [];
		}

		const items = ensureArray(sessionData.allocationSpecialisms);

		return items.map((item) => specialismData.find((s) => s.id === parseInt(item))?.name);
	})();

	const attachmentsList = getAttachmentList(appellantStatement);

	const folderId = appellantStatement.attachments?.[0]?.documentVersion?.document?.folderId ?? null;

	//check if the redacted statement is the same as the original
	const shouldShowRedactedRow = checkRedactedText(
		appellantStatement.originalRepresentation,
		session?.redactAppellantStatement?.redactedRepresentation
	);
	const isPublished = appellantStatement.status === APPEAL_REPRESENTATION_STATUS.PUBLISHED;

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
										html: newLine2LineBreak(appellantStatement.originalRepresentation)
									}
								}
							]
						},

						...(!shouldShowRedactedRow && {
							actions: {
								items: [
									{
										href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement/redact`,
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
													text: session?.redactAppellantStatement?.redactedRepresentation
												}
											}
										]
									},
									actions: {
										items: [
											{
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement/redact`,
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
											...(appellantStatement.attachments?.length > 0
												? [
														{
															text: 'Manage',
															href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement/manage-documents/${folderId}?backUrl=/appellant-statement/redact/confirm`,
															visuallyHiddenText: 'supporting documents'
														}
												  ]
												: []),
											{
												text: 'Add',
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement/add-document?backUrl=/appellant-statement/redact/confirm`,
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
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement`,
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
															href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement/valid/allocation-check`,
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
															href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement/valid/allocation-level`,
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
															href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement/valid/allocation-specialisms`,
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
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement/redact`,
		preHeading: `Appeal ${shortReference}`,
		heading: shouldShowRedactedRow ? 'Check details and accept statement' : 'Accept statement',
		forceRenderSubmitButton: true,
		submitButtonText: shouldShowRedactedRow ? 'Redact and accept statement' : 'Accept statement',
		pageComponents
	};
}
