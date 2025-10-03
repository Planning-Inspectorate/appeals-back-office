import { getTimetableTypes } from '#appeals/appeal-details/change-appeal-procedure-type/change-appeal-procedure-timetable/change-procedure-timetable.mapper.js';
import { getTimetableTypeText } from '#appeals/appeal-details/timetable/timetable.mapper.js';
import { addressToString } from '#lib/address-formatter.js';
import {
	dateISOStringToDisplayDate,
	dateISOStringToDisplayTime12hr,
	dayMonthYearHourMinuteToISOString
} from '#lib/dates.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { simpleHtmlComponent, textSummaryListItem } from '#lib/mappers/index.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { capitalize, pick } from 'lodash-es';
import { appealProcedureToLabelText } from './change-procedure-check-and-confirm.mapper.js';

/**
 * @typedef {import('../change-procedure-type.controller.js').AppealTimetable} AppealTimetable
 */
/**
 * @typedef {import('../change-procedure-type.controller.js').ChangeProcedureType} ChangeProcedureTypeSession
 */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckAndConfirm = async (request, response) => {
	const {
		errors,
		currentAppeal,
		session,
		params: { appealId, procedureType }
	} = request;

	/** @type {ChangeProcedureTypeSession} */
	const changeProcedureTypeSession = session.changeProcedureType;

	if (!objectContainsAllKeys(changeProcedureTypeSession, 'appealTimetable')) {
		return response.status(500).render('app/500.njk');
	}

	const appealTimetables = changeProcedureTypeSession.appealTimetable;

	const { appellantCase } = request.locals;

	const timeTableTypes = getTimetableTypes(
		currentAppeal.appealType,
		appellantCase.planningObligation?.hasObligation,
		changeProcedureTypeSession.appealProcedure
	);

	/** @type {{ [key: string]: {value?: string, actions?: { [text: string]: { href: string, visuallyHiddenText: string } }} }} */
	let timetableResponses = {};

	/** @type {PageComponent[]} */
	const responses = [
		{
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'appeal-procedure',
						text: 'Appeal procedure',
						value: appealProcedureToLabelText(changeProcedureTypeSession.appealProcedure),
						link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/change-selected-procedure-type`,
						editable: true
					})?.display.summaryListItem
				]
			}
		}
	];

	if ([APPEAL_CASE_PROCEDURE.HEARING, APPEAL_CASE_PROCEDURE.INQUIRY].includes(procedureType)) {
		const values = changeProcedureTypeSession;
		const dateTime = dayMonthYearHourMinuteToISOString({
			day: values['event-date-day'],
			month: values['event-date-month'],
			year: values['event-date-year'],
			hour: values['event-time-hour'],
			minute: values['event-time-minute']
		});
		const date = dateISOStringToDisplayDate(dateTime);
		const time = dateISOStringToDisplayTime12hr(dateTime);
		const address = pick(values, ['addressLine1', 'addressLine2', 'town', 'county', 'postCode']);

		responses.push(
			simpleHtmlComponent(
				'h3',
				{
					class: 'govuk-heading-m'
				},
				`${capitalizeFirstLetter(procedureType)} details`
			)
		);

		if (procedureType === APPEAL_CASE_PROCEDURE.HEARING) {
			responses.push({
				type: 'summary-list',
				parameters: {
					rows: [
						textSummaryListItem({
							id: `${procedureType}-date-known`,
							text: `Do you know the date and time of the ${procedureType}?`,
							value: values.dateKnown ? 'Yes' : 'No',
							link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType}/change-event-date-known`,
							editable: true
						})?.display.summaryListItem
					]
				}
			});
		}

		if (
			procedureType === APPEAL_CASE_PROCEDURE.INQUIRY ||
			(procedureType === APPEAL_CASE_PROCEDURE.HEARING && values.dateKnown)
		) {
			responses.push({
				type: 'summary-list',
				parameters: {
					rows: [
						textSummaryListItem({
							id: `${procedureType}-date`,
							text: `${capitalizeFirstLetter(procedureType)} date`,
							value: date,
							link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType}/date`,
							editable: true
						})?.display.summaryListItem
					]
				}
			});
			responses.push({
				type: 'summary-list',
				parameters: {
					rows: [
						textSummaryListItem({
							id: `${procedureType}-time`,
							text: `${capitalizeFirstLetter(procedureType)} time`,
							value: time,
							link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType}/date`,
							editable: true
						})?.display.summaryListItem
					]
				}
			});
		}

		if (procedureType === APPEAL_CASE_PROCEDURE.INQUIRY) {
			responses.push({
				type: 'summary-list',
				parameters: {
					rows: [
						textSummaryListItem({
							id: 'inquiry-expected-number-of-days',
							text: `Do you know the expected number of days to carry out the ${procedureType}?`,
							value: capitalize(values.estimationYesNo),
							link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType}/estimation`,
							editable: true
						})?.display.summaryListItem
					]
				}
			});
			if (values.estimationYesNo === 'yes') {
				responses.push({
					type: 'summary-list',
					parameters: {
						rows: [
							textSummaryListItem({
								id: 'expected-number-of-days',
								text: `Expected number of days to carry out the ${procedureType}`,
								value: `${values.estimationDays} days`,
								link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType}/estimation`,
								editable: true
							})?.display.summaryListItem
						]
					}
				});
			}
			responses.push({
				type: 'summary-list',
				parameters: {
					rows: [
						textSummaryListItem({
							id: 'address-known',
							text: `Do you know the address of where the ${procedureType} will take place?`,
							value: capitalize(values.addressKnown),
							link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType}/address-known`,
							editable: true
						})?.display.summaryListItem
					]
				}
			});
			if (values.addressKnown === 'yes') {
				responses.push({
					type: 'summary-list',
					parameters: {
						rows: [
							textSummaryListItem({
								id: `${procedureType}-address`,
								text: `Address of where the ${procedureType} will take place`,
								value: { html: addressToString(address, '<br>') },
								link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType}/address`,
								editable: true
							})?.display.summaryListItem
						]
					}
				});
			}
		}
	}

	responses.push(
		simpleHtmlComponent(
			'h3',
			{
				class: 'govuk-heading-m'
			},
			`Timetable due dates`
		)
	);

	timeTableTypes.forEach((timetableType) => {
		if (timetableType in appealTimetables) {
			const currentDueDateIso = appealTimetables && appealTimetables[timetableType];
			const currentDueDate = currentDueDateIso && dateISOStringToDisplayDate(currentDueDateIso);
			const idText = getTimetableTypeText(timetableType) + ' due';
			timetableResponses[idText] = {
				value: currentDueDate,
				actions: {
					Change: {
						href: `change-timetable`,
						visuallyHiddenText: idText + ' date'
					}
				}
			};
		}
	});

	/** @type {PageComponent[]} */
	const afterParams = [];
	if (
		changeProcedureTypeSession.existingAppealProcedure === APPEAL_CASE_PROCEDURE.HEARING &&
		changeProcedureTypeSession.appealProcedure !== APPEAL_CASE_PROCEDURE.HEARING
	) {
		afterParams.push(
			simpleHtmlComponent(
				'p',
				{ class: 'govuk-body' },
				`We’ll send an email to the appellant and LPA to tell them that:`
			),
			simpleHtmlComponent('li', { class: 'govuk-body' }, `we've changed the procedure`),
			simpleHtmlComponent('li', { class: 'govuk-body' }, `we've cancelled the hearing`)
		);
	} else if (
		changeProcedureTypeSession.existingAppealProcedure !==
		changeProcedureTypeSession.appealProcedure
	) {
		afterParams.push(
			simpleHtmlComponent(
				'p',
				{ class: 'govuk-body' },
				`We’ll send an email to the appellant and LPA to tell them that we've changed the procedure.`
			)
		);
	}

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and update appeal procedure',
			heading: 'Check details and update appeal procedure',
			preHeading: `Appeal ${currentAppeal.appealReference}`,
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${currentAppeal.procedureType.toLowerCase()}/change-timetable`,
			submitButtonText: 'Update appeal procedure',
			before: responses,
			responses: timetableResponses,
			after: afterParams
		},
		response,
		errors
	);
};
