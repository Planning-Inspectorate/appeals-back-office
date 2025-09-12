import { mapDocumentInfoVirusCheckStatus } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import config from '#environment/config.js';
import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import { SHOW_MORE_MAXIMUM_ROWS_BEFORE_HIDING } from '#lib/constants.js';
import logger from '#lib/logger.js';
import { appealSiteToMultilineAddressStringHtml } from './address-formatter.js';
import { appealShortReference } from './nunjucks-filters/appeals.js';

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
	return `<ul class="pins-summary-list-sublist">${notificationMethods
		// @ts-ignore
		.map((method) => `<li>${method.name}</li>`)
		.join('')}</ul>`;
};

/**
 *
 * @param {import('@pins/appeals.api').Appeals.LinkedAppeal[]} listOfAppeals
 * @returns {string}
 */
export const formatListOfLinkedAppeals = (listOfAppeals) => {
	if (!listOfAppeals?.length) {
		return '<span>No linked appeals</span>';
	}

	const formattedLinkedAppeals = listOfAppeals.map((linkedAppeal) => {
		const { appealId, appealReference, isParentAppeal, externalSource } = linkedAppeal;
		const shortAppealReference = appealShortReference(appealReference);
		const linkUrl = externalSource
			? generateHorizonAppealUrl(appealId)
			: `/appeals-service/appeal-details/${appealId}`;
		const linkAriaLabel = `Appeal ${numberToAccessibleDigitLabel(shortAppealReference || '')}`;
		const relationshipText = isParentAppeal ? ' (lead)' : '';
		return linkUrl.length > 0
			? `<a href="${linkUrl}" class="govuk-link" data-cy="linked-appeal-${shortAppealReference}" aria-label="${linkAriaLabel}">${shortAppealReference}</a>${relationshipText}`
			: `<span class="govuk-body">${shortAppealReference}</span> ${relationshipText}`;
	});

	if (formattedLinkedAppeals.length === 1) {
		return formattedLinkedAppeals[0];
	} else {
		return `<ul class="govuk-list govuk-list--bullet"><li>${formattedLinkedAppeals.join(
			'</li><li>'
		)}</li></ul>`;
	}
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

	return '<span>No</span>';
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
 * @param {Object} options
 * @param {number} options.appealId
 * @param {import('@pins/appeals.api/src/server/endpoints/appeals.js').DocumentInfo[]} options.documents
 * @param {import('#appeals/appeals.types.js').DocumentRowDisplayMode} [options.displayMode]
 * @param {boolean} [options.isAdditionalDocuments]
 * @returns {TextProperty & ClassesProperty | HtmlProperty & ClassesProperty}
 */
export function formatDocumentValues({ appealId, documents, displayMode, isAdditionalDocuments }) {
	switch (displayMode) {
		case 'none':
			return { text: '' };
		case 'number':
			return formatDocumentValuesAsNumber({ documents });
		case 'list':
		default:
			return formatDocumentValuesAsList({ appealId, documents, isAdditionalDocuments });
	}
}

/**
 * @param {Object} options
 * @param {number} options.appealId
 * @param {import('@pins/appeals.api/src/server/endpoints/appeals.js').DocumentInfo[]} options.documents
 * @param {boolean} [options.isAdditionalDocuments]
 * @returns {HtmlProperty & ClassesProperty}
 */
const formatDocumentValuesAsList = ({ appealId, documents, isAdditionalDocuments }) => {
	/** @type {HtmlProperty} */
	const htmlProperty = {
		html: '',
		pageComponents: []
	};

	if (documents.length > 0) {
		for (let i = 0; i < documents.length; i++) {
			const document = documents[i];
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
					opening: `<li${
						isAdditionalDocuments
							? ` class="govuk-!-margin-bottom-0${
									i > 0 ? ' govuk-!-padding-top-2' : ''
							  } govuk-!-padding-bottom-2${i < documents.length - 1 ? ' pins-border-bottom' : ''}"`
							: ''
					}><span>`,
					closing: '</span></li>'
				},
				type: 'html',
				parameters: {
					html: '',
					pageComponents: documentPageComponents
				}
			});
		}

		if (htmlProperty.pageComponents.length > 1) {
			htmlProperty.wrapperHtml = {
				opening: '<ol class="govuk-list govuk-list--number pins-file-list">',
				closing: '</ol>'
			};
		} else if (htmlProperty.pageComponents.length > 0) {
			htmlProperty.wrapperHtml = {
				opening: '<ul class="govuk-list pins-file-list">',
				closing: '</ul>'
			};
		}
	} else {
		htmlProperty.pageComponents.push({
			type: 'html',
			parameters: {
				html: 'No documents'
			}
		});
		logger.debug('No documents in this folder');
	}

	if (documents.length > SHOW_MORE_MAXIMUM_ROWS_BEFORE_HIDING && isAdditionalDocuments) {
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
 * @param {Object} options
 * @param {import('@pins/appeals.api/src/server/endpoints/appeals.js').DocumentInfo[]} options.documents
 * @returns {TextProperty & ClassesProperty}
 */
const formatDocumentValuesAsNumber = ({ documents }) => {
	return {
		html: `${documents.length > 0 ? documents.length : 'No'} document${
			documents.length === 1 ? '' : 's'
		}`
	};
};

/**
 * @param {number} appealId
 * @param {import('@pins/appeals.api/src/server/endpoints/appeals.js').FolderInfo|undefined} folder
 * @returns {HtmlProperty & ClassesProperty}
 */
export const formatFolderValues = (appealId, folder) => {
	const result = formatDocumentValuesAsList({ appealId, documents: folder?.documents || [] });

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
		case 'not started yet': // TODO (A2-173): replace with data model constants once those are available
			return 'Not yet started';
		case 'finalised': // TODO (A2-173): replace with data model constants once those are available
			return 'Finalised';
		case 'not-applicable': // TODO (A2-173): replace with data model constants once those are available
			return 'Not applicable';
		default:
			return 'Not answered';
	}
};
