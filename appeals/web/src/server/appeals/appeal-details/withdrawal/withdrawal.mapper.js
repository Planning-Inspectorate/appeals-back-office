import { capitalize } from 'lodash-es';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { buildNotificationBanners } from '#lib/mappers/notification-banners.mapper.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { APPEAL_VIRUS_CHECK_STATUS } from 'pins-data-model';
import {
	folderPathToFolderNameText,
	getDocumentsForVirusStatus,
	mapDocumentDownloadUrl,
	mapFolderDocumentInformationHtmlProperty
} from '../../appeal-documents/appeal-documents.mapper.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('./withdrawal.types.js').WithdrawalRequest} WithdrawalRequest
 * @typedef {import('@pins/appeals.api').Api.DocumentVersionAuditEntry} DocumentVersionAuditEntry
 * @typedef {import('@pins/appeals.api').Appeals.DocumentInfo} DocumentInfo
 * @typedef {import('@pins/appeals.api').Appeals.DocumentVersionInfo} DocumentVersionInfo
 * @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo
 * @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} RedactionStatus
 * @typedef {import('#lib/nunjucks-template-builders/tag-builders.js').HtmlLink} HtmlLink
 * @typedef {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfoItem} FileUploadInfoItem
 */

/**
 * @param {string} backLinkUrl
 * @param {FolderInfo} folder
 * @param {string} withdrawalRequestDate
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} [pageHeadingTextOverride]
 * @returns {PageContent}
 */
