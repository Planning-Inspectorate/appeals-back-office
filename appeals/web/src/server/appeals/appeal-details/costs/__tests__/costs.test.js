import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { jest } from '@jest/globals';
import { createTestEnvironment } from '#testing/index.js';
import {
	appealData,
	costsFolderInfoAppellant,
	costsFolderInfoLpa,
	costsFolderInfoDecision,
	documentFileInfo,
	documentRedactionStatuses,
	activeDirectoryUsersData,
	documentFileVersionsInfo,
	documentFileVersionsInfoNotChecked,
	documentFileVersionsInfoVirusFound,
	documentFileVersionsInfoChecked
} from '#testing/app/fixtures/referencedata.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { cloneDeep } from 'lodash-es';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('costs', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /costs/:costsCategory/select-document-type/:folderId', () => {
		const costsCategories = ['appellant', 'lpa'];

		for (const costsCategory of costsCategories) {
			it(`should render the select document type page (${costsCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/costs/appellant/select-document-type/${appealData.costs.appellantFolder.id}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('What is the document type?</h1>');
			});
		}
	});

	describe('POST /costs/:costsCategory/select-document-type/:folderId', () => {
		const costsCategories = ['appellant', 'lpa'];

		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, costsFolderInfoAppellant);
			nock('http://test/').get('/appeals/1/document-folders/2').reply(200, costsFolderInfoLpa);
		});

		for (const costsCategory of costsCategories) {
			// @ts-ignore
			const costsFolder = appealData.costs[`${costsCategory}Folder`];

			it(`should re-render the select document type page with the expected error message when no document type was selected (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/select-document-type/${costsFolder.id}`)
					.send({});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				expect(element.innerHTML).toContain('What is the document type?</h1>');
				expect(element.innerHTML).toContain('govuk-error-summary');

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem');
				expect(errorSummaryElement.innerHTML).toContain('Select a document type');
			});

			it(`should redirect to the upload documents page when a document type was selected (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/select-document-type/${costsFolder.id}`)
					.send({
						'costs-document-type': '1'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(
					`Found. Redirecting to /appeals-service/appeal-details/1/costs/${costsCategory}/upload-documents/${costsFolder.id}`
				);
			});
		}
	});

	describe('GET /costs/:costsCategory/upload-documents/:folderId', () => {
		const costsCategoriesRequiringSession = ['appellant', 'lpa'];

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, costsFolderInfoAppellant)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, costsFolderInfoLpa)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/3')
				.reply(200, costsFolderInfoDecision)
				.persist();
		});

		for (const costsCategory of costsCategoriesRequiringSession) {
			// @ts-ignore
			const costsFolder = appealData.costs[`${costsCategory}Folder`];

			it(`should render a 500 error page if required data is not present in the session (${costsCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/costs/appellant/upload-documents/${costsFolder.id}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Sorry, there is a problem with the service</h1>'
				);
			});

			it(`should render the upload documents page (${costsCategory})`, async () => {
				const selectDocumentTypeResponse = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/select-document-type/${costsFolder.id}`)
					.send({
						'costs-document-type': '1'
					});

				expect(selectDocumentTypeResponse.statusCode).toBe(302);
				expect(selectDocumentTypeResponse.text).toContain(
					`Found. Redirecting to /appeals-service/appeal-details/1/costs/${costsCategory}/upload-documents/${costsFolder.id}`
				);

				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/upload-documents/${costsFolder.id}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					`Upload ${costsCategory === 'appellant' ? costsCategory : 'LPA'} costs document</h1>`
				);
			});
		}

		it('should render the upload documents page (decision)', async () => {
			const response = await request.get(
				`${baseUrl}/1/costs/decision/upload-documents/${appealData.costs.decisionFolder.id}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload costs decision</h1>');
		});
	});

	describe('GET /costs/:costsCategory/upload-documents/:folderId/:documentId', () => {
		const costsCategories = ['appellant', 'lpa', 'decision'];

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, costsFolderInfoAppellant)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, costsFolderInfoLpa)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/3')
				.reply(200, costsFolderInfoDecision)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});

		for (const costsCategory of costsCategories) {
			// @ts-ignore
			const costsFolder = appealData.costs[`${costsCategory}Folder`];

			it(`should render the upload document version page (${costsCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/upload-documents/${costsFolder.id}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Upload an updated document</h1>');
			});
		}
	});

	describe('GET /costs/:costsCategory/add-document-details/:folderId', () => {
		const costsCategories = ['appellant', 'lpa', 'decision'];

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, costsFolderInfoAppellant)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, costsFolderInfoLpa)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/3')
				.reply(200, costsFolderInfoDecision)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
		});

		for (const costsCategory of costsCategories) {
			// @ts-ignore
			const costsFolder = appealData.costs[`${costsCategory}Folder`];

			it(`should render the document details page with one item per unpublished document (${costsCategory})`, async () => {
				let expectedH1Text = '';

				switch (costsCategory) {
					case 'appellant':
						expectedH1Text = 'Appellant costs document';
						break;
					case 'lpa':
						expectedH1Text = 'LPA costs document';
						break;
					case 'decision':
						expectedH1Text = 'Costs decision document';
						break;
				}

				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/add-document-details/${costsFolder.id}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('test-pdf-documentFolderInfo.pdf');
				expect(element.innerHTML).not.toContain('sample-20s-documentFolderInfo.mp4');

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);
			});

			it(`should render a back link to the upload document page (${costsCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/add-document-details/${costsFolder.id}`
				);
				const element = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(element.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/costs/${costsCategory}/upload-documents/${costsFolder.id}"`
				);
			});
		}
	});

	describe('GET /costs/:costsCategory/add-document-details/:folderId/:documentId', () => {
		const costsCategories = ['appellant', 'lpa', 'decision'];

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, costsFolderInfoAppellant)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, costsFolderInfoLpa)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/3')
				.reply(200, costsFolderInfoDecision)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
		});

		for (const costsCategory of costsCategories) {
			// @ts-ignore
			const costsFolder = appealData.costs[`${costsCategory}Folder`];

			it(`should render the document details page with one item per unpublished document (${costsCategory})`, async () => {
				let expectedH1Text = '';

				switch (costsCategory) {
					case 'appellant':
						expectedH1Text = 'Appellant costs document';
						break;
					case 'lpa':
						expectedH1Text = 'LPA costs document';
						break;
					case 'decision':
						expectedH1Text = 'Costs decision document';
						break;
				}

				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/add-document-details/${costsFolder.id}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('test-pdf-documentFolderInfo.pdf');
				expect(element.innerHTML).not.toContain('sample-20s-documentFolderInfo.mp4');

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);
			});

			it(`should render a back link to the upload document version page (${costsCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/add-document-details/${costsFolder.id}/1`
				);
				const element = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(element.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/costs/${costsCategory}/upload-documents/${costsFolder.id}/1"`
				);
			});
		}
	});

	describe('POST /costs/:costsCategory/add-document-details/:folderId', () => {
		const costsCategories = ['appellant', 'lpa', 'decision'];

		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, costsFolderInfoAppellant);
			nock('http://test/').get('/appeals/1/document-folders/2').reply(200, costsFolderInfoLpa);
			nock('http://test/').get('/appeals/1/document-folders/3').reply(200, costsFolderInfoDecision);
			nock('http://test/')
				.patch('/appeals/1/documents')
				.reply(200, {
					documents: [
						{
							id: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: '2023-02-01',
							redactionStatus: 2
						}
					]
				});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		for (const costsCategory of costsCategories) {
			// @ts-ignore
			const costsFolder = appealData.costs[`${costsCategory}Folder`];
			let expectedH1Text = '';

			switch (costsCategory) {
				case 'appellant':
					expectedH1Text = 'Appellant costs document';
					break;
				case 'lpa':
					expectedH1Text = 'LPA costs document';
					break;
				case 'decision':
					expectedH1Text = 'Costs decision document';
					break;
			}

			it(`should re-render the document details page with the expected error message if the request body is in an incorrect format (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/1`)
					.send({});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is empty (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/1`)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: '',
									month: '2',
									year: '2030'
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('Received date day cannot be empty');
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is non-numeric (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/1`)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: 'a',
									month: '2',
									year: '2030'
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('Received date day must be a number');
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is less than 1 (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/1`)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: '0',
									month: '2',
									year: '2030'
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(
					'Received date day must be between 1 and 31'
				);
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is greater than 31 (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/1`)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: '32',
									month: '2',
									year: '2030'
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(
					'Received date day must be between 1 and 31'
				);
			});

			it(`should re-render the document details page with the expected error message if receivedDate month is empty (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/1`)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: '1',
									month: '',
									year: '2030'
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('Received date month cannot be empty');
			});

			it(`should re-render the document details page with the expected error message if receivedDate month is non-numeric (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/1`)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: '1',
									month: 'a',
									year: '2030'
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('Received date month must be a number');
			});

			it(`should re-render the document details page with the expected error message if receivedDate month is less than 1 (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/1`)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: '1',
									month: '0',
									year: '2030'
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(
					'Received date month must be between 1 and 12'
				);
			});

			it(`should re-render the document details page with the expected error message if receivedDate month is greater than 12 (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/1`)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: '1',
									month: '13',
									year: '2030'
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(
					'Received date month must be between 1 and 12'
				);
			});

			it(`should re-render the document details page with the expected error message if receivedDate year is empty (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/1`)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: '1',
									month: '2',
									year: ''
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('Received date year cannot be empty');
			});

			it(`should re-render the document details page with the expected error message if receivedDate year is non-numeric (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/1`)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: '1',
									month: '2',
									year: 'a'
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('Received date year must be a number');
			});

			it(`should re-render the document details page with the expected error message if receivedDate is not a valid date (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/1`)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: '29',
									month: '2',
									year: '2023'
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('Received date must be a valid date');
			});

			it(`should send a patch request to the appeal documents endpoint and redirect to the appeal details page, if complete and valid document details were provided (${costsCategory})`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/add-document-details/${costsFolder.id}`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: '1',
									month: '2',
									year: '2023'
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(
					costsCategory === 'decision'
						? `Found. Redirecting to /appeals-service/appeal-details/1/costs/decision/check-and-confirm/${costsFolder.id}`
						: 'Found. Redirecting to /appeals-service/appeal-details/1'
				);
			});
		}
	});

	describe('GET /costs/:costsCategory/manage-documents/:folderId', () => {
		const costsCategories = ['appellant', 'lpa', 'decision'];

		beforeEach(() => {
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, costsFolderInfoAppellant);
			nock('http://test/').get('/appeals/1/document-folders/2').reply(200, costsFolderInfoLpa);
			nock('http://test/').get('/appeals/1/document-folders/3').reply(200, costsFolderInfoDecision);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const costsCategory of costsCategories) {
			let expectedH1Text = '';

			switch (costsCategory) {
				case 'appellant':
					expectedH1Text = 'Appellant costs documents';
					break;
				case 'lpa':
					expectedH1Text = 'LPA costs documents';
					break;
				case 'decision':
					expectedH1Text = 'Costs decision documents';
					break;
			}

			it(`should render a 404 error page if the folderId is not valid (${costsCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/manage-documents/99`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Page not found</h1>');
			});

			it(`should render the manage folder page with one document item for each document present in the folder if the folderId is valid (${costsCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/manage-documents/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);
			});
		}
	});

	describe('GET /costs/:costsCategory/manage-documents/:folderId/:documentId', () => {
		const costsCategories = ['appellant', 'lpa', 'decision'];

		beforeEach(() => {
			// @ts-ignore
			usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			// @ts-ignore
			usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, costsFolderInfoAppellant);
			nock('http://test/').get('/appeals/1/document-folders/2').reply(200, costsFolderInfoLpa);
			nock('http://test/').get('/appeals/1/document-folders/3').reply(200, costsFolderInfoDecision);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});

		for (const costsCategory of costsCategories) {
			it(`should render a 404 error page if the folderId is not valid (${costsCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/manage-documents/99/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const h1Element = parseHtml(response.text, { rootElement: 'h1' });

				expect(h1Element.innerHTML).toContain('Page not found');
			});

			it(`should render a 404 error page if the documentId is not valid (${costsCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/manage-documents/1/99`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const h1Element = parseHtml(response.text, { rootElement: 'h1' });

				expect(h1Element.innerHTML).toContain('Page not found');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is null (${costsCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/manage-documents/1/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'test-pdf-documentFileVersionsInfo.pdf</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--yellow single-line">Virus scanning</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).not.toContain('Remove current version');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "not_checked" (${costsCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoNotChecked);

				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/manage-documents/1/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'test-pdf-documentFileVersionsInfo.pdf</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--yellow single-line">Virus scanning</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).not.toContain('Remove current version');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "failed_virus_check" (${costsCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoVirusFound);

				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/manage-documents/1/1`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'test-pdf-documentFileVersionsInfo.pdf</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--red single-line">Virus detected</strong>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).toContain('Remove current version');

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(
					'The selected file contains a virus. Upload a different version.'
				);
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "checked" (${costsCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);

				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/manage-documents/1/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'test-pdf-documentFileVersionsInfo.pdf</h1>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--yellow single-line">Virus scanning</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--red single-line">Virus detected</strong>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).toContain('Remove current version');
			});
		}
	});

	describe('GET /costs/:costsCategory/manage-documents/:folderId/:documentId/:versionId/delete', () => {
		const costsCategories = ['appellant', 'lpa', 'decision'];

		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, costsFolderInfoAppellant);
			nock('http://test/').get('/appeals/1/document-folders/2').reply(200, costsFolderInfoLpa);
			nock('http://test/').get('/appeals/1/document-folders/3').reply(200, costsFolderInfoDecision);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});

		for (const costsCategory of costsCategories) {
			it(`should render the delete document page with the expected content when there is a single document version (${costsCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);

				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/manage-documents/1/1/1/delete`
				);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Are you sure you want to remove this version?</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain('class="govuk-warning-text"');

				const warningTextElement = parseHtml(response.text, {
					rootElement: '.govuk-warning-text',
					skipPrettyPrint: true
				});

				expect(warningTextElement.innerHTML).toContain(
					'Removing the only version of a document will delete the document from the case'
				);

				const radiosElement = parseHtml(response.text, {
					rootElement: '.govuk-radios',
					skipPrettyPrint: true
				});

				expect(radiosElement.innerHTML).toContain(
					'name="delete-file-answer" type="radio" value="yes"'
				);
				expect(radiosElement.innerHTML).toContain(
					'name="delete-file-answer" type="radio" value="yes-and-upload-another-document"'
				);
				expect(radiosElement.innerHTML).toContain(
					'name="delete-file-answer" type="radio" value="no"'
				);
			});

			it(`should render the delete document page with the expected content when there are multiple document versions (${costsCategory})`, async () => {
				const multipleVersionsDocument = cloneDeep(documentFileVersionsInfoChecked);
				multipleVersionsDocument.documentVersion.push(multipleVersionsDocument.documentVersion[0]);

				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, multipleVersionsDocument);

				const response = await request.get(
					`${baseUrl}/1/costs/${costsCategory}/manage-documents/1/1/1/delete`
				);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Are you sure you want to remove this version?</h1>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('class="govuk-warning-text"');

				const radiosElement = parseHtml(response.text, {
					rootElement: '.govuk-radios',
					skipPrettyPrint: true
				});

				expect(radiosElement.innerHTML).toContain(
					'name="delete-file-answer" type="radio" value="yes"'
				);
				expect(radiosElement.innerHTML).toContain(
					'name="delete-file-answer" type="radio" value="no"'
				);
				expect(radiosElement.innerHTML).not.toContain(
					'name="delete-file-answer" type="radio" value="yes-and-upload-another-document"'
				);
			});
		}
	});

	describe('POST /costs/:costsCategory/manage-documents/:folderId/:documentId/:versionId/delete', () => {
		const costsCategories = ['appellant', 'lpa', 'decision'];

		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, costsFolderInfoAppellant);
			nock('http://test/').get('/appeals/1/document-folders/2').reply(200, costsFolderInfoLpa);
			nock('http://test/').get('/appeals/1/document-folders/3').reply(200, costsFolderInfoDecision);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/').delete('/appeals/1/documents/1/1').reply(200, {
				guid: '15d19184-155b-4b6c-bba6-2bd2a61ca9a3',
				name: 'test-pdf-documentFileVersionsInfo.pdf',
				folderId: 1,
				createdAt: '2024-04-09T13:10:07.517Z',
				isDeleted: true,
				latestVersionId: null,
				caseId: 1,
				documentVersion: [],
				latestDocumentVersion: null
			});
		});

		for (const costsCategory of costsCategories) {
			// @ts-ignore
			const costsFolder = appealData.costs[`${costsCategory}Folder`];

			it(`should re-render the delete document page with the expected error message if answer was not provided (${costsCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/manage-documents/1/1/1/delete`)
					.send({});
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Are you sure you want to remove this version?</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain('class="govuk-error-summary"');

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('Answer must be provided');
			});

			it(`should not send an API request to delete the document, and should redirect to the case details page, if answer "no" was provided`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/manage-documents/1/1/1/delete`)
					.send({
						'delete-file-answer': 'no'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
			});

			it(`should send an API request to delete the document, and redirect to the case details page, if answer "yes" was provided`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/manage-documents/1/1/1/delete`)
					.send({
						'delete-file-answer': 'yes'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
			});

			it(`should send an API request to delete the document, and redirect to the upload new document page, if answer "yes, and upload another document" was provided, and there is more than one version of the document`, async () => {
				const multipleVersionsDocument = cloneDeep(documentFileVersionsInfo);
				multipleVersionsDocument.documentVersion.push(multipleVersionsDocument.documentVersion[0]);

				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, multipleVersionsDocument);

				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/manage-documents/${costsFolder.id}/1/1/delete`)
					.send({
						'delete-file-answer': 'yes-and-upload-another-document'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(
					`Found. Redirecting to /appeals-service/appeal-details/1/costs/${costsCategory}/upload-documents/${costsFolder.id}/1`
				);
			});

			it(`should send an API request to delete the document, and redirect to the case details page, if answer "yes, and upload another document" was provided, and there is only one version of the document`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(`${baseUrl}/1/costs/${costsCategory}/manage-documents/${costsFolder.id}/1/1/delete`)
					.send({
						'delete-file-answer': 'yes-and-upload-another-document'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
			});
		}
	});

	describe('GET /costs/decision/check-and-confirm/:folderId', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/3')
				.reply(200, costsFolderInfoDecision)
				.persist();
		});

		it('should render a 404 error page if the folderId is not valid', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(`${baseUrl}/1/costs/decision/check-and-confirm/99`);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render the check and confirm costs decision page if the folderId is valid', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(`${baseUrl}/1/costs/decision/check-and-confirm/3`);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Warning</span> You must email the relevant parties to inform them of the decision.'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="confirm" type="checkbox" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'for="confirm"> I will email the relevant parties'
			);
		});
	});

	describe('POST /costs/decision/check-and-confirm/:folderId', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/3')
				.reply(200, costsFolderInfoDecision)
				.persist();
		});

		it('should render a 404 error page if the folderId is not valid', async () => {
			const response = await request.post(`${baseUrl}/1/costs/decision/check-and-confirm/99`).send({
				confirm: 'yes'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should re-render the check and confirm costs decision page with the expected error message if confirmation was not provided', async () => {
			const response = await request
				.post(`${baseUrl}/1/costs/decision/check-and-confirm/3`)
				.send({});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Select that you will email the relevant parties</a></li>'
			);
		});

		it('should redirect to the case details page if confirmation was provided', async () => {
			const response = await request.post(`${baseUrl}/1/costs/decision/check-and-confirm/3`).send({
				confirm: 'yes'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(`Found. Redirecting to /appeals-service/appeal-details/1`);
		});
	});
});
