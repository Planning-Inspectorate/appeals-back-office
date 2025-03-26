import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	errorAddressProvidedRadio,
	errorEmail,
	errorFirstName,
	errorLastName
} from '#lib/error-handlers/change-screen-error-handlers.js';
import config from '@pins/appeals.web/environment/config.js';
import { DOCUMENT_STAGE, DOCUMENT_TYPE } from '../interested-party-comments.service.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { dateInput } from '#lib/mappers/index.js';
import { dateISOStringToDayMonthYearHourMinute, getTodaysISOString } from '#lib/dates.js';

/** @typedef {import("../../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').interestedPartyComment} IpComment */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {import('#appeals/appeal-details/representations/types.js').RepresentationRequest} RepresentationRequest */
/** @typedef {{ 'day': string, 'month': string, 'year': string }} RequestDate */
/** @typedef {RequestDate} ReqBody */

/** @typedef {import('@pins/appeals/index.js').AddDocumentsRequest} AddDocumentsRequest */

/**
 * @param {Appeal} appealDetails
 * @param {{ firstName: string, lastName: string, emailAddress: string }} values
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 * */
export const ipDetailsPage = (appealDetails, values, errors) => ({
	title: "Interested party's details",
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: "Interested party's details",
	pageComponents: [
		{
			type: 'input',
			parameters: {
				id: 'first-name',
				name: 'firstName',
				type: 'text',
				label: {
					text: 'First name'
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
					text: 'Last name'
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
					text: 'Email address (optional)'
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
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 * */
export const checkAddressPage = (appealDetails, value, errors) => ({
	title: 'Did the interested party provide an address?',
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/ip-details`,
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
 * @param {boolean} providedAddress
 * @param {number} folderId
 * @param {{ appealId: string, folderId: string, files: { GUID: string, name: string, documentType: string, size: number, stage: string, mimeType: string, receivedDate: string, redactionStatus: number, blobStoreUrl: string }[] }} fileUploadInfo - The file upload information object.
 * @returns {import('#appeals/appeal-documents/appeal-documents.types.js').DocumentUploadPageParameters}
 * */
export const uploadPage = (appealDetails, errors, providedAddress, folderId, fileUploadInfo) => ({
	backButtonUrl: providedAddress
		? `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/ip-address`
		: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/check-address`,
	appealId: String(appealDetails.appealId),
	appealReference: appealDetails.appealReference,
	appealShortReference: appealShortReference(appealDetails.appealReference),
	multiple: false,
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
	pageBodyComponents: [],
	documentType: DOCUMENT_TYPE,
	nextPageUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/redaction-status`,
	errors
});

/**
 * @param {{ firstName: string, lastName: string, addressProvided: string, emailAddress: string, addressLine1: string, addressLine2: string, town: string, county: string, postCode: string, redactionStatus: string, 'date-day': string, 'date-month': string, 'date-year': string }} values
 * @param {{ files: [{ GUID: string }] }} fileUpload
 * @returns {RepresentationRequest}
 */
export const mapSessionToRepresentationRequest = (values, fileUpload) => ({
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
	redactionStatus: values.redactionStatus,
	source: ODW_SYSTEM_ID
});

/**
 * @param {number} caseId
 * @param {number} folderId
 * @param {number} redactionStatus
 * @param {string} blobStorageHost
 * @param {string} blobStorageContainer
 * @param {{ files: { GUID: string, name: string, documentType: string, size: number, stage: string, mimeType: string, receivedDate: string, redactionStatus: number, blobStoreUrl: string }[] }} fileUploadInfo - The file upload information object.
 * @returns {AddDocumentsRequest}
 */
export const mapFileUploadInfoToMappedDocuments = (
	caseId,
	folderId,
	redactionStatus,
	blobStorageHost,
	blobStorageContainer,
	fileUploadInfo
) => ({
	blobStorageHost,
	blobStorageContainer,
	documents: fileUploadInfo.files.map(
		/** @type {import('#lib/ts-utilities.js').FileUploadInfoItem} */
		(file) =>
			/** @type {import('@pins/appeals/index.js').MappedDocument} */
			({
				caseId,
				documentName: file.name,
				documentType: file.documentType,
				mimeType: file.mimeType,
				documentSize: file.size,
				stage: file.stage,
				folderId,
				GUID: file.GUID,
				receivedDate: file.receivedDate,
				redactionStatusId: redactionStatus || 1,
				blobStoragePath: file.blobStoreUrl
			})
	)
});

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {ReqBody} date
 * @param {string} backLinkUrl
 * @returns {PageContent}
 * */
export const dateSubmitted = (appealDetails, errors, date, backLinkUrl) => ({
	title: 'When did the interested party submit the comment?',
	backLinkUrl,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	pageComponents: [
		dateInput({
			id: 'date',
			name: 'date',
			value:
				date.day && date.month && date.year
					? date
					: dateISOStringToDayMonthYearHourMinute(getTodaysISOString()),
			legendText: 'When did the interested party submit the comment?',
			legendIsPageHeading: true,
			hint: 'For example, 27 3 2024'
		})
	]
});