export function manageWithdrawalRequestFolderPage(
	backLinkUrl,
	folder,
	withdrawalRequestDate,
	request,
	pageHeadingTextOverride
) {
	if (getDocumentsForVirusStatus(folder, APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED).length > 0) {
		addNotificationBannerToSession(
			request.session,
			'notCheckedDocument',
			parseInt(folder.caseId.toString(), 10),
			`<p class="govuk-notification-banner__heading">Virus scan in progress</p></br><a class="govuk-notification-banner__link" href="${request.originalUrl}">Refresh page to see if scan has finished</a>`
		);
	}

	const notificationBannerComponents = buildNotificationBanners(
		request.session,
		'manageFolder',
		parseInt(folder.caseId.toString(), 10)
	);

	/** @type {PageComponent[]} */
	const errorSummaryPageComponents = [];
	const documentsWithFailedVirusCheck = getDocumentsForVirusStatus(
		folder,
		APPEAL_VIRUS_CHECK_STATUS.AFFECTED
	);

	if (documentsWithFailedVirusCheck.length > 0) {
		errorSummaryPageComponents.push({
			type: 'error-summary',
			parameters: {
				titleText: 'There is a problem',
				errorList: [
					{
						text: 'One or more files in this folder contains a virus. Upload a different version of each document that contains a virus.',
						href: '#documents-table'
					}
				]
			}
		});
	}

	/** @type {PageContent} */
	const pageContent = {
		title: 'Manage folder',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl?.replace('{{folderId}}', folder.folderId.toString()),
		preHeading: 'Manage folder',
		heading: pageHeadingTextOverride || `${folderPathToFolderNameText(folder.path)} documents`,
		pageComponents: [
			...notificationBannerComponents,
			...errorSummaryPageComponents,
			{
				type: 'table',
				parameters: {
					head: [
						{
							text: 'Name'
						},
						{
							text: 'Request date'
						},
						{
							text: 'Redaction status'
						},
						{
							text: 'Actions'
						}
					],
					attributes: {
						id: 'documents-table'
					},
					rows: (folder?.documents || []).map((document) => [
						mapFolderDocumentInformationHtmlProperty(folder, document),
						{
							text: dateISOStringToDisplayDate(withdrawalRequestDate)
						},
						{
							text: document?.latestDocumentVersion?.redactionStatus
						},
						{
							html:
								document?.id &&
								document?.name &&
								document?.latestDocumentVersion?.virusCheckStatus &&
								document?.latestDocumentVersion?.virusCheckStatus ===
									APPEAL_VIRUS_CHECK_STATUS.SCANNED
									? `<a class="govuk-link" href="${mapDocumentDownloadUrl(
											folder.caseId,
											document.id,
											document.name
									  )}" target="_blank">View<span class="govuk-visually-hidden"> document</span></a>`.trim()
									: ''
						}
					])
				}
			}
		]
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @param {string} withdrawalRequestDay
 * @param {string} withdrawalRequestMonth
 * @param {string} withdrawalRequestYear
 * @returns {PageContent}
 */
export function dateWithdrawalRequestPage(
	appealData,
	withdrawalRequestDay,
	withdrawalRequestMonth,
	withdrawalRequestYear
) {
	const title = 'Date of withdrawal request';

	/** @type {PageComponent} */
	const selectDateComponent = {
		type: 'date-input',
		parameters: {
			id: 'withdrawal-request-date',
			namePrefix: 'withdrawal-request-date',
			fieldset: {
				legend: {
					text: 'Enter date',
					classes: 'govuk-fieldset__legend--m'
				}
			},
			hint: {
				text: 'For example, 27 11 2023'
			},
			items: [
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
					name: 'day',
					value: withdrawalRequestDay || ''
				},
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
					name: 'month',
					value: withdrawalRequestMonth || ''
				},
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-4',
					name: 'year',
					value: withdrawalRequestYear || ''
				}
			]
		}
	};

	return {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/withdrawal/start`,
		backLinkText: 'Back',
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: title,
		pageComponents: [
			{
				type: 'hint',
				parameters: {
					text: 'This is the date on the withdrawal correspondence from the appellant'
				}
			},
			selectDateComponent
		]
	};
}

/**
 *
 * @param {Appeal} appealDetails
 * @param {RedactionStatus[] | undefined} redactionStatuses
 * @param {WithdrawalRequest} withdrawal
 * @returns {PageContent}
 */
export function withdrawalDocumentRedactionStatusPage(
	appealDetails,
	redactionStatuses,
	withdrawal
) {
	const redactionStatusesItems = redactionStatuses?.map((redactionStatus) => ({
		value: redactionStatus.name.toLowerCase(),
		text: redactionStatus.name,
		checked: withdrawal?.redactionStatus === redactionStatus.name.toLowerCase()
	}));

	// if redaction status isn't set then pre-set it to 'unredacted' by default if available
	if (!withdrawal?.redactionStatus && redactionStatusesItems) {
		const redactionStatusesDefaultIndex = redactionStatusesItems?.findIndex(
			(redactionStatusItem) => redactionStatusItem.value === 'unredacted'
		);

		if (redactionStatusesDefaultIndex && redactionStatusesItems[redactionStatusesDefaultIndex]) {
			redactionStatusesItems[redactionStatusesDefaultIndex].checked = true;
		}
	}

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `What is the redaction status of this document? - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/withdrawal/withdrawal-request-date`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'What is the redaction status of this document?',
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'withdrawal-redaction-status',
					items: redactionStatusesItems
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {PageContent}
 */
export function checkAndConfirmPage(appealData, session) {
	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Withdrawal request'
					},
					value: {
						text: session.fileUploadInfo?.files[0]?.name
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealData.appealId}/withdrawal/start`
							}
						]
					}
				},
				{
					key: {
						text: 'Request date'
					},
					value: {
						text: dateISOStringToDisplayDate(session.withdrawal?.withdrawalRequestDate)
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealData.appealId}/withdrawal/withdrawal-request-date`
							}
						]
					}
				},
				{
					key: {
						text: 'Redaction status'
					},
					value: {
						text: capitalize(session.withdrawal?.redactionStatus)
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealData.appealId}/withdrawal/redaction-status`
							}
						]
					}
				}
			]
		}
	};

	/** @type {PageComponent} */
	const warningTextComponent = {
		type: 'warning-text',
		parameters: {
			text: 'You are about to tell the relevant parties the appeal has been withdrawn and it is being closed. Any appointments for this case should be cancelled. Only limited changes can be made to the case once it is closed.'
		}
	};

	/** @type {PageComponent} */
	const insetConfirmComponent = {
		type: 'checkboxes',
		parameters: {
			name: 'confirm-withdrawal',
			items: [
				{
					text: 'The relevant parties can be informed of the appeal withdrawal',
					value: 'yes',
					checked: false
				}
			]
		}
	};

	const title = 'Check your answers';
	const pageContent = {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/withdrawal/withdrawal-request-date`,
		backLinkText: 'Back',
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: title,
		submitButtonText: 'Confirm',
		pageComponents: [summaryListComponent, warningTextComponent, insetConfirmComponent]
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @returns {PageContent}
 */
export function withdrawalConfirmationPage(appealData) {
	const title = 'Appeal withdrawn';

	/** @type {PageContent} */
	const pageContent = {
		title,
		pageComponents: [
			{
				type: 'panel',
				parameters: {
					titleText: title,
					headingLevel: 1,
					html: `Appeal reference<br><strong>${appealShortReference(
						appealData.appealReference
					)}</strong>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: '<p class="govuk-body">The case has been closed. The relevant parties have been informed.</p>'
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body"><a href="/appeals-service/appeal-details/${appealData.appealId}" class="govuk-link">Go back to case details</a></p>`
				}
			}
		]
	};

	return pageContent;
}
