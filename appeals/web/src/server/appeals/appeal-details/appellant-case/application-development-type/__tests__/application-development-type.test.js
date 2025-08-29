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

describe('application-development-type', () => {
	beforeEach(installMockApi), afterEach(teardown);

	describe('GET /change', () => {
		it('should render the development type change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(`${baseUrl}/application-development-type/change`);
			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();
			expect(html).toContain('Development type</h1>');
		});
	});

	describe('POST /change', () => {
		it('should redirect to appellant case if valid value submitted', async () => {
			const validData = {
				developmentType: 'major-dwellings'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request
				.post(`${baseUrl}/application-development-type/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(`Found. Redirecting to ${baseUrl}`);
		});

		it('should re-render page if no selection made', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request
				.post(`${baseUrl}/application-development-type/change`)
				.send({});

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();
			expect(html).toContain('Development type</h1>');
			expect(html).toContain('Select a development type');
		});

		it('should re-render page if invalid value submitted', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request
				.post(`${baseUrl}/application-development-type/change`)
				.send({ developmentType: 'invalid-option' });

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();
			expect(html).toContain('Development type</h1>');
			expect(html).toContain('Select a valid development type from the list');
		});
	});
});
