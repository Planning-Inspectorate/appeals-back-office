import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateInput } from '#lib/mappers/components/page-components/date.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';
import { timeInput } from '#lib/mappers/components/page-components/time.js';
import { addressInputs } from '#lib/mappers/index.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealData
 * @param {{ day: string, month: string, year: string, hour: string, minute: string }} values
 * @returns {PageContent}
 */
export function hearingDatePage(appealData, values) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const date = { day: values.day || '', month: values.month || '', year: values.year || '' };
	const time =
		values.hour || values.minute
			? { hour: values.hour || '', minute: values.minute || '' }
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
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${shortAppealReference} - set up hearing`,
		heading: 'Date and time',
		pageComponents: [dateComponent, timeComponent]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {{ addressKnown: string }} values
 * @returns {PageContent}
 */
export function addressKnownPage(appealData, values) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const addressKnownComponent = yesNoInput({
		name: 'addressKnown',
		id: 'address-known',
		legendText: 'Do you know the address of where the hearing will take place?',
		legendIsPageHeading: true,
		value: values.addressKnown
	});

	/** @type {PageContent} */
	const pageContent = {
		title: `Address - set up hearing - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${shortAppealReference} - set up hearing`,
		pageComponents: [addressKnownComponent]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals').Address} currentAddress
 * @param {string} backLinkUrl
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function addressDetailsPage(appealData, backLinkUrl, currentAddress, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Address - set up hearing - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Address',
		pageComponents: addressInputs({ address: currentAddress, errors })
	};

	return pageContent;
}
