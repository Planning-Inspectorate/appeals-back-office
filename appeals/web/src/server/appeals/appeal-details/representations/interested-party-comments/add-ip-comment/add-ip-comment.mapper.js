import { mapUncommittedDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate,
	getTodaysISOString
} from '#lib/dates.js';
import { editLink } from '#lib/edit-utilities.js';
import {
	errorAddressProvidedRadio,
	errorEmail,
	errorFirstName,
	errorLastName
} from '#lib/error-handlers/change-screen-error-handlers.js';
import { dateInput } from '#lib/mappers/index.js';
import { redactionStatusIdToKey, redactionStatusIdToName } from '#lib/redaction-statuses.js';
import config from '@pins/appeals.web/environment/config.js';
import { ODW_SYSTEM_ID, REPRESENTATION_ADDED_AS_DOCUMENT } from '@pins/appeals/constants/common.js';
import { APPEAL_REDACTED_STATUS } from '@planning-inspectorate/data-model';
import { capitalize } from 'lodash-es';
import { DOCUMENT_STAGE, DOCUMENT_TYPE } from '../../document-attachments/attachments-service.js';

/** @typedef {import("../../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').interestedPartyComment} IpComment */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {import('#appeals/appeal-details/representations/types.js').RepresentationRequest} RepresentationRequest */
/** @typedef {{ 'day': string, 'month': string, 'year': string }} RequestDate */
/** @typedef {RequestDate} ReqBody */

/**
 * @param {Appeal} appealDetails
 * @param {{ firstName: string, lastName: string, emailAddress: string }} values
 * @param {string} backLinkUrl
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 * */
export const ipDetailsPage = (appealDetails, values, backLinkUrl, errors) => ({
	title: "Interested party's details",
	backLinkUrl,
	preHeading: `Appeal ${appealShortReference(
		appealDetails.appealReference
	)} - add interested party comment`,
	heading: 'Interested party details',
	pageComponents: [
		{
			type: 'input',
			parameters: {
				id: 'first-name',
				name: 'firstName',
				type: 'text',
				label: {
					text: 'First name',
					classes: 'govuk-!-font-weight-bold'
				},
				hint: {
					text: 'Or given name'
				},
				value: values.firstName,
				errorMessage: errorFirstName(errors)
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'last-name',
				name: 'lastName',
				type: 'text',
				label: {
					text: 'Last name',
					classes: 'govuk-!-font-weight-bold'
				},
				hint: {
					text: 'Or family name'
				},
				value: values.lastName,
				errorMessage: errorLastName(errors)
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'email-address',
				name: 'emailAddress',
				type: 'text',
				label: {
					text: 'Email address (optional)',
					classes: 'govuk-!-font-weight-bold'
				},
				value: values.emailAddress,
				errorMessage: errorEmail(errors)
			}
		}
	]
});

/**
 * @param {Appeal} appealDetails
 * @param {string} value
 * @param {string} backLinkUrl
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 * */
export const checkAddressPage = (appealDetails, value, backLinkUrl, errors) => ({
	title: 'Did the interested party provide an address?',
	backLinkUrl,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	submitButtonProperties: {
		text: 'Continue'
	},
	pageComponents: [
		{
			type: 'radios',
			parameters: {
				name: 'addressProvided',
				idPrefix: 'address-provided',
				fieldset: {
					legend: {
						text: 'Did the interested party provide an address?',
						isPageHeading: true,
						classes: 'govuk-fieldset__legend--l'
					}
				},
				items: [
					{
						value: 'yes',
						text: 'Yes',
						checked: value === 'yes'
					},
					{
						value: 'no',
						text: 'No',
						checked: value === 'no'
					}
				],
				errorMessage: errorAddressProvidedRadio(errors)
			}
		}
	]
});

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {string} backButtonUrl
 * @param {number} folderId
 * @param {{ appealId: string, folderId: string, files: { GUID: string, name: string, documentType: string, allowedTypes: string[], size: number, stage: string, mimeType: string, receivedDate: string, redactionStatus: number, blobStoreUrl: string }[] }} fileUploadInfo - The file upload information object.
 * @returns {import('#appeals/appeal-documents/appeal-documents.types.js').DocumentUploadPageParameters}
 * */
