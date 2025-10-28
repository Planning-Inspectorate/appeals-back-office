import { getTimetableTypes } from '#appeals/appeal-details/change-procedure-type/change-procedure-timetable/change-procedure-timetable.mapper.js';
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
		params: { appealId }
	} = request;

	const sessionValues =
		request.session['changeProcedureType']?.[request.currentAppeal.appealId] || {};
	const newProcedureType = sessionValues.appealProcedure;

	if (!objectContainsAllKeys(sessionValues, 'appealTimetable')) {
		return response.status(500).render('app/500.njk');
	}

	const appealTimetables = sessionValues.appealTimetable;

	const { appellantCase } = request.locals;

	const timeTableTypes = getTimetableTypes(
		currentAppeal.appealType,
		appellantCase.planningObligation?.hasObligation,
		newProcedureType
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
						value: appealProcedureToLabelText(newProcedureType),
						link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/change-selected-procedure-type`,
						editable: true,
						cypressDataName: 'change-appeal-procedure'
					})?.display.summaryListItem
				]
			}
		}
	];

	if ([APPEAL_CASE_PROCEDURE.HEARING, APPEAL_CASE_PROCEDURE.INQUIRY].includes(newProcedureType)) {
		const dateTime = dayMonthYearHourMinuteToISOString({
			day: sessionValues['event-date-day'],
			month: sessionValues['event-date-month'],
			year: sessionValues['event-date-year'],
			hour: sessionValues['event-time-hour'],
			minute: sessionValues['event-time-minute']
		});
		const date = dateISOStringToDisplayDate(dateTime);
		const time = dateISOStringToDisplayTime12hr(dateTime);
		const address = pick(sessionValues, [
			'addressLine1',
			'addressLine2',
			'town',
			'county',
			'postCode'
		]);

		responses.push(
			simpleHtmlComponent(
				'h3',
				{
					class: 'govuk-heading-m'
				},
				`${capitalizeFirstLetter(newProcedureType)} details`
			)
		);

		if (newProcedureType === APPEAL_CASE_PROCEDURE.HEARING) {
			responses.push({
				type: 'summary-list',
				parameters: {
					rows: [
						textSummaryListItem({
							id: `${newProcedureType}-date-known`,
							text: `Do you know the date and time of the ${newProcedureType}?`,
							value: sessionValues.dateKnown
								? sessionValues.dateKnown.toLowerCase() === 'yes'
									? 'Yes'
									: 'No'
								: 'No',
							link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/change-event-date-known`,
							editable: true,
							cypressDataName: `change-${newProcedureType}-date-known`
						})?.display.summaryListItem
					]
				}
			});
		}

		if (
			newProcedureType === APPEAL_CASE_PROCEDURE.INQUIRY ||
			(newProcedureType === APPEAL_CASE_PROCEDURE.HEARING && sessionValues.dateKnown === 'yes')
		) {
			responses.push({
				type: 'summary-list',
				parameters: {
					rows: [
						textSummaryListItem({
							id: `${newProcedureType}-date`,
							text: `${capitalizeFirstLetter(newProcedureType)} date`,
							value: date,
							link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/date`,
							editable: true,
							cypressDataName: `change-${newProcedureType}-date`
						})?.display.summaryListItem
					]
				}
			});
			responses.push({
				type: 'summary-list',
				parameters: {
					rows: [
						textSummaryListItem({
							id: `${newProcedureType}-time`,
							text: `${capitalizeFirstLetter(newProcedureType)} time`,
							value: time,
							link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/date`,
							editable: true,
							cypressDataName: `change-${newProcedureType}-time`
						})?.display.summaryListItem
					]
				}
			});
		}

		if (newProcedureType === APPEAL_CASE_PROCEDURE.INQUIRY) {
			responses.push({
				type: 'summary-list',
				parameters: {
					rows: [
						textSummaryListItem({
							id: 'expected-number-of-days',
							text: `Do you know the expected number of days to carry out the ${newProcedureType}?`,
							value: capitalize(sessionValues.estimationYesNo),
							link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/estimation`,
							editable: true,
							cypressDataName: `change-${newProcedureType}-estimation`
						})?.display.summaryListItem
					]
				}
			});
			if (sessionValues?.estimationYesNo === 'yes') {
				responses.push({
					type: 'summary-list',
					parameters: {
						rows: [
							textSummaryListItem({
								id: 'expected-number-of-days',
								text: `Expected number of days to carry out the ${newProcedureType}`,
								value: `${sessionValues.estimationDays} days`,
								link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/estimation`,
								editable: true,
								cypressDataName: `change-${newProcedureType}-estimation`
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
							text: `Do you know the address of where the ${newProcedureType} will take place?`,
							value: capitalize(sessionValues.addressKnown),
							link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/address-known`,
							editable: true,
							cypressDataName: `change-${newProcedureType}-address-known`
						})?.display.summaryListItem
					]
				}
			});
			if (sessionValues.addressKnown === 'yes') {
				responses.push({
					type: 'summary-list',
					parameters: {
						rows: [
							textSummaryListItem({
								id: `${newProcedureType}-address`,
								text: `Address of where the ${newProcedureType} will take place`,
								value: { html: addressToString(address, '<br>') },
								link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/address`,
								editable: true,
								cypressDataName: `change-${newProcedureType}-address`
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
		sessionValues.existingAppealProcedure === APPEAL_CASE_PROCEDURE.HEARING &&
		newProcedureType !== APPEAL_CASE_PROCEDURE.HEARING
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
	} else if (sessionValues.existingAppealProcedure !== newProcedureType) {
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
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/change-timetable`,
			submitButtonText: 'Update appeal procedure',
			before: responses,
			responses: timetableResponses,
			after: afterParams
		},
		response,
		errors
	);
};
