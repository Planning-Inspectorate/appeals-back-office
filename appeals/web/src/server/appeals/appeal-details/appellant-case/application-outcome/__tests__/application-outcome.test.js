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

describe('application-outcome', () => {
	beforeEach(installMockApi), afterEach(teardown);

	describe('GET /change', () => {
		it('should render the applicationOutcome change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
			const response = await request.get(`${baseUrl}/application-outcome/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Was your application granted or refused?</h1>');
		});
	});

	describe('POST /change', () => {
		it('should redirect appellant case if data is valid', async () => {
			const validData = {
				applicationOutcome: 'refused'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			const response = await request.post(`${baseUrl}/application-outcome/change`).send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});

		it('should re-render applicationOutcome change page if data is invalid', async () => {
			const invalidData = {
				applicationOutcome: 'invalid'
			};
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, invalidData);

			const response = await request
				.post(`${baseUrl}/application-outcome/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Was your application granted or refused?</h1>');
			expect(elementInnerHtml).toContain('Select one of the options');
		});
	});
});
