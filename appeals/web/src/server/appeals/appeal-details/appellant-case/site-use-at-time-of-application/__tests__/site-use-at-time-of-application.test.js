import {
	appealData,
	appellantCaseDataIncompleteOutcome
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`;

describe('site-use-at-time-of-application', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the development description change page when accessed from the appellant case page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });
			const response = await request.get(`${baseUrl}/site-use-at-time-of-application/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(response.statusCode).toEqual(200);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'What did you use the appeal site for when you made the application?</h1>'
			);
			expect(elementInnerHtml).toContain(
				'What did you use the appeal site for when you made the application?'
			);
		});
	});

	describe('POST /change', () => {
		it('should re-direct to appellant case when the data is valid', async () => {
			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});
			const validData = {
				siteUseAtTimeOfApplication: 'Some valid text'
			};

			const response = await request
				.post(`${baseUrl}/site-use-at-time-of-application/change`)
				.send(validData);

			expect(response.statusCode).toEqual(302);
			expect(apiCall.isDone()).toBe(true);
			expect(response.text).toBe(`Found. Redirecting to ${baseUrl}`);
		});

		it('should re-render the development description change page with an error if the field is empty', async () => {
			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});
			const appellantCaseDataCall = nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });
			const invalidData = {
				siteUseAtTimeOfApplication: ''
			};

			const response = await request
				.post(`${baseUrl}/site-use-at-time-of-application/change`)
				.send(invalidData);

			expect(response.statusCode).toEqual(200);
			expect(apiCall.isDone()).toBe(false);
			expect(appellantCaseDataCall.isDone()).toBe(true);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(elementInnerHtml).toContain(
				'What did you use the appeal site for when you made the application?</h1>'
			);
			expect(elementInnerHtml).toContain(
				'What did you use the appeal site for when you made the application?'
			);
		});

		it('should re-render the development description change page with an error if the field is over 1000 char', async () => {
			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});
			const appellantCaseDataCall = nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const invalidData = {
				developmentDescription: `${'a'.repeat(1001)}`
			};

			const response = await request
				.post(`${baseUrl}/site-use-at-time-of-application/change`)
				.send(invalidData);

			expect(response.statusCode).toEqual(200);
			expect(apiCall.isDone()).toBe(false);
			expect(appellantCaseDataCall.isDone()).toBe(true);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(elementInnerHtml).toContain(
				'What did you use the appeal site for when you made the application?</h1>'
			);
			expect(elementInnerHtml).toContain(
				'What did you use the appeal site for when you made the application?'
			);
		});
	});
});
