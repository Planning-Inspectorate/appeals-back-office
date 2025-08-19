import { objectContainsAllKeys } from '#lib/object-utilities.js';
import {
	getAppealTimetableTypes,
	getTimetableTypeText
} from '#appeals/appeal-details/timetable/timetable.mapper.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { simpleHtmlComponent, textSummaryListItem } from '#lib/mappers/index.js';
import { appealProcedureToLabelText } from './check-and-confirm.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckAndConfirm = async (request, response) => {
	const {
		errors,
		currentAppeal,
		session,
		params: { appealId }
	} = request;

	if (
		!objectContainsAllKeys(session, 'changeProcedureType') ||
		!objectContainsAllKeys(session.changeProcedureType, 'appealTimetable')
	) {
		return response.status(500).render('app/500.njk');
	}

	const appealTimetables = session.changeProcedureType.appealTimetable;

	const { appellantCase } = request.locals;

	const timeTableTypes = getAppealTimetableTypes(currentAppeal, appellantCase);

	/** @type {{ [key: string]: {value?: string, actions?: { [text: string]: { href: string, visuallyHiddenText: string } }} }} */
	let timetableResponses = {};

	/** @type {PageComponent[]} */
	let responses = [
		{
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'appeal-procedure',
						text: 'Appeal procedure',
						value: appealProcedureToLabelText(session.changeProcedureType.appealProcedure),
						link: `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/change-selected-procedure-type`,
						editable: true
					})?.display.summaryListItem
				]
			}
		},
		simpleHtmlComponent(
			'h3',
			{
				class: 'govuk-heading-m'
			},
			`Timetable due dates`
		)
	];

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

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and update appeal procedure',
			heading: 'Check details and update appeal procedure',
			preHeading: `Appeal ${currentAppeal.appealReference}`,
			backLinkUrl: `change-timetable`,
			submitButtonText: 'Update appeal procedure',
			before: responses,
			responses: timetableResponses,
			after: [
				simpleHtmlComponent(
					'p',
					{ class: 'govuk-body' },
					`We’ll send an email to the appellant and LPA to tell them that:`
				),
				simpleHtmlComponent('li', { class: 'govuk-body' }, `we've changed the procedure`),
				simpleHtmlComponent('li', { class: 'govuk-body' }, `we've cancelled the hearing`)
			]
		},
		response,
		errors
	);
};
