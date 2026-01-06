import { appealData } from '#testing/appeals/appeals.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const appealDataWithoutStartDate = {
	...appealData,
	startedAt: null,
	appealTimetable: {
		appealTimetableId: 1053,
		lpaQuestionnaireDueDate: '2023-10-11T01:00:00.000Z',
		finalCommentsDueDate: '2023-10-12T01:00:00.000Z',
		ipCommentsDueDate: '2023-10-13T01:00:00.000Z',
		lpaStatementDueDate: '2023-10-14T01:00:00.000Z',
		statementOfCommonGroundDueDate: '2023-10-15T01:00:00.000Z',
		planningObligationDueDate: '2023-10-16T01:00:00.000Z'
	}
};

describe('GET /change-appeal-procedure-type/hearing/change-event-date-known', () => {
	afterEach(teardown);

	it('should render the change event date known page for hearing with the correct content', async () => {
		nock('http://test/')
			.get('/appeals/1?include=all')
			.reply(200, {
				...appealDataWithoutStartDate,
				appealStatus: 'lpa_questionnaire',
				appealType: 'Planning appeal',
				procedureType: 'hearing',
				documentationSummary: {
					lpaQuestionnaire: {
						status: 'not received'
					}
				}
			});

		nock('http://test/')
			.get('/appeals/1/appellant-cases/0')
			.reply(200, { planningObligation: { hasObligation: false } });

		const response = await request.get(
			`/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/change-event-date-known`
		);

		expect(response.statusCode).toBe(200);

		const html = parseHtml(response.text).innerHTML;

		expect(html).toMatchSnapshot();

		const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

		expect(unprettifiedHtml).toContain('Do you know the date and time of the hearing?</h1>');
		expect(unprettifiedHtml).toContain('Yes</label>');
		expect(unprettifiedHtml).toContain('No</label>');

		expect(unprettifiedHtml).toContain('Continue</button>');
	});

	it('should render and not delete existing session data if procedure type is not changed', async () => {
		nock('http://test/')
			.get('/appeals/1?include=all')
			.reply(200, {
				...appealDataWithoutStartDate,
				appealStatus: 'lpa_questionnaire',
				appealType: 'Planning appeal',
				procedureType: 'written',
				documentationSummary: {
					lpaQuestionnaire: {
						status: 'not received'
					}
				}
			})
			.persist();

		nock('http://test/')
			.get('/appeals/1/appellant-cases/0')
			.reply(200, { planningObligation: { hasObligation: false }, procedureType: 'written' })
			.persist();

		await request
			.post(
				`/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type`
			)
			.send({
				appealProcedure: 'hearing'
			});

		await request
			.post(
				`/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/change-event-date-known`
			)
			.send({
				dateKnown: 'yes'
			});

		await request
			.post(
				`/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type`
			)
			.send({
				appealProcedure: 'hearing'
			});

		const response = await request.get(
			`/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/change-event-date-known`
		);

		expect(response.statusCode).toBe(200);

		const html = parseHtml(response.text).innerHTML;

		expect(html).toMatchSnapshot();

		const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
		expect(unprettifiedHtml).toContain(
			'type="radio" value="yes" checked><label class="govuk-label govuk-radios__label" for="date-known"> Yes</label>'
		);
	});

	it('should render and delete existing session data if procedure type is changed', async () => {
		nock('http://test/')
			.get('/appeals/1?include=all')
			.reply(200, {
				...appealDataWithoutStartDate,
				appealStatus: 'lpa_questionnaire',
				appealType: 'Planning appeal',
				procedureType: 'written',
				documentationSummary: {
					lpaQuestionnaire: {
						status: 'not received'
					}
				}
			})
			.persist();

		nock('http://test/')
			.get('/appeals/1/appellant-cases/0')
			.reply(200, { planningObligation: { hasObligation: false }, procedureType: 'written' })
			.persist();

		await request
			.post(
				`/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type`
			)
			.send({
				appealProcedure: 'inquiry'
			});

		await request
			.post(
				`/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/change-event-date-known`
			)
			.send({
				dateKnown: 'yes'
			});

		await request
			.post(
				`/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type`
			)
			.send({
				appealProcedure: 'hearing'
			});

		const response = await request.get(
			`/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/change-event-date-known`
		);

		expect(response.statusCode).toBe(200);

		const html = parseHtml(response.text).innerHTML;

		expect(html).toMatchSnapshot();

		const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
		expect(unprettifiedHtml).toContain(
			'type="radio" value="yes"><label class="govuk-label govuk-radios__label" for="date-known"> Yes</label>'
		);
	});

	it('should have a back link to the select procedure type page', async () => {
		nock('http://test/')
			.get('/appeals/1?include=all')
			.reply(200, { ...appealDataWithoutStartDate, appealId: 1 });

		const response = await request.get(
			`/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/change-event-date-known`
		);
		const bodyHtml = parseHtml(response.text, { rootElement: 'body' });
		expect(bodyHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
			`/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type`
		);
	});

	it('should have a back link to the CYA page if editing', async () => {
		nock('http://test/')
			.get('/appeals/1?include=all')
			.reply(200, { ...appealDataWithoutStartDate, appealId: 1, procedureType: 'hearing' });

		const response = await request.get(
			`/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/change-event-date-known?editEntrypoint=` +
				'%2Fappeals-service%2Fappeal-details%2F1%2Fchange-appeal-procedure-type%2Fhearing%2Fchange-event-date-known'
		);
		const bodyHtml = parseHtml(response.text, { rootElement: 'body' });
		expect(bodyHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toContain(
			'/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/check-and-confirm'
		);
	});
});

describe('POST /change-appeal-procedure-type/hearing/change-event-date-known', () => {
	afterEach(teardown);

	it('should post the change event date known page and redirect to the timetable due page if date is not known', async () => {
		nock('http://test/')
			.get('/appeals/1?include=all')
			.reply(200, {
				...appealDataWithoutStartDate,
				appealStatus: 'lpa_questionnaire',
				appealType: 'Planning appeal',
				procedureType: 'hearing',
				documentationSummary: {
					lpaQuestionnaire: {
						status: 'not received'
					}
				}
			});

		nock('http://test/')
			.get('/appeals/1/appellant-cases/0')
			.reply(200, { planningObligation: { hasObligation: false }, procedureType: 'hearing' });

		const response = await request
			.post(
				`/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/change-event-date-known`
			)
			.send({
				dateKnown: 'no'
			});

		expect(response.statusCode).toBe(302);

		expect(response.text).toBe(
			'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/change-timetable'
		);
	});

	it('should post the change event date known page and redirect to the timetable due page if date is known', async () => {
		nock('http://test/')
			.get('/appeals/1?include=all')
			.reply(200, {
				...appealDataWithoutStartDate,
				appealStatus: 'lpa_questionnaire',
				appealType: 'Planning appeal',
				procedureType: 'hearing',
				documentationSummary: {
					lpaQuestionnaire: {
						status: 'not received'
					}
				}
			});

		nock('http://test/')
			.get('/appeals/1/appellant-cases/0')
			.reply(200, { planningObligation: { hasObligation: false }, procedureType: 'hearing' });

		const response = await request
			.post(
				`/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/change-event-date-known`
			)
			.send({
				dateKnown: 'yes'
			});

		expect(response.statusCode).toBe(302);

		expect(response.text).toBe(
			'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/date'
		);
	});
});
