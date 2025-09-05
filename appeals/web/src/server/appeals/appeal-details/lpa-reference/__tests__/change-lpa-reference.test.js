import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('change-lpa-reference', () => {
	beforeEach(() => {
		nock('http://test/')
			.get(`/appeals/${appealData.appealId}`)
			.reply(200, { ...appealData, lpaQuestionnaireId: null })
			.persist();
	});

	afterEach(teardown);

	describe('GET /change', () => {
		it('should render changeLpaReference page when loaded from appeal details', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(`${baseUrl}/${appealId}/lpa-reference/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('What is the application reference number?</h1>');
			expect(elementInnerHtml).toContain('Continue</button>');
		});

		it('should render changeLpaReference page when loaded from appellant case', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(
				`${baseUrl}/${appealId}/appellant-case/lpa-reference/change`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('What is the application reference number?</h1>');
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
			expect(elementInnerHtml).toContain('What is the application reference number?</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter the application reference number</a>');
		});

		it('should re-render changeLpaReference page with an error when planningApplicationReference is over 100 characters', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				planningApplicationReference:
					'12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901'
			};

			const response = await request
				.post(`${baseUrl}/${appealId}/lpa-reference/change`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('What is the application reference number?</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Application reference number must be 100 characters or less</a>'
			);
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
