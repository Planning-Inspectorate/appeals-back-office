import { appealShortReference } from '#lib/appeals-formatter.js';
import config from '@pins/appeals.web/environment/config.js';
import { capitalize } from 'lodash-es';
import {
	dayMonthYearToApiDateString,
	dateToDisplayDate,
	dateToDisplayTime,
	apiDateStringToDayMonthYear,
	apiDateStringToDisplayDate
} from '#lib/dates.js';
import { kilobyte, megabyte, gigabyte } from '#appeals/appeal.constants.js';
import { buildNotificationBanners } from '#lib/mappers/notification-banners.mapper.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { surnameFirstToFullName } from '#lib/person-name-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { redactionStatusIdToName } from '#lib/redaction-statuses.js';
import { AVSCAN_STATUS } from '@pins/appeals/constants/documents.js';
import { REDACTION_STATUS } from '@pins/appeals/constants/documents.js';

/**
 * @typedef {import('../appeal-details/appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo
 * @typedef {import('@pins/appeals.api').Appeals.DocumentInfo} DocumentInfo
 * @typedef {import('@pins/appeals.api').Appeals.DocumentVersionInfo} DocumentVersionInfo
 * @typedef {import('#lib/nunjucks-template-builders/tag-builders.js').HtmlLink} HtmlLink
 * @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} RedactionStatus
 * @typedef {import('@pins/appeals.api').Api.DocumentVersionAuditEntry} DocumentVersionAuditEntry
 * @typedef {import('#lib/ts-utilities.js').FileUploadInfoItem} FileUploadInfoItem
 */

/**
 * @param {string} appealId
 * @param {string} appealReference
 * @param {string} folderId
 * @param {string} folderPath
 * @param {string} documentId
 * @param {string} documentName
 * @param {number} latestVersion
 * @param {string} backButtonUrl
 * @param {string|undefined} nextPageUrl
 * @param {boolean} isLateEntry
 * @param {any} session
 * @param {import('@pins/express').ValidationErrors|undefined} errors
 * @param {string} [pageHeadingTextOverride]
 * @param {PageComponent[]} [pageBodyComponents]
 * @param {boolean} [allowMultipleFiles]
 * @param {string} [documentType]
 * @returns {Promise<import('#appeals/appeal-documents/appeal-documents.types.js').DocumentUploadPageParameters>}
 */
export async function documentUploadPage(
	appealId,
	appealReference,
	folderId,
	folderPath,
	documentId,
	documentName,
	latestVersion,
	backButtonUrl,
	nextPageUrl,
	isLateEntry,
	session,
	errors,
	pageHeadingTextOverride,
	pageBodyComponents = [],
	allowMultipleFiles,
	documentType
) {
	const isAdditionalDocument = folderPath.split('/')[1] === 'appellantCaseCorrespondence';
	const pageHeadingText =
		pageHeadingTextOverride || mapAddDocumentsPageHeading(isAdditionalDocument, documentId);
	const pathComponents = folderPath.split('/');
	const documentStage = pathComponents[0];
	const documentTypeComputed = documentType || pathComponents[1];
	const { fileUploadInfo } = session;

	return {
		backButtonUrl: backButtonUrl?.replace('{{folderId}}', folderId),
		appealId,
		appealReference,
		folderId: folderId,
		documentId,
		documentOriginalFileName: documentName,
		documentVersion: latestVersion,
		useBlobEmulator: config.useBlobEmulator,
		...(fileUploadInfo && {
			uncommittedFiles: JSON.stringify({
				files: fileUploadInfo.map(
					(/** @type {FileUploadInfoItem} */ infoItem) => infoItem.blobStoreUrl
				)
			})
		}),
		blobStorageHost:
			config.useBlobEmulator === true ? config.blobEmulatorSasUrl : config.blobStorageUrl,
		blobStorageContainer: config.blobStorageDefaultContainer,
		multiple: documentId ? false : allowMultipleFiles || false,
		documentStage: documentStage,
		serviceName: documentName || pageHeadingText,
		pageTitle: pageHeadingTextOverride || 'Upload documents',
		appealShortReference: appealShortReference(appealReference),
		pageHeadingText,
		pageBodyComponents,
		documentType: documentTypeComputed,
		nextPageUrl:
			nextPageUrl?.replace('{{folderId}}', folderId) ||
			backButtonUrl?.replace('{{folderId}}', folderId),
		displayLateEntryContent: isAdditionalDocument && isLateEntry,
		displayCorrectFolderConfirmationContent: isAdditionalDocument && !isLateEntry,
		errors
	};
}

/**
 * @param {string|number} appealId
 * @param {string} documentId
 * @param {number} [documentVersion]
 */
export const mapDocumentDownloadUrl = (appealId, documentId, documentVersion) => {
	if (documentVersion) {
		return `/documents/${appealId}/download/${documentId}/${documentVersion}/preview/`;
	}
	return `/documents/${appealId}/download/${documentId}/preview/`;
};

/**
 * @param {string|null|undefined} fileName
 * @returns {string}
 */
const mapDocumentFileNameToFileExtension = (fileName) => {
	if (!fileName) {
		return '';
	}

	const nameFragments = fileName.split('.');

	return nameFragments[nameFragments.length - 1].toUpperCase();
};

