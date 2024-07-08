import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const appellantCaseId = appealData.appellantCaseId;
const baseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;
describe('application-date', () => {
	beforeEach(installMockApi), afterEach(teardown);

	describe('GET /change', () => {
		it('should render the applicationDecisionHasDate change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
			const response = await request.get(`${baseUrl}/application-decision-date/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Was an application decision made?</h1>');
		});
	});

	describe('POST /change', () => {
		it('should redirect to set-date if "yes" is selected', async () => {
			const validData = {
				'application-decision-radio': 'yes'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			const response = await request
				.post(`${baseUrl}/application-decision-date/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/application-decision-date/change/set-date'
			);
		});

		it('should redirect to appellant-case if "no" is selected', async () => {
			const validData = {
				'application-decision-radio': 'no'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			const response = await request
				.post(`${baseUrl}/application-decision-date/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});
	});

	describe('POST /change/set-date', () => {
		it('should re-direct to appellant-case if date is valid', async () => {
			const validData = {
				'application-decision-date-day': '11',
				'application-decision-date-month': '06',
				'application-decision-date-year': '2021'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			const response = await request
				.post(`${baseUrl}/application-decision-date/change/set-date`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});

		it('should re-render applicationdecisionDate change page if day is not valid', async () => {
			const invalidData = {
				'application-decision-date-day': '32',
				'application-decision-date-month': '06',
				'application-decision-date-year': '2021'
			};
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request
				.post(`${baseUrl}/application-decision-date/change/set-date`)
				.send(invalidData);
			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the application decision date</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
		});

		it('should re-render applicationdecisionDate change page if month not valid', async () => {
			const invalidData = {
				'application-decision-date-day': '15',
				'application-decision-date-month': '15',
				'application-decision-date-year': '2021'
			};

			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request
				.post(`${baseUrl}/application-decision-date/change/set-date`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the application decision date</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
		});

		it('should re-render to applicationdecisionDate change page if year not valid', async () => {
			const invalidData = {
				'application-decision-date-day': '15',
				'application-decision-date-month': '12',
				'application-decision-date-year': 'a'
			};

			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request
				.post(`${baseUrl}/application-decision-date/change/set-date`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the application decision date</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
		});
	});
});
