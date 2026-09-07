/**
 * @param {string} backLinkUrl
 * @param {string} [inviteMainPartyComments]
 * @returns {PageContent}
 */
export function inviteMainPartyCommentsPage(backLinkUrl, inviteMainPartyComments) {
	/** @type {PageContent} */
	return {
		title: 'Do you want to invite comments from main parties on this document?',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl,
		heading: 'Do you want to invite comments from main parties on this document?',
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'invite-main-party-comments',
					idPrefix: 'invite-main-party-comments',
					value: inviteMainPartyComments || null,
					items: [
						{ text: 'Yes', value: 'yes' },
						{ text: 'No', value: 'no' }
					]
				}
			}
		],
		submitButtonText: 'Continue',
		submitButtonProperties: {
			text: 'Continue',
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
