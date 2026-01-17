import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const appellantCaseId = appealData.appellantCaseId;
const baseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

describe('application-decision-date', () => {
	(beforeEach(installMockApi), afterEach(teardown));

	describe('GET /change', () => {
		it('should render the application decision date change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
			const response = await request.get(`${baseUrl}/application-decision-date/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'What’s the date on the decision letter from the local planning authority?​'
			);
		});

		it('should render the application decision date change page when decision not received', async () => {
			const appellantCaseData = {
				...appellantCaseDataNotValidated,
				applicationDecision: 'not_received'
			};
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseData);
			const response = await request.get(`${baseUrl}/application-decision-date/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'What date was your decision due from the local planning authority?'
			);
		});
	});

	describe('POST /change', () => {
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
				.post(`${baseUrl}/application-decision-date/change`)
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
				.post(`${baseUrl}/application-decision-date/change`)
				.send(invalidData);
			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'What’s the date on the decision letter from the local planning authority?​'
			);

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
				.post(`${baseUrl}/application-decision-date/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'What’s the date on the decision letter from the local planning authority?​'
			);

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
				.post(`${baseUrl}/application-decision-date/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'What’s the date on the decision letter from the local planning authority?​'
			);

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
		});
		it('should re-render to applicationdecisionDate change page if date is in the future', async () => {
			const tommorow = new Date();
			tommorow.setDate(tommorow.getDate() + 1);
			const invalidData = {
				'application-decision-date-day': tommorow.getDate(),
				'application-decision-date-month': tommorow.getMonth() + 1,
				'application-decision-date-year': tommorow.getFullYear()
			};

			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request
				.post(`${baseUrl}/application-decision-date/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toContain(
				'What’s the date on the decision letter from the local planning authority?​'
			);

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
		});
		it('should re-render to applicationdecisionDate change page if date is today', async () => {
			const today = new Date();
			const invalidData = {
				'application-decision-date-day': today.getDate(),
				'application-decision-date-month': today.getMonth() + 1,
				'application-decision-date-year': today.getFullYear()
			};

			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request
				.post(`${baseUrl}/application-decision-date/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toContain(
				'What’s the date on the decision letter from the local planning authority?​'
			);

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
		});
	});
});
