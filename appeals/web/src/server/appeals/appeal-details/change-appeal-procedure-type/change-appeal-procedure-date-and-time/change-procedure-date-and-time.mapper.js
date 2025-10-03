import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateInput } from '#lib/mappers/components/page-components/date.js';
import { timeInput } from '#lib/mappers/components/page-components/time.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {{ day?: string | number, month?: string | number, year?: string | number, hour?: string | number, minute?: string | number }} values
 * @param {string} procedureType
 * @returns {PageContent}
 */
export function eventChangeProcedureDatePage(appealData, values, procedureType) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const date = { day: values.day || '', month: values.month || '', year: values.year || '' };
	const time =
		String(values.hour) || String(values.minute)
			? { hour: String(values.hour) || '', minute: String(values.minute).padStart(2, '0') || '' }
			: { hour: '10', minute: '00' };

	const dateComponent = dateInput({
		name: 'event-date',
		id: 'event-date',
		namePrefix: 'event-date',
		legendText: 'Date',
		legendClasses: 'govuk-fieldset__legend--m',
		hint: 'For example, 31 3 2025',
		value: date
	});

	const timeComponent = timeInput({
		id: 'event-time',
		hint: 'For example, 9:00 or 13:15',
		value: { hour: time?.hour, minute: time?.minute },
		legendText: 'Time',
		legendClasses: 'govuk-fieldset__legend--m',
		showLabels: true
	});

	/** @type {PageContent} */
	return {
		title: `Date and time - set up ${procedureType} - ${shortAppealReference}`,
		backLinkUrl:
			procedureType === APPEAL_CASE_PROCEDURE.HEARING
				? `/appeals-service/appeal-details/${appealData.appealId}/change-appeal-procedure-type/${procedureType}/change-event-date-known`
				: `/appeals-service/appeal-details/${appealData.appealId}/change-appeal-procedure-type/change-selected-procedure-type`,
		preHeading: `Appeal ${shortAppealReference} - update appeal procedure`,
		heading: `${capitalizeFirstLetter(procedureType)} date and time`,
		pageComponents: [dateComponent, timeComponent]
	};
}
