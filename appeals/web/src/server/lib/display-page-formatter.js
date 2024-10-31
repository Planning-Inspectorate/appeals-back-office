import logger from '#lib/logger.js';
import config from '#environment/config.js';
import { appealShortReference } from './nunjucks-filters/appeals.js';
import { mapDocumentInfoVirusCheckStatus } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import { dateISOStringToDayMonthYearHourMinute, dateIsInThePast } from '#lib/dates.js';
import { appealSiteToMultilineAddressStringHtml } from './address-formatter.js';
import { SHOW_MORE_MAXIMUM_ROWS_BEFORE_HIDING } from '#lib/constants.js';

/**
 * @typedef {import('@pins/appeals.api').Schema.Folder} Folder
 * @typedef {import('@pins/appeals.api').Schema.Document} Document
 * @typedef {import('@pins/appeals.api').Appeals.DocumentInfo} DocumentInfo
 * @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo
 * @typedef {import('@pins/appeals.api').Schema.LPANotificationMethods} LPANotificationMethods
 */

/**
 *
 * @param {number} appealId
 * @param {any} listOfDocuments
 * @param {string} documentUploadUrlTemplate
 * @returns
 */
export const formatDocumentActionLink = (appealId, listOfDocuments, documentUploadUrlTemplate) => {
	if (
		listOfDocuments != null &&
		typeof listOfDocuments === 'object' &&
		'documents' in listOfDocuments
	) {
		return documentUploadUrlTemplate
			.replace('{{appealId}}', String(appealId))
			.replace('{{folderId}}', listOfDocuments.folderId)
			.replace('/{{documentId}}', '');
	}
	return `#`;
};

/**
 * @param {LPANotificationMethods[] | null | undefined} notificationMethods
 * @returns {string}
 */
export const formatListOfNotificationMethodsToHtml = (notificationMethods) => {
	if (!notificationMethods || !notificationMethods.length) {
		return '';
	}
	// TODO: check LPANotificationMethodDetails in SingleAppellantCaseResponse
	// @ts-ignore
	return `<ul>${notificationMethods.map((method) => `<li>${method.name}</li>`).join('')}</ul>`;
};

/**
 *
 * @param {import('@pins/appeals.api').Appeals.LinkedAppeal[]} listOfAppeals
 * @returns {string}
 */
export const formatListOfLinkedAppeals = (listOfAppeals) => {
	if (listOfAppeals && listOfAppeals.length > 0) {
		let formattedLinks = '';

		for (let i = 0; i < listOfAppeals.length; i++) {
			const shortAppealReference = appealShortReference(listOfAppeals[i].appealReference);
			const linkUrl = listOfAppeals[i].externalSource
				? generateHorizonAppealUrl(listOfAppeals[i].appealId)
				: `/appeals-service/appeal-details/${listOfAppeals[i].appealId}`;
			const linkAriaLabel = `Appeal ${numberToAccessibleDigitLabel(shortAppealReference || '')}`;
			const relationshipText = listOfAppeals[i].isParentAppeal ? ' (Lead)' : ' (Child)';

			formattedLinks +=
				linkUrl.length > 0
					? `<li><a href="${linkUrl}" class="govuk-link" data-cy="linked-appeal-${shortAppealReference}" aria-label="${linkAriaLabel}">${shortAppealReference}</a> ${relationshipText}</li>`
					: `<li><span class="govuk-body">${shortAppealReference}</span> ${relationshipText}</li>`;
		}

		return `<ul class="govuk-list govuk-list--bullet">${formattedLinks}</ul>`;
	}

	return '<span>No appeals</span>';
};

/**
 *
 * @param {import('@pins/appeals.api').Appeals.RelatedAppeal[]} listOfAppeals
 * @returns {string}
 */
export const formatListOfRelatedAppeals = (listOfAppeals) => {
	if (listOfAppeals && listOfAppeals.length > 0) {
		let formattedLinks = '';

		for (let i = 0; i < listOfAppeals.length; i++) {
			const shortAppealReference = appealShortReference(listOfAppeals[i].appealReference);
			const linkUrl = listOfAppeals[i].externalSource
				? generateHorizonAppealUrl(listOfAppeals[i].externalId)
				: `/appeals-service/appeal-details/${listOfAppeals[i].appealId}`;
			const linkAriaLabel = `Appeal ${numberToAccessibleDigitLabel(shortAppealReference || '')}`;

			formattedLinks +=
				linkUrl.length > 0
					? `<li><a href="${linkUrl}" class="govuk-link" data-cy="related-appeal-${shortAppealReference}" aria-label="${linkAriaLabel}">${shortAppealReference}</a></li>`
					: `<li><span class="govuk-body">${shortAppealReference}</span></li>`;
		}

		return `<ul class="govuk-list govuk-list--bullet">${formattedLinks}</ul>`;
	}

	return '<span>No appeals</span>';
};

