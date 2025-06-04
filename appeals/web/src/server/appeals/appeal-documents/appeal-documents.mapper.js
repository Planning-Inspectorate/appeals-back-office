import { appealShortReference } from '#lib/appeals-formatter.js';
import config from '@pins/appeals.web/environment/config.js';
import { capitalize } from 'lodash-es';
import {
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate,
	dateISOStringToDisplayTime24hr,
	dayMonthYearHourMinuteToISOString
} from '#lib/dates.js';
import { kilobyte, megabyte, gigabyte } from '#appeals/appeal.constants.js';
import {
	mapNotificationBannersFromSession,
	createNotificationBanner,
	documentDateInput
} from '#lib/mappers/index.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { surnameFirstToFullName } from '#lib/person-name-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { redactionStatusIdToName } from '#lib/redaction-statuses.js';
import { APPEAL_REDACTED_STATUS, APPEAL_VIRUS_CHECK_STATUS } from 'pins-data-model';
import { folderIsAdditionalDocuments } from '#lib/documents.js';

/**
 * @typedef {import('../appeal-details/appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo
 * @typedef {import('@pins/appeals.api').Appeals.DocumentInfo} DocumentInfo
 * @typedef {import('@pins/appeals.api').Appeals.DocumentVersionInfo} DocumentVersionInfo
 * @typedef {import('#lib/nunjucks-template-builders/tag-builders.js').HtmlLink} HtmlLink
 * @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} RedactionStatus
 * @typedef {import('@pins/appeals.api').Api.DocumentVersionAuditEntry} DocumentVersionAuditEntry
 * @typedef {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfoItem} FileUploadInfoItem
 */

/**
 * @param {Object} params
 * @param {string} params.appealId
 * @param {string} params.appealReference
 * @param {string} params.folderId
 * @param {string} params.folderPath
 * @param {string} params.documentId
 * @param {string|undefined} params.documentName
 * @param {number|undefined} params.latestVersion
 * @param {string} params.backButtonUrl
 * @param {string|undefined} params.nextPageUrl
 * @param {boolean} params.isLateEntry
 * @param {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfo} params.fileUploadInfo
 * @param {import('@pins/express').ValidationErrors|undefined} params.errors
 * @param {string} [params.pageHeadingTextOverride]
 * @param {string} [params.preHeadingTextOverride]
 * @param {PageComponent[]} [params.pageBodyComponents]
 * @param {boolean} [params.allowMultipleFiles]
 * @param {string} [params.documentType]
 * @param {string} [params.filenamesInFolder]
 * @param {string[]} [params.allowedTypes]
 * @param {string} [params.uploadContainerHeadingTextOverride]
 * @param {string} [params.documentTitle]
 * @returns {Promise<import('#appeals/appeal-documents/appeal-documents.types.js').DocumentUploadPageParameters>}
 */
