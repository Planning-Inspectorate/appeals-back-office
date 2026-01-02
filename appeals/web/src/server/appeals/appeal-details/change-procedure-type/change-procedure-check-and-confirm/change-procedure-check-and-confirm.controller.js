import { getTimetableTypes } from '#appeals/appeal-details/change-procedure-type/change-procedure-timetable/change-procedure-timetable.mapper.js';
import { getTimetableTypeText } from '#appeals/appeal-details/timetable/timetable.mapper.js';
import { addressToString } from '#lib/address-formatter.js';
import {
	dateISOStringToDisplayDate,
	dateISOStringToDisplayTime12hr,
	dateStringToISOString,
	dayMonthYearHourMinuteToISOString
} from '#lib/dates.js';
import { clearEditsForAppeal, editLink, getSessionValuesForAppeal } from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { simpleHtmlComponent, textSummaryListItem } from '#lib/mappers/index.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { capitalize, kebabCase, pick } from 'lodash-es';
import { appealProcedureToLabelText } from './change-procedure-check-and-confirm.mapper.js';
import { postProcedureChangeRequest } from './change-procedure-check-and-confirm.service.js';

/**
 * @typedef {import('../change-procedure-type.controller.js').AppealTimetable} AppealTimetable
 */
/**
 * @typedef {import('../change-procedure-type.controller.js').ChangeProcedureType} ChangeProcedureTypeSession
 */
/**
 * @typedef {import('../change-procedure-type.controller.js').ChangeProcedureTypeRequest} ChangeProcedureTypeRequest
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

	const sessionValues = getSessionValuesForAppeal(request, 'changeProcedureType', appealId);
	const newProcedureType = sessionValues.appealProcedure;

	if (!objectContainsAllKeys(sessionValues, 'appealTimetable')) {
		return response.status(500).render('app/500.njk');
	}

	clearEditsForAppeal(request, 'changeProcedureType', appealId);

	const appealTimetables = /** @type {AppealTimetable} */ (sessionValues.appealTimetable);

	const { appellantCase } = request.locals;

	const timeTableTypes = getTimetableTypes(
		currentAppeal.appealType,
		appellantCase.planningObligation?.hasObligation,
		newProcedureType
	);

	/** @type {{ [key: string]: {value?: string, actions?: { [text: string]: { href: string, visuallyHiddenText: string, attributes?: { 'data-cy': string } } }} }} */
	let timetableResponses = {};

	const baseUrl = `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type`;

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
						link: editLink(baseUrl, 'change-selected-procedure-type'),
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
							link: editLink(baseUrl, `${newProcedureType}/change-event-date-known`),
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
							link: editLink(baseUrl, `${newProcedureType}/date`),
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
							link: editLink(baseUrl, `${newProcedureType}/estimation`),
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
								link: editLink(baseUrl, `${newProcedureType}/estimation`),
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
							link: editLink(baseUrl, `${newProcedureType}/address-known`),
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
								link: editLink(baseUrl, `${newProcedureType}/address-details`),
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
			const href = editLink(baseUrl, `${newProcedureType}/change-timetable`);
			timetableResponses[idText] = {
				value: currentDueDate,
				actions: {
					Change: {
						href,
						visuallyHiddenText: idText + ' date',
						attributes: {
							'data-cy': `change-${kebabCase(timetableType)}`
						}
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
			simpleHtmlComponent(
				'ul',
				{ class: 'govuk-list govuk-list--bullet govuk-!-margin-bottom-6' },
				`<li>we've changed the procedure</li><li>we've cancelled the hearing</li>`
			)
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

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postCheckAndConfirm = async (request, response) => {
	try {
		const {
			params: { appealId }
		} = request;

		const sessionValues = /** @type {ChangeProcedureTypeSession} */ (
			/** @type {unknown} */ (getSessionValuesForAppeal(request, 'changeProcedureType', appealId))
		);
		const newProcedureType = sessionValues.appealProcedure;

		if (!newProcedureType) {
			return response.status(500).render('app/500.njk');
		}

		const requestValues = mapSessionValuesForRequest(sessionValues);

		await postProcedureChangeRequest(request.apiClient, appealId, requestValues);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'procedureTypeChanged',
			appealId
		});

		delete request.session['changeProcedureType']?.[request.currentAppeal.appealId];

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when posting the check details and change procedure'
		);

		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {ChangeProcedureTypeSession} values
 * @returns {ChangeProcedureTypeRequest}
 */
const mapSessionValuesForRequest = (values) => {
	const eventDate = dayMonthYearHourMinuteToISOString({
		day: values['event-date-day'],
		month: values['event-date-month'],
		year: values['event-date-year'],
		hour: values['event-time-hour'],
		minute: values['event-time-minute']
	});

	const address = {
		address: {
			...pick(values, ['addressLine1', 'addressLine2', 'town', 'county']),
			...(values['postCode'] ? { postcode: values['postCode'] } : {})
		}
	};
	const includeAddress = address && Object.keys(address.address).length > 0 ? address : {};

	/**@type {ChangeProcedureTypeRequest} */
	return {
		existingAppealProcedure: values.existingAppealProcedure,
		appealProcedure: values.appealProcedure,
		eventDate,
		...includeAddress,
		estimationDays: values.estimationDays,
		lpaQuestionnaireDueDate: dateStringToISOString(values.appealTimetable.lpaQuestionnaireDueDate),
		ipCommentsDueDate: dateStringToISOString(values.appealTimetable.ipCommentsDueDate),
		lpaStatementDueDate: dateStringToISOString(values.appealTimetable.lpaStatementDueDate),
		finalCommentsDueDate: dateStringToISOString(values.appealTimetable.finalCommentsDueDate),
		statementOfCommonGroundDueDate: dateStringToISOString(
			values.appealTimetable.statementOfCommonGroundDueDate
		),
		...(values.appealTimetable.planningObligationDueDate
			? {
					planningObligationDueDate: dateStringToISOString(
						values.appealTimetable.planningObligationDueDate
					)
			  }
			: {}),
		proofOfEvidenceAndWitnessesDueDate: dateStringToISOString(
			values.appealTimetable.proofOfEvidenceAndWitnessesDueDate
		),
		caseManagementConferenceDueDate: dateStringToISOString(
			values.appealTimetable.caseManagementConferenceDueDate
		)
	};
};