/**
 * @param {number|null|undefined} fileSize
 * @returns {string}
 */
const mapDocumentSizeToFileSizeString = (fileSize) => {
	if (!fileSize) {
		return '';
	}

	if (fileSize < kilobyte) {
		return `${fileSize} bytes`;
	} else if (fileSize < megabyte) {
		return `${Math.round(fileSize / kilobyte)} KB`;
	} else if (fileSize < gigabyte) {
		return `${(fileSize / megabyte).toFixed(1)} MB`;
	} else {
		return `${(fileSize / gigabyte).toFixed(2)} GB`;
	}
};

/**
 *
 * @param {DocumentInfo|undefined} document
 * @returns {string}
 */
const mapDocumentFileTypeAndSize = (document) => {
	if (!document?.latestDocumentVersion) {
		return '';
	}

	return `${mapDocumentFileNameToFileExtension(document.name)}, ${mapDocumentSizeToFileSizeString(
		Number(document.latestDocumentVersion?.size)
	)}`;
};

/**
 * @typedef {Object} DocumentVirusCheckStatus
 * @property {boolean} checked
 * @property {boolean} safe
 * @property {string} manageFolderPageActionText
 * @property {string} [statusText]
 */

/**
 * @param {string} virusCheckStatus
 * @returns {DocumentVirusCheckStatus}
 */
export function mapVirusCheckStatus(virusCheckStatus) {
	/** @type {DocumentVirusCheckStatus} */
	const result = {
		checked: false,
		safe: false,
		manageFolderPageActionText: 'Edit'
	};

	switch (virusCheckStatus) {
		case AVSCAN_STATUS.SCANNED:
			result.checked = true;
			result.safe = true;
			result.manageFolderPageActionText = 'View and edit';
			break;
		case AVSCAN_STATUS.AFFECTED:
			result.checked = true;
			result.statusText = 'virus_detected';
			result.manageFolderPageActionText = 'Edit or remove';
			break;
		case AVSCAN_STATUS.NOT_SCANNED:
		default:
			result.statusText = 'virus_scanning';
			break;
	}

	return result;
}

/**
 * @param {DocumentInfo} document
 * @returns {DocumentVirusCheckStatus}
 */
export function mapDocumentInfoVirusCheckStatus(document) {
	return mapVirusCheckStatus(
		document.latestDocumentVersion?.virusCheckStatus ||
			document?.latestDocumentVersion?.virusCheckStatus
	);
}

/**
 * @param {DocumentVersionInfo|undefined} document
 * @returns {DocumentVirusCheckStatus}
 */
export function mapDocumentVersionDetailsVirusCheckStatus(document) {
	return mapVirusCheckStatus(document?.virusCheckStatus || AVSCAN_STATUS.NOT_SCANNED);
}

/**
 * @param {boolean} isAdditionalDocument
 * @param {string} [documentId]
 * @returns {string}
 */
export function mapAddDocumentsPageHeading(isAdditionalDocument, documentId) {
	const isExistingDocument = !!documentId;

	if (isAdditionalDocument) {
		return isExistingDocument ? 'Update additional document' : 'Add additional documents';
	} else if (isExistingDocument) {
		return 'Upload an updated document';
	}

	return 'Upload documents';
}

/**
 * @param {string} backLinkUrl
 * @param {FolderInfo} folder - API type needs to be updated here (should be Folder, but there are worse problems with that type)
 * @param {FileUploadInfoItem[]} uploadInfo
 * @param {Object<string, any>} bodyItems
 * @param {RedactionStatus[]} redactionStatuses
 * @param {string} [pageHeadingTextOverride]
 * @returns {PageContent}
 */
export function addDocumentDetailsPage(
	backLinkUrl,
	folder,
	uploadInfo,
	bodyItems,
	redactionStatuses,
	pageHeadingTextOverride
) {
	/** @type {PageContent} */
	const pageContent = {
		title: pageHeadingTextOverride || 'Add document details',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl?.replace('{{folderId}}', folder.folderId.toString()),
		preHeading: 'Add document details',
		heading: pageHeadingTextOverride || `${folderPathToFolderNameText(folder.path)} documents`,
		pageComponents: uploadInfo.flatMap((uploadInfoItem, index) => {
			return mapFileUploadInfoItemToDocumentDetailsPageComponents(
				uploadInfo,
				uploadInfoItem,
				bodyItems,
				index,
				redactionStatuses
			);
		})
	};

	return pageContent;
}

/**
 * @param {FileUploadInfoItem[]} uploadInfo
 * @param {FileUploadInfoItem} uploadInfoItem
 * @param {Object<string, any>} bodyItems
 * @param {number} index
 * @param {RedactionStatus[]} redactionStatuses
 * @returns {PageComponent[]}
 */
