// @ts-nocheck
import { appealData as rawAppealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

const appealData = {
	...rawAppealData,
	appealRule6Parties: [
		{
			id: 1,
			serviceUser: {
				organisationName: 'Test Organisation',
				email: 'test@example.com'
			}
		}
	]
};

describe('remove rule 6 party', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /rule-6-parties/remove/:rule6PartyId', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/2?include=appealRule6Parties`)
				.reply(200, { ...appealData, appealId: 2 });
		});

		it('should return 400 if the rule 6 party id is not a number', async () => {
			const response = await request.get(`${baseUrl}/2/rule-6-parties/remove/abc`);
			expect(response.statusCode).toBe(400);
			expect(response.text).toContain('Sorry, there is a problem with your request');
		});

		it('should render the confirmation page', async () => {
			const response = await request.get(`${baseUrl}/2/rule-6-parties/remove/1`);
			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('h1').textContent.trim()).toBe(
				'Confirm you want to remove Test Organisation'
			);
			expect(element.querySelector('.govuk-caption-l').textContent.trim()).toBe(
				'Appeal 351062 - remove rule 6 party'
			);
			expect(element.querySelector('button[type="submit"]').textContent.trim()).toBe(
				'Confirm and remove rule 6 party'
			);
		});

		it('should have a back link to the appeal details page', async () => {
			const response = await request.get(`${baseUrl}/2/rule-6-parties/remove/1`);
			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text, { rootElement: 'body' });
			expect(element.querySelector('.govuk-back-link').getAttribute('href')).toBe(`${baseUrl}/2`);
		});

		it('should have a back link to the original page if specified', async () => {
			const response = await request.get(`${baseUrl}/2/rule-6-parties/remove/1?backUrl=/my-cases`);
			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text, { rootElement: 'body' });
			expect(element.querySelector('.govuk-back-link').getAttribute('href')).toBe('/my-cases');
		});
	});

	describe('POST /rule-6-parties/remove/:rule6PartyId', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/2?include=appealRule6Parties`)
				.reply(200, { ...appealData, appealId: 2 });
		});

		it('should delete the rule 6 party', async () => {
			const mock = nock('http://test/').delete(`/appeals/2/rule-6-parties/1`).reply(200);

			await request.post(`${baseUrl}/2/rule-6-parties/remove/1`);
			expect(mock.isDone()).toBe(true);
		});

		it('should redirect to the appeal details page', async () => {
			nock('http://test/').delete(`/appeals/2/rule-6-parties/1`).reply(200);

			const response = await request.post(`${baseUrl}/2/rule-6-parties/remove/1`);
			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/2`);
		});

		it('should return a 500 if the deletion fails', async () => {
			nock('http://test/').delete(`/appeals/2/rule-6-parties/1`).reply(404);

			const response = await request.post(`${baseUrl}/2/rule-6-parties/remove/1`);
			expect(response.statusCode).toBe(500);
		});
	});
});
