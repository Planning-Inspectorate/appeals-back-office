import { appealData } from '#testing/appeals/appeals.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
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
const procedureTypeAppealVariants = [
	{ name: 'S78', appealType: APPEAL_TYPE.S78 },
	{ name: 'S20', appealType: APPEAL_TYPE.PLANNED_LISTED_BUILDING }
];

describe('GET /change-appeal-procedure-type/check-and-confirm', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});
	afterEach(teardown);

	describe('GET /change-appeal-procedure-type/written/check-and-confirm', () => {
		describe.each(procedureTypeAppealVariants)('S78 and S20 parity - $name', ({ appealType }) => {
			it('should render the written check details page', async () => {
				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, {
						...appealDataWithoutStartDate,
						appealStatus: 'lpa_questionnaire',
						appealType,
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
					'/appeals-service/appeal-details/1/change-appeal-procedure-type/written/check-and-confirm'
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedHtml = parseHtml(response.text, {
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedHtml).toContain('Check details and update appeal procedure</h1>');
				expect(unprettifiedHtml).toContain('Written representations</dd>');
			});
		});

		it('should render the check details page with the expected content for written procedure type if an appeal procedure is found in the session', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
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
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/change-selected-procedure-type?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fchange-selected-procedure-type" data-cy="change-' +
					'appeal-procedure">Change<span class="govuk-visually-hidden"> Appeal procedure</span></a>'
			);
			expect(unprettifiedHtml).toContain('<h3 class="govuk-heading-m">Timetable due dates</h3>');

			expect(unprettifiedHtml).toContain('Interested party comments due</dt>');
			expect(unprettifiedHtml).toContain('13 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/written/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fwritten%2Fchange-timetable" data-cy="change-' +
					'ip-comments-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('Statements due</dt>');
			expect(unprettifiedHtml).toContain('14 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/written/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fwritten%2Fchange-timetable" data-cy="change-' +
					'lpa-statement-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('LPA questionnaire due</dt>');
			expect(unprettifiedHtml).toContain('11 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/written/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fwritten%2Fchange-timetable" data-cy="change-' +
					'lpa-questionnaire-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('Final comments due</dt>');
			expect(unprettifiedHtml).toContain('12 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/written/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fwritten%2Fchange-timetable" data-cy="change-' +
					'final-comments-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('Update appeal procedure</button>');
		});
	});

	describe('GET /change-appeal-procedure-type/hearing/check-and-confirm', () => {
		describe.each(procedureTypeAppealVariants)('S78 and S20 parity - $name', ({ appealType }) => {
			it('should render the hearing check details page', async () => {
				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, {
						...appealDataWithoutStartDate,
						appealStatus: 'lpa_questionnaire',
						appealType,
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
						planningObligation: { hasObligation: false },
						procedureType: 'hearing',
						dateKnown: 'yes'
					});

				const response = await request.get(
					'/appeals-service/appeal-details/1/change-appeal-procedure-type/hearing/check-and-confirm'
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedHtml = parseHtml(response.text, {
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedHtml).toContain('Check details and update appeal procedure</h1>');
				expect(unprettifiedHtml).toContain('Hearing</dd>');
			});
		});

		it('should render the check details page with the expected content for hearing procedure type with planning obligation if an appeal procedure is found in the session', async () => {
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
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/change-selected-procedure-type?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fchange-selected-procedure-type" data-cy="change-' +
					'appeal-procedure">Change<span class="govuk-visually-hidden"> Appeal procedure</span></a>'
			);
			expect(unprettifiedHtml).toContain('<h3 class="govuk-heading-m">Timetable due dates</h3>');

			expect(unprettifiedHtml).toContain('Interested party comments due</dt>');
			expect(unprettifiedHtml).toContain('13 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/hearing/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fhearing%2Fchange-timetable" data-cy="change-' +
					'ip-comments-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('Statements due</dt>');
			expect(unprettifiedHtml).toContain('14 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/hearing/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fhearing%2Fchange-timetable" data-cy="change-' +
					'lpa-statement-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('LPA questionnaire due</dt>');
			expect(unprettifiedHtml).toContain('11 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/hearing/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fhearing%2Fchange-timetable" data-cy="change-' +
					'lpa-questionnaire-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('Planning obligation due</dt>');
			expect(unprettifiedHtml).toContain('16 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/hearing/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fhearing%2Fchange-timetable" data-cy="change-' +
					'planning-obligation-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('Statement of common ground due</dt>');
			expect(unprettifiedHtml).toContain('15 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/hearing/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fhearing%2Fchange-timetable" data-cy="change-' +
					'statement-of-common-ground-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('Update appeal procedure</button>');
		});

		it('should render the check details page with the expected content for hearing procedure type with no event date known', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
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
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/change-selected-procedure-type?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fchange-selected-procedure-type" data-cy="change-' +
					'appeal-procedure">Change<span class="govuk-visually-hidden"> Appeal procedure</span></a>'
			);

			expect(unprettifiedHtml).toContain('Hearing details</h3>');

			expect(unprettifiedHtml).toContain('<h3 class="govuk-heading-m">Timetable due dates</h3>');

			expect(unprettifiedHtml).toContain('Interested party comments due</dt>');
			expect(unprettifiedHtml).toContain('13 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/hearing/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fhearing%2Fchange-timetable" data-cy="change-' +
					'ip-comments-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('Statements due</dt>');
			expect(unprettifiedHtml).toContain('14 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/hearing/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fhearing%2Fchange-timetable" data-cy="change-' +
					'lpa-statement-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('LPA questionnaire due</dt>');
			expect(unprettifiedHtml).toContain('11 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/hearing/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fhearing%2Fchange-timetable" data-cy="change-' +
					'lpa-questionnaire-due-date">Change '
			);

			expect(unprettifiedHtml).not.toContain('Planning Obligation due</dt>');
			expect(unprettifiedHtml).not.toContain('16 October 2023</dd>');

			expect(unprettifiedHtml).toContain('Statement of common ground due</dt>');
			expect(unprettifiedHtml).toContain('15 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type' +
					'/hearing/change-timetable?editEntrypoint=%2Fappeals-service%2Fappeal-details' +
					'%2F1%2Fchange-appeal-procedure-type%2Fhearing%2Fchange-timetable" data-cy="change-' +
					'statement-of-common-ground-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('Update appeal procedure</button>');
		});
	});

	describe('GET /change-appeal-procedure-type/inquiry/check-and-confirm', () => {
		describe.each(procedureTypeAppealVariants)('S78 and S20 parity - $name', ({ appealType }) => {
			it('should render the inquiry check details page', async () => {
				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, {
						...appealDataWithoutStartDate,
						appealStatus: 'lpa_questionnaire',
						appealType,
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

				const unprettifiedHtml = parseHtml(response.text, {
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedHtml).toContain('Check details and update appeal procedure</h1>');
				expect(unprettifiedHtml).toContain('Inquiry</dd>');
				expect(unprettifiedHtml).toContain(
					'Do you know the expected number of days to carry out the inquiry?</dt>'
				);
			});
		});

		it('should render the check details page with the expected content for inquiry procedure type', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
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
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type/' +
					'change-selected-procedure-type?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2F' +
					'change-appeal-procedure-type%2Fchange-selected-procedure-type" data-cy="change-appeal-procedure">' +
					'Change<span class="govuk-visually-hidden"> Appeal procedure</span></a>'
			);

			expect(unprettifiedHtml).toContain('Inquiry details</h3>');
			expect(unprettifiedHtml).toContain('Inquiry date</dt>');
			expect(unprettifiedHtml).toContain(
				'href="/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/date" data-cy="change-inquiry-date">Change'
			);
			expect(unprettifiedHtml).toContain(
				'href="/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/date' +
					'?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fchange-appeal-procedure-type%2Finquiry%2Fdate" ' +
					'data-cy="change-inquiry-time">Change<span class="govuk-visually-hidden"> Inquiry time</span></a>'
			);
			expect(unprettifiedHtml).toContain(
				'Do you know the expected number of days to carry out the inquiry?</dt>'
			);
			expect(unprettifiedHtml).toContain(
				'href="/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/estimation' +
					'?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fchange-appeal-procedure-type%2Finquiry%2Festimation" ' +
					'data-cy="change-inquiry-estimation">Change'
			);
			expect(unprettifiedHtml).toContain(
				'Do you know the address of where the inquiry will take place?</dt>'
			);

			expect(unprettifiedHtml).toContain('<h3 class="govuk-heading-m">Timetable due dates</h3>');

			expect(unprettifiedHtml).toContain('Interested party comments due</dt>');
			expect(unprettifiedHtml).toContain('13 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/change-timetable' +
					'?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fchange-appeal-procedure-type%2Finquiry%2Fchange-timetable" ' +
					'data-cy="change-ip-comments-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('Statements due</dt>');
			expect(unprettifiedHtml).toContain('14 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/change-timetable' +
					'?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fchange-appeal-procedure-type%2Finquiry%2Fchange-timetable" ' +
					'data-cy="change-lpa-statement-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('LPA questionnaire due</dt>');
			expect(unprettifiedHtml).toContain('11 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/change-timetable' +
					'?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fchange-appeal-procedure-type%2Finquiry%2Fchange-timetable" ' +
					'data-cy="change-lpa-questionnaire-due-date">Change '
			);

			expect(unprettifiedHtml).not.toContain('Planning Obligation due</dt>');
			expect(unprettifiedHtml).not.toContain('16 October 2023</dd>');

			expect(unprettifiedHtml).toContain('Statement of common ground due</dt>');
			expect(unprettifiedHtml).toContain('15 October 2023</dd>');
			expect(unprettifiedHtml).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/change-timetable' +
					'?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fchange-appeal-procedure-type%2Finquiry%2Fchange-timetable" ' +
					'data-cy="change-statement-of-common-ground-due-date">Change '
			);

			expect(unprettifiedHtml).toContain('Update appeal procedure</button>');
		});

		it('should render the check details page with the expected content for inquiry procedure type with no estimated days', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
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
				.get('/appeals/1?include=all')
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
	describe('POST /change-appeal-procedure-type/inquiry/check-and-confirm', () => {
		it('should redirect to appeal details screen on success', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.times(5)
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

			// set session data with post requests to previous pages
			await request
				.post(
					`/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type`
				)
				.send({ appealProcedure: 'inquiry' });
			await request
				.post(`/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/date`)
				.send({
					'event-date-day': '01',
					'event-date-month': '02',
					'event-date-year': '3025',
					'event-time-hour': '12',
					'event-time-minute': '00'
				});
			await request
				.post(`/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/address`)
				.send({ addressKnown: 'no' });

			let capturedRequestBody;
			const changeProcedureTypeRequest = nock('http://test/')
				.post('/appeals/1/procedure-type-change-request', (body) => {
					capturedRequestBody = body;
					return true;
				})
				.reply(200);

			const response = await request
				.post(
					'/appeals-service/appeal-details/1/change-appeal-procedure-type/inquiry/check-and-confirm'
				)
				.send();

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toContain('/appeals-service/appeal-details/1');
			expect(response.text).toContain('Found. Redirecting to /appeals-service/appeal-details/1');
			expect(changeProcedureTypeRequest.isDone()).toBe(true);
			expect(capturedRequestBody).toMatchObject({
				existingAppealProcedure: 'hearing',
				appealProcedure: 'inquiry',
				eventDate: '3025-02-01T12:00:00.000Z',
				lpaQuestionnaireDueDate: '2023-10-11T01:00:00.000Z',
				ipCommentsDueDate: '2023-10-13T01:00:00.000Z',
				lpaStatementDueDate: '2023-10-14T01:00:00.000Z',
				finalCommentsDueDate: '2023-10-12T01:00:00.000Z',
				statementOfCommonGroundDueDate: '2023-10-15T01:00:00.000Z',
				planningObligationDueDate: '2023-10-16T01:00:00.000Z',
				proofOfEvidenceAndWitnessesDueDate: '',
				caseManagementConferenceDueDate: ''
			});
		});
	});
});