export async function documentUploadPage({
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
	fileUploadInfo,
	errors,
	pageHeadingTextOverride,
	preHeadingTextOverride,
	pageBodyComponents = [],
	allowMultipleFiles,
	documentType,
	filenamesInFolder,
	allowedTypes = [],
	uploadContainerHeadingTextOverride = '',
	documentTitle = ''
}) {
	const isAdditionalDocument = folderIsAdditionalDocuments(folderPath);
	const pageHeadingText =
		pageHeadingTextOverride || mapAddDocumentsPageHeading(folderPath, documentId);
	const uploadContainerHeadingText = uploadContainerHeadingTextOverride || pageHeadingText;
	const preHeadingText =
		preHeadingTextOverride || 'Appeal ' + appealShortReference(appealReference);
	const pathComponents = folderPath ? folderPath.split('/') : [];
	const documentStage = pathComponents.length > 0 ? pathComponents[0] : 'unknown';
	const documentTypeComputed =
		documentType || (pathComponents.length > 1 ? pathComponents[1] : 'unknown');

	return {
		backButtonUrl: backButtonUrl?.replace('{{folderId}}', folderId),
		appealId,
		appealReference,
		folderId: folderId,
		documentId,
		documentOriginalFileName: documentName,
		documentVersion: latestVersion,
		useBlobEmulator: config.useBlobEmulator,
		filenamesInFolder,
		...(fileUploadInfo &&
			fileUploadInfo.appealId === appealId &&
			fileUploadInfo.folderId === folderId && {
				uncommittedFiles: JSON.stringify({
					files: fileUploadInfo.files
				})
			}),
		blobStorageHost:
			config.useBlobEmulator === true ? config.blobEmulatorSasUrl : config.blobStorageUrl,
		blobStorageContainer: config.blobStorageDefaultContainer,
		multiple: documentId ? false : allowMultipleFiles || false,
		documentStage: documentStage,
		serviceName: documentName || pageHeadingText,
		pageTitle: pageHeadingTextOverride || 'Upload documents',
		pageHeadingText,
		preHeadingText,
		pageBodyComponents,
		uploadContainerHeadingText,
		documentTitle,
		documentType: documentTypeComputed,
		allowedTypes,
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
 * @param {string} filename
 * @param {number} [documentVersion]
 */
export const mapDocumentDownloadUrl = (appealId, documentId, filename, documentVersion) => {
	if (documentVersion) {
		return `/documents/${appealId}/download/${documentId}/${documentVersion}/${filename}`;
	}
	return `/documents/${appealId}/download/${documentId}/${filename}`;
};

/**
 * @param {string|number} appealReference
 * @param {string} documentId
 * @param {string} filename
 * @param {string|number} [documentVersion]
 */
export const mapUncommittedDocumentDownloadUrl = (
	appealReference,
	documentId,
	filename,
	documentVersion
) => {
	return `/documents/${appealReference}/download-uncommitted/${documentId}/${filename}${
		documentVersion ? `/${documentVersion}` : ''
	}`;
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
		case APPEAL_VIRUS_CHECK_STATUS.SCANNED:
			result.checked = true;
			result.safe = true;
			result.manageFolderPageActionText = 'View and edit';
			break;
		case APPEAL_VIRUS_CHECK_STATUS.AFFECTED:
			result.checked = true;
			result.statusText = 'virus_detected';
			result.manageFolderPageActionText = 'Edit or remove';
			break;
		case APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED:
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
	return mapVirusCheckStatus(document?.virusCheckStatus || APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED);
}

/**
 * @param {string} folderPath
 * @param {string} [documentId]
 * @returns {string}
 */
function mapAddDocumentsPageHeading(folderPath, documentId) {
	const isExistingDocument = !!documentId;

	if (folderIsAdditionalDocuments(folderPath)) {
		return isExistingDocument ? 'Update additional document' : 'Upload additional documents';
	} else if (isExistingDocument) {
		return 'Upload an updated document';
	}

	return 'Upload documents';
}

/**
 * @param {string} folderPath
 * @param {string} [documentId]
 * @returns {string}
 */
function mapAddDocumentDetailsPageHeading(folderPath, documentId) {
	const isExistingDocument = !!documentId;

	if (folderIsAdditionalDocuments(folderPath)) {
		return isExistingDocument ? 'Updated additional document' : 'Additional documents';
	} else if (isExistingDocument) {
		return `Updated ${folderPathToFolderNameText(folderPath, false)} document`;
	}

	return `${folderPathToFolderNameText(folderPath)} documents`;
}

/**
 * @param {string} folderPath
 * @returns {string}
 */
function mapManageFolderPageHeading(folderPath) {
	if (folderIsAdditionalDocuments(folderPath)) {
		return 'Additional documents';
	}

	return `${folderPathToFolderNameText(folderPath)} documents`;
}

/**
 * @param {string} fileName
 * @returns {string}
 */
function stripFileExtension(fileName) {
	return fileName.replace(/\.\w+$/, '');
}

/**
 * @param {Object} params
 * @param {string} params.backLinkUrl
 * @param {FolderInfo} params.folder
 * @param {FileUploadInfoItem[]} params.uncommittedFiles
 * @param {Object<string, any>} params.bodyItems
 * @param {RedactionStatus[]} params.redactionStatuses
 * @param {string} [params.pageHeadingTextOverride]
 * @param {string} [params.dateLabelTextOverride]
 * @param {string} [params.documentId]
 * @param {import("@pins/express").ValidationErrors | undefined} [params.errors]
 * @returns {PageContent}
 */
export function addDocumentDetailsPage({
	backLinkUrl,
	folder,
	uncommittedFiles,
	bodyItems,
	redactionStatuses,
	pageHeadingTextOverride,
	dateLabelTextOverride,
	documentId,
	errors
}) {
	/** @type {PageContent} */
	const pageContent = {
		title: pageHeadingTextOverride || 'Add document details',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl?.replace('{{folderId}}', folder.folderId.toString()),
		preHeading: 'Add document details',
		heading: pageHeadingTextOverride || mapAddDocumentDetailsPageHeading(folder.path, documentId),
		pageComponents: uncommittedFiles.flatMap((uncommittedFile, index) => {
			return mapFileUploadInfoItemToDocumentDetailsPageComponents({
				uncommittedFiles,
				uncommittedFile,
				bodyItems,
				index,
				redactionStatuses,
				dateLabelTextOverride,
				errors
			});
		})
	};

	return pageContent;
}

/**
 * @param {Object} params
 * @param {FileUploadInfoItem[]} params.uncommittedFiles
 * @param {FileUploadInfoItem} params.uncommittedFile
 * @param {Object<string, any>} params.bodyItems
 * @param {number} params.index
 * @param {RedactionStatus[]} params.redactionStatuses
 * @param {string} [params.dateLabelTextOverride]
 * @param {import("@pins/express").ValidationErrors | undefined} params.errors
 * @returns {PageComponent[]}
 */
function mapFileUploadInfoItemToDocumentDetailsPageComponents({
	uncommittedFiles,
	uncommittedFile,
	bodyItems,
	index,
	redactionStatuses,
	dateLabelTextOverride,
	errors
}) {
	const receivedDateDayMonthYear = dateISOStringToDayMonthYearHourMinute(
		uncommittedFile.receivedDate
	);
	const bodyItem = bodyItems?.find(
		(/** @type {{ documentId: string; }} */ item) => item.documentId === uncommittedFile.GUID
	);
	const bodyRecievedDateDay = bodyItem?.receivedDate?.day;
	const bodyRecievedDateMonth = bodyItem?.receivedDate?.month;
	const bodyRecievedDateYear = bodyItem?.receivedDate?.year;
	const bodyRedactionStatus = bodyItem?.redactionStatus;

	return [
		{
			wrapperHtml: {
				opening: `<div class="govuk-form-group"><h2 class="govuk-heading-m">${uncommittedFile.name}</h2>`,
				closing: ''
			},
			type: 'input',
			parameters: {
				type: 'hidden',
				name: `items[${index}][documentId]`,
				value: uncommittedFile.GUID
			}
		},
		documentDateInput({
			value: {
				day:
					(bodyRecievedDateDay !== undefined
						? bodyRecievedDateDay
						: receivedDateDayMonthYear?.day) || '',
				month:
					(bodyRecievedDateMonth !== undefined
						? bodyRecievedDateMonth
						: receivedDateDayMonthYear?.month) || '',
				year:
					(bodyRecievedDateYear !== undefined
						? bodyRecievedDateYear
						: receivedDateDayMonthYear?.year) || ''
			},
			legendText: dateLabelTextOverride || 'Date received',
			hint: 'For example, 27 3 2007',
			appealDocumentIndex: index,
			errors: errors
		}),
		{
			wrapperHtml: {
				opening: '',
				closing:
					index < uncommittedFiles.length - 1 ? '<hr class="govuk-!-margin-top-7"></div>' : '</div>'
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
								: redactionStatusIdToName(redactionStatuses, uncommittedFile.redactionStatus)) ===
							'redacted'
					},
					{
						text: 'Unredacted',
						value: 'unredacted',
						checked:
							(bodyRedactionStatus
								? bodyRedactionStatus
								: redactionStatusIdToName(redactionStatuses, uncommittedFile.redactionStatus)) ===
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
								: redactionStatusIdToName(redactionStatuses, uncommittedFile.redactionStatus)) ===
								'no redaction required' || !uncommittedFile.redactionStatus
					}
				]
			}
		}
	];
}

