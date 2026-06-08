import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import {
	appellantCaseDataNotValidated,
	appellantCaseInvalidReasons
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';

import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appellantCasePagePath = '/appellant-case';
const invalidOutcomePagePath = '/invalid';
const confirmationPagePath = '/confirmation';

const invalidReasonsWithoutText = appellantCaseInvalidReasons.filter(
	(reason) => reason.hasText === false
);
const invalidReasonsWithText = appellantCaseInvalidReasons.filter(
	(reason) => reason.hasText === true
);

const invalidReasonsWithoutTextIds = invalidReasonsWithoutText.map((reason) => reason.id);
const invalidReasonsWithTextIds = invalidReasonsWithText.map((reason) => reason.id);

describe('appellant-case invalid', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});
	beforeEach(installMockApi);
	afterEach(teardown);
	describe('GET /appellant-case/invalid', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the invalid reason page', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Why is the appeal invalid?</h1>');
			expect(element.innerHTML).toContain('data-module="govuk-checkboxes">');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /appellant-case/invalid', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the invalid reason page with the expected error message if no invalid reason was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Select why the appeal is invalid</a>');
		});

		it('should re-render the invalid reason page with the expected error message if a single invalid reason with text was provided but the matching text property is an empty string', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithTextIds[0],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: ''
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if a single invalid reason with text was provided but the matching text property is an empty array', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithTextIds[0],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: []
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if multiple invalid reasons with text were provided but any of the matching text properties are empty strings', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: ''
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if multiple invalid reasons with text were provided but any of the matching text properties are empty arays', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: []
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if a single invalid reason with text was provided but the matching text property exceeds the character limit', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithTextIds[0],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'a'.repeat(
						textInputCharacterLimits.checkboxTextItemsLength + 1
					)
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				`Reason must be ${textInputCharacterLimits.checkboxTextItemsLength} characters or less</a>`
			);
		});

		it('should re-render the invalid reason page with the expected error message if multiple invalid reasons with text were provided but any of the matching text properties exceed the character limit', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'a'.repeat(
						textInputCharacterLimits.checkboxTextItemsLength + 1
					)
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				`Reason must be ${textInputCharacterLimits.checkboxTextItemsLength} characters or less</a>`
			);
		});

		it('should redirect to the check and confirm page if a single invalid reason without text was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithoutTextIds[0]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/check-your-answers'
			);
		});

		it('should redirect to the check and confirm page if a single invalid reason with text within the character limit was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithTextIds[0],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: [
						'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength)
					]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/check-your-answers'
			);
		});

		it('should redirect to the check and confirm page if multiple invalid reasons without text were provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithoutTextIds
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/check-your-answers'
			);
		});

		it('should redirect to the check and confirm page if multiple invalid reasons with text within the character limit were provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: [
						'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength)
					],
					[`invalidReason-${invalidReasonsWithTextIds[1]}`]: [
						'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength),
						'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength)
					]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/check-your-answers'
			);
		});
	});

	describe('GET /appellant-case/invalid/confirmation', () => {
		it('should render the outcome invalid confirmation page', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}${confirmationPagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Appeal invalid</h1>');
			expect(element.innerHTML).toContain(
				'The appeal has been closed. The relevant parties have been informed.</p>'
			);
			expect(element.innerHTML).toContain(
				'href="/appeals-service/appeal-details/1">Go back to case details</a>'
			);
		});
	});
});
