import { addressToString } from '#lib/address-formatter.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/components/page-components/date.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';
import { timeInput } from '#lib/mappers/components/page-components/time.js';
import { addressInputs } from '#lib/mappers/index.js';
import { addQueryParamsToUrl, preserveQueryString } from '#lib/url-utilities.js';
import { capitalize } from 'lodash-es';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealData
 * @param {{ day?: string | number, month?: string | number, year?: string | number, hour?: string | number, minute?: string | number }} values
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export function hearingDatePage(appealData, values, backLinkUrl) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const date = { day: values.day || '', month: values.month || '', year: values.year || '' };
	const time =
		String(values.hour) || String(values.minute)
			? { hour: String(values.hour) || '', minute: String(values.minute).padStart(2, '0') || '' }
			: { hour: '10', minute: '00' };

	const dateComponent = dateInput({
		name: 'hearing-date',
		id: 'hearing-date',
		namePrefix: 'hearing-date',
		legendText: 'Date',
		legendClasses: 'govuk-fieldset__legend--m',
		hint: 'For example, 31 3 2025',
		value: date
	});

	const timeComponent = timeInput({
		id: 'hearing-time',
		hint: 'For example, 9:00 or 13:15',
		value: { hour: time?.hour, minute: time?.minute },
		legendText: 'Time',
		legendClasses: 'govuk-fieldset__legend--m',
		showLabels: true
	});

	/** @type {PageContent} */
	const pageContent = {
		title: `Date and time - set up hearing - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - set up hearing`,
		heading: 'Date and time',
		pageComponents: [dateComponent, timeComponent]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {string} backLinkUrl
 * @param {Record<string, string>} [values]
 * @returns {PageContent}
 */
export function addressKnownPage(appealData, backLinkUrl, values) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const addressKnownComponent = yesNoInput({
		name: 'addressKnown',
		id: 'address-known',
		legendText: 'Do you know the address of where the hearing will take place?',
		legendIsPageHeading: true,
		value: values?.addressKnown
	});

	/** @type {PageContent} */
	const pageContent = {
		title: `Address - set up hearing - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - set up hearing`,
		pageComponents: [addressKnownComponent]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {Record<string, string>} values
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export function addressDetailsPage(appealData, values, errors, backLinkUrl) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Address - set up hearing - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Address',
		pageComponents: addressInputs({ address: values, errors })
	};

	return pageContent;
}

/**
 * @typedef {import('@pins/appeals').Address} Address
 */

/**
 * @param {Appeal} appealData
 * @param {{ hearingDateTime?: string, addressKnown?: string, address?: Address }} values
 * @param {string} action
 * @param {import('@pins/express').Request} request
 * @returns {PageContent}
 */
export function checkDetailsPage(appealData, values, action, request) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/**
	 * @param {string} slug - The last part of the URL path
	 * @returns {string}
	 */
	const editLink = (slug) => {
		const url = `/appeals-service/appeal-details/${appealData.appealId}/hearing/${action}/${slug}`;
		return addQueryParamsToUrl(preserveQueryString(request, url), { editEntrypoint: url });
	};

	/** @type {SummaryListRowProperties[]} */
	const rows = [
		{
			key: { text: 'Date' },
			value: { text: dateISOStringToDisplayDate(values.hearingDateTime) },
			actions: {
				items: [
					{
						text: 'Change',
						href: editLink('date'),
						visuallyHiddenText: 'Date',
						attributes: {
							'data-cy': 'change-date'
						}
					}
				]
			}
		},
		{
			key: { text: 'Time' },
			value: { text: dateISOStringToDisplayTime12hr(values.hearingDateTime) },
			actions: {
				items: [
					{
						text: 'Change',
						href: editLink('date'),
						visuallyHiddenText: 'Time',
						attributes: {
							'data-cy': 'change-time'
						}
					}
				]
			}
		},
		{
			key: { text: 'Do you know the address of where the hearing will take place?' },
			value: { text: capitalize(values.addressKnown) },
			actions: {
				items: [
					{
						text: 'Change',
						href: editLink('address'),
						visuallyHiddenText: 'Whether the address is known or not',
						attributes: {
							'data-cy': 'change-address-known'
						}
					}
				]
			}
		}
	];

	if (values.addressKnown === 'yes' && values.address) {
		rows.push({
			key: { text: 'Address' },
			value: { html: addressToString(values.address, '<br>') },
			actions: {
				items: [
					{
						text: 'Change',
						href: editLink('address-details'),
						visuallyHiddenText: 'Address',
						attributes: {
							'data-cy': 'change-address-details'
						}
					}
				]
			}
		});
	}

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: { rows }
	};

	const backLinkUrl = preserveQueryString(
		request,
		values.addressKnown === 'yes'
			? `/appeals-service/appeal-details/${appealData.appealId}/hearing/${action}/address-details`
			: `/appeals-service/appeal-details/${appealData.appealId}/hearing/${action}/address`
	);

	/** @type {PageContent} */
	const pageContent = {
		title: `Check details and set up hearing - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Check details and set up hearing`,
		pageComponents: [summaryListComponent],
		submitButtonText: action === 'change' ? 'Update hearing' : 'Set up hearing'
	};

	return pageContent;
}
