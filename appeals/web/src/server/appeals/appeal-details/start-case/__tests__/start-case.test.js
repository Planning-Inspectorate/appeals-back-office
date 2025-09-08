import featureFlags from '#common/feature-flags.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { appealData } from '#testing/appeals/appeals.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealDataWithoutStartDate = {
	...appealData,
	startedAt: null
};

describe('start-case', () => {
	afterEach(teardown);

	describe('GET /start-case/add', () => {
		it('should render the start case page with the expected content if the appeal type is Householder', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Householder'
				});

			const response = await request.get(`${baseUrl}/1/start-case/add`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toContain('Start case</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				`Warning</span> Confirming will activate the timetable on ${dateISOStringToDisplayDate(
					new Date().toISOString()
				)}. Start letters will be sent to the relevant parties.`
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});

		it('should render the start case page with the expected content if the appeal type is S78 and the S78 hearing feature flag is disabled', async () => {
			featureFlags.isFeatureActive = () => false;

			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.get(`${baseUrl}/1/start-case/add`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toContain('Start case</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				`Warning</span> Confirming will activate the timetable on ${dateISOStringToDisplayDate(
					new Date().toISOString()
				)}. Start letters will be sent to the relevant parties.`
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});

		it('should redirect to the select procedure page if the appeal type is S78 and the S78 hearing feature flag is enabled', async () => {
			featureFlags.isFeatureActive = () => true;

			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.get(`${baseUrl}/1/start-case/add`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/start-case/select-procedure'
			);
		});

		it('should redirect to the select procedure page if the appeal type is S78 and the S78 hearing feature flag is enabled, passing the backLink query parameter if provided', async () => {
			featureFlags.isFeatureActive = () => true;

			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.get(`${baseUrl}/1/start-case/add?backUrl=/test/back/url`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/start-case/select-procedure?backUrl=/test/back/url'
			);
		});

		it('should redirect to the select procedure page if the appeal type is S78 and the S78 hearing feature flag is enabled, and the select procedure type page was previously submitted with an option selected', async () => {
			featureFlags.isFeatureActive = () => true;

			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const postSelectProcedureResponse = await request
				.post('/appeals-service/appeal-details/1/start-case/select-procedure')
				.send({
					appealProcedure: 'written'
				});

			expect(postSelectProcedureResponse.statusCode).toBe(302);
			expect(postSelectProcedureResponse.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/start-case/select-procedure/check-and-confirm'
			);

			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.get(`${baseUrl}/1/start-case/add?backUrl=/test/back/url`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/start-case/select-procedure?backUrl=/test/back/url'
			);
		});
	});

	describe('POST /start-case/add', () => {
		it('should redirect to appeal details page', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealDataWithoutStartDate);
			nock('http://test/').post(`/appeals/1/appeal-timetables`).reply(200, {});

			const response = await request.post(`${baseUrl}/1/start-case/add`).send({});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /start-case/change', () => {
		it.each([
			['working day', '2024-06-03T22:59:00.000Z', '3 June 2024'],
			['weekend', '2024-06-01T22:59:00.000Z', '3 June 2024']
		])(
			'should render the change start date page with the expected content on a %s',
			async (_, dateString, expectedDisplayDate) => {
				jest
					.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
					.setSystemTime(new Date(dateString));
				try {
					nock('http://test/').get('/appeals/1').reply(200, appealData);

					const response = await request.get(`${baseUrl}/1/start-case/change`);
					const element = parseHtml(response.text);

					expect(element.innerHTML).toContain('Change start date</h1>');

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain(
						`Warning</span> Confirming will change the start day to ${expectedDisplayDate} and update the case timetable. New start letters will be sent to relevant parties.</strong>`
					);
					expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
				} finally {
					jest.useRealTimers();
				}
			}
		);
	});

	describe('POST /start-case/change', () => {
		it('should redirect to the appeal details page', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/').post(`/appeals/1/appeal-timetables`).reply(200, {});

			const response = await request.post(`${baseUrl}/1/start-case/change`).send({});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /start-case/select-procedure', () => {
		it('should render the select procedure page with the expected content', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.get(
				'/appeals-service/appeal-details/1/start-case/select-procedure'
			);

			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain('href="/" class="govuk-back-link">Back</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<span class="govuk-caption-l">Appeal 351062 - start case</span>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Appeal procedure</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealProcedure" type="radio" value="written">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealProcedure" type="radio" value="hearing">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealProcedure" type="radio" value="inquiry">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the select procedure page with the expected back link URL, if the backLink query parameter was passed', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.get(
				'/appeals-service/appeal-details/1/start-case/select-procedure?backUrl=/test/back/url'
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain(
				'href="/test/back/url" class="govuk-back-link">Back</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<span class="govuk-caption-l">Appeal 351062 - start case</span>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Appeal procedure</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealProcedure" type="radio" value="written">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealProcedure" type="radio" value="hearing">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealProcedure" type="radio" value="inquiry">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		[
			['false', 'select-procedure/check-and-confirm'],
			['true', 'hearing']
		].forEach(([featureFlag, redirectPath]) => {
			describe(`with featureFlagHearingPostMvp set to ${featureFlag}`, () => {
				it('should render the select procedure page with the expected radio option preselected if an appeal procedure is found in the session', async () => {
					nock('http://test/')
						.get('/appeals/1')
						.reply(200, {
							...appealDataWithoutStartDate,
							appealType: 'Planning appeal'
						});

					const selectProcedurePostResponse = await request
						.post('/appeals-service/appeal-details/1/start-case/select-procedure')
						.set('x-feature-flag-hearing-post-mvp', featureFlag)
						.send({
							appealProcedure: 'hearing'
						});

					expect(selectProcedurePostResponse.statusCode).toBe(302);
					expect(selectProcedurePostResponse.text).toBe(
						`Found. Redirecting to /appeals-service/appeal-details/1/start-case/${redirectPath}`
					);

					nock('http://test/')
						.get('/appeals/1')
						.reply(200, {
							...appealDataWithoutStartDate,
							appealType: 'Planning appeal'
						});

					const response = await request.get(
						'/appeals-service/appeal-details/1/start-case/select-procedure'
					);

					expect(response.statusCode).toBe(200);

					const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

					expect(unprettifiedHtml).toContain('Appeal procedure</h1>');
					expect(unprettifiedHtml).toContain(
						'name="appealProcedure" type="radio" value="written">'
					);
					expect(unprettifiedHtml).toContain(
						'name="appealProcedure" type="radio" value="hearing" checked>'
					);
					expect(unprettifiedHtml).toContain(
						'name="appealProcedure" type="radio" value="inquiry">'
					);
				});
			});
		});

		it('should render the select procedure page with no option preselected if the flow was restarted after submitting the select procedure page with an option selected', async () => {
			featureFlags.isFeatureActive = () => true;

			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const postSelectProcedureResponse = await request
				.post('/appeals-service/appeal-details/1/start-case/select-procedure')
				.send({
					appealProcedure: 'written'
				});

			expect(postSelectProcedureResponse.statusCode).toBe(302);
			expect(postSelectProcedureResponse.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/start-case/select-procedure/check-and-confirm'
			);

			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const getStartCaseAddResponse = await request.get(
				`${baseUrl}/1/start-case/add?backUrl=/test/back/url`
			);

			expect(getStartCaseAddResponse.statusCode).toBe(302);
			expect(getStartCaseAddResponse.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/start-case/select-procedure?backUrl=/test/back/url'
			);

			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.get(
				'/appeals-service/appeal-details/1/start-case/select-procedure'
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('Appeal procedure</h1>');
			expect(unprettifiedHtml).toContain('name="appealProcedure" type="radio" value="written">');
			expect(unprettifiedHtml).toContain('name="appealProcedure" type="radio" value="hearing">');
			expect(unprettifiedHtml).toContain('name="appealProcedure" type="radio" value="inquiry">');
			expect(unprettifiedHtml).not.toContain('checked');
		});
	});

	describe('POST /start-case/select-procedure', () => {
		it('should re-render the select procedure page with the expected error message if no radio option was selected', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request
				.post('/appeals-service/appeal-details/1/start-case/select-procedure')
				.send({});

			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('Appeal procedure</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: '.govuk-error-summary'
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Select the appeal procedure</a>');
		});

		[
			['false', 'select-procedure/check-and-confirm'],
			['true', 'hearing']
		].forEach(([featureFlag, redirectPath]) => {
			describe(`with featureFlagHearingPostMvp set to ${featureFlag}`, () => {
				it(`should redirect to ${redirectPath} if a radio option was selected`, async () => {
					nock('http://test/')
						.get('/appeals/1')
						.reply(200, {
							...appealDataWithoutStartDate,
							appealType: 'Planning appeal'
						});

					const response = await request
						.post('/appeals-service/appeal-details/1/start-case/select-procedure')
						.set('x-feature-flag-hearing-post-mvp', featureFlag)
						.send({
							appealProcedure: 'hearing'
						});

					expect(response.statusCode).toBe(302);
					expect(response.text).toBe(
						`Found. Redirecting to /appeals-service/appeal-details/1/start-case/${redirectPath}`
					);
				});
			});
		});
	});

	describe('GET /start-case/select-procedure/check-and-confirm', () => {
		it('should render a 500 error page if an appeal procedure is not found in the session', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.get(
				'/appeals-service/appeal-details/1/start-case/select-procedure/check-and-confirm'
			);

			expect(response.statusCode).toBe(500);

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should render the check details and start case page with the expected content if an appeal procedure is found in the session', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const selectProcedurePostResponse = await request
				.post('/appeals-service/appeal-details/1/start-case/select-procedure')
				.send({
					appealProcedure: 'hearing'
				});

			expect(selectProcedurePostResponse.statusCode).toBe(302);

			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.get(
				'/appeals-service/appeal-details/1/start-case/select-procedure/check-and-confirm'
			);

			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('Check details and start case</h1>');
			expect(unprettifiedHtml).toContain('Appeal procedure</dt>');
			expect(unprettifiedHtml).toContain('Hearing</dd>');
			expect(unprettifiedHtml).toContain(
				'href="/appeals-service/appeal-details/1/start-case/select-procedure" data-cy="change-appeal-procedure">Change<span class="govuk-visually-hidden"> Appeal procedure</span></a>'
			);
			expect(unprettifiedHtml).toContain(
				'We’ll start the timetable now and send emails to the relevant parties.</p>'
			);
			expect(unprettifiedHtml).toContain('Start case</button>');
		});
	});

	describe('POST /start-case/select-procedure/check-and-confirm', () => {
		it('should render a 500 error page if an appeal procedure is not found in the session', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.post(
				'/appeals-service/appeal-details/1/start-case/select-procedure/check-and-confirm'
			);

			expect(response.statusCode).toBe(500);

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should send a post request to the appeal timetables endpoint and redirect to the case details page if an appeal procedure is found in the session', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const selectProcedurePostResponse = await request
				.post('/appeals-service/appeal-details/1/start-case/select-procedure')
				.send({
					appealProcedure: 'hearing'
				});

			expect(selectProcedurePostResponse.statusCode).toBe(302);

			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const mockAppealTimetablesEndpoint = nock('http://test/')
				.post('/appeals/1/appeal-timetables')
				.reply(200);

			const response = await request.post(
				'/appeals-service/appeal-details/1/start-case/select-procedure/check-and-confirm'
			);

			expect(response.statusCode).toBe(302);
			expect(mockAppealTimetablesEndpoint.isDone()).toBe(true);
		});
	});
});
