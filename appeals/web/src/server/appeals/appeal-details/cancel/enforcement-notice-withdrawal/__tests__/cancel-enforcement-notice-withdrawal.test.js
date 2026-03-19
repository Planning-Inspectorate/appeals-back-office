import {
	appealDataEnforcementListedBuilding,
	appealDataEnforcementNotice,
	fileUploadInfo
} from '#testing/appeals/appeals.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const mockAppealId = appealDataEnforcementNotice.appealId;
const mockAppealListedBuildingId = appealDataEnforcementListedBuilding.appealId;

describe('cancel enforcement notice withdrawal', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /cancel/enforcement-notice-withdrawal', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get(
					`/appeals/${mockAppealId}/document-folders?path=cancellation/lpaEnforcementNoticeWithdrawal`
				)
				.reply(200, [
					{
						folderId: 123,
						path: 'cancellation/lpaEnforcementNoticeWithdrawal'
					}
				])
				.persist();
		});

		it('should render a document upload page', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal`
			);
			expect(response.statusCode).toBe(200);

			const pageHtml = parseHtml(response.text);
			expect(pageHtml.innerHTML).toMatchSnapshot();
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'LPA enforcement notice withdrawal'
			);
			expect(pageHtml.querySelector('h2')?.innerHTML.trim()).toBe(
				'Upload enforcement notice withdrawal'
			);
		});

		it('should have a back button that links to the cancel reasons page', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal`
			);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')?.trim()).toBe(
				`${baseUrl}/${mockAppealId}/cancel`
			);
		});

		it('should have a back button to the CYA page if editing', async () => {
			const url = `${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal`;
			const queryString = `?editEntrypoint=${encodeURIComponent(url)}`;
			const response = await request.get(`${url}${queryString}`);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')?.trim()).toBe(
				`${url}/check-details`
			);
		});
	});

	describe('POST /cancel/enforcement-notice-withdrawal', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get(
					`/appeals/${mockAppealId}/document-folders?path=cancellation/lpaEnforcementNoticeWithdrawal`
				)
				.reply(200, [
					{
						folderId: 123,
						path: 'cancellation/lpaEnforcementNoticeWithdrawal'
					}
				])
				.persist();
			nock('http://test/').get('/appeals/document-redaction-statuses').reply(200, []).persist();
		});

		it('should render a 500 error page if upload-info is not present in the request body', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal`)
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
				.post(`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal`)
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

		it('should redirect to the CYA page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${mockAppealId}/cancel/enforcement-notice-withdrawal/check-details`
			);
		});
	});

	describe('GET /cancel/enforcement-notice-withdrawal/check-details', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get(
					`/appeals/${mockAppealId}/document-folders?path=cancellation/lpaEnforcementNoticeWithdrawal`
				)
				.reply(200, [
					{
						folderId: 123,
						path: 'cancellation/lpaEnforcementNoticeWithdrawal'
					}
				])
				.persist();
			nock('http://test/').get('/appeals/document-redaction-statuses').reply(200, []).persist();
			nock('http://test/')
				.post(`/appeals/${mockAppealId}/cancel/enforcement-notice-withdrawn?dryRun=true`)
				.reply(200, {
					appellant: 'Appellant email preview',
					lpa: 'LPA email preview'
				});
		});

		it('should render the check your answers page', async () => {
			await request.post(`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal`).send({
				'upload-info': fileUploadInfo
			});
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal/check-details`
			);

			expect(response.statusCode).toBe(200);
			const pageHtml = parseHtml(response.text);
			expect(pageHtml.innerHTML).toMatchSnapshot();

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Check details and withdraw enforcement notice'
			);
			const summaryListRows = unprettifiedHtml.querySelectorAll('.govuk-summary-list__row');
			expect(summaryListRows).toHaveLength(2);
			expect(summaryListRows[0].querySelector('.govuk-summary-list__key')?.innerHTML.trim()).toBe(
				'Why are you cancelling the appeal?'
			);
			expect(summaryListRows[0].querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
				'LPA has withdrawn the enforcement notice'
			);
			expect(summaryListRows[1].querySelector('.govuk-summary-list__key')?.innerHTML.trim()).toBe(
				'LPA enforcement notice withdrawal'
			);
			expect(
				summaryListRows[1]
					.querySelector('.govuk-summary-list__value a')
					?.getAttribute('href')
					?.trim()
			).toBe('/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt');
			expect(
				summaryListRows[1].querySelector('.govuk-summary-list__value a')?.innerHTML.trim()
			).toBe('test-document.txt');
			expect(
				unprettifiedHtml
					.querySelector('[data-cy="preview-email-to-appellant"] div')
					?.innerHTML.trim()
			).toBe('Appellant email preview');
			expect(
				unprettifiedHtml.querySelector('[data-cy="preview-email-to-lpa"] div')?.innerHTML.trim()
			).toBe('LPA email preview');
			expect(
				unprettifiedHtml.querySelector('#enforcement-notice-withdrawal-hint')?.innerHTML.trim()
			).toBe('We will withdraw the enforcement notice and send an email to the relevant parties.');
			expect(unprettifiedHtml.querySelector('button')?.innerHTML.trim()).toBe(
				'Withdraw enforcement notice'
			);
		});

		it('should have a back button that links to the document upload page', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal/check-details`
			);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')?.trim()).toBe(
				`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal`
			);
		});
	});

	describe('POST /cancel/enforcement-notice-withdrawal/check-details', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get(
					`/appeals/${mockAppealId}/document-folders?path=cancellation/lpaEnforcementNoticeWithdrawal`
				)
				.reply(200, [
					{
						folderId: 123,
						path: 'cancellation/lpaEnforcementNoticeWithdrawal'
					}
				])
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, [
					{
						id: 1,
						key: 'redacted',
						name: 'Redacted'
					},
					{
						id: 2,
						key: 'unredacted',
						name: 'Unredacted'
					},
					{
						id: 3,
						key: 'no_redaction_required',
						name: 'No redaction required'
					}
				])
				.persist();
		});

		it('should save the documents and mark the appeal as invalid', async () => {
			const mockAddDocument = nock('http://test/')
				.post(`/appeals/${mockAppealId}/documents`)
				.reply(200, {
					documentId: '123'
				});
			const mockCancelEnforcementNoticeWithdrawn = nock('http://test/')
				.post(`/appeals/${mockAppealId}/cancel/enforcement-notice-withdrawn`)
				.reply(200);
			await request.post(`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal`).send({
				'upload-info': fileUploadInfo
			});
			const response = await request.post(
				`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal/check-details`
			);
			expect(response.statusCode).toBe(302);
			expect(response.header.location).toBe(`/appeals-service/appeal-details/${mockAppealId}`);
			expect(mockAddDocument.isDone()).toBe(true);
			expect(mockCancelEnforcementNoticeWithdrawn.isDone()).toBe(true);
		});

		it('should redirect to error page if the document request fails', async () => {
			nock('http://test/').post(`/appeals/${mockAppealId}/documents`).reply(500);
			await request.post(`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal`).send({
				'upload-info': fileUploadInfo
			});
			const response = await request.post(
				`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal/check-details`
			);
			expect(response.statusCode).toBe(302);
			expect(response.header.location).toContain('/appeals-service/error');
		});

		it('should render 500 if the cancel/enforcement-notice-withdrawn request fails', async () => {
			nock('http://test/')
				.post(`/appeals/${mockAppealId}/documents`)
				.reply(200, { documentId: '123' });
			nock('http://test/')
				.post(`/appeals/${mockAppealId}/cancel/enforcement-notice-withdrawn`)
				.reply(500);
			await request.post(`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal`).send({
				'upload-info': fileUploadInfo
			});
			const response = await request.post(
				`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal/check-details`
			);
			expect(response.statusCode).toBe(500);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});
	});
});