function mapFileUploadInfoItemToDocumentDetailsPageComponents(
	uploadInfo,
	uploadInfoItem,
	bodyItems,
	index,
	redactionStatuses
) {
	const receivedDateDayMonthYear = apiDateStringToDayMonthYear(uploadInfoItem.receivedDate);
	const bodyItem = bodyItems?.find(
		(/** @type {{ documentId: string; }} */ item) => item.documentId === uploadInfoItem.GUID
	);
	const bodyRecievedDateDay = bodyItem?.receivedDate?.day;
	const bodyRecievedDateMonth = bodyItem?.receivedDate?.month;
	const bodyRecievedDateYear = bodyItem?.receivedDate?.year;
	const bodyRedactionStatus = bodyItem?.redactionStatus;

	return [
		{
			wrapperHtml: {
				opening: `<div class="govuk-form-group"><h2 class="govuk-heading-m">${uploadInfoItem.name}</h2>`,
				closing: ''
			},
			type: 'input',
			parameters: {
				type: 'hidden',
				name: `items[${index}][documentId]`,
				value: uploadInfoItem.GUID
			}
		},
		{
			type: 'date-input',
			parameters: {
				id: `items[${index}]receivedDate`,
				namePrefix: `items[${index}][receivedDate]`,
				fieldset: {
					legend: {
						text: 'Date received'
					}
				},
				items: [
					{
						classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
						id: `items[${index}].receivedDate.day`,
						name: '[day]',
						label: 'Day',
						value:
							(bodyRecievedDateDay !== undefined
								? bodyRecievedDateDay
								: receivedDateDayMonthYear?.day) || ''
					},
					{
						classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
						id: `items[${index}].receivedDate.month`,
						name: '[month]',
						label: 'Month',
						value:
							(bodyRecievedDateMonth !== undefined
								? bodyRecievedDateMonth
								: receivedDateDayMonthYear?.month) || ''
					},
					{
						classes: 'govuk-input govuk-date-input__input govuk-input--width-4',
						id: `items[${index}].receivedDate.year`,
						name: '[year]',
						label: 'Year',
						value:
							(bodyRecievedDateYear !== undefined
								? bodyRecievedDateYear
								: receivedDateDayMonthYear?.year) || ''
					}
				]
			}
		},
		{
			wrapperHtml: {
				opening: '',
				closing:
					index < uploadInfo.length - 1 ? '<hr class="govuk-!-margin-top-7"></div>' : '</div>'
			},
			type: 'radios',
			parameters: {
				name: `items[${index}][redactionStatus]`,
				fieldset: {
					legend: {
						text: 'Redaction status'
					}
				},
				items: [
					{
						text: 'Redacted',
						value: 'redacted',
						checked:
							(bodyRedactionStatus
								? bodyRedactionStatus
								: redactionStatusIdToName(redactionStatuses, uploadInfoItem.redactionStatus)) ===
							'redacted'
					},
					{
						text: 'Unredacted',
						value: 'unredacted',
						checked:
							(bodyRedactionStatus
								? bodyRedactionStatus
								: redactionStatusIdToName(redactionStatuses, uploadInfoItem.redactionStatus)) ===
							'unredacted'
					},
					{
						divider: 'Or'
					},
					{
						text: 'No redaction required',
						value: 'no redaction required',
						checked:
							(bodyRedactionStatus
								? bodyRedactionStatus
								: redactionStatusIdToName(redactionStatuses, uploadInfoItem.redactionStatus)) ===
							'no redaction required'
					}
				]
			}
		}
	];
}

/**
 * @param {DocumentVersionInfo} item
 * @param {RedactionStatus[]} redactionStatuses
 * @returns {PageComponent[]}
 */
function mapDocumentDetailsItemToDocumentDetailsPageComponents(item, redactionStatuses) {
	const dateReceived = apiDateStringToDayMonthYear(item.dateReceived);
	const bodyRecievedDateDay = dateReceived?.day;
	const bodyRecievedDateMonth = dateReceived?.month;
	const bodyRecievedDateYear = dateReceived?.year;
	const bodyRedactionStatus = item?.redactionStatus;

	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			wrapperHtml: {
				opening: `<div class="govuk-form-group"><h2 class="govuk-heading-m">${item.originalFilename}</h2>`,
				closing: ''
			},
			type: 'input',
			parameters: {
				type: 'hidden',
				name: `items[0][documentId]`,
				value: item.documentId
			}
		},
		{
			type: 'date-input',
			parameters: {
				id: `items[0]receivedDate`,
				namePrefix: `items[0][receivedDate]`,
				fieldset: {
					legend: {
						text: 'Date received'
					}
				},
				items: [
					{
						classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
						id: `items[0].receivedDate.day`,
						name: '[day]',
						label: 'Day',
						value: bodyRecievedDateDay || ''
					},
					{
						classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
						id: `items[0].receivedDate.month`,
						name: '[month]',
						label: 'Month',
						value: bodyRecievedDateMonth || ''
					},
					{
						classes: 'govuk-input govuk-date-input__input govuk-input--width-4',
						id: `items[0].receivedDate.year`,
						name: '[year]',
						label: 'Year',
						value: bodyRecievedDateYear || ''
					}
				]
			}
		},
		{
			wrapperHtml: {
				opening: '',
				closing: '</div>'
			},
			type: 'radios',
			parameters: {
				name: `items[0][redactionStatus]`,
				fieldset: {
					legend: {
						text: 'Redaction status'
					}
				},
				items: [
					{
						text: 'Redacted',
						value: 'redacted',
						checked:
							bodyRedactionStatus ===
							redactionStatuses.find((status) => status.key === REDACTION_STATUS.REDACTED)?.name
					},
					{
						text: 'Unredacted',
						value: 'unredacted',
						checked:
							bodyRedactionStatus ===
							redactionStatuses.find((status) => status.key === REDACTION_STATUS.UNREDACTED)?.name
					},
					{
						divider: 'Or'
					},
					{
						text: 'No redaction required',
						value: 'no redaction required',
						checked:
							bodyRedactionStatus ===
							redactionStatuses.find(
								(status) => status.key === REDACTION_STATUS.NO_REDACTION_REQUIRED
							)?.name
					}
				]
			}
		}
	];

	return pageComponents;
}

