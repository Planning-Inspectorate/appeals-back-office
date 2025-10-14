import { appealShortReference } from '#lib/appeals-formatter.js';
import { ensureArray } from '#lib/array-utilities.js';
import { buttonComponent, simpleHtmlComponent, wrapComponents } from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { newLine2LineBreak } from '#lib/string-utilities.js';
import { checkRedactedText } from '#lib/validators/redacted-text.validator.js';
import { REVERT_BUTTON_TEXT } from '@pins/appeals/constants/common.js';
import { redactInput } from '../../../representations/common/components/redact-input.js';
import { getAttachmentList } from '../../common/document-attachment-list.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */
/** @typedef {import('../../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} lpaStatement
 * @param {import('express-session').Session & Record<string, string> & { redactLPAStatement?: { redactedRepresentation: string, lpaStatementId: number, allocationLevelAndSpecialisms: string, allocationLevel: string, allocationSpecialisms: string[] } }} [session]
 * @returns {PageContent}
 */
export function redactLpaStatementPage(appealDetails, lpaStatement, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	if (session && session.redactLPAStatement?.lpaStatementId !== lpaStatement.id) {
		delete session.redactLPAStatement;
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
						html: newLine2LineBreak(lpaStatement.originalRepresentation),
						id: 'original-comment',
						classes: 'govuk-!-margin-top-2'
					}
				},
				...redactInput({
					representation: lpaStatement,
					labelText: 'Redacted statement',
					session,
					redactedRepresentation: session?.redactLPAStatement?.redactedRepresentation,
					buttonText: REVERT_BUTTON_TEXT.LPA_STATEMENT
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
		title: 'Redact LPA statement',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Redact LPA statement',
		pageComponents
	};
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} lpaStatement
 * @param {import('#lib/api/allocation-details.api.js').AllocationDetailsSpecialism[]} specialismData
 * @param {SessionWithAuth & { redactLPAStatement?: { redactedRepresentation: string, allocationLevelAndSpecialisms: string, allocationLevel: string, allocationSpecialisms: string[], forcedAllocation: boolean } }} session
 * @returns {PageContent}
 */
export function redactConfirmPage(appealDetails, lpaStatement, specialismData, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const sessionData = session.redactLPAStatement;
	const updatingAllocation = sessionData?.allocationLevelAndSpecialisms === 'yes';

	const specialisms = (() => {
		if (!sessionData?.allocationSpecialisms) {
			return [];
		}

		const items = ensureArray(sessionData.allocationSpecialisms);

		return items.map((item) => specialismData.find((s) => s.id === parseInt(item))?.name);
	})();

	const attachmentsList = getAttachmentList(lpaStatement);

	const folderId = lpaStatement.attachments?.[0]?.documentVersion?.document?.folderId ?? null;

	//check if the redacted statement is the same as the original
	const shouldShowRedactedRow = checkRedactedText(
		lpaStatement.originalRepresentation,
		session?.redactLPAStatement?.redactedRepresentation
	);
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
										html: newLine2LineBreak(lpaStatement.originalRepresentation)
									}
								}
							]
						},

						...(!shouldShowRedactedRow && {
							actions: {
								items: [
									{
										href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/redact`,
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
												parameters: { text: session?.redactLPAStatement?.redactedRepresentation }
											}
										]
									},
									actions: {
										items: [
											{
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/redact`,
												text: 'Change',
												visuallyHiddenText: 'redacted statement'
											}
										]
									}
								}
						  ]
						: []),
					{
						key: { text: 'Supporting documents' },
						value: attachmentsList ? { html: attachmentsList } : { text: 'Not provided' },
						actions: {
							items: [
								...(lpaStatement.attachments?.length > 0
									? [
											{
												text: 'Manage',
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/manage-documents/${folderId}?backUrl=/lpa-statement/redact/confirm`,
												visuallyHiddenText: 'supporting documents'
											}
									  ]
									: []),
								{
									text: 'Add',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/add-document?backUrl=/lpa-statement/redact/confirm`,
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
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement`,
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
									key: { text: 'Do you need to update the allocation level and specialisms?' },
									value: { text: updatingAllocation ? 'Yes' : 'No' },
									actions: {
										items: [
											{
												text: 'Change',
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-check`,
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
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-level`,
												visuallyHiddenText: 'allocation level'
											}
										]
									}
								},
								{
									key: { text: 'Allocation specialisms' },
									value: {
										html: `<ul class="govuk-list govuk-list--bullet">
                    ${specialisms.map((s) => `<li>${s}</li>`).join('')}
                  </ul>`
									},
									actions: {
										items: [
											{
												text: 'Change',
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-specialisms`,
												visuallyHiddenText: 'allocation specialisms'
											}
										]
									}
								}
						  ]
						: [])
				]
			}
		}
	];

	preRenderPageComponents(pageComponents);

	return {
		title: shouldShowRedactedRow ? 'Check details and accept statement' : 'Accept statement',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/redact`,
		preHeading: `Appeal ${shortReference}`,
		heading: shouldShowRedactedRow ? 'Check details and accept statement' : 'Accept statement',
		forceRenderSubmitButton: true,
		submitButtonText: shouldShowRedactedRow ? 'Redact and accept statement' : 'Accept statement',
		pageComponents
	};
}
