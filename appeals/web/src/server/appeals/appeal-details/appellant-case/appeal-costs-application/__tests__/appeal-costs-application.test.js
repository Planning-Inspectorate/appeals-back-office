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
describe('appeal-costs-application', () => {
	beforeEach(installMockApi), afterEach(teardown);

	describe('GET /change', () => {
		it('should render the costs application change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
			const response = await request.get(`${baseUrl}/appeal-costs-application/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Did the appellant apply for an award of costs?</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealCostsApplicationRadio" type="radio" value="yes"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealCostsApplicationRadio" type="radio" value="no"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		it('should re-direct to appeals-details page if yes', async () => {
			const validData = {
				appealCostsApplicationRadio: 'yes'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			const response = await request
				.post(`${baseUrl}/appeal-costs-application/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});

		it('should re-direct to appeals-details page if no', async () => {
			const validData = {
				appealCostsApplicationRadio: 'no'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			const response = await request
				.post(`${baseUrl}/appeal-costs-application/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});
	});
});