/**
 * @param {string} backLinkUrl
 * @param {string} appealReference
 * @param {FileUploadInfoItem[]} fileUploadInfo
 * @param {RedactionStatus[]} redactionStatuses
 * @returns {PageContent}
 */
export function addDocumentsCheckAndConfirmPage(
	backLinkUrl,
	appealReference,
	fileUploadInfo,
	redactionStatuses
) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Check your answers',
		backLinkUrl,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Check your answers',
		pageComponents: [
			{
				type: 'table',
				parameters: {
					head: [{ text: 'Name' }, { text: 'Received' }, { text: 'Redaction status' }],
					rows: fileUploadInfo.map((/** @type {FileUploadInfoItem} */ infoItem) => [
						{
							text: infoItem.name
						},
						{
							text: apiDateStringToDisplayDate(infoItem.receivedDate)
						},
						{
							text: capitalize(redactionStatusIdToName(redactionStatuses, infoItem.redactionStatus))
						}
					]),
					firstCellIsHeader: false
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {FolderInfo} folder
 * @param {DocumentInfo} document
 * @returns {HtmlProperty & ClassesProperty}
 */
function mapFolderDocumentInformationHtmlProperty(folder, document) {
	/** @type {HtmlProperty} */
	const htmlProperty = {
		html: '',
		pageComponents: []
	};

	if (document?.id) {
		const linkWrapperHtml = {
			opening: '<div class="govuk-!-margin-bottom-4">',
			closing: '</div>'
		};
		const virusCheckStatus = mapDocumentInfoVirusCheckStatus(document);

		if (virusCheckStatus.checked && virusCheckStatus.safe) {
			htmlProperty.pageComponents.push({
				type: 'html',
				wrapperHtml: linkWrapperHtml,
				parameters: {
					html: `<a class="govuk-link" href="${mapDocumentDownloadUrl(
						folder.caseId,
						document.id
					)}">${document.name || ''}</a>`.trim()
				}
			});
		} else {
			htmlProperty.pageComponents.push({
				type: 'html',
				wrapperHtml: linkWrapperHtml,
				parameters: {
					html: `<span class="govuk-body">${document.name || ''}</span>`.trim()
				}
			});
		}

		htmlProperty.pageComponents.push({
			type: 'html',
			parameters: {
				html: `<dl class="govuk-body govuk-!-font-size-16 pins-inline-definition-list"><dt>File type and size:&nbsp;</dt><dd>${mapDocumentFileTypeAndSize(
					document
				)}</dd></dl>`.trim()
			}
		});

		if (!virusCheckStatus.safe) {
			htmlProperty.pageComponents.push({
				type: 'status-tag',
				wrapperHtml: {
					opening: '<div class="govuk-!-margin-bottom-4">',
					closing: '</div>'
				},
				parameters: {
					status: virusCheckStatus.statusText || ''
				}
			});
		}
	}

	return htmlProperty;
}

/**
 * @param {FolderInfo} folder
 * @param {DocumentInfo} document
 * @param {string} viewAndEditUrl
 * @returns {HtmlProperty & ClassesProperty}
 */
function mapFolderDocumentActionsHtmlProperty(folder, document, viewAndEditUrl) {
	/** @type {HtmlProperty} */
	const htmlProperty = {
		html: ''
	};

	if (document?.id) {
		const virusCheckStatus = mapDocumentInfoVirusCheckStatus(document);
		htmlProperty.html = `<a href="${viewAndEditUrl
			.replace('{{folderId}}', folder.folderId.toString())
			.replace('{{documentId}}', document.id)}" class="govuk-link">${
			virusCheckStatus.manageFolderPageActionText
		} <span class="govuk-visually-hidden">${document.name}</span></a>`;
	}

	return htmlProperty;
}

/**
 * @param {string} backLinkUrl
 * @param {string} viewAndEditUrl
 * @param {FolderInfo} folder - API type needs to be updated (should be Folder, but there are worse problems with that type)
 * @param {RedactionStatus[]} redactionStatuses
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} [pageHeadingTextOverride]
 * @returns {PageContent}
 */
export function manageFolderPage(
	backLinkUrl,
	viewAndEditUrl,
	folder,
	redactionStatuses,
	request,
	pageHeadingTextOverride
) {
	if (getDocumentsForVirusStatus(folder, AVSCAN_STATUS.NOT_SCANNED).length > 0) {
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
	const documentsWithFailedVirusCheck = getDocumentsForVirusStatus(folder, AVSCAN_STATUS.AFFECTED);

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
							text: 'Date received'
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
						document?.latestDocumentVersion?.isLateEntry
							? {
									html: '',
									pageComponents: [
										{
											wrapperHtml: {
												opening: '<div>',
												closing: '</div>'
											},
											type: 'html',
											parameters: {
												html: dateToDisplayDate(document?.latestDocumentVersion?.dateReceived)
											}
										},
										{
											wrapperHtml: {
												opening: '<div class="govuk-!-margin-top-3">',
												closing: '</div>'
											},
											type: 'status-tag',
											parameters: {
												status: 'late_entry'
											}
										}
									]
							  }
							: {
									text: dateToDisplayDate(document?.latestDocumentVersion?.dateReceived)
							  },
						{
							text: document?.latestDocumentVersion?.redactionStatus
						},
						mapFolderDocumentActionsHtmlProperty(folder, document, viewAndEditUrl)
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
 * @param {DocumentInfo} document
 * @param {DocumentVersionInfo|undefined} documentVersion
 * @returns {HtmlProperty & ClassesProperty}
 */
function mapVersionDocumentInformationHtmlProperty(document, documentVersion) {
	/** @type {HtmlProperty} */
	const htmlProperty = {
		html: '',
		pageComponents: []
	};

	if (!documentVersion) {
		return htmlProperty;
	}

	const linkWrapperHtml = {
		opening: '<div class="govuk-!-margin-bottom-2">',
		closing: '</div>'
	};
	const virusCheckStatus = mapDocumentVersionDetailsVirusCheckStatus(documentVersion);

	if (virusCheckStatus.checked && virusCheckStatus.safe) {
		htmlProperty.pageComponents.push({
			type: 'html',
			wrapperHtml: linkWrapperHtml,
			parameters: {
				html:
					document &&
					documentVersion &&
					!documentVersion.isDeleted &&
					document?.caseId &&
					document?.id
						? `<a class="govuk-link" href="${mapDocumentDownloadUrl(
								document?.caseId,
								document.id
						  )}">${document.name || ''}</a>`
						: document.name || ''
			}
		});
	} else {
		htmlProperty.pageComponents.push({
			type: 'html',
			wrapperHtml: linkWrapperHtml,
			parameters: {
				html: `<span class="govuk-body">${document.name || ''}</span>`.trim()
			}
		});
	}

	if (!virusCheckStatus.safe) {
		htmlProperty.pageComponents.push({
			type: 'status-tag',
			wrapperHtml: {
				opening: '<div class="govuk-!-margin-bottom-1">',
				closing: '</div>'
			},
			parameters: {
				status: virusCheckStatus.statusText || ''
			}
		});
	}

	return htmlProperty;
}

/**
 * @param {DocumentInfo} document
 * @param {DocumentVersionInfo} documentVersion
 * @returns {HtmlProperty & ClassesProperty}
 */
function mapDocumentNameHtmlProperty(document, documentVersion) {
	/** @type {HtmlProperty} */
	const htmlProperty = {
		html: '',
		pageComponents: []
	};
	const virusCheckStatus = mapDocumentVersionDetailsVirusCheckStatus(documentVersion);
	const linkWrapperHtml = {
		opening: '<div class="govuk-!-margin-bottom-2">',
		closing: '</div>'
	};

	if (virusCheckStatus.checked && virusCheckStatus.safe) {
		htmlProperty.pageComponents.push({
			type: 'html',
			wrapperHtml: linkWrapperHtml,
			parameters: {
				html:
					document &&
					documentVersion &&
					!documentVersion.isDeleted &&
					document?.caseId &&
					document?.id
						? `<a class="govuk-link" href="${mapDocumentDownloadUrl(
								document.caseId,
								document.id,
								documentVersion.version
						  )}">${documentVersion.originalFilename || ''}</a>`
						: documentVersion.originalFilename || ''
			}
		});
	} else {
		htmlProperty.pageComponents.push({
			type: 'html',
			wrapperHtml: linkWrapperHtml,
			parameters: {
				html: `<span class="govuk-body">${documentVersion.originalFilename || ''}</span>`.trim()
			}
		});
	}

	if (
		typeof documentVersion.version === 'number' &&
		documentVersion.version === document.latestDocumentVersion?.version
	) {
		htmlProperty.pageComponents.push({
			type: 'html',
			parameters: {
				html: `<strong class="govuk-tag govuk-tag--blue single-line govuk-!-margin-bottom-2">CURRENT VERSION</strong>`
			}
		});
	}

	if (!virusCheckStatus.safe) {
		htmlProperty.pageComponents.push({
			type: 'status-tag',
			wrapperHtml: {
				opening: '<div class="govuk-!-margin-bottom-2">',
				closing: '</div>'
			},
			parameters: {
				status: virusCheckStatus.statusText || ''
			}
		});
	}

	if (documentVersion.isLateEntry) {
		htmlProperty.pageComponents.push({
			type: 'status-tag',
			wrapperHtml: {
				opening: '<div class="govuk-!-margin-bottom-2">',
				closing: '</div>'
			},
			parameters: {
				status: 'late_entry'
			}
		});
	}

	return htmlProperty;
}

/**
 * @param {string|number} appealId
 * @param {string} backLinkUrl
 * @param {string} uploadUpdatedDocumentUrl
 * @param {string} removeDocumentUrl
 * @param {RedactionStatus[]} redactionStatuses
 * @param {DocumentInfo} document
 * @param {FolderInfo} folder
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {Promise<PageContent>}
 */
export async function manageDocumentPage(
	appealId,
	backLinkUrl,
	uploadUpdatedDocumentUrl,
	removeDocumentUrl,
	redactionStatuses,
	document,
	folder,
	request
) {
	const changeDetailsUrl = request.originalUrl.replace(
		'manage-documents',
		'change-document-details'
	);
	const session = request.session;
	const latestVersion = getDocumentLatestVersion(document);
	const virusCheckStatus = mapDocumentVersionDetailsVirusCheckStatus(latestVersion);

	if (!virusCheckStatus.checked) {
		addNotificationBannerToSession(
			session,
			'notCheckedDocument',
			parseInt(appealId.toString(), 10),
			`<p class="govuk-notification-banner__heading">Virus scan in progress</p></br><a class="govuk-notification-banner__link" href="${request.originalUrl}">Refresh page to see if scan has finished</a>`
		);
	}

	/** @type {PageComponent[]} */
	const notificationBannerComponents = buildNotificationBanners(
		session,
		'manageDocuments',
		Number(appealId)
	);

	const versionId = latestVersion?.version?.toString() || '';
	const uploadNewVersionUrl = uploadUpdatedDocumentUrl
		.replace('{{folderId}}', folder.folderId.toString())
		.replace('{{documentId}}', document.id || '');

	/** @type {PageComponent[]} */
	const pageComponents = [...notificationBannerComponents];

	if (virusCheckStatus.checked && !virusCheckStatus.safe) {
		/** @type {PageComponent} */
		const errorSummaryComponent = {
			type: 'error-summary',
			parameters: {
				titleText: 'There is a problem',
				errorList: [
					{
						text: 'The selected file contains a virus. Upload a different version.',
						href: uploadNewVersionUrl
					}
				]
			}
		};
		pageComponents.push(errorSummaryComponent);
	}

	/** @type {PageComponent} */
	const documentSummary = {
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds">',
			closing: '</div></div>'
		},
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: { text: 'Name' },
					value: mapVersionDocumentInformationHtmlProperty(document, latestVersion)
				},
				{
					key: { text: 'Version' },
					value: {
						text: versionId
					}
				},
				{
					key: { text: 'Date received' },
					value: latestVersion?.isLateEntry
						? {
								html: '',
								pageComponents: [
									{
										type: 'html',
										parameters: {
											html: '',
											pageComponents: [
												{
													wrapperHtml: {
														opening: '<div class="govuk-!-margin-bottom-2">',
														closing: '</div>'
													},
													type: 'html',
													parameters: {
														html: dateToDisplayDate(latestVersion?.dateReceived)
													}
												},
												{
													wrapperHtml: {
														opening: '<div class="govuk-!-margin-bottom-1">',
														closing: '</div>'
													},
													type: 'status-tag',
													parameters: {
														status: 'late_entry'
													}
												}
											]
										}
									}
								]
						  }
						: {
								text: dateToDisplayDate(latestVersion?.dateReceived)
						  },
					actions: {
						items: [
							{
								text: 'Change',
								href: changeDetailsUrl,
								visuallyHiddenText: `${document.name} date received`
							}
						]
					}
				},
				{
					key: { text: 'Redaction status' },
					value: {
						text: getDocumentLatestVersion(document)?.redactionStatus
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: changeDetailsUrl,
								visuallyHiddenText: `${document.name} redaction status`
							}
						]
					}
				}
			]
		}
	};

	pageComponents.push(documentSummary);

	if (virusCheckStatus.checked) {
		/** @type {PageComponent} */
		const uploadUpdatedDocumentButton = {
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds">',
				closing: ''
			},
			type: 'button',
			parameters: {
				id: 'upload-updated-document',
				href: uploadNewVersionUrl,
				classes: 'govuk-!-margin-right-2',
				text: 'Upload a new version'
			}
		};

		const removeDocumentUrlProcessed = removeDocumentUrl
			?.replace('{{folderId}}', folder.folderId.toString())
			.replace('{{documentId}}', document.id || '')
			.replace('{{versionId}}', versionId);

		/** @type {PageComponent} */
		const removeDocumentButton = {
			wrapperHtml: {
				opening: '',
				closing: '</div></div>'
			},
			type: 'button',
			parameters: {
				id: 'remove-document',
				href: removeDocumentUrlProcessed,
				classes: 'govuk-button--secondary',
				text: 'Remove current version'
			}
		};

		pageComponents.push(uploadUpdatedDocumentButton);
		pageComponents.push(removeDocumentButton);
	}

	/** @type {PageComponent} */
	const documentHistoryDetails = {
		wrapperHtml: {
			opening:
				'<div class="govuk-grid-row"><div class="govuk-grid-column-full"><h2>Document versions</h2><p class="govuk-body">View and remove versions of this document</p>',
			closing: '</div></div>'
		},
		type: 'details',
		parameters: {
			summaryText: 'Version history',
			html: '',
			pageComponents: [
				{
					type: 'table',
					parameters: {
						classes: 'govuk-!-font-size-16',
						head: [
							{
								text: 'Version'
							},
							{
								text: 'Name'
							},
							{
								text: 'Activity'
							},
							{
								text: 'Redaction status'
							},
							{
								text: 'Action'
							}
						],
						rows: await Promise.all(
							(document.allVersions || []).map(async (documentVersion) => {
								const versionVirusCheckStatus =
									mapDocumentVersionDetailsVirusCheckStatus(documentVersion);

								return [
									{
										text: documentVersion.version?.toString() || ''
									},
									mapDocumentNameHtmlProperty(document, documentVersion),
									{
										html: await mapDocumentVersionToAuditActivityHtml(
											documentVersion,
											document.versionAudit || [],
											session
										)
									},
									{
										text: documentVersion.redactionStatus
									},
									{
										html:
											documentVersion.isDeleted || !versionVirusCheckStatus.checked
												? ''
												: `<a class="govuk-link" href="${removeDocumentUrl
														?.replace('{{folderId}}', folder.folderId.toString())
														.replace('{{documentId}}', document.id || '')
														.replace(
															'{{versionId}}',
															documentVersion.version?.toString() || ''
														)}">Remove</a>`
									}
								];
							})
						).then((result) =>
							result.sort((a, b) => parseInt(b[0].text, 10) - parseInt(a[0].text, 10))
						)
					}
				}
			]
		}
	};

	pageComponents.push(documentHistoryDetails);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Manage document',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl
			?.replace('{{folderId}}', folder.folderId.toString())
			.replace('{{documentId}}', document.id || ''),
		preHeading: 'Manage document',
		heading: document?.name || '',
		pageComponents
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}

