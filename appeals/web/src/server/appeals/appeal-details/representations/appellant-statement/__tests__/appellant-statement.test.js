import usersService from '#appeals/appeal-users/users-service.js';
import {
	activeDirectoryUsersData,
	allocationDetailsData,
	appealDataEnforcementNotice,
	appellantStatementAwaitingReview,
	costsFolderInfoAppellantApplication,
	documentFileInfo,
	documentFileVersionsInfo,
	documentFolderInfo,
	documentRedactionStatuses,
	finalCommentsForReview,
	getAppealRepsResponse,
	interestedPartyCommentForReview
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('appellant-statements', () => {
	beforeEach(() => {
		installMockApi();
		// Common nock setup
		nock('http://test/')
			.get('/appeals/2?include=all')
			.reply(200, {
				...appealDataEnforcementNotice,
				appealId: 2,
				appealStatus: 'statements'
			});

		nock('http://test/')
			.get('/appeals/2/document-folders')
			.query({ path: 'representation/representationAttachments' })
			.reply(200, [{ folderId: 1234, path: 'representation/attachments' }]);

		nock('http://test/')
			.get('/appeals/2/reps?type=appellant_statement')
			.reply(200, finalCommentsForReview) // TODO: this should be Appellant statement data, not final comment data
			.persist();

		nock('http://test/')
			.get('/appeals/2/document-folders?path=representation/representationAttachments')
			.reply(200, [{ folderId: 1234, path: 'representation/attachments' }]);
	});

	afterEach(teardown);

	describe('GET /', () => {
		const appealId = 3;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, {
					...appealDataEnforcementNotice,
					appealId,
					appealStatus: 'statements'
				});
		});

		it('should render 404 for unsupported appeal types', async () => {
			nock.cleanAll();

			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, {
					...appealDataEnforcementNotice,
					appealId,
					appealType: 'Planning appeal',
					appealStatus: 'statements'
				});

			const response = await request.get(`${baseUrl}/${appealId}/appellant-statement`);

			expect(response.statusCode).toBe(404);
		});

		it('should render the review Appellant statement page with the expected content if the statement is awaiting review', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/reps?type=appellant_statement`)
				.reply(200, {
					...getAppealRepsResponse,
					itemCount: 1,
					items: [appellantStatementAwaitingReview]
				});

			const response = await request.get(`${baseUrl}/${appealId}/appellant-statement`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Review appellant statement</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Review decision</legend>');
			expect(unprettifiedElement.innerHTML).toContain('name="status" type="radio" value="valid">');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="status" type="radio" value="valid_requires_redaction">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="status" type="radio" value="incomplete">'
			);
		});

		it('should render the review Appellant statement page with no valid_requires_redaction option if no text in appellant statement', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/reps?type=appellant_statement`)
				.reply(200, {
					...getAppealRepsResponse,
					itemCount: 1,
					items: [
						{
							...appellantStatementAwaitingReview,
							originalRepresentation: ''
						}
					]
				});

			const response = await request.get(`${baseUrl}/${appealId}/appellant-statement`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).not.toContain(
				'name="status" type="radio" value="valid_requires_redaction">'
			);
		});

		it('should render the review Appellant statement page with the expected content if the statement is incomplete', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/reps?type=appellant_statement`)
				.reply(200, {
					...getAppealRepsResponse,
					itemCount: 1,
					items: [
						{
							...appellantStatementAwaitingReview,
							status: 'incomplete'
						}
					]
				});

			const response = await request.get(`${baseUrl}/${appealId}/appellant-statement`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Review appellant statement</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Review decision</legend>');
			expect(unprettifiedElement.innerHTML).toContain('name="status" type="radio" value="valid">');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="status" type="radio" value="valid_requires_redaction">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="status" type="radio" value="incomplete">'
			);
		});

		it('should render the view Appellant statement page with the expected content if the statement is neither awaiting review nor incomplete', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/reps?type=appellant_statement`)
				.reply(200, {
					...getAppealRepsResponse,
					itemCount: 1,
					items: [
						{
							...appellantStatementAwaitingReview,
							status: 'valid'
						}
					]
				});

			const response = await request.get(`${baseUrl}/${appealId}/appellant-statement`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('>Appellant statement</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-summary-list__row"><dt class="govuk-summary-list__key"> Statement</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-summary-list__row"><dt class="govuk-summary-list__key"> Supporting documents</dt>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Review decision</legend>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'name="status" type="radio" value="valid">'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'name="status" type="radio" value="valid_requires_redaction">'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'name="status" type="radio" value="incomplete">'
			);
		});
	});

	describe('POST /', () => {
		const appealId = 3;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}/reps?type=appellant_statement`)
				.reply(200, {
					...getAppealRepsResponse,
					itemCount: 1,
					items: [appellantStatementAwaitingReview]
				});
		});

		it('should re-render the review page with the expected error message if a review status was not selected', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, {
					...appealDataEnforcementNotice,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.post(`${baseUrl}/${appealId}/appellant-statement`).send({});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text, { rootElement: '.govuk-error-summary' });

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Select your review decision</a>');
		});

		it('should redirect to the allocation level page, if "valid" status was selected and the appeal has no allocation level', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, {
					...appealDataEnforcementNotice,
					appealId,
					appealStatus: 'statements',
					allocationDetails: {
						...appealDataEnforcementNotice.allocationDetails,
						level: null
					}
				});

			const response = await request.post(`${baseUrl}/${appealId}/appellant-statement`).send({
				status: 'valid'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-statement/valid/allocation-level`
			);
		});

		it('should redirect to the allocation level page, if "valid" status was selected and the appeal has no allocation specialisms', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, {
					...appealDataEnforcementNotice,
					appealId,
					appealStatus: 'statements',
					allocationDetails: {
						...appealDataEnforcementNotice.allocationDetails,
						specialisms: []
					}
				});

			const response = await request.post(`${baseUrl}/${appealId}/appellant-statement`).send({
				status: 'valid'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-statement/valid/allocation-level`
			);
		});

		it('should redirect to the allocation check page, if "valid" status was selected and the appeal has both an allocation level and allocation specialisms', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, {
					...appealDataEnforcementNotice,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.post(`${baseUrl}/${appealId}/appellant-statement`).send({
				status: 'valid'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-statement/valid/allocation-check`
			);
		});

		it('should redirect to the incomplete reasons page if "incomplete" status was selected', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, {
					...appealDataEnforcementNotice,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.post(`${baseUrl}/${appealId}/appellant-statement`).send({
				status: 'incomplete'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/3/appellant-statement/incomplete/reasons'
			);
		});

		it('should redirect to the redact statement page if "redact and accept" status was selected', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, {
					...appealDataEnforcementNotice,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.post(`${baseUrl}/${appealId}/appellant-statement`).send({
				status: 'valid_requires_redaction'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/3/appellant-statement/redact'
			);
		});
		describe('check your answers page', () => {
			const appealId = 3;

			beforeEach(() => {
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=appellant_statement`)
					.reply(200, {
						...getAppealRepsResponse,
						itemCount: 1,
						items: [appellantStatementAwaitingReview]
					})
					.persist();
				nock('http://test/')
					.get('/appeals/appeal-allocation-levels')
					.reply(200, allocationDetailsData.levels)
					.persist();
				nock('http://test/')
					.get('/appeals/appeal-allocation-specialisms')
					.reply(200, allocationDetailsData.specialisms)
					.persist();
			});

			it('should display "Do you need to update the allocation level and specialisms?" row and allocation-specialisms row if allocation and specialisms were previously set', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, {
						...appealDataEnforcementNotice,
						appealId,
						appealStatus: 'statements',
						allocationDetails: {
							level: 'B',
							band: 3,
							specialisms: ['Specialism 3']
						}
					})
					.persist();

				await request.post(`${baseUrl}/${appealId}/appellant-statement`).send({ status: 'valid' });
				await request
					.post(`${baseUrl}/${appealId}/appellant-statement/valid/allocation-check`)
					.send({ allocationLevelAndSpecialisms: 'yes' });
				await request
					.post(`${baseUrl}/${appealId}/appellant-statement/valid/allocation-level`)
					.send({ allocationLevel: 'A' });
				await request
					.post(`${baseUrl}/${appealId}/appellant-statement/valid/allocation-specialisms`)
					.send({ allocationSpecialisms: 1 });
				const response = await request.get(
					`${baseUrl}/${appealId}/appellant-statement/valid/confirm`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Do you need to update the allocation level and specialisms?</dt>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Allocation level</dt>');
				expect(unprettifiedElement.innerHTML).toContain('Allocation specialisms</dt>');
			});

			it('should not display "Do you need to update the allocation level and specialisms?" row and should display allocation-specialisms row if allocation and specialisms were not previously set', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, {
						...appealDataEnforcementNotice,
						appealId,
						appealStatus: 'statements',
						allocationDetails: null
					})
					.persist();

				await request.post(`${baseUrl}/${appealId}/appellant-statement`).send({ status: 'valid' });
				await request
					.post(`${baseUrl}/${appealId}/appellant-statement/valid/allocation-check`)
					.send({ allocationLevelAndSpecialisms: 'yes' });
				await request
					.post(`${baseUrl}/${appealId}/appellant-statement/valid/allocation-level`)
					.send({ allocationLevel: 'A' });
				await request
					.post(`${baseUrl}/${appealId}/appellant-statement/valid/allocation-specialisms`)
					.send({ allocationSpecialisms: 1 });
				const response = await request.get(
					`${baseUrl}/${appealId}/appellant-statement/valid/confirm`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).not.toContain(
					'Do you need to update the allocation level and specialisms?</dt>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Allocation level</dt>');
				expect(unprettifiedElement.innerHTML).toContain('Allocation specialisms</dt>');
			});

			it('should display "Do you need to update the allocation level and specialisms?" row and should not display allocation-specialisms row if allocation and specialisms were previously set and asnwer to allocation check was "yes" at first, but later set to "no" at CYA', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, {
						...appealDataEnforcementNotice,
						appealId,
						appealStatus: 'statements',
						allocationDetails: {
							level: 'B',
							band: 3,
							specialisms: ['Specialism 3']
						}
					})
					.persist();

				await request.post(`${baseUrl}/${appealId}/appellant-statement`).send({ status: 'valid' });
				await request
					.post(`${baseUrl}/${appealId}/appellant-statement/valid/allocation-check`)
					.send({ allocationLevelAndSpecialisms: 'yes' });
				await request
					.post(`${baseUrl}/${appealId}/appellant-statement/valid/allocation-level`)
					.send({ allocationLevel: 'A' });
				await request
					.post(`${baseUrl}/${appealId}/appellant-statement/valid/allocation-specialisms`)
					.send({ allocationSpecialisms: 1 });
				await request
					.post(`${baseUrl}/${appealId}/appellant-statement/valid/allocation-check`)
					.send({ allocationLevelAndSpecialisms: 'no' });
				const response = await request.get(
					`${baseUrl}/${appealId}/appellant-statement/valid/confirm`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Do you need to update the allocation level and specialisms?</dt>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('Allocation level</dt>');
				expect(unprettifiedElement.innerHTML).not.toContain('Allocation specialisms</dt>');
			});
		});
	});

	// TODO: A2-2696: tests for other screens/routes in the feature

	describe('GET /manage-documents/:folderId/', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview); // TODO: this should be Appellant statement data, not ip comment data

			nock('http://test/')
				.get('/appeals/2/document-folders/1?repId=3670')
				.reply(200, costsFolderInfoAppellantApplication)
				.persist();

			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);

			nock('http://test/')
				.get('/appeals/2/reps?type=appellant_final_comment')
				.reply(200, finalCommentsForReview); // TODO: this should be Appellant statement data, not final comment data
		});

		it('should render a 404 error page if the folderId is invalid', async () => {
			nock('http://test/').get('/appeals/2/document-folders/99').reply(404);

			const response = await request.get(`${baseUrl}/2/appellant-statement/manage-documents/99`);

			expect(response.statusCode).toBe(404);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render manage folder page with the provided comment details', async () => {
			const response = await request.get(`${baseUrl}/2/appellant-statement/manage-documents/1`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Supporting documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Name</th>');
			expect(unprettifiedElement.innerHTML).toContain('Date submitted</th>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</th>');
			expect(unprettifiedElement.innerHTML).toContain('Actions</th>');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFolderInfo.pdf</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<a href="/appeals-service/appeal-details/2/appellant-statement/add-document" role="button" draggable="false" class="govuk-button govuk-button--secondary" data-module="govuk-button"> Add document</a>`
			);
		});
	});

	describe('GET /manage-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			// @ts-ignore
			usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			// @ts-ignore
			usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);

			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview); // TODO: this should be Appellant statement data, not final comment data

			nock('http://test/')
				.get('/appeals/2/document-folders/1?repId=3670')
				.reply(200, costsFolderInfoAppellantApplication)
				.persist();

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);

			nock('http://test/')
				.get('/appeals/2/document-folders/1?repId=3670')
				.reply(200, documentFolderInfo)
				.persist();

			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		it('should render a 404 error page if the folderId is invalid', async () => {
			nock('http://test/').get('/appeals/2/document-folders/99').reply(404);

			const response = await request.get(`${baseUrl}/2/appellant-statement/manage-documents/1/99`);

			expect(response.statusCode).toBe(404);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render manage document page with the provided comment details', async () => {
			const response = await request.get(`${baseUrl}/2/appellant-statement/manage-documents/1/1`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage versions</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Virus scanning</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'test-pdf-documentFileVersionsInfo.pdf</a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version</a>');
			expect(unprettifiedElement.innerHTML).not.toContain('Remove current version</a>');
		});
	});

	describe('GET change-document-name/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataEnforcementNotice,
					appealId: 2,
					appealStatus: 'statements'
				});

			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview); // TODO: this should be Appellant statement data, not final comment data

			nock('http://test/')
				.get('/appeals/2/document-folders/1?repId=3670')
				.reply(200, costsFolderInfoAppellantApplication)
				.persist();

			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		it('should render change document page with the provided comment details', async () => {
			const response = await request.get(
				`${baseUrl}/2/appellant-statement/manage-documents/change-document-name/1/1`
			);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('File name');
			expect(unprettifiedElement.innerHTML).toContain('value="ph0-documentFileInfo">');
		});
	});

	describe('GET change-document-details/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataEnforcementNotice,
					appealId: 2,
					appealStatus: 'statements'
				});

			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview); // TODO: this should be using Appellant statement data, not ip comment data

			nock('http://test/')
				.get('/appeals/2/document-folders/1?repId=3670')
				.reply(200, costsFolderInfoAppellantApplication)
				.persist();

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);

			nock('http://test/')
				.get('/appeals/2/document-folders/1?repId=3670')
				.reply(200, documentFolderInfo)
				.persist();

			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		it('should render change document details page with the provided comment details', async () => {
			const response = await request.get(
				`${baseUrl}/2/appellant-statement/manage-documents/change-document-details/1/1`
			);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('ph0-documentFileInfo.jpeg</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="items[0][receivedDate]-[day]" type="text" value="11" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="items[0][receivedDate]-[month]" type="text" value="10" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="items[0][receivedDate]-[year]" type="text" value="2023" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="items[0][redactionStatus]" type="radio" value="redacted">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="items[0][redactionStatus]" type="radio" value="unredacted">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="items[0][redactionStatus]" type="radio" value="no redaction required" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});

		describe('GET /add-document', () => {
			beforeEach(() => {
				nock('http://test/').get('/appeals/2/reps').reply(200, interestedPartyCommentForReview); // TODO: this should be Appellant statement data, not final comment data

				nock('http://test/')
					.get('/appeals/3619/reps?type=appellant_statement')
					.reply(200, appellantStatementAwaitingReview);
			});

			it('should render the add document details page', async () => {
				const response = await request.get(`${baseUrl}/2/appellant-statement/add-document`);
				expect(response.statusCode).toBe(200);
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
				expect(unprettifiedElement.innerHTML).toContain('Upload supporting document</h1>');
				expect(unprettifiedElement.innerHTML).toContain(
					'data-document-title="appellant statement document"'
				);
			});

			it('should render the redaction status page', async () => {
				const response = await request.get(
					`${baseUrl}/2/appellant-statement/add-document/redaction-status`
				);
				expect(response.statusCode).toBe(200);
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</h1');
			});

			it('should render the date submitted page', async () => {
				const response = await request.get(
					`${baseUrl}/2/appellant-statement/add-document/date-submitted`
				);
				expect(response.statusCode).toBe(200);
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
				expect(unprettifiedElement.innerHTML).toContain(
					'When was the supporting document submitted?</h1'
				);
			});
		});
	});
});
