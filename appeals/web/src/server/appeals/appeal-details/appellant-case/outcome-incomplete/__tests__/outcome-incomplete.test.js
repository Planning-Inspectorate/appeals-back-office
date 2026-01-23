import {
	appealCaseEnforcementInvalidReasons,
	appealDataEnforcementNotice,
	appellantCaseDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi } = createTestEnvironment();
const request = supertest(app);
const appealId = appealDataEnforcementNotice.appealId;
const baseUrl = `/appeals-service/appeal-details/${appealId}`;

describe('incomplete-appeal', () => {
	describe('enforcement notice appeal', () => {
		describe('GET /enforcement-notice-reason', () => {
			beforeEach(async () => {
				installMockApi();
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
					.reply(200, appellantCaseDataNotValidated);
				nock('http://test/')
					.get('/appeals/appellant-case-enforcement-invalid-reasons')
					.reply(200, appealCaseEnforcementInvalidReasons);
			});

			afterEach(() => {
				nock.cleanAll();
			});

			it('should render the enforcement notice reasons page with no reasons selected', async () => {
				const response = await request.get(
					`${baseUrl}/appellant-case/invalid/enforcement-notice-reason`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');

				expect(unprettifiedElement.innerHTML).toContain(
					'Why is the enforcement notice invalid?</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<div class="govuk-checkboxes__item"><input class="govuk-checkboxes__input" id="invalid-reason" name="invalidReason" type="checkbox" value="1" data-aria-controls="conditional-invalid-reason"><label class="govuk-label govuk-checkboxes__label" for="invalid-reason"> Enforcement invalid reason one</label></div>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});
		});

		describe('POST /enforcement-notice-reason', () => {
			beforeEach(async () => {
				installMockApi();
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
					.reply(200, appellantCaseDataNotValidated);
				nock('http://test/')
					.get('/appeals/appellant-case-enforcement-invalid-reasons')
					.reply(200, appealCaseEnforcementInvalidReasons);
			});

			afterEach(() => {
				nock.cleanAll();
			});

			it('should re-render the enforcement notice reasons page with the expected error message if no reason was selected', async () => {
				const response = await request
					.post(`${baseUrl}/appellant-case/invalid/enforcement-notice-reason`)
					.send({});

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;
				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'Select why the enforcement notice is invalid</a>'
				);
			});

			it('should re-render the enforcement notice reasons page with the expected error message if reasons were selected, but one has an empty text value', async () => {
				const response = await request
					.post(`${baseUrl}/appellant-case/invalid/enforcement-notice-reason`)
					.send({
						invalidReason: ['1', '2'],
						'invalidReason-1': 'has some text',
						'invalidReason-2': ''
					});

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;
				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');

				const unprettifiedInvalidReason1 = parseHtml(response.text, {
					rootElement: `#conditional-invalid-reason`,
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedInvalidReason1).toContain('Enter a reason</label>');
				expect(unprettifiedInvalidReason1).toContain('value="has some text"');
				expect(unprettifiedInvalidReason1).not.toContain('Error:</span> Enter a reason</p>');

				const unprettifiedInvalidReason2 = parseHtml(response.text, {
					rootElement: `#conditional-invalid-reason-2`,
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedInvalidReason2).toContain('Enter a reason</label>');
				expect(unprettifiedInvalidReason2).toContain('value=""');
				expect(unprettifiedInvalidReason2).toContain('Error:</span> Enter a reason</p>');
			});

			it('should redirect to check details screen on success', async () => {
				// Populate session data
				await request.post(`${baseUrl}/appellant-case`).send({ reviewOutcome: 'invalid' });

				const response = await request
					.post(`${baseUrl}/appellant-case/invalid/enforcement-notice-reason`)
					.send({
						invalidReason: ['1', '2'],
						'invalidReason-1': 'has some text',
						'invalidReason-2': 'has some other text'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case/invalid/enforcement-other-information`
				);
			});
		});
	});
});
