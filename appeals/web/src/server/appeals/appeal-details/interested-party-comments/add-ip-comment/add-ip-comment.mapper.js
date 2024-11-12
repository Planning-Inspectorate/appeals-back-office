import config from '@pins/appeals.web/environment/config.js';
import { addressToMultilineStringHtml } from '#lib/address-formatter.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	errorAddressProvidedRadio,
	errorEmail,
	errorFirstName,
	errorLastName
} from '#lib/error-handlers/change-screen-error-handlers.js';
import { DOCUMENT_STAGE, DOCUMENT_TYPE } from '../interested-party-comments.service.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/interested-party-comments/interested-party-comments.types').interestedPartyComment} IpComment */

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
 * @param {Appeal} appealDetails
 * @param {IpComment} values
 * @param {{ files: [{ name:string }] }} fileUpload
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 * */
export const checkYourAnswersPage = (appealDetails, values, fileUpload, errors) => ({
	title: 'Check details and add comment',
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/date-submitted`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: 'Check details and add comment',
	pageComponents: [
		{
			type: 'summary-list',
			parameters: {
				rows: [
					{
						key: {
							text: 'Contact Details'
						},
						value: {
							html: `
								${values?.firstName || ''} ${values?.lastName || ''} <br>
								${values?.emailAddress || ''}
														`
						},
						actions: {
							items: [
								{
									text: 'Change',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/ip-details`
								}
							]
						}
					},
					{
						key: {
							text: 'Address'
						},
						value: {
							html: `${
								values?.addressProvided === 'no'
									? 'Not provided'
									: addressToMultilineStringHtml(values)
							}`
						},
						actions: {
							items: [
								{
									text: 'Change',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/ip-address`
								}
							]
						}
					},
					{
						key: {
							text: 'Comment'
						},
						value: {
							html: `<a href='#'>${fileUpload?.files[0]?.name || ''}</a>`
						},
						actions: {
							items: [
								{
									text: 'Change',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/upload`
								}
							]
						}
					},
					{
						key: {
							text: 'Redaction Status'
						},
						value: {
							html: `
								${values?.redactionStatus || ''}
							`
						},
						actions: {
							items: [
								{
									text: 'Change',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/redaction-status`
								}
							]
						}
					},
					{
						key: {
							text: 'Date Submitted'
						},
						value: {
							html: `
								${values?.['date-day'] || ''}
								${values?.['date-month'] || ''}
								${values?.['date-year'] || ''}
							`
						},
						actions: {
							items: [
								{
									text: 'Change',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/date-submitted`
								}
							]
						}
					}
				],
				errors
			}
		}
	]
});
