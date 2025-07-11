// @ts-nocheck
import { mapLpaQuestionnaire } from '#lib/mappers/data/appeal/submappers/lpa-questionnaire.mapper.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';

describe('lpa-questionnaire.mapper', () => {
	let params;
	const todayFormatted = dateISOStringToDisplayDate(new Date());

	beforeEach(() => {
		params = {
			appealDetails: {
				startedAt: new Date('2025-01-01'),
				documentationSummary: { lpaQuestionnaire: { status: 'not_received' } },
				appealTimetable: { lpaQuestionnaireDueDate: new Date() }
			},
			currentRoute: '/appeal-questionnaire',
			request: { originalUrl: '/original-url' }
		};
	});

	it('Should be awaiting a start date when there is no start date', () => {
		params.appealDetails.startedAt = undefined;
		const result = mapLpaQuestionnaire(params);
		const [label, status, received, action] = result.display.tableItem;
		expect(label.text).toEqual('LPA questionnaire');
		expect(status.text).toEqual('Awaiting start date');
		expect(received.text).toEqual('Not applicable');
		expect(action.html).toEqual('');
	});

	it('Should be overdue if the due date is in the past', () => {
		params.appealDetails.appealTimetable.lpaQuestionnaireDueDate = new Date('2025-01-01');
		const result = mapLpaQuestionnaire(params);
		const [label, status, received, action] = result.display.tableItem;
		expect(label.text).toEqual('LPA questionnaire');
		expect(status.text).toEqual('Overdue');
		expect(received.text).toEqual('Due by 1 January 2025');
		expect(action.html).toEqual('');
	});

	it('Should be awaiting the questionnaire if it has not been received', () => {
		params.appealDetails.documentationSummary.lpaQuestionnaire.status = 'not_received';
		const result = mapLpaQuestionnaire(params);
		const [label, status, received, action] = result.display.tableItem;
		expect(label.text).toEqual('LPA questionnaire');
		expect(status.text).toEqual('Awaiting questionnaire');
		expect(received.text).toEqual(`Due by ${todayFormatted}`);
		expect(action.html).toEqual('');
	});

	it('Should be ready to review if it has been received', () => {
		params.appealDetails.documentationSummary.lpaQuestionnaire.status = 'received';
		const result = mapLpaQuestionnaire(params);
		const [label, status, received, action] = result.display.tableItem;
		expect(label.text).toEqual('LPA questionnaire');
		expect(status.text).toEqual('Ready to review');
		expect(received.text).toEqual('');
		expect(action.html).toContain('class="govuk-link">Review<span');
	});

	it('Should be ready to view if it is complete', () => {
		params.appealDetails.documentationSummary.lpaQuestionnaire.status = 'complete';
		const result = mapLpaQuestionnaire(params);
		const [label, status, received, action] = result.display.tableItem;
		expect(label.text).toEqual('LPA questionnaire');
		expect(status.text).toEqual('Complete');
		expect(received.text).toEqual('');
		expect(action.html).toContain('class="govuk-link">View<span');
	});

	it('Should be ready to view if it is incomplete', () => {
		params.appealDetails.documentationSummary.lpaQuestionnaire.status = 'incomplete';
		const result = mapLpaQuestionnaire(params);
		const [label, status, received, action] = result.display.tableItem;
		expect(label.text).toEqual('LPA questionnaire');
		expect(status.text).toEqual('Incomplete');
		expect(received.text).toEqual('');
		expect(action.html).toContain('class="govuk-link">View<span');
	});
});
