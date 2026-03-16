import { mapUncommittedDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { editLink } from '#lib/edit-utilities.js';
import { simpleHtmlComponent } from '#lib/mappers/components/page-components/html.js';
import { listOrOnlyItem } from '#lib/mappers/components/page-components/list-or-only-item.js';

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appeal
 * @param {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfoItem[]} uncommittedFiles
 * @param {string} appellantNotifyPreview
 * @param {string} lpaNotifyPreview
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export const enforcementNoticeWithdrawalCheckDetailsPage = (
	appeal,
	uncommittedFiles = [],
	appellantNotifyPreview,
	lpaNotifyPreview,
	backLinkUrl
) => {
	const cancelUrl = `/appeals-service/appeal-details/${appeal.appealId}/cancel`;

	const fileLinks = uncommittedFiles.map((file) => {
		const url = mapUncommittedDocumentDownloadUrl(appeal.appealReference, file.GUID, file.name);
		return `<a class="govuk-link" href="${url}" target="_blank">${file.name}</a>`;
	});

	/** @type {SummaryListPageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Why are you cancelling the appeal?'
					},
					value: {
						text: 'LPA has withdrawn the enforcement notice'
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: editLink(cancelUrl),
								visuallyHiddenText: 'cancellation reason',
								attributes: {
									'data-cy': 'change-cancellation-reason'
								}
							}
						]
					}
				},
				{
					key: {
						text: 'LPA enforcement notice withdrawal'
					},
					value: {
						html: listOrOnlyItem(fileLinks, 'None', '')
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: editLink(cancelUrl, 'enforcement-notice-withdrawal'),
								visuallyHiddenText: 'LPA enforcement notice withdrawal documents',
								attributes: {
									'data-cy': 'change-enforcement-notice-withdrawal-documents'
								}
							}
						]
					}
				}
			]
		}
	};

	/**
	 * @param {string} summaryText
	 * @param {string} html
	 * @returns {PageComponent}
	 */
	const notifyPreviewComponent = (summaryText, html) => {
		return {
			type: 'details',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				summaryText,
				html
			}
		};
	};

	const hintTextComponent = simpleHtmlComponent(
		'p',
		{
			id: 'enforcement-notice-withdrawal-hint',
			class: 'govuk-body govuk-!-margin-bottom-6'
		},
		'We will withdraw the enforcement notice and send an email to the relevant parties.'
	);

	return {
		title: 'Check your answers',
		backLinkUrl,
		preHeading: `Appeal ${appealShortReference(appeal.appealReference)}`,
		heading: 'Check details and withdraw enforcement notice',
		pageComponents: [
			summaryListComponent,
			notifyPreviewComponent('Preview email to appellant', appellantNotifyPreview),
			notifyPreviewComponent('Preview email to LPA', lpaNotifyPreview),
			hintTextComponent
		],
		submitButtonProperties: {
			id: 'withdraw-enforcement-notice',
			text: 'Withdraw enforcement notice'
		}
	};
};
