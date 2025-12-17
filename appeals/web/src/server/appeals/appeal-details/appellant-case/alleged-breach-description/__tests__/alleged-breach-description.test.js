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
const appealId = appealData.appealId;
const appellantCaseId = appealData.appellantCaseId;
const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

describe('alleged-breach-description', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the alleged breach description  change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataIncompleteOutcome,
					enforcementNotice: { reference: 'ref-1234' }
				});
			const response = await request.get(`${appellantCaseUrl}/alleged-breach-description/change`);

			const mainInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain('Enter the description of the alleged breach</label></h1>');
		});

		it('should render a back link to appellant case page on the alleged breach description change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataIncompleteOutcome);
			const response = await request.get(`${appellantCaseUrl}/alleged-breach-description/change`);

			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;

			expect(response.statusCode).toEqual(200);
			expect(backLinkInnerHtml).toContain(`href="${appellantCaseUrl}`);
		});
	});

	describe('POST /change', () => {
		it('should update via the api and re-direct to Appellant Case if the field is valid', async () => {
			const validData = {
				descriptionOfAllegedBreach: 'ref-1234'
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {});

			const response = await request
				.post(`${appellantCaseUrl}/alleged-breach-description/change`)
				.send(validData);

			expect(apiCall.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});

		it('should re-render the page with an error if the field is empty', async () => {
			const invalidData = {
				descriptionOfAllegedBreach: ''
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {});

			const response = await request
				.post(`${appellantCaseUrl}/alleged-breach-description/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(apiCall.isDone()).toBe(false);

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('Enter a description</a>');
		});

		it('should re-render the page with an error if the field is greater than 1000 characters', async () => {
			const invalidData = {
				descriptionOfAllegedBreach: 'x'.repeat(1001)
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {});

			const response = await request
				.post(`${appellantCaseUrl}/alleged-breach-description/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(apiCall.isDone()).toBe(false);

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('Your description must be 1000 characters or less</a>');
		});
	});
});