/**
 * @param {DocumentVersionInfo} item
 * @param {RedactionStatus[]} redactionStatuses
 * @param {import("@pins/express").ValidationErrors | undefined} [errors]
 * @returns {PageComponent[]}
 */
function mapDocumentDetailsItemToDocumentDetailsPageComponents(item, redactionStatuses, errors) {
	const dateReceived = dateISOStringToDayMonthYearHourMinute(item.dateReceived);
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
		documentDateInput({
			value: {
				day: bodyRecievedDateDay || '',
				month: bodyRecievedDateMonth || '',
				year: bodyRecievedDateYear || ''
			},
			legendText: 'Date received',
			hint: '',
			appealDocumentIndex: 0,
			errors: errors
		}),
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
							redactionStatuses.find((status) => status.key === APPEAL_REDACTED_STATUS.REDACTED)
								?.name
					},
					{
						text: 'Unredacted',
						value: 'unredacted',
						checked:
							bodyRedactionStatus ===
							redactionStatuses.find((status) => status.key === APPEAL_REDACTED_STATUS.NOT_REDACTED)
								?.name
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
									(status) => status.key === APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED
								)?.name || !bodyRedactionStatus
					}
				]
			}
		}
	];

	return pageComponents;
}
/**
 * @param {string} fileName
 * @param {{originalFilename: string, documentId: string}} item
 * @returns {PageComponent[]}
 */