export const uploadPage = (appealDetails, errors, backButtonUrl, folderId, fileUploadInfo) => ({
	backButtonUrl,
	appealId: String(appealDetails.appealId),
	appealReference: appealDetails.appealReference,
	preHeadingText: `Appeal ${appealShortReference(
		appealDetails.appealReference
	)} - add interested party comment`,
	multiple: true,
	// TODO: replace with real values
	folderId: String(folderId),
	useBlobEmulator: config.useBlobEmulator,
	...(fileUploadInfo &&
		Number(fileUploadInfo.appealId) === appealDetails.appealId &&
		Number(fileUploadInfo.folderId) === folderId && {
			uncommittedFiles: JSON.stringify({
				files: fileUploadInfo.files
			})
		}),
	blobStorageHost: config.useBlobEmulator ? config.blobEmulatorSasUrl : config.blobStorageUrl,
	blobStorageContainer: config.blobStorageDefaultContainer,
	documentStage: DOCUMENT_STAGE,
	pageHeadingText: 'Upload interested party comment',
	pageBodyComponents: [
		{
			type: 'html',
			parameters: {
				html: `<p class="govuk-body">If you have a redacted version of the comment, you can upload this later.</p>`
			}
		}
	],
	documentType: DOCUMENT_TYPE,
	allowedTypes: [],
	nextPageUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/redaction-status`,
	documentTitle: 'interested party comment document',
	errors
});

/**
 * @param {{ firstName: string, lastName: string, addressProvided: string, emailAddress: string, addressLine1: string, addressLine2: string, town: string, county: string, postCode: string }} values
 * @param {{ files: [{ GUID: string, receivedDate: string, redactionStatus: number }] }} fileUpload
 * @param {import("#appeals/appeal-documents/appeal-documents.mapper.js").RedactionStatus[]} redactionStatuses
 * @returns {RepresentationRequest}
 */
export const mapSessionToRepresentationRequest = (values, fileUpload, redactionStatuses) => {
	const firstDocument = fileUpload.files[0];

	const redactionStatus =
		redactionStatusIdToKey(redactionStatuses, firstDocument?.redactionStatus) ||
		APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED;

	return {
		ipDetails: {
			firstName: values.firstName,
			lastName: values.lastName,
			email: values.emailAddress || ''
		},
		ipAddress: {
			addressLine1: values.addressLine1 || '',
			addressLine2: values.addressLine2 || '',
			town: values.town || '',
			county: values.county || '',
			postCode: values.postCode
		},
		attachments: fileUpload.files.map((file) => file.GUID) || [],
		redactionStatus: redactionStatus,
		source: ODW_SYSTEM_ID,
		dateCreated: firstDocument.receivedDate,
		representationText: REPRESENTATION_ADDED_AS_DOCUMENT
	};
};

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {ReqBody} commentData
 * @param {string} backLinkUrl
 * @returns {PageContent}
 * */
export const dateSubmitted = (appealDetails, errors, commentData, backLinkUrl) => ({
	title: 'When did the interested party submit the comment?',
	backLinkUrl,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	pageComponents: [
		dateInput({
			id: 'date',
			name: 'date',
			namePrefix: 'date',
			value:
				commentData.day && commentData.month && commentData.year
					? { day: commentData.day, month: commentData.month, year: commentData.year }
					: dateISOStringToDayMonthYearHourMinute(getTodaysISOString()),
			legendText: 'When did the interested party submit the comment?',
			legendIsPageHeading: true,
			hint: 'For example, 27 3 2024',
			errors
		})
	]
});

/**
 * @param {import('#appeals/appeal-documents/appeal-documents.types.js').FileUploadInfoItem[]} uploadFiles
 * @param {string} appealReference
 * @param {string} baseUrl
 * @param {import('@pins/appeals.api/src/database/schema.js').DocumentRedactionStatus[]} redactionStatuses
 * @returns {PageComponent[]}
 * */
export const generateCheckAnswersCommentPageComponents = (
	uploadFiles,
	appealReference,
	baseUrl,
	redactionStatuses
) => {
	/** @type {PageComponent[]} */
	let commentPageComponents = [];

	const changeDocumentLinkUrl = editLink(baseUrl, 'upload');

	const changeDetailsLinkUrl = editLink(baseUrl, 'add-document-details');

	/** @ts-ignore */
	uploadFiles.forEach((document, index) => {
		/** @type {HtmlPageComponent} */
		const htmlComponent = {
			type: 'html',
			parameters: {
				html: `<h2 class="govuk-heading-m govuk-!-margin-top-${
					index === 0 ? '5' : '8'
				} govuk-!-margin-bottom-4">Uploaded comment${
					uploadFiles.length > 1 ? ` ${index + 1}` : ''
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
							text: 'Interested party comment document'
						},
						value: {
							html: `<a class="govuk-link" href="${mapUncommittedDocumentDownloadUrl(
								appealReference,
								document.GUID,
								document.name
							)}" target="_blank">${document.name}</a>`
						},
						actions: {
							items: [
								{
									text: 'Change',
									href: changeDocumentLinkUrl,
									visuallyHiddenText: `file ${document.name}`
								}
							]
						}
					},
					{
						key: {
							text: 'Date received'
						},
						value: {
							text: dateISOStringToDisplayDate(document.receivedDate)
						},
						actions: {
							items: [
								{
									text: 'Change',
									href: changeDetailsLinkUrl,
									visuallyHiddenText: `${document.name} date received`
								}
							]
						}
					},
					{
						key: {
							text: 'Redaction status'
						},
						value: {
							text: capitalize(redactionStatusIdToName(redactionStatuses, document.redactionStatus))
						},
						actions: {
							items: [
								{
									text: 'Change',
									href: changeDetailsLinkUrl,
									visuallyHiddenText: `${document.name} redaction status`
								}
							]
						}
					}
				]
			}
		};

		commentPageComponents.push(htmlComponent);
		commentPageComponents.push(summaryListComponent);
	});

	return commentPageComponents;
};
