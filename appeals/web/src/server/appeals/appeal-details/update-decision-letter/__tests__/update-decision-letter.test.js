// @ts-nocheck
import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';
const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const oneThousdandAndOneCharacterString = 'a'.repeat(1001);
const oneThousdandCharacterString = 'a'.repeat(1000);
import {
	appealDataIssuedDecision,
	documentRedactionStatuses,
	fileUploadInfo,
	documentFileInfo,
	fileUploadInfo2,
	template
} from '../../../../../../../web/testing/app/fixtures/referencedata.js';

describe('update-decision-letter', () => {
	/**
	 * @type {import("superagent").Response}
	 */
	let uploadDecisionLetterResponse;
	/**
	 * @type {import("superagent").Response}
	 */
	let correctionNoticeResponse;
	beforeEach(() => {
		installMockApi();
		nock.cleanAll();
		nock('http://test/').get('/appeals/1').reply(200, appealDataIssuedDecision).persist();
	});
	afterEach(teardown);

	describe('GET /update-decision-letter/correction-notice', () => {
		it(`should render the 'correction-notice' page with the expected content`, async () => {
			const response = await request.get(`${baseUrl}/1/update-decision-letter/correction-notice`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			console.log('unprettifiedElement', unprettifiedElement.innerHTML);
			expect(unprettifiedElement.innerHTML).toContain('Correction notice');
		});
	});

	describe('POST /upload-decision-letter/correction-notice', () => {
		it(`should return 'Enter the correction notice' when nothing value provided`, async () => {
			const response = await request
				.post(`${baseUrl}/1/update-decision-letter/correction-notice`)
				.expect(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Enter the correction notice</a>');
			expect(unprettifiedElement.innerHTML).toContain('href="#correction-notice"');
			expect(unprettifiedElement.innerHTML).toContain('Enter the correction notice</p>');
		});
		it(`should return expected error message if invalid character entered(non ascii)`, async () => {
			const response = await request
				.post(`${baseUrl}/1/update-decision-letter/correction-notice`)
				.send({ correctionNotice: '😀' })
				.expect(200);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Correction notice must only include letters a to z, numbers 0 to 9, and special characters such as hyphens, spaces and apostrophes</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain('href="#correction-notice"');
			expect(unprettifiedElement.innerHTML).toContain(
				'Correction notice must only include letters a to z, numbers 0 to 9, and special characters such as hyphens, spaces and apostrophes</p>'
			);
			expect(unprettifiedElement.innerHTML).toContain('😀');
		});

		it(`should return expected error message if over 1000 characters entered`, async () => {
			const response = await request
				.post(`${baseUrl}/1/update-decision-letter/correction-notice`)
				.send({ correctionNotice: oneThousdandAndOneCharacterString })
				.expect(200);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Correction notice must be 1000 characters or less</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain('href="#correction-notice"');
			expect(unprettifiedElement.innerHTML).toContain(
				'Correction notice must be 1000 characters or less</p>'
			);
			expect(unprettifiedElement.innerHTML).toContain(oneThousdandAndOneCharacterString);
		});

		it(`should rredirect to CYA page if valid correction notice provided`, async () => {
			const response = await request
				.post(`${baseUrl}/1/update-decision-letter/correction-notice`)
				.send({ correctionNotice: oneThousdandCharacterString })
				.expect(302);
			expect(response.headers.location).toBe(`${baseUrl}/1/update-decision-letter/check-details`);
		});
	});

	describe('GET /decision-letter-upload', () => {
		it('should render the decision letter upload page with a file upload component', async () => {
			const response = await request.get(
				`${baseUrl}/1/update-decision-letter/upload-decision-letter`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Appeal 351062 - update decision letter</span>'
			);
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
		let issueDecisionAppealData = appealDataIssuedDecision;

		beforeEach(() => {
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
				.post(`${baseUrl}/1/update-decision-letter/upload-decision-letter`)
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
				.post(`${baseUrl}/1/update-decision-letter/upload-decision-letter`)
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

		it('should redirect to the correction notice  page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/1/update-decision-letter/upload-decision-letter`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/update-decision-letter/correction-notice'
			);
		});
	});

	describe('GET /issue-decision/check-your-decision', () => {
		let issueDecisionAppealData = appealDataIssuedDecision;

		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, issueDecisionAppealData).persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });
			nock('http://test/')
				.post(`/appeals/notify-preview/correction-notice-decision.content.md`)
				.reply(200, template);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();

			correctionNoticeResponse = await request
				.post(`${baseUrl}/1/update-decision-letter/correction-notice`)
				.send({ correctionNotice: oneThousdandCharacterString });

			uploadDecisionLetterResponse = await request
				.post(`${baseUrl}/1/update-decision-letter/upload-decision-letter`)
				.send({
					'upload-info': fileUploadInfo2
				});
		});

		afterEach(teardown);

		it('should render the check your decision page', async () => {
			expect(uploadDecisionLetterResponse.statusCode).toBe(302);
			expect(correctionNoticeResponse.statusCode).toBe(302);

			const response = await request.get(`${baseUrl}/1/update-decision-letter/check-details`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');
			expect(unprettifiedElement.innerHTML).toContain('Check details and update decision letter');
			expect(unprettifiedElement.innerHTML).toContain('Decision letter');
			expect(unprettifiedElement.innerHTML).toContain('Correction notice');
			expect(unprettifiedElement.innerHTML).toContain('Preview');
			expect(unprettifiedElement.innerHTML).toContain('Update decision letter');
		});
		it('should render the check your view-decision page after submit', async () => {
			expect(uploadDecisionLetterResponse.statusCode).toBe(302);
			expect(correctionNoticeResponse.statusCode).toBe(302);

			nock('http://test/')
				.post('/appeals/1/documents/e1e90a49-fab3-44b8-a21a-bb73af089f6b')
				.reply(200, { success: true });

			const response = await request
				.post(`${baseUrl}/1/update-decision-letter/check-details`)
				.send({});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appeal-decision'
			);
		});
	});
});
