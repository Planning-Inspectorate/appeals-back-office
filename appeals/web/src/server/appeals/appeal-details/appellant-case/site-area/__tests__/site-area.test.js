import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);

const baseUrl = `/appeals-service/appeal-details`;

describe('change-site-area', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render changeSiteArea page when loaded from appellant case', async () => {
			const appealId = appealData.appealId;
			const appellantCaseId = appealData.appellantCaseId;
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
			const response = await request.get(`${baseUrl}/${appealId}/appellant-case/site-area/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('What is the area of the appeal site?</h1>');
			expect(elementInnerHtml).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		it('should re-render changeSiteArea page with an error when siteArea is empty', async () => {
			const appealId = appealData.appealId;
			const appellantCaseId = appealData.appellantCaseId;
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const invalidData = {
				siteArea: ''
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-area/change`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('What is the area of the appeal site?</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter the site area</a>');
		});

		it('should re-render changeSiteArea page with an error when siteArea is not a number or decimal', async () => {
			const appealId = appealData.appealId;
			const appellantCaseId = appealData.appellantCaseId;
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const invalidData = {
				siteArea: 'blah'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-area/change`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('What is the area of the appeal site?</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Site area must be a number or decimal</a>');
		});

		it('should redirect to the appellant-case page when siteArea is valid', async () => {
			const appealId = appealData.appealId.toString();
			const appellantCaseId = appealData.appellantCaseId.toString();
			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {
					siteAreaSquareMetres: '31.5'
				});

			const validData = {
				siteArea: '31.5'
			};

			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-area/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});
	});
});