describe('cancel enforcement notice withdrawal (Enforcement listed building)', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /cancel/enforcement-notice-withdrawal', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealListedBuildingId}?include=all`)
				.reply(200, appealDataEnforcementListedBuilding)
				.persist();
			nock('http://test/')
				.get(
					`/appeals/${mockAppealListedBuildingId}/document-folders?path=cancellation/lpaEnforcementNoticeWithdrawal`
				)
				.reply(200, [
					{
						folderId: 123,
						path: 'cancellation/lpaEnforcementNoticeWithdrawal'
					}
				])
				.persist();
		});

		it('should render a document upload page', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal`
			);
			expect(response.statusCode).toBe(200);

			const pageHtml = parseHtml(response.text);
			expect(pageHtml.innerHTML).toMatchSnapshot();
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'LPA enforcement notice withdrawal'
			);
			expect(pageHtml.querySelector('h2')?.innerHTML.trim()).toBe(
				'Upload enforcement notice withdrawal'
			);
		});

		it('should have a back button that links to the cancel reasons page', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal`
			);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')?.trim()).toBe(
				`${baseUrl}/${mockAppealListedBuildingId}/cancel`
			);
		});

		it('should have a back button to the CYA page if editing', async () => {
			const url = `${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal`;
			const queryString = `?editEntrypoint=${encodeURIComponent(url)}`;
			const response = await request.get(`${url}${queryString}`);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')?.trim()).toBe(
				`${url}/check-details`
			);
		});
	});

	describe('POST /cancel/enforcement-notice-withdrawal', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealListedBuildingId}?include=all`)
				.reply(200, appealDataEnforcementListedBuilding)
				.persist();
			nock('http://test/')
				.get(
					`/appeals/${mockAppealListedBuildingId}/document-folders?path=cancellation/lpaEnforcementNoticeWithdrawal`
				)
				.reply(200, [
					{
						folderId: 123,
						path: 'cancellation/lpaEnforcementNoticeWithdrawal'
					}
				])
				.persist();
			nock('http://test/').get('/appeals/document-redaction-statuses').reply(200, []).persist();
		});

		it('should render a 500 error page if upload-info is not present in the request body', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal`)
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
				.post(`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal`)
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

		it('should redirect to the CYA page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal/check-details`
			);
		});
	});

	describe('GET /cancel/enforcement-notice-withdrawal/check-details', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealListedBuildingId}?include=all`)
				.reply(200, appealDataEnforcementListedBuilding)
				.persist();
			nock('http://test/')
				.get(
					`/appeals/${mockAppealListedBuildingId}/document-folders?path=cancellation/lpaEnforcementNoticeWithdrawal`
				)
				.reply(200, [
					{
						folderId: 123,
						path: 'cancellation/lpaEnforcementNoticeWithdrawal'
					}
				])
				.persist();
			nock('http://test/').get('/appeals/document-redaction-statuses').reply(200, []).persist();
		});

		it('should render the check your answers page', async () => {
			await request
				.post(`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal`)
				.send({
					'upload-info': fileUploadInfo
				});
			const response = await request.get(
				`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal/check-details`
			);

			expect(response.statusCode).toBe(200);
			const pageHtml = parseHtml(response.text);
			expect(pageHtml.innerHTML).toMatchSnapshot();

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Check details and withdraw enforcement notice'
			);
			const summaryListRows = unprettifiedHtml.querySelectorAll('.govuk-summary-list__row');
			expect(summaryListRows).toHaveLength(2);
			expect(summaryListRows[0].querySelector('.govuk-summary-list__key')?.innerHTML.trim()).toBe(
				'Why are you cancelling the appeal?'
			);
			expect(summaryListRows[0].querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
				'LPA has withdrawn the enforcement notice'
			);
			expect(summaryListRows[1].querySelector('.govuk-summary-list__key')?.innerHTML.trim()).toBe(
				'LPA enforcement notice withdrawal'
			);
			expect(
				summaryListRows[1]
					.querySelector('.govuk-summary-list__value a')
					?.getAttribute('href')
					?.trim()
			).toBe('/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt');
			expect(
				summaryListRows[1].querySelector('.govuk-summary-list__value a')?.innerHTML.trim()
			).toBe('test-document.txt');
			expect(
				unprettifiedHtml.querySelector('#enforcement-notice-withdrawal-hint')?.innerHTML.trim()
			).toBe('We will withdraw the enforcement notice and send an email to the relevant parties.');
			expect(unprettifiedHtml.querySelector('button')?.innerHTML.trim()).toBe(
				'Withdraw enforcement notice'
			);
		});

		it('should have a back button that links to the document upload page', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal/check-details`
			);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')?.trim()).toBe(
				`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal`
			);
		});
	});

	describe('POST /cancel/enforcement-notice-withdrawal/check-details', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealListedBuildingId}?include=all`)
				.reply(200, appealDataEnforcementListedBuilding)
				.persist();
			nock('http://test/')
				.get(
					`/appeals/${mockAppealListedBuildingId}/document-folders?path=cancellation/lpaEnforcementNoticeWithdrawal`
				)
				.reply(200, [
					{
						folderId: 123,
						path: 'cancellation/lpaEnforcementNoticeWithdrawal'
					}
				])
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, [
					{
						id: 1,
						key: 'redacted',
						name: 'Redacted'
					},
					{
						id: 2,
						key: 'unredacted',
						name: 'Unredacted'
					},
					{
						id: 3,
						key: 'no_redaction_required',
						name: 'No redaction required'
					}
				])
				.persist();
		});

		it('should save the documents and mark the appeal as invalid', async () => {
			const mockAddDocument = nock('http://test/')
				.post(`/appeals/${mockAppealListedBuildingId}/documents`)
				.reply(200, {
					documentId: '123'
				});
			const mockSetReviewOutcome = nock('http://test/')
				.patch(
					`/appeals/${mockAppealListedBuildingId}/appellant-cases/${appealDataEnforcementNotice.appellantCaseId}`,
					{
						validationOutcome: 'invalid',
						invalidReasons: [{ id: 8 }],
						enforcementNoticeInvalid: 'no'
					}
				)
				.reply(200);
			await request
				.post(`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal`)
				.send({
					'upload-info': fileUploadInfo
				});
			const response = await request.post(
				`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal/check-details`
			);
			expect(response.statusCode).toBe(302);
			expect(response.header.location).toBe(
				`/appeals-service/appeal-details/${mockAppealListedBuildingId}`
			);
			expect(mockAddDocument.isDone()).toBe(true);
			expect(mockSetReviewOutcome.isDone()).toBe(true);
		});

		it('should redirect to error page if the document request fails', async () => {
			nock('http://test/').post(`/appeals/${mockAppealListedBuildingId}/documents`).reply(500);
			await request
				.post(`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal`)
				.send({
					'upload-info': fileUploadInfo
				});
			const response = await request.post(
				`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal/check-details`
			);
			expect(response.statusCode).toBe(302);
			expect(response.header.location).toContain('/appeals-service/error');
		});

		it('should render 500 if the review outcome request fails', async () => {
			nock('http://test/')
				.post(`/appeals/${mockAppealListedBuildingId}/documents`)
				.reply(200, { documentId: '123' });
			nock('http://test/')
				.patch(
					`/appeals/${mockAppealListedBuildingId}/appellant-cases/${appealDataEnforcementNotice.appellantCaseId}`
				)
				.reply(500);
			await request
				.post(`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal`)
				.send({
					'upload-info': fileUploadInfo
				});
			const response = await request.post(
				`${baseUrl}/${mockAppealListedBuildingId}/cancel/enforcement-notice-withdrawal/check-details`
			);
			expect(response.statusCode).toBe(500);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});
	});
});
