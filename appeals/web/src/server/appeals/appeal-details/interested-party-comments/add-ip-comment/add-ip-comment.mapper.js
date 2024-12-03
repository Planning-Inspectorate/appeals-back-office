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

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/interested-party-comments/interested-party-comments.types').interestedPartyComment} IpComment */
/** @typedef {import('#appeals/appeal-details/interested-party-comments/interested-party-comments.types').Representation} Representation */
/** @typedef {import('#appeals/appeal-details/interested-party-comments/interested-party-comments.types').RepresentationRequest} RepresentationRequest */

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
					isPageHeading: false,
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
					isPageHeading: false,
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
					isPageHeading: false,
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
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 * */
export const checkAddressPage = (appealDetails, errors) => ({
	title: 'Did the interested party provide an address?',
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/ip-details`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: 'Did the interested party provide an address?',
	submitButtonProperties: {
		text: 'Continue'
	},
	pageComponents: [
		{
			type: 'radios',
			parameters: {
				name: 'addressProvided',
				idPrefix: 'address-provided',
				items: [
					{
						value: 'yes',
						text: 'Yes'
					},
					{
						value: 'no',
						text: 'No'
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
 * @returns {import('#appeals/appeal-documents/appeal-documents.types.js').DocumentUploadPageParameters}
 * */
export const uploadPage = (appealDetails, errors, providedAddress, folderId) => ({
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
