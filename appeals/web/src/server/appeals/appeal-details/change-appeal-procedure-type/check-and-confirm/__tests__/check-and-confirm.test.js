import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import { appealData } from '#testing/appeals/appeals.js';

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
		lpaStatementDueDate: '2023-10-14T01:00:00.000Z'
	}
};

describe('GET /change-appeal-procedure-type/check-and-confirm', () => {
	afterEach(teardown);

	it('should render the check details page with the expected content for written procedure type if an appeal procedure is found in the session', async () => {
		nock('http://test/')
			.get('/appeals/1')
			.reply(200, {
				...appealDataWithoutStartDate,
				appealStatus: 'lpa_questionnaire',
				appealType: 'Planning appeal',
				documentationSummary: {
					lpaQuestionnaire: {
						status: 'not received'
					}
				}
			});

		const response = await request.get(
			'/appeals-service/appeal-details/1/change-appeal-procedure-type/check-and-confirm'
		);

		expect(response.statusCode).toBe(200);

		const html = parseHtml(response.text).innerHTML;

		expect(html).toMatchSnapshot();

		const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

		expect(unprettifiedHtml).toContain('Check details and update appeal procedure</h1>');
		expect(unprettifiedHtml).toContain('Appeal procedure</dt>');
		expect(unprettifiedHtml).toContain('Written representations</dd>');
		expect(unprettifiedHtml).toContain(
			'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type" data-cy="change-appeal-procedure">Change<span class="govuk-visually-hidden"> Appeal procedure</span></a>'
		);
		expect(unprettifiedHtml).toContain('<h3 class="govuk-heading-m">Timetable due dates</h3>');

		expect(unprettifiedHtml).toContain('Interested party comments due</dt>');
		expect(unprettifiedHtml).toContain('13 October 2023</dd>');
		expect(unprettifiedHtml).toContain('<a class="govuk-link" href="change-timetable">Change ');

		expect(unprettifiedHtml).toContain('Statements due</dt>');
		expect(unprettifiedHtml).toContain('14 October 2023</dd>');
		expect(unprettifiedHtml).toContain('<a class="govuk-link" href="change-timetable">Change ');

		expect(unprettifiedHtml).toContain('LPA questionnaire due</dt>');
		expect(unprettifiedHtml).toContain('11 October 2023</dd>');
		expect(unprettifiedHtml).toContain('<a class="govuk-link" href="change-timetable">Change ');

		expect(unprettifiedHtml).toContain('Final comments due</dt>');
		expect(unprettifiedHtml).toContain('12 October 2023</dd>');
		expect(unprettifiedHtml).toContain('<a class="govuk-link" href="change-timetable">Change ');

		expect(unprettifiedHtml).toContain(
			`We’ll send an email to the appellant and LPA to tell them that:</p>`
		);
		expect(unprettifiedHtml).toContain(`we've changed the procedure`);
		expect(unprettifiedHtml).toContain(`we've cancelled the hearing`);
		expect(unprettifiedHtml).toContain('Update appeal procedure</button>');
	});
});
