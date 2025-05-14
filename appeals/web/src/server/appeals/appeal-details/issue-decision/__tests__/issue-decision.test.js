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
const appellantCostsDecisionLetterUploadPath = '/appellant-costs-decision-letter-upload';
const lpaCostsDecisionLetterUploadPath = '/lpa-costs-decision-letter-upload';
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

		it(`should require a chosen option`, async () => {
			const response = await request.post(`${baseUrl}/1/issue-decision/decision`).expect(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Select decision</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<p id="decision-error" class="govuk-error-message"><span class="govuk-visually-hidden">Error:</span> Select decision</p>'
			);
		});

		it(`should redirect to the decision letter upload page, if the decision is 'Allowed'`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Allowed' })
				.expect(302);

			expect(response.headers.location).toBe(
				'/appeals-service/appeal-details/1/issue-decision/decision-letter-upload'
			);
		});

		it(`should redirect to the decision letter upload page, if the decision is 'Dismissed'`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Dismissed' })
				.expect(302);

			expect(response.headers.location).toBe(
				'/appeals-service/appeal-details/1/issue-decision/decision-letter-upload'
			);
		});

		it(`should redirect to the decision letter upload page, if the decision is 'Split'`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Split' })
				.expect(302);

			expect(response.headers.location).toBe(
				'/appeals-service/appeal-details/1/issue-decision/decision-letter-upload'
			);
		});

		it(`should send the decision details for invalid, and redirect to the invalid reason page, if the decision is 'Invalid'`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Invalid' })
				.expect(302);

			expect(response.headers.location).toBe(
				'/appeals-service/appeal-details/1/issue-decision/decision-letter-upload'
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

			expect(unprettifiedElement.innerHTML).toContain('Decision letter</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Upload decision letter</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');
			expect(unprettifiedElement.innerHTML).toContain('or drop file</span>');
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

		it('should redirect to the appellant cost decision page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${decisionLetterUploadPath}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/issue-decision/appellant-costs-decision'
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
				`/appeals-service/appeal-details/${mockAppealId}/issue-decision/appellant-costs-decision`
			);
		});
	});

	describe('GET /appellant-costs-decision', () => {
		it('should render the appellant cost decision page', async () => {
			const mockAppealId = '1';
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/issue-decision/appellant-costs-decision`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Do you want to issue the appellant&#39;s costs decision?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-radios__input" id="appellant-costs-decision" name="appellantCostsDecision" type="radio" value="true">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-radios__input" id="appellant-costs-decision-2" name="appellantCostsDecision" type="radio" value="false">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /appellant-costs-decision', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1').reply(200, inspectorDecisionData);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(teardown);

		it(`should require a chosen option`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/appellant-costs-decision`)
				.expect(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Select yes if you want to issue the appellant&#39;s cost decision</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<p id="appellant-costs-decision-error" class="govuk-error-message"><span class="govuk-visually-hidden">Error:</span> Select yes if you want to issue the appellant&#39;s cost decision</p>'
			);
		});

		it(`should redirect to the appellant costs decision letter upload page, if the appellant costs decision is 'Yes'`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/appellant-costs-decision`)
				.send({ appellantCostsDecision: 'true' })
				.expect(302);

			expect(response.headers.location).toBe(
				'/appeals-service/appeal-details/1/issue-decision/appellant-costs-decision-letter-upload'
			);
		});

		it(`should redirect to the check your decision page, if the decision is 'No'`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/appellant-costs-decision`)
				.send({ appellantCostsDecision: 'false' })
				.expect(302);

			expect(response.headers.location).toBe(
				'/appeals-service/appeal-details/1/issue-decision/check-your-decision'
			);
		});
	});

	describe('GET /appellant-costs-decision-letter-upload', () => {
		it('should render the decision letter upload page with a file upload component', async () => {
			const response = await request.get(
				`${baseUrl}/1${issueDecisionPath}/${appellantCostsDecisionLetterUploadPath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant costs decision letter</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Upload appellant costs decision letter</h2>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');
			expect(unprettifiedElement.innerHTML).toContain('or drop file</span>');
		});
	});

	describe('POST /appellant-costs-decision-letter-upload', () => {
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
				.post(`${baseUrl}/1${issueDecisionPath}/${appellantCostsDecisionLetterUploadPath}`)
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
				.post(`${baseUrl}/1${issueDecisionPath}/${appellantCostsDecisionLetterUploadPath}`)
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

		it('should redirect to the appellant cost decision page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${appellantCostsDecisionLetterUploadPath}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/issue-decision/lpa-costs-decision'
			);
		});
	});

	describe('GET /lpa-costs-decision', () => {
		it('should render the LPA cost decision page', async () => {
			const mockAppealId = '1';
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/issue-decision/lpa-costs-decision`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Do you want to issue the LPA&#39;s costs decision?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-radios__input" id="lpa-costs-decision" name="lpaCostsDecision" type="radio" value="true">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-radios__input" id="lpa-costs-decision-2" name="lpaCostsDecision" type="radio" value="false">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /lpa-costs-decision', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1').reply(200, inspectorDecisionData);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(teardown);

		it(`should require a chosen option`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/lpa-costs-decision`)
				.expect(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Select yes if you want to issue the LPA&#39;s cost decision</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<p id="lpa-costs-decision-error" class="govuk-error-message"><span class="govuk-visually-hidden">Error:</span> Select yes if you want to issue the LPA&#39;s cost decision</p>'
			);
		});

		it(`should redirect to the LPA costs decision letter upload page, if the LPA costs decision is 'Yes'`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/lpa-costs-decision`)
				.send({ lpaCostsDecision: 'true' })
				.expect(302);

			expect(response.headers.location).toBe(
				'/appeals-service/appeal-details/1/issue-decision/lpa-costs-decision-letter-upload'
			);
		});

		it(`should redirect to the check your decision page, if the decision is 'No'`, async () => {
			const response = await request
				.post(`${baseUrl}/1/issue-decision/lpa-costs-decision`)
				.send({ lpaCostsDecision: 'false' })
				.expect(302);

			expect(response.headers.location).toBe(
				'/appeals-service/appeal-details/1/issue-decision/check-your-decision'
			);
		});
	});

	describe('GET /lpa-costs-decision-letter-upload', () => {
		it('should render the decision letter upload page with a file upload component', async () => {
			const response = await request.get(
				`${baseUrl}/1${issueDecisionPath}/${lpaCostsDecisionLetterUploadPath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('LPA costs decision letter</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Upload LPA costs decision letter</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');
			expect(unprettifiedElement.innerHTML).toContain('or drop file</span>');
		});
	});

	describe('POST /lpa-costs-decision-letter-upload', () => {
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
				.post(`${baseUrl}/1${issueDecisionPath}/${lpaCostsDecisionLetterUploadPath}`)
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
				.post(`${baseUrl}/1${issueDecisionPath}/${lpaCostsDecisionLetterUploadPath}`)
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

		it('should redirect to the lpa cost decision page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${lpaCostsDecisionLetterUploadPath}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/issue-decision/check-your-decision'
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
		/**
		 * @type {import("superagent").Response}
		 */
		let issueAppellantCostsDecisionResponse;
		/**
		 * @type {import("superagent").Response}
		 */
		let uploadAppellantCostsDecisionLetterResponse;
		/**
		 * @type {import("superagent").Response}
		 */
		let issueLpaCostsDecisionResponse;
		/**
		 * @type {import("superagent").Response}
		 */
		let uploadLpaCostsDecisionLetterResponse;

		beforeEach(async () => {
			nock('http://test/').get('/appeals/1').reply(200, inspectorDecisionData);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();

			issueDecisionResponse = await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Allowed' });

			uploadDecisionLetterResponse = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${decisionLetterUploadPath}`)
				.send({
					'upload-info':
						'[{"name": "test-document.pdf", "GUID": "1", "blobStoreUrl": "/", "mimeType": "pdf", "documentType": "caseDecisionLetter", "size": 1, "stage": "appellant-case"}]'
				});

			issueAppellantCostsDecisionResponse = await request
				.post(`${baseUrl}/1/issue-decision/appellant-costs-decision`)
				.send({ appellantCostsDecision: 'true' });

			uploadAppellantCostsDecisionLetterResponse = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${appellantCostsDecisionLetterUploadPath}`)
				.send({
					'upload-info':
						'[{"name": "test-document-appellant.pdf", "GUID": "2", "blobStoreUrl": "/", "mimeType": "pdf", "documentType": "appellantCostsDecisionLetter", "size": 1, "stage": "appellant-case"}]'
				});

			issueLpaCostsDecisionResponse = await request
				.post(`${baseUrl}/1/issue-decision/lpa-costs-decision`)
				.send({ lpaCostsDecision: 'true' });

			uploadLpaCostsDecisionLetterResponse = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${lpaCostsDecisionLetterUploadPath}`)
				.send({
					'upload-info':
						'[{"name": "test-document-lpa.pdf", "GUID": "3", "blobStoreUrl": "/", "mimeType": "pdf", "documentType": "lpaCostsDecisionLetter", "size": 1, "stage": "appellant-case"}]'
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
			expect(issueAppellantCostsDecisionResponse.statusCode).toBe(302);
			expect(uploadAppellantCostsDecisionLetterResponse.statusCode).toBe(302);
			expect(issueLpaCostsDecisionResponse.statusCode).toBe(302);
			expect(uploadLpaCostsDecisionLetterResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${issueDecisionPath}/${checkYourDecisionPath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Check details and issue decision</h1>');

			expect(unprettifiedElement.innerHTML).toContain('Decision</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Allowed</dd>');

			expect(unprettifiedElement.innerHTML).toContain('Decision letter</dt>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.pdf</a>');

			expect(unprettifiedElement.innerHTML).toContain(
				'Do you want to issue the appellant&#39;s costs decision?</dt><dd class="govuk-summary-list__value"> Yes</dd>'
			);

			expect(unprettifiedElement.innerHTML).toContain('Appellant costs decision letter</dt>');
			expect(unprettifiedElement.innerHTML).toContain('test-document-appellant.pdf</a>');

			expect(unprettifiedElement.innerHTML).toContain(
				'Do you want to issue the LPA&#39;s costs decision?</dt><dd class="govuk-summary-list__value"> Yes</dd>'
			);

			expect(unprettifiedElement.innerHTML).toContain('LPA costs decision letter</dt>');
			expect(unprettifiedElement.innerHTML).toContain('test-document-lpa.pdf</a>');

			expect(unprettifiedElement.innerHTML).toContain('Issue decision</button>');
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
			expect(unprettifiedElement.innerHTML).toContain('Issue decision</button>');
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