function mapDocumentNameItemToDocumentNamePageComponents(item, fileName) {
	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			wrapperHtml: {
				opening: `<div class="govuk-form-group"><h2 class="govuk-heading-m">${stripFileExtension(
					item.originalFilename
				)}</h2>`,
				closing: ''
			},
			type: 'input',
			parameters: {
				type: 'hidden',
				name: 'documentId',
				value: item.documentId
			}
		},
		{
			wrapperHtml: {
				opening: '',
				closing: '</div>'
			},
			type: 'input',
			parameters: {
				id: 'file-name',
				name: 'fileName',
				label: {
					text: 'File name',
					classes: 'govuk-caption-m govuk-!-margin-bottom-3'
				},
				value: stripFileExtension(fileName)
			}
		}
	];

	return pageComponents;
}

/**
 * @param {Object} params
 * @param {string} params.backLinkUrl
 * @param {string} params.changeFileLinkUrl
 * @param {string|undefined} params.changeDateLinkUrl
 * @param {string|undefined} params.changeRedactionStatusLinkUrl
 * @param {string} params.appealReference
 * @param {FileUploadInfoItem[]} params.uncommittedFiles
 * @param {RedactionStatus[]} params.redactionStatuses
 * @param {number} [params.documentVersion] current version being uploaded (if uploading a new version of an existing document)
 * @param {string} [params.documentFileName] filename of existing document, not new version being uploaded (if uploading a new version of an existing document)
 * @param {string} [params.titleTextOverride]
 * @param {string} [params.summaryListNameLabelOverride]
 * @param {string} [params.summaryListDateLabelOverride]
 * @param {string} [params.folderPath]
 * @returns {PageContent}
 */
