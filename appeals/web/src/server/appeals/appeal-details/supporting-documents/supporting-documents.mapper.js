/**
 * @param {string} backLinkUrl
 * @param {string} [selectedInviteResponses]
 * @returns {PageContent}
 */
export function inviteResponsesPage(backLinkUrl, selectedInviteResponses) {
	/** @type {PageContent} */
	return {
		title: 'Do you want to invite responses?',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl,
		heading: 'Do you want to invite responses?',
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'invite-responses',
					idPrefix: 'invite-responses',
					value: selectedInviteResponses || null,
					items: [
						{ text: 'Yes', value: 'yes' },
						{ text: 'No', value: 'no' }
					]
				}
			}
		],
		submitButtonText: 'Confirm and share document',
		submitButtonProperties: {
			text: 'Confirm and share document',
			type: 'submit'
		}
	};
}

/**
 * @param {string} backLinkUrl
 * @param {import('@pins/appeals.api').Appeals.DocumentVersionInfo} documentVersion
 * @param {string} [inviteResponses]
 * @param {{renderedHtml: string}|null} notifyPreview
 * * @returns {PageContent}
 */
export function shareDocumentCheckAndConfirmPage(
	backLinkUrl,
	documentVersion,
	notifyPreview,
	inviteResponses
) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Check your answers',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl,
		heading: `Confirm you want to share ${documentVersion.originalFilename} with the main parties`,
		pageComponents: [],
		submitButtonText: 'Confirm and share document',
		submitButtonProperties: {
			text: 'Confirm and share document',
			type: 'submit'
		}
	};

	if (inviteResponses) {
		pageContent.pageComponents?.push({
			type: 'summary-list',
			parameters: {
				rows: [
					{
						key: {
							text: 'Do you want to invite responses?'
						},
						value: {
							text: inviteResponses === 'yes' ? 'Yes' : 'No'
						},
						actions: {
							items: [
								{
									text: 'Change',
									href: backLinkUrl,
									visuallyHiddenText: 'invite responses answer'
								}
							]
						}
					}
				]
			}
		});
	}

	if (notifyPreview) {
		pageContent.pageComponents?.push({
			type: 'details',
			parameters: {
				summaryText: 'Preview email to LPA and appellant',
				html: notifyPreview.renderedHtml
			}
		});
	}

	return pageContent;
}
