import config from '@pins/appeals.web/environment/config.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	errorAddressProvidedRadio,
	errorEmail,
	errorFirstName,
	errorLastName
} from '#lib/error-handlers/change-screen-error-handlers.js';
import { addressInputs } from '#lib/mappers/components/address.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */

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
 * @param {{ addressLine1: string, addressLine2: string, town: string, county: string, postCode: string }} address
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 * */
export const ipAddressPage = (appealDetails, address, errors) => ({
	title: "Interested party's address",
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/check-address`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: "Interested party's address",
	pageComponents: addressInputs({ address, errors })
});

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {boolean} providedAddress
 * @returns {import('#appeals/appeal-documents/appeal-documents.types.js').DocumentUploadPageParameters}
 * */
export const uploadPage = (appealDetails, errors, providedAddress) => ({
	backButtonUrl: providedAddress
		? `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/ip-address`
		: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/check-address`,
	appealId: String(appealDetails.appealId),
	appealReference: appealDetails.appealReference,
	appealShortReference: appealShortReference(appealDetails.appealReference),
	multiple: false,
	// TODO: replace with real values
	folderId: '',
	useBlobEmulator: config.useBlobEmulator,
	blobStorageHost: '',
	blobStorageContainer: '',
	documentStage: '',
	pageHeadingText: 'Upload interested party comment',
	pageBodyComponents: [],
	documentType: '',
	nextPageUrl: '',
	errors
});

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 * */
export const redactionStatusPage = (appealDetails, errors) => ({
	title: 'Select redaction status',
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/upload`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: 'Select redaction status',
	pageComponents: [
		{
			type: 'radios',
			parameters: {
				name: 'redactionStatus',
				items: [
					{
						value: 'redacted',
						text: 'Redacted'
					},
					{
						value: 'unredacted',
						text: 'Unredacted'
					},
					{
						value: 'not-required',
						text: 'No redaction required'
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
 * @param {{ 'date-day': string, 'date-month': string, 'date-year': string }} date
 * @returns {PageContent}
 * */
export const dateSubmittedPage = (appealDetails, errors, date) => ({
	title: 'Enter date submitted',
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/redaction-status`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: 'Enter date submitted',
	pageComponents: [
		{
			type: 'date-input',
			parameters: {
				id: 'date',
				namePrefix: 'date',
				fieldset: {
					legend: {
						text: '',
						classes: 'govuk-fieldset__legend--m'
					}
				},
				hint: {
					text: 'For example, 28 10 2024'
				},
				items: [
					{
						classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
						name: 'day',
						value: date['date-day'] || ''
					},
					{
						classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
						name: 'month',
						value: date['date-month'] || ''
					},
					{
						classes: 'govuk-input govuk-date-input__input govuk-input--width-4',
						name: 'year',
						value: date['date-year'] || ''
					}
				],
				errors
			}
		}
	]
});
