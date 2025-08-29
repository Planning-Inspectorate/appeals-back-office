import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import {
	appealData,
	appellantCaseDataInvalidOutcome,
	appellantCaseDataNotValidated,
	appellantCaseInvalidReasons
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { appellantEmailTemplate, lpaEmailTemplate } from '../invalid-appeal-data.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const baseUrl = `/appeals-service/appeal-details/${appealId}`;

const invalidReasonsWithoutText = appellantCaseInvalidReasons.filter(
	(reason) => reason.hasText === false
);
const invalidReasonsWithText = appellantCaseInvalidReasons.filter(
	(reason) => reason.hasText === true
);

const invalidReasonsWithoutTextIds = invalidReasonsWithoutText.map((reason) => reason.id);
const invalidReasonsWithTextIds = invalidReasonsWithText.map((reason) => reason.id);

describe('invalid-appeal', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET / , /new', () => {
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
			const response = await request.get(`${baseUrl}/invalid/new`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Why is the appeal invalid?</h1>');
			expect(element.innerHTML).toContain('data-module="govuk-checkboxes">');
			expect(element.innerHTML).toContain(
				'for="invalid-reason">Appeal has not been submitted on time'
			);
			expect(element.innerHTML).toContain(
				'for="invalid-reason-2">Documents have not been submitted on time'
			);
			expect(element.innerHTML).toContain(
				'for="invalid-reason-3">The appellant does not have the right to appeal'
			);
			expect(element.innerHTML).toContain('for="invalid-reason-4">Other reason');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST  / , /new', () => {
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
			const response = await request.post(`${baseUrl}/invalid/new`).send({});

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
			const response = await request.post(`${baseUrl}/invalid/new`).send({
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
			const response = await request.post(`${baseUrl}/invalid/new`).send({
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
			const response = await request.post(`${baseUrl}/invalid/new`).send({
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
			const response = await request.post(`${baseUrl}/invalid/new`).send({
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
			const response = await request.post(`${baseUrl}/invalid/new`).send({
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
			const response = await request.post(`${baseUrl}/invalid/new`).send({
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
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: invalidReasonsWithoutTextIds[0]
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/invalid/check'
			);
		});

		it('should redirect to the CYA page if a single invalid reason with text within the character limit was provided', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: invalidReasonsWithTextIds[0],
				[`invalidReason-${invalidReasonsWithTextIds[0]}`]: [
					'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength)
				]
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/invalid/check'
			);
		});

		it('should redirect to the check and confirm page if multiple invalid reasons without text were provided', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: invalidReasonsWithoutTextIds
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/invalid/check'
			);
		});

		it('should redirect to the check and confirm page if multiple invalid reasons with text within the character limit were provided', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
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
				'Found. Redirecting to /appeals-service/appeal-details/1/invalid/check'
			);
		});
	});

	describe('GET /check', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
			nock('http://test/')
				.post(`/appeals/notify-preview/appeal-invalid.content.md`)
				.reply(200, appellantEmailTemplate);
			nock('http://test/')
				.post(`/appeals/notify-preview/appeal-invalid-lpa.content.md`)
				.reply(200, lpaEmailTemplate);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the invalid appeal check page', async () => {
			await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: invalidReasonsWithoutTextIds[0]
			});
			const response = await request.get(`${baseUrl}/invalid/check`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and mark appeal as invalid</h1>');
			expect(element.innerHTML).toContain('Preview email to appellant');
			expect(element.innerHTML).toContain('Preview email to LPA');
		});
	});

	describe('GET /view', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataInvalidOutcome);
			nock('http://test/')
				.get('/appeals/1/appeal-status/invalid/created-date')
				.reply(200, { createdDate: '2050-01-01T00:00:00.000Z' });
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the invalid appeal view page', async () => {
			const response = await request.get(`${baseUrl}/invalid/view`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Appeal marked as invalid</h1>');
			expect(element.innerHTML).toContain('Why is the appeal invalid?');
			expect(element.innerHTML).toContain('Invalid date');
		});
	});
});
