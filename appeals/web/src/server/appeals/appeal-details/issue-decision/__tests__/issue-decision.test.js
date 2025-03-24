import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import { mapDecisionOutcome } from '../issue-decision.mapper.js';
import {
	appealData,
	documentFileInfo,
	inspectorDecisionData,
	documentRedactionStatuses,
	fileUploadInfo
} from '#testing/appeals/appeals.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const issueDecisionPath = '/issue-decision';
const decisionPath = '/decision';
const decisionLetterUploadPath = '/decision-letter-upload';
const decisionLetterDatePath = '/decision-letter-date';
const checkYourDecisionPath = '/check-your-decision';

describe('issue-decision', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /decision', () => {
		it(`should render the 'what is the decision' page with the expected content`, async () => {
			const response = await request.get(`${baseUrl}/1${issueDecisionPath}/${decisionPath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('What is the decision?</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-radios__input" id="decision" name="decision" type="radio" value="Allowed">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-radios__input" id="decision-2" name="decision" type="radio" value="Dismissed">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-radios__input" id="decision-3" name="decision" type="radio" value="Split">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-radios__input" id="decision-4" name="decision" type="radio" value="Invalid">'
			);
		});
	});

	describe('POST /decision', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1').reply(200, inspectorDecisionData);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(teardown);

		it(`should redirect to the decision letter upload page, if the decision is 'Allowed'`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Allowed' })
				.expect(302);

			expect(response.headers.location).toBe(
				`/appeals-service/appeal-details/1/issue-decision/decision-letter-upload`
			);
		});

		it(`should redirect to the decision letter upload page, if the decision is 'Dismissed'`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Dismissed' })
				.expect(302);

			expect(response.headers.location).toBe(
				`/appeals-service/appeal-details/1/issue-decision/decision-letter-upload`
			);
		});

		it(`should redirect to the decision letter upload page, if the decision is 'Split'`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Split' })
				.expect(302);

			expect(response.headers.location).toBe(
				`/appeals-service/appeal-details/1/issue-decision/decision-letter-upload`
			);
		});

		it(`should send the decision details for invalid, and redirect to the invalid reason page, if the decision is 'Invalid'`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Invalid' })
				.expect(302);

			expect(response.headers.location).toBe(
				`/appeals-service/appeal-details/1/issue-decision/invalid-reason`
			);
		});
	});

	describe('GET /decision-letter-upload', () => {
		it('should render the decision letter upload page with a file upload component', async () => {
			const response = await request.get(
				`${baseUrl}/1${issueDecisionPath}/${decisionLetterUploadPath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload decision letter</h1>');

			expect(unprettifiedElement.innerHTML).toContain(
				'Warning</span> Before uploading, check that you have:'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<li>added the correct appeal reference</li>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<li>added the decision date and visit date</li>'
			);
			expect(unprettifiedElement.innerHTML).toContain('<li>added the correct site address</li>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<li>added the decision to the top and bottom of the letter</li>'
			);
			expect(unprettifiedElement.innerHTML).toContain('<li>signed the letter</li>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Select files</button>');
		});
	});

	describe('POST /decision-letter-upload', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if upload-info is not present in the request body', async () => {
			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${decisionLetterUploadPath}`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render a 500 error page if request body upload-info is in an incorrect format', async () => {
			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${decisionLetterUploadPath}`)
				.send({
					'upload-info': ''
				});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should redirect to the decision letter date page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${decisionLetterUploadPath}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/issue-decision/decision-letter-date'
			);
		});
	});

	describe('GET /decision-letter-date', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Allowed' })
				.expect(302);

			const response = await request.get(
				`${baseUrl}/1${issueDecisionPath}/${decisionLetterDatePath}`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the decision letter date page with the expected content if fileUploadInfo is present in the session', async () => {
			await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Allowed' })
				.expect(302);

			const uploadDecisionLetterResponse = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${decisionLetterUploadPath}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(uploadDecisionLetterResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${issueDecisionPath}/${decisionLetterDatePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter date of decision letter</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="decision-letter-date-day" type="text" value="" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="decision-letter-date-month" type="text" value="" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="decision-letter-date-year" type="text" value="" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /decision-letter-date', () => {
		/**
		 * @type {import("superagent").Response}
		 */
		let issueDecisionResponse;
		/**
		 * @type {import("superagent").Response}
		 */
		let uploadDecisionLetterResponse;

		beforeEach(async () => {
			nock('http://test/').get('/appeals/1').reply(200, inspectorDecisionData);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);

			issueDecisionResponse = await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Allowed' });

			uploadDecisionLetterResponse = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${decisionLetterUploadPath}`)
				.send({
					'upload-info': fileUploadInfo
				});
		});
		afterEach(teardown);

		it('should re-render the decision letter date page with an error message if the provided date day is invalid', async () => {
			expect(issueDecisionResponse.statusCode).toBe(302);
			expect(uploadDecisionLetterResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${decisionLetterDatePath}`)
				.send({
					'decision-letter-date-day': 32,
					'decision-letter-date-month': 11,
					'decision-letter-date-year': 2024
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter date of decision letter</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Decision letter date day must be between 1 and 31</a>'
			);
		});

		it('should re-render the decision letter date page with an error message if the provided date month is invalid', async () => {
			expect(issueDecisionResponse.statusCode).toBe(302);
			expect(uploadDecisionLetterResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${decisionLetterDatePath}`)
				.send({
					'decision-letter-date-day': 1,
					'decision-letter-date-month': 13,
					'decision-letter-date-year': 2024
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter date of decision letter</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Decision letter date month must be between 1 and 12</a>'
			);
		});

		it('should re-render the decision letter date page with an error message if the provided date year is invalid', async () => {
			expect(issueDecisionResponse.statusCode).toBe(302);
			expect(uploadDecisionLetterResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${decisionLetterDatePath}`)
				.send({
					'decision-letter-date-day': 1,
					'decision-letter-date-month': 11,
					'decision-letter-date-year': 'x'
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter date of decision letter</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Decision letter date year must be a number</a>'
			);
		});

		it('should re-render the decision letter date page with an error message if the provided date year is not in the past', async () => {
			expect(issueDecisionResponse.statusCode).toBe(302);
			expect(uploadDecisionLetterResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${decisionLetterDatePath}`)
				.send({
					'decision-letter-date-day': 1,
					'decision-letter-date-month': 11,
					'decision-letter-date-year': 3000
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter date of decision letter</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Date must be today or in the past</a>');
		});

		it('should redirect to the check your decision page if the provided date is fully populated and valid', async () => {
			nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });
			expect(issueDecisionResponse.statusCode).toBe(302);
			expect(uploadDecisionLetterResponse.statusCode).toBe(302);

			const mockAppealId = '1';
			const mockLetterDecisionDate = {
				'decision-letter-date-day': '2',
				'decision-letter-date-month': '1',
				'decision-letter-date-year': '2024'
			};
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/issue-decision/decision-letter-date`)
				.send(mockLetterDecisionDate)
				.expect(302);

			expect(response.headers.location).toBe(
				`/appeals-service/appeal-details/${mockAppealId}/issue-decision/check-your-decision`
			);
		});
	});

	describe('GET /invalid-reason', () => {
		it('should render the invalid reason page', async () => {
			const mockAppealId = '1';
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/issue-decision/invalid-reason`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Why is the appeal invalid?</h1>');
			expect(element.innerHTML).toContain(
				'This information will be shared with all parties.</div>'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea govuk-js-character-count" id="decision-invalid-reason" name="decisionInvalidReason"'
			);
			expect(unprettifiedElement.innerHTML).toContain('You can enter up to 1000 characters</div>');
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /invalid-reason', () => {
		it('should re-render the invalid reason page with the expected error message if no invalid reason text is provided', async () => {
			const mockAppealId = '1';
			const mockReason = '';
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/issue-decision/invalid-reason`)
				.send({ decisionInvalidReason: mockReason })
				.expect(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Why is the appeal invalid?</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter invalid reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if the provided invalid reason text exceeds the character limit', async () => {
			const mockAppealId = '1';
			const mockReason = 'a'.repeat(textInputCharacterLimits.defaultTextareaLength + 1);
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/issue-decision/invalid-reason`)
				.send({ decisionInvalidReason: mockReason })
				.expect(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Why is the appeal invalid?</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Invalid reason must be 1000 characters or less</a>'
			);
		});

		it('should process the invalid reason page and redirect', async () => {
			const mockAppealId = '1';
			const mockReason = 'Reasons!';
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/issue-decision/invalid-reason`)
				.send({ decisionInvalidReason: mockReason })
				.expect(302);

			expect(response.headers.location).toBe(
				`/appeals-service/appeal-details/${mockAppealId}/issue-decision/check-invalid-decision`
			);
		});
	});

	describe('GET /issue-decision/check-your-decision', () => {
		/**
		 * @type {import("superagent").Response}
		 */
		let issueDecisionResponse;
		/**
		 * @type {import("superagent").Response}
		 */
		let uploadDecisionLetterResponse;

		beforeEach(async () => {
			nock('http://test/').get('/appeals/1').reply(200, inspectorDecisionData);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);

			issueDecisionResponse = await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Allowed' });

			uploadDecisionLetterResponse = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${decisionLetterUploadPath}`)
				.send({
					'upload-info': fileUploadInfo
				});

			const mockLetterDecisionDate = {
				'decision-letter-date-day': '1',
				'decision-letter-date-month': '1',
				'decision-letter-date-year': '2023'
			};

			await request
				.post(`${baseUrl}/1/issue-decision/decision-letter-date`)
				.send(mockLetterDecisionDate)
				.expect(302);
		});
		afterEach(teardown);

		it('should render the check your decision page', async () => {
			expect(issueDecisionResponse.statusCode).toBe(302);
			expect(uploadDecisionLetterResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${issueDecisionPath}/${checkYourDecisionPath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check your answers</h1>');
			expect(element.innerHTML).toContain('Decision</dt>');
			expect(element.innerHTML).toContain('Decision letter</dt>');
			expect(element.innerHTML).toContain('Decision date</dt>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Warning</span> You are about to send the decision to relevant parties and close the appeal. Make sure you have reviewed the decision information.</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ready-to-send" type="checkbox" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Send decision</button>');
		});
	});

	describe('GET /check-invalid-decision', () => {
		it('should render the check your answer page for invalid decision', async () => {
			const mockAppealId = '1';
			const mockReason = 'Reasons!';
			const invalidReasonResponse = await request
				.post(`${baseUrl}/${mockAppealId}/issue-decision/invalid-reason`)
				.send({ decisionInvalidReason: mockReason })
				.expect(302);

			expect(invalidReasonResponse.headers.location).toBe(
				`/appeals-service/appeal-details/${mockAppealId}/issue-decision/check-invalid-decision`
			);

			const response = await request.get(`${baseUrl}/1${issueDecisionPath}/check-invalid-decision`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check your answers</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Decision</dt><dd class="govuk-summary-list__value"> Invalid</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/1/issue-decision/decision">Change<span class="govuk-visually-hidden"> decision</span></a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Reasons</dt><dd class="govuk-summary-list__value"> Reasons!</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/1/issue-decision/invalid-reason">Change<span class="govuk-visually-hidden"> invalid reasons</span></a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Warning</span> You are about to send the decision to relevant parties and close the appeal. Make sure you have reviewed the decision information.'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ready-to-send" type="checkbox" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Send decision</button>');
		});
	});
});

describe('mapDecisionOutcome', () => {
	it('should map "allowed" to "Allowed"', () => {
		const result = mapDecisionOutcome('allowed');
		expect(result).toBe('Allowed');
	});

	it('should map "dismissed" to "Dismissed"', () => {
		const result = mapDecisionOutcome('dismissed');
		expect(result).toBe('Dismissed');
	});

	it('should map "split" to "Split decision"', () => {
		const result = mapDecisionOutcome('split');
		expect(result).toBe('Split decision');
	});

	it('should return an empty string for undefined outcome', () => {
		const result = mapDecisionOutcome(undefined);
		expect(result).toBe('');
	});

	it('should return invalid for invalid outcome', () => {
		const result = mapDecisionOutcome('invalid');
		expect(result).toBe('Invalid');
	});
});
