import { capitalize } from 'lodash-es';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	mapNotificationBannersFromSession,
	createNotificationBanner,
	sortNotificationBanners,
	dateInput
} from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { APPEAL_VIRUS_CHECK_STATUS } from '@planning-inspectorate/data-model';
import {
	folderPathToFolderNameText,
	getDocumentsForVirusStatus,
	mapDocumentDownloadUrl,
	mapFolderDocumentInformationHtmlProperty,
	mapRedactionStatusKeyToName,
	mapUncommittedDocumentDownloadUrl
} from '../../appeal-documents/appeal-documents.mapper.js';
import { dateFieldNamePrefix } from './withdrawl.constants.js';

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
 * @param {string|number} appealId
 * @param {string} backLinkUrl
 * @param {FolderInfo} folder
 * @param {string} withdrawalRequestDate
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} [pageHeadingTextOverride]
 * @returns {PageContent}
 */
export function manageWithdrawalRequestFolderPage(
	appealId,
	backLinkUrl,
	folder,
	withdrawalRequestDate,
	request,
	pageHeadingTextOverride
) {
	const notificationBanners = mapNotificationBannersFromSession(
		request.session,
		'manageFolder',
		parseInt(folder.caseId.toString(), 10)
	);

	if (getDocumentsForVirusStatus(folder, APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED).length > 0) {
		notificationBanners.unshift(
			createNotificationBanner({ bannerDefinitionKey: 'notCheckedDocument' })
		);
	}

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
			...sortNotificationBanners(notificationBanners),
			...errorSummaryPageComponents,
			{
				type: 'table',
				wrapperHtml: {
					opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
					closing: '</div></div>'
				},
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
							text: mapRedactionStatusKeyToName(document?.latestDocumentVersion?.redactionStatus)
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
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function dateWithdrawalRequestPage(
	appealData,
	withdrawalRequestDay,
	withdrawalRequestMonth,
	withdrawalRequestYear,
	errors
) {
	const title = 'Date of withdrawal request';

	// /** @type {PageComponent} */
	const selectDateComponent = dateInput({
		name: dateFieldNamePrefix,
		id: dateFieldNamePrefix,
		namePrefix: dateFieldNamePrefix,
		value: {
			day: withdrawalRequestDay,
			month: withdrawalRequestMonth,
			year: withdrawalRequestYear
		},
		legendText: 'Enter date',
		hint: 'For example, 27 3 2023',
		errors: errors
	});

	return {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/withdrawal/start`,
		backLinkText: 'Back',
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: title,
		prePageComponents: [
			{
				type: 'hint',
				parameters: {
					text: 'This is the date on the withdrawal correspondence from the appellant'
				}
			}
		],
		pageComponents: [selectDateComponent]
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
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'withdrawal-redaction-status',
					idPrefix: 'withdrawal-redaction-status',
					fieldset: {
						legend: {
							text: 'What is the redaction status of this document?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
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
	const uncommittedFile = session.fileUploadInfo?.files[0];

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
						html: `<a class="govuk-link" href="${mapUncommittedDocumentDownloadUrl(
							appealData.appealReference,
							uncommittedFile.GUID,
							uncommittedFile.name
						)}" target="_blank">${uncommittedFile.name}</a>`
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealData.appealId}/withdrawal/start`,
								visuallyHiddenText: 'withdrawal request'
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
								href: `/appeals-service/appeal-details/${appealData.appealId}/withdrawal/withdrawal-request-date`,
								visuallyHiddenText: 'request date'
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
								href: `/appeals-service/appeal-details/${appealData.appealId}/withdrawal/redaction-status`,
								visuallyHiddenText: 'redaction status'
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
			idPrefix: 'confirm-withdrawal',
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
		prePageComponents: [summaryListComponent, warningTextComponent],
		pageComponents: [insetConfirmComponent]
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}