/**
 * @param {import('@pins/appeals.api/src/server/endpoints/appeals.js').ListedBuildingDetailsResponse[]} listOfListedBuildingNumbers
 * @returns {string}
 */
export const formatListOfListedBuildingNumbers = (listOfListedBuildingNumbers) => {
	if (listOfListedBuildingNumbers.length > 0) {
		let formattedLinks = ``;
		for (let i = 0; i < listOfListedBuildingNumbers.length; i++) {
			const listedBuildingNumber = listOfListedBuildingNumbers[i];
			if ('listEntry' in listedBuildingNumber) {
				formattedLinks += `<li><a href='https://historicengland.org.uk/listing/the-list/list-entry/${
					listedBuildingNumber.listEntry
				}' class="govuk-link" aria-label="Listed building number ${numberToAccessibleDigitLabel(
					listedBuildingNumber.listEntry || ''
				)}">${listedBuildingNumber.listEntry}</a></li>`;
			} else {
				formattedLinks += `<li><a href='https://historicengland.org.uk' class='govuk-link'>ListEntryNumber not yet in BD</a></li>`;
			}
		}
		return `<ul class="govuk-list">${formattedLinks}</ul>`;
	}
	return '<span>No listed building details</span>';
};

/**
 * @param {number} appealId
 * @param {*[]} listOfDocuments
 * @param {boolean} [isAdditionalDocuments]
 * @returns {HtmlProperty & ClassesProperty}
 */
export const formatDocumentValues = (appealId, listOfDocuments, isAdditionalDocuments = false) => {
	/** @type {HtmlProperty} */
	const htmlProperty = {
		html: '',
		pageComponents: []
	};

	if (listOfDocuments.length > 0) {
		for (let i = 0; i < listOfDocuments.length; i++) {
			const document = listOfDocuments[i];
			const virusCheckStatus = mapDocumentInfoVirusCheckStatus(document);

			/** @type {PageComponent[]} */
			const documentPageComponents = [];

			if (virusCheckStatus.safe) {
				documentPageComponents.push({
					type: 'html',
					parameters: {
						html: `<a href='/documents/${appealId}/download/${document.id}/${document.name}' data-cy='document-${document.id}' target="_blank" class="govuk-link">${document.name}</a>`
					}
				});
			} else {
				documentPageComponents.push({
					type: 'html',
					wrapperHtml: {
						opening: '<span>',
						closing: ''
					},
					parameters: {
						html: '',
						pageComponents: [
							{
								type: 'html',
								parameters: {
									html: `<div class="govuk-body govuk-!-margin-bottom-2">${document.name}</div>`
								}
							}
						]
					}
				});
				documentPageComponents.push({
					type: 'html',
					wrapperHtml: {
						opening: '',
						closing: '</span>'
					},
					parameters: {
						html: '',
						pageComponents: [
							{
								type: 'status-tag',
								parameters: {
									status: virusCheckStatus.statusText || ''
								}
							}
						]
					}
				});
			}

			if (isAdditionalDocuments && document.latestDocumentVersion.isLateEntry) {
				documentPageComponents.push({
					type: 'status-tag',
					parameters: {
						status: 'late_entry'
					}
				});
			}

			htmlProperty.pageComponents.push({
				wrapperHtml: {
					opening: isAdditionalDocuments
						? `<li class="govuk-!-margin-bottom-0${
								i > 0 ? ' govuk-!-padding-top-2' : ''
						  } govuk-!-padding-bottom-2${
								i < listOfDocuments.length - 1 ? ' pins-border-bottom' : ''
						  }">`
						: '<li>',
					closing: '</li>'
				},
				type: 'html',
				parameters: {
					html: '',
					pageComponents: documentPageComponents
				}
			});
		}

		if (htmlProperty.pageComponents.length > 0) {
			htmlProperty.wrapperHtml = {
				opening: '<ul class="govuk-list">',
				closing: '</ul>'
			};
		}
	} else {
		htmlProperty.pageComponents.push({
			type: 'html',
			parameters: {
				html: '	No documents available'
			}
		});
		logger.debug('No documents in this folder');
	}

	if (listOfDocuments.length > SHOW_MORE_MAXIMUM_ROWS_BEFORE_HIDING && isAdditionalDocuments) {
		htmlProperty.pageComponents = [
			{
				type: 'show-more',
				parameters: {
					labelText: 'additional documents',
					html: '',
					contentRowSelector: 'li',
					toggleTextCollapsed: 'View all',
					pageComponents: [
						{
							type: 'html',
							wrapperHtml: htmlProperty.wrapperHtml,
							parameters: {
								html: '',
								pageComponents: htmlProperty.pageComponents
							}
						}
					]
				}
			}
		];

		delete htmlProperty.wrapperHtml;
	}

	return htmlProperty;
};

