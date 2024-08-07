import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('change-lpa-reference', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		beforeEach(installMockApi);
		afterEach(teardown);

		it('should render changeLpaReference page when loaded from appeal details', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(`${baseUrl}/${appealId}/lpa-reference/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the LPA application reference</h1>');
			expect(elementInnerHtml).toContain('Continue</button>');
		});

		it('should render changeLpaReference page when loaded from appellant case', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(
				`${baseUrl}/${appealId}/appellant-case/lpa-reference/change`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the LPA application reference</h1>');
			expect(elementInnerHtml).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		it('should re-render changeLpaReference page with an error when planningApplicationReference is empty', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				planningApplicationReference: ''
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/lpa-reference/change`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the LPA application reference</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter the LPA application reference</a>');
		});

		it('should redirect to the appeal-details page when planningApplicationReference is valid and was opened in appeal details', async () => {
			const appealId = appealData.appealId.toString();
			nock('http://test/').patch(`/appeals/${appealId}`).reply(200, {
				planningApplicationReference: '12345/A/67890'
			});

			const validData = {
				planningApplicationReference: '12345/A/67890'
			};

			const response = await request
				.post(`${baseUrl}/${appealId}/lpa-reference/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should redirect to the appellant case page when planningApplicationReference is valid and was opened in appellant case', async () => {
			const appealId = appealData.appealId.toString();
			nock('http://test/').patch(`/appeals/${appealId}`).reply(200, {
				planningApplicationReference: '12345/A/67890'
			});

			const validData = {
				planningApplicationReference: '12345/A/67890'
			};

			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/lpa-reference/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});
	});
});