export function addDocumentsCheckAndConfirmPage({
	backLinkUrl,
	changeFileLinkUrl,
	changeDateLinkUrl,
	changeRedactionStatusLinkUrl,
	appealReference,
	uncommittedFiles,
	redactionStatuses,
	documentVersion,
	documentFileName,
	titleTextOverride,
	summaryListNameLabelOverride,
	summaryListDateLabelOverride,
	folderPath
}) {
	/** @type {PageContent} */
	const pageContent = {
		title: titleTextOverride || 'Check your answers',
		backLinkUrl,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading:
			folderPath === 'internal/mainPartyCorrespondence'
				? 'Check details and add main party correspondence'
				: 'Check your answers',
		submitButtonProperties: {
			text:
				folderPath === 'internal/mainPartyCorrespondence'
					? 'Add main party correspondence'
					: 'Confirm',
			type: 'submit',
			preventDoubleClick: true
		},
		pageComponents: []
	};

	uncommittedFiles.forEach((uncommittedFile, index) => {
		/** @type {HtmlPageComponent} */
		const htmlComponent = {
			type: 'html',
			parameters: {
				html: `<h2 class="govuk-heading-m govuk-!-margin-top-${
					index === 0 ? '5' : '8'
				} govuk-!-margin-bottom-4">Uploaded file${
					uncommittedFiles.length > 1 ? ` ${index + 1}` : ''
				}</h2>`
			}
		};

		/** @type {SummaryListPageComponent} */
		const summaryListComponent = {
			type: 'summary-list',
			parameters: {
				rows: [
					{
						key: {
							text: summaryListNameLabelOverride || 'File'
						},
						value: {
							html: `<a class="govuk-link" href="${mapUncommittedDocumentDownloadUrl(
								appealReference,
								uncommittedFile.GUID,
								documentFileName || uncommittedFile.name,
								documentVersion
							)}" target="_blank">${uncommittedFile.name}</a>`
						},
						actions: {
							items: [
								{
									text: 'Change',
									href: changeFileLinkUrl,
									visuallyHiddenText: `file ${uncommittedFile.name}`
								}
							]
						}
					}
				]
			}
		};

		if (changeDateLinkUrl) {
			summaryListComponent.parameters.rows.push({
				key: {
					text: summaryListDateLabelOverride || 'Date received'
				},
				value: {
					text: dateISOStringToDisplayDate(uncommittedFile.receivedDate)
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: changeDateLinkUrl,
							visuallyHiddenText: `${uncommittedFile.name} date received`
						}
					]
				}
			});
		}

		if (changeRedactionStatusLinkUrl) {
			summaryListComponent.parameters.rows.push({
				key: {
					text: 'Redaction status'
				},
				value: {
					text: capitalize(
						redactionStatusIdToName(redactionStatuses, uncommittedFile.redactionStatus)
					)
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: changeRedactionStatusLinkUrl,
							visuallyHiddenText: `${uncommittedFile.name} redaction status`
						}
					]
				}
			});
		}

		pageContent.pageComponents?.push(htmlComponent);
		pageContent.pageComponents?.push(summaryListComponent);
	});

	return pageContent;
}

/**
 * @param {FolderInfo} folder
 * @param {DocumentInfo} document
 * @returns {HtmlProperty & ClassesProperty}
 */