/**
 * @param {number} appealId
 * @param {import('@pins/appeals.api/src/server/endpoints/appeals.js').FolderInfo|undefined} folder
 * @returns {HtmlProperty & ClassesProperty}
 */
export const formatFolderValues = (appealId, folder) => {
	const mappedDocumentInfo =
		folder?.documents?.map((document) => {
			const documentInfo = {
				id: document.id,
				name: document.name,
				folderId: folder.folderId,
				caseId: appealId,
				virusCheckStatus: document.latestDocumentVersion?.virusCheckStatus,
				isLateEntry: document.latestDocumentVersion?.isLateEntry
			};

			return documentInfo;
		}) || [];

	const result = formatDocumentValues(appealId, mappedDocumentInfo);

	return result;
};

/**
 * @param {any} value
 * @returns {string | undefined}
 */
export function nullToEmptyString(value) {
	if (value !== undefined) {
		return value !== null ? value : '';
	} else {
		return undefined;
	}
}

/**
 * @param {string|undefined} status
 * @param {string|null|undefined} [dueDate]
 * @returns {string}
 */
export function mapDocumentStatus(status, dueDate) {
	switch (status?.toLowerCase()) {
		case 'received':
			return 'Received';
		case 'not_received':
			return 'Not received';
		case 'invalid':
			return 'Invalid';
		case 'incomplete':
			if (dueDate) {
				const parsedDueDate = dateISOStringToDayMonthYearHourMinute(dueDate);
				if (
					parsedDueDate &&
					parsedDueDate.year &&
					parsedDueDate.month &&
					parsedDueDate.day &&
					dateIsInThePast({
						year: parsedDueDate.year,
						month: parsedDueDate.month,
						day: parsedDueDate.day
					})
				) {
					return 'Overdue';
				}
			}
			return 'Incomplete';
		case 'valid':
			return 'Valid';
		case 'complete':
			return 'Complete';
		default:
			return '';
	}
}

/**
 * @param {string|null|undefined} freeText
 * @returns {string}
 */
export function formatFreeTextForDisplay(freeText) {
	if (!freeText || freeText.length === 0) {
		return '';
	}

	return freeText.replaceAll(/\n/g, '<br>');
}

/**
 * @param {{address: import('@pins/appeals.api').Appeals.AppealSite}[]} arrayOfAddresses
 * @returns
 */
export function formatListOfAddresses(arrayOfAddresses) {
	if (arrayOfAddresses.length > 0) {
		let formattedList = ``;
		for (let i = 0; i < arrayOfAddresses.length; i++) {
			const address = arrayOfAddresses[i].address;
			formattedList += `<li>${appealSiteToMultilineAddressStringHtml(address)}</li>`;
		}
		return `<ul class="govuk-list govuk-list--bullet">${formattedList}</ul>`;
	}
	return '<span>None</span>';
}

/**
 * @param {string|number|null|undefined} appealId
 * @returns {string}
 */
export function generateHorizonAppealUrl(appealId) {
	if (appealId === null || appealId === undefined) {
		return '';
	}

	return config.horizonAppealBaseUrl && config.horizonAppealBaseUrl.length
		? `${config.horizonAppealBaseUrl}${appealId}`
		: '';
}

/**
 * @param {string|null|undefined} planningObligationStatus
 * @returns {string}
 */
export const formatPlanningObligationStatus = (planningObligationStatus) => {
	switch (planningObligationStatus) {
		case 'not_started': // TODO (A2-173): replace with data model constants once those are available
			return 'Not yet started';
		case 'finalised': // TODO (A2-173): replace with data model constants once those are available
			return 'Finalised';
		default:
			return 'Not applicable';
	}
};
