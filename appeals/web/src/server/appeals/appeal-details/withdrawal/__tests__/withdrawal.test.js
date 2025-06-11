import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import {
	appealData,
	documentFileInfo,
	withdrawalRequestData,
	documentRedactionStatuses,
	fileUploadInfo
} from '#testing/appeals/appeals.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const withdrawalPath = '/withdrawal';
const withdrawalRequestStartPath = '/start';
const withdrawalRequestDatePath = '/withdrawal-request-date';
const withdrawalRequestRedactionStatus = '/redaction-status';
const checkYourAnswersPath = '/check-your-answers';
const withdrawalRequestViewPath = '/view';
const mockRequestWithdrawalDate = {
	'withdrawal-request-date-day': '1',
	'withdrawal-request-date-month': '1',
	'withdrawal-request-date-year': '2024'
};
const mockAppealId = '1';

describe('withdrawal', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /start', () => {
		it('should render the withdrawal request upload page with a file upload component', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestStartPath}`
			);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(
				`Upload appellant&#39;s withdrawal request</h1>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');
		});
	});

	describe('POST /start', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if request body upload-info is in an incorrect format', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestStartPath}`)
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

		it('should redirect to the withdrawal request date page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestStartPath}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/withdrawal/withdrawal-request-date'
			);
		});
	});

	describe('GET /withdrawal-request-date', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the withdrawal request date page with the expected content if fileUploadInfo is present in the session', async () => {
			await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestStartPath}`)
				.send({
					'upload-info': fileUploadInfo
				});

			const response = await request.get(
				`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestDatePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Date of withdrawal request</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="withdrawal-request-date-day" type="text" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="withdrawal-request-date-month" type="text" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="withdrawal-request-date-year" type="text" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /withdrawal-request-date', () => {
		/**
		 * @type {import("superagent").Response}
		 */
		let withdrawalRequestDateResponse;

		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();

			withdrawalRequestDateResponse = await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestStartPath}`)
				.send({
					'upload-info': fileUploadInfo
				});
		});
		afterEach(teardown);

		it('should re-render the withdrawal request date page with an error message if the provided date day is invalid', async () => {
			expect(withdrawalRequestDateResponse.statusCode).toBe(302);

			const testCases = [
				{ value: '', expectedError: 'Withdrawal request date must include a day' },
				{ value: 'a', expectedError: 'Withdrawal request date day must be a number' },
				{ value: '0', expectedError: 'Withdrawal request date day must be between 1 and 31' },
				{ value: '32', expectedError: 'Withdrawal request date day must be between 1 and 31' }
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestDatePath}`)
					.send({
						'withdrawal-request-date-day': testCase.value,
						'withdrawal-request-date-month': 11,
						'withdrawal-request-date-year': 2024
					});

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toContain('Date of withdrawal request</h1>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(`${testCase.expectedError}</a>`);
			}
		});

		it('should re-render the withdrawal request date page with an error message if the provided date month is invalid', async () => {
			expect(withdrawalRequestDateResponse.statusCode).toBe(302);

			const testCases = [
				{ value: '', expectedError: 'Withdrawal request date must include a month' },
				{ value: 'a', expectedError: 'Withdrawal request date month must be a number' },
				{ value: '0', expectedError: 'Withdrawal request date month must be between 1 and 12' },
				{ value: '13', expectedError: 'Withdrawal request date month must be between 1 and 12' }
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestDatePath}`)
					.send({
						'withdrawal-request-date-day': 1,
						'withdrawal-request-date-month': testCase.value,
						'withdrawal-request-date-year': 2024
					});

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toContain('Date of withdrawal request</h1>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(`${testCase.expectedError}</a>`);
			}
		});

		it('should re-render the withdrawal request date page with an error message if the provided date year is invalid', async () => {
			expect(withdrawalRequestDateResponse.statusCode).toBe(302);

			const testCases = [
				{ value: '', expectedError: 'Withdrawal request date must include a year' },
				{ value: 'a', expectedError: 'Withdrawal request date year must be a number' },
				{ value: '202', expectedError: 'Withdrawal request date year must be 4 digits' },
				{ value: 3000, expectedError: 'Date must be today or in the past' }
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestDatePath}`)
					.send({
						'withdrawal-request-date-day': 1,
						'withdrawal-request-date-month': 11,
						'withdrawal-request-date-year': testCase.value
					});

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toContain('Date of withdrawal request</h1>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(`${testCase.expectedError}</a>`);
			}
		});

		it('should redirect to the redaction status page if the provided date is fully populated and valid', async () => {
			expect(withdrawalRequestDateResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestDatePath}`)
				.send(mockRequestWithdrawalDate)
				.expect(302);

			expect(response.headers.location).toBe(
				`/appeals-service/appeal-details/1/withdrawal/redaction-status`
			);
		});
	});

	describe('GET /redaction-status', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();

			await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestStartPath}`)
				.send({ 'upload-info': fileUploadInfo });
			await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestDatePath}`)
				.send(mockRequestWithdrawalDate);
		});

		afterEach(teardown);
		it('should render the redaction status page', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestRedactionStatus}`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('What is the redaction status of this document?</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /redaction-status', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();

			await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestStartPath}`)
				.send({ 'upload-info': fileUploadInfo });
			await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestDatePath}`)
				.send(mockRequestWithdrawalDate);
		});

		afterEach(teardown);
		it('should re-render the redaction status page with the expected error message if no redaction status is provided', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestRedactionStatus}`)
				.send({ 'withdrawal-redaction-status': '' })
				.expect(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('What is the redaction status of this document?</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Please select the redaction status</a>');
		});

		it('should process the redaction status page and redirect', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestRedactionStatus}`)
				.send({ 'withdrawal-redaction-status': 'Unredacted' })
				.expect(302);

			expect(response.headers.location).toBe(
				`/appeals-service/appeal-details/1/withdrawal/check-your-answers`
			);
		});
	});

	describe('GET /withdrawal/check-your-answers', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();

			await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestStartPath}`)
				.send({ 'upload-info': fileUploadInfo });
			await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestDatePath}`)
				.send(mockRequestWithdrawalDate);
			await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestRedactionStatus}`)
				.send({ 'withdrawal-redaction-status': 'Unredacted' });
		});

		afterEach(teardown);

		it('should render the check your asnwers page', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealId}${withdrawalPath}${checkYourAnswersPath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check your answers</h1>');
			expect(element.innerHTML).toContain('Withdrawal request</dt>');
			expect(element.innerHTML).toContain('Request date</dt>');
			expect(element.innerHTML).toContain('Redaction status</dt>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Warning</span> You are about to tell the relevant parties the appeal has been withdrawn and it is being closed. Any appointments for this case should be cancelled. Only limited changes can be made to the case once it is closed.</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="confirm-withdrawal" type="checkbox" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /withdrawal/check-your-answers', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/').post('/appeals/1/documents/1').reply(200);

			await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestStartPath}`)
				.send({ 'upload-info': fileUploadInfo });
			await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestDatePath}`)
				.send(mockRequestWithdrawalDate);
			await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestRedactionStatus}`)
				.send({ 'withdrawal-redaction-status': 'Unredacted' });
		});

		afterEach(teardown);

		it('should render the check your asnwers page with the expected error message if confirm checkbox is not checked', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${checkYourAnswersPath}`)
				.send({ 'confirm-withdrawal': '' });
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check your answers</h1>');
			expect(element.innerHTML).toContain('Withdrawal request</dt>');
			expect(element.innerHTML).toContain('Request date</dt>');
			expect(element.innerHTML).toContain('Redaction status</dt>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Warning</span> You are about to tell the relevant parties the appeal has been withdrawn and it is being closed. Any appointments for this case should be cancelled. Only limited changes can be made to the case once it is closed.</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="confirm-withdrawal" type="checkbox" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Please confirm that the relevant parties can be informed of the appeal withdrawal</a>'
			);
		});
	});
	describe('GET /view', () => {
		afterEach(teardown);

		it('should render a 404 error page for the view withdrawal request document folder page of the appeal that is not withdrawn', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);

			const response = await request.get(
				`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestViewPath}`
			);
			expect(response.statusCode).toBe(404);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render the view withdrawal request document folder', async () => {
			const appealDataWithWithdrawalData = {
				...appealData,
				...withdrawalRequestData,
				appealStatus: 'withdrawn'
			};
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealDataWithWithdrawalData);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);

			const response = await request.get(
				`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestViewPath}`
			);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(`Appeal withdrawal request</h1>`);
			expect(unprettifiedElement.innerHTML).toContain('Request date');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status');
		});
	});
});