export function mapFolderDocumentInformationHtmlProperty(folder, document) {
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
						document.id,
						document.name
					)}" target="_blank">${document.name || ''}</a>`.trim()
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
export function mapFolderDocumentActionsHtmlProperty(folder, document, viewAndEditUrl) {
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
 * @param {Object} params
 * @param {string} params.backLinkUrl
 * @param {string} params.viewAndEditUrl
 * @param {string} params.addButtonUrl
 * @param {FolderInfo} params.folder - API type needs to be updated (should be Folder, but there are worse problems with that type)
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {string} [params.pageHeadingTextOverride]
 * @param {string} [params.addButtonTextOverride]
 * @param {string} [params.dateColumnLabelTextOverride]
 * @returns {PageContent}
 */
export function manageFolderPage({
	backLinkUrl,
	viewAndEditUrl,
	addButtonUrl,
	folder,
	request,
	pageHeadingTextOverride,
	addButtonTextOverride,
	dateColumnLabelTextOverride
}) {
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

	/** @type {PageComponent} */
	const buttonComponent = {
		type: 'button',
		parameters: {
			text: addButtonTextOverride || 'Add documents',
			href: addButtonUrl?.replace('{{folderId}}', folder.folderId.toString())
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: 'Manage folder',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl?.replace('{{folderId}}', folder.folderId.toString()),
		preHeading: 'Manage folder',
		heading: pageHeadingTextOverride || mapManageFolderPageHeading(folder.path),
		pageComponents: [
			...notificationBanners,
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
							text: dateColumnLabelTextOverride || 'Date received'
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
						folderIsAdditionalDocuments(folder.path) && document?.latestDocumentVersion?.isLateEntry
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
												html: dateISOStringToDisplayDate(
													document?.latestDocumentVersion?.dateReceived
												)
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
									text: dateISOStringToDisplayDate(document?.latestDocumentVersion?.dateReceived)
							  },
						{
							text: document?.latestDocumentVersion?.redactionStatus
						},
						mapFolderDocumentActionsHtmlProperty(folder, document, viewAndEditUrl)
					])
				}
			},
			buttonComponent
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
								document.id,
								document.name
						  )}" target="_blank">${document.name || ''}</a>`
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
								documentVersion.originalFilename,
								documentVersion.version
						  )}" target="_blank">${documentVersion.originalFilename || ''}</a>`
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
				html: `<strong class="govuk-tag govuk-tag--blue single-line govuk-!-margin-bottom-2">Current version</strong>`
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
 * @param {Object} params
 * @param {string|number} params.appealId
 * @param {string} params.backLinkUrl
 * @param {string} params.uploadUpdatedDocumentUrl
 * @param {string} params.removeDocumentUrl
 * @param {DocumentInfo} params.document
 * @param {FolderInfo} params.folder
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {string} [params.pageTitleTextOverride]
 * @param {string} [params.dateRowLabelTextOverride]
 * @param {boolean} [params.editable]
 * @param {boolean} [params.skipChangeDocumentDetails]
 * @param {string} [params.baseUrl]
 * @returns {Promise<PageContent>}
 */
