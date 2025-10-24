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

describe('GET /change-appeal-procedure-type/check-and-confirm', () => {
	afterEach(teardown);

	describe('GET /change-appeal-procedure-type/written/check-and-confirm', () => {
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

			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } });

			const response = await request.get(
				`/appeals-service/appeal-details/1/change-appeal-procedure-type/written/check-and-confirm`
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

			expect(unprettifiedHtml).toContain('Update appeal procedure</button>');
		});
	});

	describe('GET /change-appeal-procedure-type/hearing/check-and-confirm', () => {
		it('should render the check details page with the expected content for hearing procedure type with planning obligation if an appeal procedure is found in the session', async () => {
			nock('http://test/')
				.get('/appeals/1')
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
				.reply(200, {
					planningObligation: { hasObligation: true },
					procedureType: 'hearing',
					dateKnown: 'yes'
				});

			const response = await request.get(
				`/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/check-and-confirm`
			);

			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('Check details and update appeal procedure</h1>');
			expect(unprettifiedHtml).toContain('Appeal procedure</dt>');
			expect(unprettifiedHtml).toContain('Hearing</dd>');
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

			expect(unprettifiedHtml).toContain('Planning obligation due</dt>');
			expect(unprettifiedHtml).toContain('16 October 2023</dd>');
			expect(unprettifiedHtml).toContain('<a class="govuk-link" href="change-timetable">Change ');

			expect(unprettifiedHtml).toContain('Statement of common ground due</dt>');
			expect(unprettifiedHtml).toContain('15 October 2023</dd>');
			expect(unprettifiedHtml).toContain('<a class="govuk-link" href="change-timetable">Change ');

			expect(unprettifiedHtml).toContain('Update appeal procedure</button>');
		});

		it('should render the check details page with the expected content for hearing procedure type with no event date known', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.twice()
				.reply(200, {
					...appealDataWithoutStartDate,
					appealStatus: 'lpa_questionnaire',
					appealType: 'Planning appeal',
					procedureType: 'hearing',
					hearing: null
				});
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.twice()
				.reply(200, {
					planningObligation: { hasObligation: true },
					procedureType: 'hearing'
				});

			await request
				.post(
					'/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/change-event-date-known'
				)
				.send({ dateKnown: 'no' });

			const response = await request.get(
				'/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/check-and-confirm'
			);

			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain(
				'<dt class="govuk-summary-list__key"> Do you know the date and time of the hearing?</dt>'
			);
			expect(unprettifiedHtml).toContain('<dd class="govuk-summary-list__value"> No</dd>');
		});

		it('should render the check details page with the expected content for hearing procedure type without planning obligation if an appeal procedure is found in the session', async () => {
			nock('http://test/')
				.get('/appeals/1')
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
				'/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/check-and-confirm'
			);

			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('Check details and update appeal procedure</h1>');
			expect(unprettifiedHtml).toContain('Appeal procedure</dt>');
			expect(unprettifiedHtml).toContain('Hearing</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type" data-cy="change-appeal-procedure">Change<span class="govuk-visually-hidden"> Appeal procedure</span></a>'
			);

			expect(unprettifiedHtml).toContain('Hearing details</h3>');

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

			expect(unprettifiedHtml).not.toContain('Planning Obligation due</dt>');
			expect(unprettifiedHtml).not.toContain('16 October 2023</dd>');

			expect(unprettifiedHtml).toContain('Statement of common ground due</dt>');
			expect(unprettifiedHtml).toContain('15 October 2023</dd>');
			expect(unprettifiedHtml).toContain('<a class="govuk-link" href="change-timetable">Change ');

			expect(unprettifiedHtml).toContain('Update appeal procedure</button>');
		});
	});

	describe('GET /change-appeal-procedure-type/inquiry/check-and-confirm', () => {
		it('should render the check details page with the expected content for inquiry procedure type', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealStatus: 'lpa_questionnaire',
					appealType: 'Planning appeal',
					procedureType: 'inquiry',
					inquiry: {
						estimatedDays: 8,
						address: {
							addressId: 1,
							addressLine1: '21 The Pavement',
							county: 'Wandsworth',
							postCode: 'SW4 0HY'
						}
					},
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
				'/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/check-and-confirm'
			);

			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('Check details and update appeal procedure</h1>');
			expect(unprettifiedHtml).toContain('Appeal procedure</dt>');
			expect(unprettifiedHtml).toContain('Inquiry</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type" data-cy="change-appeal-procedure">Change<span class="govuk-visually-hidden"> Appeal procedure</span></a>'
			);

			expect(unprettifiedHtml).toContain('Inquiry details</h3>');
			expect(unprettifiedHtml).toContain('Inquiry date</dt>');
			expect(unprettifiedHtml).toContain(
				'href="/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/date" data-cy="change-inquiry-date">Change'
			);
			expect(unprettifiedHtml).toContain(
				'href="/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/date" data-cy="change-inquiry-time">Change<span class="govuk-visually-hidden"> Inquiry time</span></a>'
			);
			expect(unprettifiedHtml).toContain(
				'Do you know the expected number of days to carry out the inquiry?</dt>'
			);
			expect(unprettifiedHtml).toContain(
				'href="/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/estimation" data-cy="change-inquiry-estimation">Change'
			);
			expect(unprettifiedHtml).toContain(
				'Do you know the address of where the inquiry will take place?</dt>'
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

			expect(unprettifiedHtml).not.toContain('Planning Obligation due</dt>');
			expect(unprettifiedHtml).not.toContain('16 October 2023</dd>');

			expect(unprettifiedHtml).toContain('Statement of common ground due</dt>');
			expect(unprettifiedHtml).toContain('15 October 2023</dd>');
			expect(unprettifiedHtml).toContain('<a class="govuk-link" href="change-timetable">Change ');

			expect(unprettifiedHtml).toContain('Update appeal procedure</button>');
		});

		it('should render the check details page with the expected content for inquiry procedure type with no estimated days', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealStatus: 'lpa_questionnaire',
					appealType: 'Planning appeal',
					procedureType: 'inquiry',
					inquiry: {
						address: {
							addressId: 1,
							addressLine1: '21 The Pavement',
							county: 'Wandsworth',
							postCode: 'SW4 0HY'
						}
					},
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
				'/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/check-and-confirm'
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).not.toContain(
				'Expected number of days to carry out the inquiry</dt>'
			);
		});

		it('should render the check details page with the expected content for inquiry procedure type with no selected address when address is unknown', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealStatus: 'lpa_questionnaire',
					appealType: 'Planning appeal',
					procedureType: 'inquiry',
					documentationSummary: {
						lpaQuestionnaire: {
							status: 'not received'
						}
					},
					inquiry: {
						inquiryId: 0,
						inquiryEndTime: undefined,
						inquiryStartTime: '2023-10-09T08:38:00.000Z',
						addressId: null,
						address: null
					}
				});
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } });

			const response = await request.get(
				'/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/check-and-confirm'
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).not.toContain('Address of where the inquiry will take place</dt>');
		});
	});
});
