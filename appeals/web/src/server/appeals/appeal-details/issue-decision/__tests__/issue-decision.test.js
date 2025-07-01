// @ts-nocheck
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import {
	appealData,
	documentFileInfo,
	inspectorDecisionData,
	documentRedactionStatuses,
	fileUploadInfo
} from '#testing/appeals/appeals.js';
import { cloneDeep } from 'lodash-es';
import { mapDecisionOutcome } from '#appeals/appeal-details/issue-decision/issue-decision.utils.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const issueDecisionPath = '/issue-decision';
const decisionPath = '/decision';
const decisionLetterUploadPath = '/decision-letter-upload';
const appellantCostsDecisionLetterUploadPath = '/appellant-costs-decision-letter-upload';
const lpaCostsDecisionLetterUploadPath = '/lpa-costs-decision-letter-upload';
const checkYourDecisionPath = '/check-your-decision';
const issueAppellantCostsDecisionLetterUploadPath = '/issue-appellant-costs-decision-letter-upload';
const checkYourAppellantCostsDecisionPath = '/check-your-appellant-costs-decision';
const issueLpaCostsDecisionLetterUploadPath = '/issue-lpa-costs-decision-letter-upload';
const checkYourLpaCostsDecisionPath = '/check-your-lpa-costs-decision';
const viewDecisionPath = '/view-decision';