export async function manageDocumentPage({
	appealId,
	backLinkUrl,
	uploadUpdatedDocumentUrl,
	removeDocumentUrl,
	document,
	folder,
	request,
	pageTitleTextOverride,
	dateRowLabelTextOverride,
	editable,
	skipChangeDocumentDetails,
	baseUrl = ''
}) {
	const changeDetailsUrl =
		!skipChangeDocumentDetails &&
		request.originalUrl.replace('manage-documents', `${baseUrl}change-document-details`);
	const changeNameUrl = request.originalUrl.replace(
		'manage-documents',
		`${baseUrl}change-document-name`
	);
	const session = request.session;
	const latestVersion = getDocumentLatestVersion(document);
	const virusCheckStatus = mapDocumentVersionDetailsVirusCheckStatus(latestVersion);

	/** @type {PageComponent[]} */
	const notificationBanners = mapNotificationBannersFromSession(
		session,
		'manageDocuments',
		Number(appealId)
	);

	if (!virusCheckStatus.checked) {
		notificationBanners.unshift(
			createNotificationBanner({ bannerDefinitionKey: 'notCheckedDocument' })
		);
	}

	const versionId = latestVersion?.version?.toString() || '';
	const uploadNewVersionUrl = uploadUpdatedDocumentUrl
		.replace('{{folderId}}', folder.folderId.toString())
		.replace('{{documentId}}', document.id || '');

	/** @type {PageComponent[]} */
	const pageComponents = [...notificationBanners];

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
					value: mapVersionDocumentInformationHtmlProperty(document, latestVersion),
					actions: {
						items: [
							...(editable
								? [
										{
											text: 'Change',
											href: changeNameUrl,
											visuallyHiddenText: `${document.name} name`
										}
								  ]
								: [])
						]
					}
				},
				{
					key: { text: 'Version' },
					value: {
						text: versionId
					}
				}
			]
		}
	};

	if (changeDetailsUrl) {
		documentSummary.parameters.rows.push({
			key: { text: dateRowLabelTextOverride || 'Date received' },
			value:
				folderIsAdditionalDocuments(folder.path) && latestVersion?.isLateEntry
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
													html: dateISOStringToDisplayDate(latestVersion?.dateReceived)
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
							text: dateISOStringToDisplayDate(latestVersion?.dateReceived)
					  },
			actions: {
				items: [
					...(editable
						? [
								{
									text: 'Change',
									href: changeDetailsUrl,
									visuallyHiddenText: `${document.name} date received`
								}
						  ]
						: [])
				]
			}
		});
		documentSummary.parameters.rows.push({
			key: { text: 'Redaction status' },
			value: {
				text: getDocumentLatestVersion(document)?.redactionStatus
			},
			actions: {
				items: [
					...(editable
						? [
								{
									text: 'Change',
									href: changeDetailsUrl,
									visuallyHiddenText: `${document.name} redaction status`
								}
						  ]
						: [])
				]
			}
		});
	}

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
				html: `Upload a new version<span class="govuk-visually-hidden"> of ${document.name}</span>`
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
				html: `Remove current version<span class="govuk-visually-hidden"> of ${document.name}</span>`
			}
		};

		if (editable) {
			pageComponents.push(uploadUpdatedDocumentButton);
			pageComponents.push(removeDocumentButton);
		}
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
								const versionNumberText = documentVersion.version?.toString() || '';

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
											documentVersion.isDeleted || !versionVirusCheckStatus.checked || !editable
												? ''
												: `<a class="govuk-link" href="${removeDocumentUrl
														?.replace('{{folderId}}', folder.folderId.toString())
														.replace('{{documentId}}', document.id || '')
														.replace(
															'{{versionId}}',
															versionNumberText
														)}">Remove <span class="govuk-visually-hidden"> version ${versionNumberText} of ${
														document.name
												  }</span></a>`
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
		title: pageTitleTextOverride || 'Manage document',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl
			?.replace('{{folderId}}', folder.folderId.toString())
			.replace('{{documentId}}', document.id || ''),
		preHeading: pageTitleTextOverride || 'Manage document',
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
					idPrefix: 'delete-file-answer',
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

				const userName = userData?.name ? surnameFirstToFullName(userData?.name) : '';
				const loggedAt = matchingAuditItem.auditTrail.loggedAt;

				return `<p class="govuk-body"><strong>${
					matchingAuditItem.action
				}</strong>: ${dateISOStringToDisplayTime24hr(loggedAt)}, ${dateISOStringToDisplayDate(
					loggedAt
				)}${userName.length > 0 ? `,<br/>by ${userName}` : ''}</p>`;
			}
		})
		.filter((activityHtmlEntry) => activityHtmlEntry !== undefined)
		.join('');

	return auditActivityHtml;
};

/**
 *
 * @typedef {Object} DocumentFileNameFormData
 * @property {string} documentId
 * @property {string} fileName
 */

/**
 *
 * @param {DocumentFileNameFormData} formData
 * @returns {import('./appeal.documents.service.js').DocumentDetailAPIPatchRequest}
 */
export const mapDocumentFileNameFormDataToAPIRequest = (formData) => {
	const { documentId, fileName } = formData;
	return {
		document: {
			id: documentId,
			fileName
		}
	};
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
			receivedDate: dayMonthYearHourMinuteToISOString({
				day: item.receivedDate.day,
				month: item.receivedDate.month,
				year: item.receivedDate.year
			}),
			redactionStatus: mapRedactionStatusNameToId(redactionStatuses, item.redactionStatus)
		}))
	};
};

/**
 * @param {DocumentDetailsFormData} formData
 * @param {FileUploadInfoItem[]} uncommittedFiles
 * @param {import('@pins/appeals.api').Schema.DocumentRedactionStatus[] | undefined} redactionStatuses
 * @returns
 */
