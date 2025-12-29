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
describe('application-development-all-or-part', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the applicationDevelopmentAllOrPart change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
			const response = await request.get(`${baseUrl}/application-development-all-or-part/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'Was the application for all or part of the development?</h1>'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="applicationDevelopmentAllOrPartRadio" type="radio" value="all-of-the-development"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="applicationDevelopmentAllOrPartRadio" type="radio" value="part-of-the-development"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		it('should re-direct to appellant-case if all of the development', async () => {
			const validData = {
				applicationDevelopmentAllOrPartRadio: 'all-of-the-development'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			const response = await request
				.post(`${baseUrl}/application-development-all-or-part/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});

		it('should re-direct to appellant-case if part of the development', async () => {
			const validData = {
				applicationDevelopmentAllOrPartRadio: 'part-of-the-development'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			const response = await request
				.post(`${baseUrl}/application-development-all-or-part/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});

		it('should re-render the development all or part change page with an error if not selected', async () => {
			const invalidData = {};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {});

			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, invalidData);

			const response = await request
				.post(`${baseUrl}/application-development-all-or-part/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(apiCall.isDone()).toBe(false);

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain(
				'Select if the application was for all or part of the development</a>'
			);
		});
	});
});