/**
 * @param {string} backLinkUrl
 * @param {RedactionStatus[]} redactionStatuses
 * @param {DocumentInfo} document
 * @param {FolderInfo} folder - API type needs to be updated here (should be Folder, but there are worse problems with that type)
 * @param {string} versionId
 * @returns {Promise<PageContent>}
 */
export async function deleteDocumentPage(
	backLinkUrl,
	redactionStatuses,
	document,
	folder,
	versionId
) {
	const totalDocumentVersions =
		document.allVersions?.filter((documentVersion) => !documentVersion.isDeleted).length || 1;

	const radioEntries = [
		{
			text: 'Yes',
			value: 'yes'
		}
	];

	if (totalDocumentVersions === 1) {
		radioEntries.push({
			text: 'Yes, and upload another document',
			value: 'yes-and-upload-another-document'
		});
	}

	radioEntries.push({
		text: 'No',
		value: 'no'
	});

	/** @type {PageComponent} */
	const warningText = {
		type: 'warning-text',
		parameters: {
			text: 'Removing the only version of a document will delete the document from the case'
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: 'Remove document',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl
			?.replace('{{folderId}}', folder.folderId.toString())
			.replace('{{documentId}}', document.id || ''),
		preHeading: 'Manage versions',
		heading: 'Are you sure you want to remove this version?',
		pageComponents: [
			{
				wrapperHtml: {
					opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds">',
					closing: ''
				},
				type: 'summary-list',
				parameters: {
					rows: [
						{
							key: { text: 'Name' },
							value: {
								html: document && document?.name ? document.name : ''
							}
						},
						{
							key: { text: 'Version' },
							value: {
								text: versionId || ''
							}
						}
					]
				}
			},
			...(totalDocumentVersions === 1 ? [warningText] : []),
			{
				wrapperHtml: {
					opening: '<form method="POST">',
					closing: ''
				},
				type: 'radios',
				parameters: {
					name: 'delete-file-answer',
					items: radioEntries
				}
			},
			{
				wrapperHtml: {
					opening: '',
					closing: '</form></div></div>'
				},
				type: 'button',
				parameters: {
					id: 'remove-document-button',
					type: 'submit',
					text: 'Continue'
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
 * @param {DocumentInfo} document
 * @returns {DocumentVersionInfo|undefined}
 */
const getDocumentLatestVersion = (document) => {
	return document?.latestDocumentVersion;
};

/**
 *
 * @param {DocumentVersionInfo} documentVersion
 * @param {DocumentVersionAuditEntry[]} documentVersionAuditItems
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {Promise<string>}
 */
const mapDocumentVersionToAuditActivityHtml = async (
	documentVersion,
	documentVersionAuditItems,
	session
) => {
	const matchingAuditItems = (documentVersionAuditItems || []).filter(
		(auditItem) => auditItem.version === documentVersion.version
	);

	if (!matchingAuditItems || !matchingAuditItems.length) {
		return '';
	}

	const matchingAuditItemUsers = await Promise.all(
		matchingAuditItems
			.map((matchingAuditItem) =>
				matchingAuditItem.auditTrail?.loggedAt && matchingAuditItem.auditTrail?.user
					? matchingAuditItem.auditTrail?.user
					: undefined
			)
			.filter((item) => item !== undefined)
			.map((user) => usersService.getUserById(user?.azureAdUserId || '', session))
	);

	const auditActivityHtml = matchingAuditItems
		.map((matchingAuditItem) => {
			if (matchingAuditItem.auditTrail?.loggedAt && matchingAuditItem.auditTrail?.user) {
				const userData = matchingAuditItemUsers.find(
					(user) => user?.id === matchingAuditItem.auditTrail?.user?.azureAdUserId
				);

				if (userData) {
					const userName = surnameFirstToFullName(userData?.name);
					const loggedAt = new Date(matchingAuditItem.auditTrail.loggedAt);

					return `<p class="govuk-body"><strong>${
						matchingAuditItem.action
					}</strong>: ${dateToDisplayTime(loggedAt)}, ${dateToDisplayDate(loggedAt)}${
						userName.length > 0 ? `,<br/>by ${userName}` : ''
					}</p>`;
				}
			}
		})
		.filter((activityHtmlEntry) => activityHtmlEntry !== undefined)
		.join('');

	return auditActivityHtml;
};

/**
 *
 * @typedef {Object} DocumentDetailsFormItem
 * @property {string} documentId
 * @property {Object<string, string>} receivedDate
 * @property {string} redactionStatus
 */

/**
 *
 * @typedef {Object} DocumentDetailsFormData
 * @property {DocumentDetailsFormItem[]} items
 */

/**
 *
 * @param {DocumentDetailsFormData} formData
 * @param {import('@pins/appeals.api').Schema.DocumentRedactionStatus[]} redactionStatuses
 * @returns {import('./appeal.documents.service.js').DocumentDetailsAPIPatchRequest}
 */
export const mapDocumentDetailsFormDataToAPIRequest = (formData, redactionStatuses) => {
	return {
		documents: formData.items.map((item) => ({
			id: item.documentId,
			receivedDate: dayMonthYearToApiDateString({
				day: parseInt(item.receivedDate.day, 10),
				month: parseInt(item.receivedDate.month, 10),
				year: parseInt(item.receivedDate.year, 10)
			}),
			redactionStatus: mapRedactionStatusNameToId(redactionStatuses, item.redactionStatus)
		}))
	};
};

/**
 * @param {DocumentDetailsFormData} formData
 * @param {FileUploadInfoItem[]} fileUploadInfo
 * @param {import('@pins/appeals.api').Schema.DocumentRedactionStatus[]} redactionStatuses
 * @returns
 */
export const addDocumentDetailsFormDataToFileUploadInfo = (
	formData,
	fileUploadInfo,
	redactionStatuses
) => {
	for (const item of formData.items) {
		const matchingInfoItem = fileUploadInfo.find((infoItem) => infoItem.GUID === item.documentId);

		if (matchingInfoItem) {
			matchingInfoItem.receivedDate = dayMonthYearToApiDateString({
				day: parseInt(item.receivedDate.day, 10),
				month: parseInt(item.receivedDate.month, 10),
				year: parseInt(item.receivedDate.year, 10)
			});
			matchingInfoItem.redactionStatus = mapRedactionStatusNameToId(
				redactionStatuses,
				item.redactionStatus
			);
		}
	}
};

/**
 * @param {import('@pins/appeals.api').Schema.DocumentRedactionStatus[]} redactionStatuses
 * @param {string} redactionStatusName
 * @returns {number}
 */
const mapRedactionStatusNameToId = (redactionStatuses, redactionStatusName) => {
	for (const status of redactionStatuses) {
		if (status.name.toLowerCase() === redactionStatusName.toLowerCase()) {
			return Number(status.id);
		}
	}
	return 0;
};

/**
 * @param {import('@pins/appeals.api').Schema.DocumentRedactionStatus[]} redactionStatuses
 * @param {number | null | undefined} redactionStatusId
 * @returns {string}
 */
export const mapRedactionStatusIdToName = (redactionStatuses, redactionStatusId) => {
	if (!redactionStatusId) {
		return '';
	}

	for (const status of redactionStatuses) {
		if (status.id.toString() === redactionStatusId.toString()) {
			return status.name;
		}
	}
	return '';
};

/**
 *
 * @param {string} folderPath
 * @returns {string}
 */
export const folderPathToFolderNameText = (folderPath) => {
	let nameText = capitalize(
		(folderPath.split('/')?.[1] || '').replace(/(?<!^)([A-Z])/g, ' $1').toLowerCase()
	);

	if (nameText.endsWith('documents')) {
		nameText = nameText.slice(0, -9);
	}

	return nameText.trim();
};

/**
 * @typedef {Object} MappedDocumentRow
 * @property {(string[] | string | HtmlLink[] | HtmlLink)} value
 * @property {ActionItemProperties[]} actions
 * @property {import('#lib/nunjucks-template-builders/tag-builders.js').HtmlTagType} valueType
 * @property {{[key: string]: string} | null} [attributes]
 */

/** @typedef {import('./appeal-documents.controller.js').DocumentDetailsItem} DocumentDetailsItem */
/** @typedef {Object<string, any>} Document */

/**
 * @param {string} backLinkUrl
 * @param {FolderInfo} folder
 * @param {Document} file
 * @param {RedactionStatus[]} redactionStatuses
 * @returns {PageContent}
 */
export function changeDocumentDetailsPage(backLinkUrl, folder, file, redactionStatuses) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Change document details',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl?.replace('{{folderId}}', folder.folderId.toString()),
		preHeading: 'Change document details',
		heading: `${folderPathToFolderNameText(folder.path)} documents`,
		pageComponents: mapDocumentDetailsItemToDocumentDetailsPageComponents(
			file.latestDocumentVersion,
			redactionStatuses
		)
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}

/**
 *
 * @param {FolderInfo} folder
 * @param {"not_scanned"|"scanned"|"affected"} virusStatus
 * @returns {DocumentInfo[]}
 */
function getDocumentsForVirusStatus(folder, virusStatus) {
	let matchingDocuments = [];
	for (let document of Object.values(folder.documents || [])) {
		if (document?.latestDocumentVersion?.virusCheckStatus === virusStatus) {
			matchingDocuments.push(document);
		}
	}
	return matchingDocuments;
}