describe('issue-decision', () => {
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

	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /decision', () => {
		it(`should render the 'what is the decision' page with the expected content`, async () => {
			const response = await request.get(`${baseUrl}/1${issueDecisionPath}/${decisionPath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062 - issue decision</span>');

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
				'<input class="govuk-radios__input" id="decision-4" name="decision" type="radio" value="Invalid" data-aria-controls="conditional-decision-4">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="invalid-reason" name="invalidReason" rows="5" aria-describedby="invalid-reason-hint"></textarea>'
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
				.send({ decision: 'Invalid', invalidReason: 'my invalid reason' })
				.expect(302);

			expect(response.headers.location).toBe(
				'/appeals-service/appeal-details/1/issue-decision/check-your-decision'
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

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062 - issue decision</span>');
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
		let issueDecisionAppealData;

		beforeEach(() => {
			issueDecisionAppealData = cloneDeep(appealData);
			issueDecisionAppealData.costs.appellantApplicationFolder.documents = [{}];
			issueDecisionAppealData.costs.lpaApplicationFolder.documents = [{}];
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, issueDecisionAppealData).persist();
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

	describe('GET /appellant-costs-decision', () => {
		it('should render the appellant cost decision page', async () => {
			const mockAppealId = '1';
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/issue-decision/appellant-costs-decision`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062 - issue decision</span>');

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

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062 - issue decision</span>');
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
		let issueDecisionAppealData;

		beforeEach(() => {
			issueDecisionAppealData = cloneDeep(appealData);
			issueDecisionAppealData.costs.lpaApplicationFolder.documents = [{}];
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, issueDecisionAppealData).persist();
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
				'Found. Redirecting to /appeals-service/appeal-details/1/issue-decision/lpa-costs-decision?backUrl=%2Fappeals-service%2Fappeal-details%2F1%2Fissue-decision%2F%2Fappellant-costs-decision-letter-upload'
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

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062 - issue decision</span>');

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

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062 - issue decision</span>');
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

	describe('GET /issue-decision/check-your-decision', () => {
		let issueDecisionAppealData;

		beforeEach(async () => {
			issueDecisionAppealData = cloneDeep(appealData);
			issueDecisionAppealData.costs.appellantApplicationFolder.documents = [{}];
			issueDecisionAppealData.costs.lpaApplicationFolder.documents = [{}];
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, issueDecisionAppealData).persist();
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

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');

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

	describe('POST /issue-decision/check-your-decision', () => {
		beforeEach(async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/').post('/appeals/1/documents').reply(200, {}).persist();
			nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });
			nock('http://test/').post(`/appeals/1/decision`).reply(200, {});
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();

			issueDecisionResponse = await request
				.post(`${baseUrl}/1/issue-decision/decision`)
				.send({ decision: 'Allowed' });
		});
		afterEach(teardown);

		it('should render a 500 error page if no decision files are sent', async () => {
			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${checkYourDecisionPath}`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should redirect to the case details page', async () => {
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

			expect(issueDecisionResponse.statusCode).toBe(302);
			expect(uploadDecisionLetterResponse.statusCode).toBe(302);
			expect(issueAppellantCostsDecisionResponse.statusCode).toBe(302);
			expect(uploadAppellantCostsDecisionLetterResponse.statusCode).toBe(302);
			expect(issueLpaCostsDecisionResponse.statusCode).toBe(302);
			expect(uploadLpaCostsDecisionLetterResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${checkYourDecisionPath}`)
				.send({});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /issue-appellant-costs-decision-letter-upload', () => {
		it('should render the decision letter upload page with a file upload component', async () => {
			const response = await request.get(
				`${baseUrl}/1${issueDecisionPath}/${issueAppellantCostsDecisionLetterUploadPath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Appeal 351062 - issue appellant costs decision</span>'
			);

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

	describe('POST /issue-appellant-costs-decision-letter-upload', () => {
		let issueDecisionAppealData;

		beforeEach(() => {
			issueDecisionAppealData = cloneDeep(appealData);
			issueDecisionAppealData.costs.lpaApplicationFolder.documents = [{}];
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, issueDecisionAppealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if upload-info is not present in the request body', async () => {
			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${issueAppellantCostsDecisionLetterUploadPath}`)
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
				.post(`${baseUrl}/1${issueDecisionPath}/${issueAppellantCostsDecisionLetterUploadPath}`)
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

		it('should redirect to the check your appellant cost decision page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${issueAppellantCostsDecisionLetterUploadPath}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/issue-decision/check-your-appellant-costs-decision?backUrl=%2Fappeals-service%2Fappeal-details%2F1%2Fissue-decision%2F%2Fissue-appellant-costs-decision-letter-upload'
			);
		});
	});

	describe('GET /issue-decision/check-your-appellant-costs-decision', () => {
		let issueDecisionAppealData;

		beforeEach(async () => {
			issueDecisionAppealData = cloneDeep(appealData);
			issueDecisionAppealData.costs.appellantApplicationFolder.documents = [{}];
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, issueDecisionAppealData).persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();

			uploadAppellantCostsDecisionLetterResponse = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${appellantCostsDecisionLetterUploadPath}`)
				.send({
					'upload-info':
						'[{"name": "test-document-appellant.pdf", "GUID": "2", "blobStoreUrl": "/", "mimeType": "pdf", "documentType": "appellantCostsDecisionLetter", "size": 1, "stage": "appellant-case"}]'
				});
		});

		afterEach(teardown);

		it('should render the check your decision page', async () => {
			expect(uploadAppellantCostsDecisionLetterResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${issueDecisionPath}/${checkYourAppellantCostsDecisionPath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');

			expect(unprettifiedElement.innerHTML).toContain(
				'Check details and issue appellant costs decision</h1>'
			);

			expect(unprettifiedElement.innerHTML).not.toContain('Decision</dt>');
			expect(unprettifiedElement.innerHTML).not.toContain('Allowed</dd>');

			expect(unprettifiedElement.innerHTML).not.toContain('Decision letter</dt>');
			expect(unprettifiedElement.innerHTML).not.toContain('test-document.pdf</a>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'Do you want to issue the appellant&#39;s costs decision?</dt>'
			);

			expect(unprettifiedElement.innerHTML).toContain('Appellant costs decision letter</dt>');
			expect(unprettifiedElement.innerHTML).toContain('test-document-appellant.pdf</a>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'Do you want to issue the LPA&#39;s costs decision?</dt>'
			);

			expect(unprettifiedElement.innerHTML).not.toContain('LPA costs decision letter</dt>');

			expect(unprettifiedElement.innerHTML).toContain('Issue appellant costs decision</button>');
		});
	});

	describe('POST /issue-decision/check-your-appellant-costs-decision', () => {
		beforeEach(async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/').post('/appeals/1/documents').reply(200, {}).persist();
			nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });
			nock('http://test/').post(`/appeals/1/decision`).reply(200, {});
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(teardown);

		it('should render a 500 error page if no decision files are sent', async () => {
			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${checkYourDecisionPath}`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should redirect to the case details page', async () => {
			uploadAppellantCostsDecisionLetterResponse = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${issueAppellantCostsDecisionLetterUploadPath}`)
				.send({
					'upload-info':
						'[{"name": "test-document-appellant.pdf", "GUID": "2", "blobStoreUrl": "/", "mimeType": "pdf", "documentType": "appellantCostsDecisionLetter", "size": 1, "stage": "appellant-case"}]'
				});

			expect(uploadAppellantCostsDecisionLetterResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${checkYourAppellantCostsDecisionPath}`)
				.send({});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /issue-lpa-costs-decision-letter-upload', () => {
		it('should render the decision letter upload page with a file upload component', async () => {
			const response = await request.get(
				`${baseUrl}/1${issueDecisionPath}/${issueLpaCostsDecisionLetterUploadPath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Appeal 351062 - issue LPA costs decision</span>'
			);

			expect(unprettifiedElement.innerHTML).toContain('LPA costs decision letter</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Upload LPA costs decision letter</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');
			expect(unprettifiedElement.innerHTML).toContain('or drop file</span>');
		});
	});

	describe('POST /issue-lpa-costs-decision-letter-upload', () => {
		let issueDecisionAppealData;

		beforeEach(() => {
			issueDecisionAppealData = cloneDeep(appealData);
			issueDecisionAppealData.costs.lpaApplicationFolder.documents = [{}];
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, issueDecisionAppealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if upload-info is not present in the request body', async () => {
			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${issueLpaCostsDecisionLetterUploadPath}`)
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
				.post(`${baseUrl}/1${issueDecisionPath}/${issueLpaCostsDecisionLetterUploadPath}`)
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
				.post(`${baseUrl}/1${issueDecisionPath}/${issueLpaCostsDecisionLetterUploadPath}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/issue-decision/check-your-lpa-costs-decision'
			);
		});
	});

	describe('GET /issue-decision/check-your-lpa-costs-decision', () => {
		let issueDecisionAppealData;

		beforeEach(async () => {
			issueDecisionAppealData = cloneDeep(appealData);
			issueDecisionAppealData.costs.lpaApplicationFolder.documents = [{}];
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, issueDecisionAppealData).persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();

			uploadLpaCostsDecisionLetterResponse = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${lpaCostsDecisionLetterUploadPath}`)
				.send({
					'upload-info':
						'[{"name": "test-document-lpa.pdf", "GUID": "2", "blobStoreUrl": "/", "mimeType": "pdf", "documentType": "lpaCostsDecisionLetter", "size": 1, "stage": "lpa-case"}]'
				});
		});

		afterEach(teardown);

		it('should render the check your decision page', async () => {
			expect(uploadLpaCostsDecisionLetterResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${issueDecisionPath}/${checkYourLpaCostsDecisionPath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');

			expect(unprettifiedElement.innerHTML).toContain(
				'Check details and issue LPA costs decision</h1>'
			);

			expect(unprettifiedElement.innerHTML).not.toContain('Decision</dt>');
			expect(unprettifiedElement.innerHTML).not.toContain('Allowed</dd>');

			expect(unprettifiedElement.innerHTML).not.toContain('Decision letter</dt>');
			expect(unprettifiedElement.innerHTML).not.toContain('test-document.pdf</a>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'Do you want to issue the lpa&#39;s costs decision?</dt>'
			);

			expect(unprettifiedElement.innerHTML).toContain('LPA costs decision letter</dt>');
			expect(unprettifiedElement.innerHTML).toContain('test-document-lpa.pdf</a>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'Do you want to issue the LPA&#39;s costs decision?</dt>'
			);

			expect(unprettifiedElement.innerHTML).not.toContain('Appellant costs decision letter</dt>');

			expect(unprettifiedElement.innerHTML).toContain('Issue LPA costs decision</button>');
		});
	});

	describe('POST /issue-decision/check-your-lpa-costs-decision', () => {
		beforeEach(async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/').post('/appeals/1/documents').reply(200, {}).persist();
			nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });
			nock('http://test/').post(`/appeals/1/decision`).reply(200, {});
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(teardown);

		it('should render a 500 error page if no decision files are sent', async () => {
			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${checkYourDecisionPath}`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should redirect to the case details page', async () => {
			uploadLpaCostsDecisionLetterResponse = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${issueLpaCostsDecisionLetterUploadPath}`)
				.send({
					'upload-info':
						'[{"name": "test-document-lpa.pdf", "GUID": "2", "blobStoreUrl": "/", "mimeType": "pdf", "documentType": "lpaCostsDecisionLetter", "size": 1, "stage": "lpa-case"}]'
				});

			expect(uploadLpaCostsDecisionLetterResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${issueDecisionPath}/${checkYourLpaCostsDecisionPath}`)
				.send({});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /issue-decision/view-decision', () => {
		let issueDecisionAppealData;

		beforeEach(async () => {
			issueDecisionAppealData = cloneDeep(appealData);
			issueDecisionAppealData.decision.outcome = 'allowed';
			issueDecisionAppealData.costs.appellantDecisionFolder.documents = [
				{
					name: 'appellant-costs-decision-letter.pdf',
					latestDocumentVersion: {
						dateReceived: '2025-06-02T00:00:00.000Z',
						version: 1
					}
				}
			];
			issueDecisionAppealData.costs.lpaDecisionFolder.documents = [
				{
					name: 'lpa-costs-decision-letter.pdf',
					latestDocumentVersion: {
						dateReceived: '2025-06-02T00:00:00.000Z',
						version: 1
					}
				}
			];
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, issueDecisionAppealData).persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});

		afterEach(teardown);

		it('should render the view decision page', async () => {
			const response = await request.get(`${baseUrl}/1${issueDecisionPath}/${viewDecisionPath}`);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');

			expect(unprettifiedElement.innerHTML).toContain('Decision</h1>');

			expect(unprettifiedElement.innerHTML).toContain('Decision</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Allowed</dd>');

			expect(unprettifiedElement.innerHTML).toContain('Decision letter</dt>');
			expect(unprettifiedElement.innerHTML).toContain('decision-letter.pdf</a>');

			expect(unprettifiedElement.innerHTML).toContain('Appellant costs decision letter</dt>');
			expect(unprettifiedElement.innerHTML).toContain('appellant-costs-decision-letter.pdf</a>');

			expect(unprettifiedElement.innerHTML).toContain('LPA costs decision letter</dt>');
			expect(unprettifiedElement.innerHTML).toContain('lpa-costs-decision-letter.pdf</a>');
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