export const addDocumentDetailsFormDataToFileUploadInfo = (
	formData,
	uncommittedFiles,
	redactionStatuses
) => {
	for (const item of formData.items) {
		const matchingInfoItem = uncommittedFiles.find((file) => file.GUID === item.documentId);

		if (matchingInfoItem) {
			if (
				item.receivedDate &&
				item.receivedDate.day &&
				item.receivedDate.month &&
				item.receivedDate.year
			) {
				matchingInfoItem.receivedDate = dayMonthYearHourMinuteToISOString({
					day: item.receivedDate.day,
					month: item.receivedDate.month,
					year: item.receivedDate.year
				});
			}

			if (redactionStatuses && item.redactionStatus) {
				matchingInfoItem.redactionStatus = mapRedactionStatusNameToId(
					redactionStatuses,
					item.redactionStatus
				);
			}
		}
	}
};

/**
 * @param {import('@pins/appeals.api').Schema.DocumentRedactionStatus[]|undefined} redactionStatuses
 * @param {string} redactionStatusName
 * @returns {number}
 */
const mapRedactionStatusNameToId = (redactionStatuses = [], redactionStatusName) => {
	for (const status of redactionStatuses) {
		if (status.name.toLowerCase() === redactionStatusName.toLowerCase()) {
			return Number(status.id);
		}
	}
	return 0;
};

/**
 * @param {string} redactionStatusKey
 * @returns {string}
 */
export const mapRedactionStatusKeyToName = (redactionStatusKey) => {
	switch (redactionStatusKey) {
		case APPEAL_REDACTED_STATUS.REDACTED:
			return 'Redacted';
		case APPEAL_REDACTED_STATUS.NOT_REDACTED:
			return 'Unredacted';
		case APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED:
			return 'No redaction required';
		default:
			return '';
	}
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
 * @param {boolean} [capitalizeFirstLetter]
 * @returns {string}
 */
export const folderPathToFolderNameText = (folderPath, capitalizeFirstLetter = true) => {
	let nameText = (folderPath.split('/')?.[1] || '').replace(/(?<!^)([A-Z])/g, ' $1').toLowerCase();

	if (nameText.endsWith('documents')) {
		nameText = nameText.slice(0, -9);
	}

	nameText = nameText.trim();

	return capitalizeFirstLetter ? capitalize(nameText) : nameText;
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
 * @returns {PageContent}
 */
export function changeDocumentFileNamePage(backLinkUrl, folder, file) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Change document details',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl?.replace('{{folderId}}', folder.folderId.toString()),
		preHeading: 'Change document details',
		heading: `${folderPathToFolderNameText(folder.path)} documents`,
		pageComponents: mapDocumentNameItemToDocumentNamePageComponents(
			file.latestDocumentVersion,
			file.name
		)
	};

	return pageContent;
}

/**
 * @param {string} backLinkUrl
 * @param {FolderInfo} folder
 * @param {Document} file
 * @param {RedactionStatus[]} redactionStatuses
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function changeDocumentDetailsPage(backLinkUrl, folder, file, redactionStatuses, errors) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Change document details',
		backLinkText: 'Back',
		backLinkUrl: backLinkUrl?.replace('{{folderId}}', folder.folderId.toString()),
		preHeading: 'Change document details',
		heading: `${folderPathToFolderNameText(folder.path)} documents`,
		pageComponents: mapDocumentDetailsItemToDocumentDetailsPageComponents(
			file.latestDocumentVersion,
			redactionStatuses,
			errors
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
 * @param {string} virusStatus
 * @returns {DocumentInfo[]}
 */
export function getDocumentsForVirusStatus(folder, virusStatus) {
	let matchingDocuments = [];
	for (let document of Object.values(folder.documents || [])) {
		if (document?.latestDocumentVersion?.virusCheckStatus === virusStatus) {
			matchingDocuments.push(document);
		}
	}
	return matchingDocuments;
}
