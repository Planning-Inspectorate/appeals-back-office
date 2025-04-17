// @ts-nocheck
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import {
	appealData,
	appealDataFullPlanning,
	linkedAppeals,
	linkableAppealSummaryBackOffice,
	linkableAppealSummaryHorizon,
	costsFolderInfoAppellantApplication,
	costsFolderInfoLpaApplication,
	costsFolderInfoDecision,
	folderInfoCrossTeamCorrespondence,
	folderInfoInspectorCorrespondence,
	documentRedactionStatuses,
	linkedAppealsWithExternalLead,
	fileUploadInfo,
	caseNotes,
	activeDirectoryUsersData,
	finalCommentsForReview,
	appellantFinalCommentsAwaitingReview,
	lpaFinalCommentsAwaitingReview
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { APPEAL_CASE_PROCEDURE } from 'pins-data-model';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const pastDate = '2025-01-06T23:59:00.000Z';
const futureDate = '3000-01-06T23:59:00.000Z';

describe('appeal-details', () => {
	beforeEach(() => {
		installMockApi();
		// @ts-ignore
		usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
		// @ts-ignore
		usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
		// @ts-ignore
		usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);

		nock('http://test/')
			.get('/appeals/1/reps?type=appellant_final_comment')
			.reply(200, appellantFinalCommentsAwaitingReview)
			.persist();
		nock('http://test/')
			.get('/appeals/1/reps?type=lpa_final_comment')
			.reply(200, lpaFinalCommentsAwaitingReview)
			.persist();

		nock('http://test/')
			.get('/appeals/2/reps?type=appellant_final_comment')
			.reply(200, appellantFinalCommentsAwaitingReview);
		nock('http://test/')
			.get('/appeals/2/reps?type=lpa_final_comment')
			.reply(200, lpaFinalCommentsAwaitingReview);

		nock('http://test/')
			.get('/appeals/3/reps?type=appellant_final_comment')
			.reply(200, appellantFinalCommentsAwaitingReview);
		nock('http://test/')
			.get('/appeals/3/reps?type=lpa_final_comment')
			.reply(200, lpaFinalCommentsAwaitingReview);
	});
	afterEach(teardown);

	describe('GET /:appealId', () => {
		describe('Notification banners', () => {
			const notificationBannerElement = '.govuk-notification-banner';
			it('should render a "This appeal is awaiting transfer" important notification banner with a link to add the Horizon reference of the transferred appeal when the appeal is awaiting transfer', async () => {
				const appealId = 2;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, { ...appealData, appealId, appealStatus: 'awaiting_transfer' });
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Important</h3>');
				expect(notificationBannerElementHTML).toContain('This appeal is awaiting transfer</p>');
				expect(notificationBannerElementHTML).toContain(
					'href="/appeals-service/appeal-details/2/change-appeal-type/add-horizon-reference'
				);
			});

			it('should render a "Appeal ready to be assigned to case officer" important notification banner with a link to assign case officer when status is "Assign case officer"', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, { ...appealData, appealId, appealStatus: 'assign_case_officer' });
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();

				expect(notificationBannerElementHTML).toContain('Important</h3>');
				expect(notificationBannerElementHTML).toContain(
					'Appeal ready to be assigned to case officer</p>'
				);
				expect(notificationBannerElementHTML).toContain(
					`href="/appeals-service/appeal-details/2/assign-user/case-officer?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}"`
				);
				expect(notificationBannerElementHTML).toContain('Assign case officer</a>');
			});

			it('should render a "Horizon reference added" success notification banner, a "Transferred" status tag, and an inset text component with the appeal type and horizon link for the transferred appeal, when the appeal was successfully transferred to horizon', async () => {
				//nock.cleanAll();

				const appealId = 2;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId: appealId,
						appealStatus: 'transferred',
						transferStatus: {
							transferredAppealType: '(C) Enforcement notice appeal',
							transferredAppealReference: '12345'
						}
					})
					.persist();

				nock('http://test/').get('/appeals/transferred-appeal/123').reply(200, {
					caseFound: true
				});
				nock('http://test/')
					.post(`/appeals/${appealId}/appeal-transfer-confirmation`)
					.reply(200, { success: true });
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

				await request.post(`${baseUrl}/${appealId}/change-appeal-type/add-horizon-reference`).send({
					'horizon-reference': '123'
				});

				await request.post(`${baseUrl}/${appealId}/change-appeal-type/check-transfer`).send({
					confirm: 'yes'
				});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				const statusTagElementHTML = parseHtml(response.text, {
					rootElement: '.govuk-tag--grey'
				}).innerHTML;
				const insetTextElementHTML = parseHtml(response.text, {
					rootElement: '.govuk-inset-text'
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toMatch('Horizon reference added</p>');

				//TODO: Move the tag test to it's own test
				expect(statusTagElementHTML).toMatchSnapshot();
				expect(statusTagElementHTML).toMatch('Transferred');

				expect(insetTextElementHTML).toMatchSnapshot();
				expect(insetTextElementHTML).toMatch('This appeal needed to change to a');
				expect(insetTextElementHTML).toMatch(
					'It has been transferred to Horizon with the reference'
				);
			});

			it('should render a "Neighbouring site added" success notification banner when an inspector/3rd party neighbouring site was added', async () => {
				const appealReference = '1';
				const appealId = appealData.appealId;
				nock.cleanAll();
				nock('http://test/')
					.post(`/appeals/${appealReference}/neighbouring-sites`)
					.reply(200, {
						siteId: 1,
						address: {
							addressLine1: '1 Grove Cottage',
							addressLine2: 'Shotesham Road',
							country: 'United Kingdom',
							county: 'Devon',
							postcode: 'NR35 2ND',
							town: 'Woodton'
						}
					});
				nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData).persist();
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/case-notes`)
					.reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);

				await request.post(`${baseUrl}/1/neighbouring-sites/add/back-office`).send({
					addressLine1: '1 Grove Cottage',
					addressLine2: null,
					county: 'Devon',
					postCode: 'NR35 2ND',
					town: 'Woodton'
				});

				await request.post(`${baseUrl}/1/neighbouring-sites/add/back-office/check-and-confirm`);

				const response = await request.get(`${baseUrl}/${appealData.appealId}`);

				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Neighbouring site added</p>');
			});

			it('should render a "Neighbouring site updated" success notification banner when an inspector/3rd party neighbouring site was updated', async () => {
				const appealReference = '1';

				nock.cleanAll();
				nock('http://test/').patch(`/appeals/${appealReference}/neighbouring-sites`).reply(200, {
					siteId: 1
				});
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}`)
					.reply(200, appealData)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/case-notes`)
					.reply(200, caseNotes);

				nock('http://test/')
					.get(`/appeals/${appealReference}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealReference}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);
				await request.post(`${baseUrl}/1/neighbouring-sites/change/site/1`).send({
					addressLine1: '2 Grove Cottage',
					addressLine2: null,
					county: 'Devon',
					postCode: 'NR35 2ND',
					town: 'Woodton'
				});

				await request.post(`${baseUrl}/1/neighbouring-sites/change/site/1/check-and-confirm`);

				const response = await request.get(`${baseUrl}/${appealData.appealId}`);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Neighbouring site updated</p>');
			});

			it('should render a "Neighbouring site removed" success notification banner when an inspector/3rd party neighbouring site was removed', async () => {
				const appealReference = '1';

				nock.cleanAll();
				nock('http://test/').delete(`/appeals/${appealReference}/neighbouring-sites`).reply(200, {
					siteId: 1
				});
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}`)
					.reply(200, appealData)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/case-notes`)
					.reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealReference}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealReference}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);
				await request.post(`${baseUrl}/1/neighbouring-sites/remove/site/1`).send({
					'remove-neighbouring-site': 'yes'
				});

				const response = await request.get(`${baseUrl}/${appealData.appealId}`);

				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Neighbouring site removed</p>');
			});

			it('should render a "This appeal is now the lead for appeal" success notification banner when the appeal was successfully linked as the lead of a back-office appeal', async () => {
				const appealReference = '1234567';

				nock.cleanAll();
				nock('http://test/')
					.get(`/appeals/linkable-appeal/${appealReference}`)
					.reply(200, linkableAppealSummaryBackOffice);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}`)
					.reply(200, appealData)
					.persist();
				nock('http://test/').post(`/appeals/${appealData.appealId}/link-appeal`).reply(200, {
					childId: linkableAppealSummaryBackOffice.appealId,
					childRef: linkableAppealSummaryBackOffice.appealReference,
					externaAppealType: null,
					externalSource: false,
					id: 1,
					linkingDate: '2024-02-22T16:45:24.037Z',
					parentId: appealData.appealId,
					parentRef: appealData.appealReference,
					type: 'linked'
				});
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/case-notes`)
					.reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);
				await request.post(`${baseUrl}/1/linked-appeals/add`).send({
					'appeal-reference': appealReference
				});
				await request.post(`${baseUrl}/1/linked-appeals/add/check-and-confirm`).send({
					confirmation: 'child'
				});

				const response = await request.get(`${baseUrl}/${appealData.appealId}`);
				const element = parseHtml(response.text, { rootElement: notificationBannerElement });
				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Success</h3>');
				expect(element.innerHTML).toContain('This appeal is now the lead for appeal');
			});

			it('should render a success notification banner with appropriate content if the appeal was just linked as the child of a back-office appeal', async () => {
				const appealReference = '1234567';

				nock.cleanAll();
				nock('http://test/')
					.get(`/appeals/linkable-appeal/${appealReference}`)
					.reply(200, linkableAppealSummaryBackOffice);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}`)
					.reply(200, appealData)
					.persist();
				nock('http://test/').post(`/appeals/${appealData.appealId}/link-appeal`).reply(200, {
					childId: appealData.appealId,
					childRef: appealData.appealReference,
					externaAppealType: null,
					externalSource: false,
					id: 1,
					linkingDate: '2024-02-22T16:45:24.037Z',
					parentId: linkableAppealSummaryBackOffice.appealId,
					parentRef: linkableAppealSummaryBackOffice.appealReference,
					type: 'linked'
				});
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/case-notes`)
					.reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);
				await request.post(`${baseUrl}/1/linked-appeals/add`).send({
					'appeal-reference': appealReference
				});

				await request.post(`${baseUrl}/1/linked-appeals/add/check-and-confirm`).send({
					confirmation: 'lead'
				});

				const response = await request.get(`${baseUrl}/${appealData.appealId}`);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('This appeal is now a child of appeal');
			});

			it('should render a success notification banner with appropriate content if the appeal was just linked as the lead of a legacy (Horizon) appeal', async () => {
				const appealReference = '1234567';

				nock.cleanAll();
				nock('http://test/')
					.get(`/appeals/linkable-appeal/${appealReference}`)
					.reply(200, linkableAppealSummaryHorizon);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}`)
					.reply(200, appealData)
					.persist();
				nock('http://test/').post(`/appeals/${appealData.appealId}/link-legacy-appeal`).reply(200, {
					childId: null,
					childRef: '3171066',
					externaAppealType: null,
					externalSource: true,
					id: 1,
					linkingDate: '2024-02-22T16:58:09.276Z',
					parentId: 5465,
					parentRef: 'TEST-569815',
					type: 'linked'
				});
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/case-notes`)
					.reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);
				await request.post(`${baseUrl}/1/linked-appeals/add`).send({
					'appeal-reference': appealReference
				});

				await request.post(`${baseUrl}/1/linked-appeals/add/check-and-confirm`).send({
					confirmation: 'child'
				});

				const response = await request.get(`${baseUrl}/${appealData.appealId}`);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('This appeal is now the lead for appeal');
			});

			it('should render a success notification banner with appropriate content if the appeal was just linked as the child of a legacy (Horizon) appeal', async () => {
				const appealReference = '1234567';

				nock.cleanAll();
				nock('http://test/')
					.get(`/appeals/linkable-appeal/${appealReference}`)
					.reply(200, linkableAppealSummaryHorizon);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}`)
					.reply(200, appealData)
					.persist();
				nock('http://test/').post(`/appeals/${appealData.appealId}/link-legacy-appeal`).reply(200, {
					childId: 5466,
					childRef: 'TEST-489773',
					externaAppealType: null,
					externalSource: true,
					id: 1,
					linkingDate: '2024-02-22T17:16:57.654Z',
					parentId: null,
					parentRef: '3171066',
					type: 'linked'
				});
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/case-notes`)
					.reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);

				const addLinkedAppealReferencePostResponse = await request
					.post(`${baseUrl}/1/linked-appeals/add`)
					.send({
						'appeal-reference': appealReference
					});

				expect(addLinkedAppealReferencePostResponse.statusCode).toBe(302);

				const addLinkedAppealCheckAndConfirmPostResponse = await request
					.post(`${baseUrl}/1/linked-appeals/add/check-and-confirm`)
					.send({
						confirmation: 'lead'
					});

				expect(addLinkedAppealCheckAndConfirmPostResponse.statusCode).toBe(302);

				const response = await request.get(`${baseUrl}/${appealData.appealId}`);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('This appeal is now a child of appeal');
			});

			it('should render a success notification banner when a user was successfully unassigned as inspector', async () => {
				nock('http://test/').patch('/appeals/1').reply(200, { inspector: '' });
				nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);
				await request.post(`${baseUrl}/1/unassign-user/inspector/1/confirm`).send({
					confirm: 'yes'
				});

				const response = await request.get(`${baseUrl}/1`);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Inspector has been removed</p>');
			});

			it('should render a success notification banner when a user was successfully assigned as case officer', async () => {
				nock('http://test/')
					.patch('/appeals/1')
					.reply(200, { caseOfficer: 'updatedCaseOfficerId' });
				nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);

				await request.post(`${baseUrl}/1/assign-user/case-officer/1/confirm`).send({
					confirm: 'yes'
				});

				const response = await request.get(`${baseUrl}/1`);

				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Case officer has been assigned</p>');
			});

			it('should render a success notification banner when a user was successfully assigned as inspector', async () => {
				nock('http://test/').patch('/appeals/1').reply(200, { inspector: 'updatedInspectorId' });
				nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);

				await request.post(`${baseUrl}/1/assign-user/inspector/1/confirm`).send({
					confirm: 'yes'
				});

				const response = await request.get(`${baseUrl}/1`);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Inspector has been assigned</p>');
			});

			it('should render a success notification banner when an appellant costs document was uploaded', async () => {
				nock('http://test/')
					.get('/appeals/1/document-folders/1')
					.reply(200, costsFolderInfoAppellantApplication)
					.persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/').post('/appeals/1/documents').reply(200);
				nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);

				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/appellant/application/upload-documents/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const postCheckAndConfirmResponse = await request
					.post(`${baseUrl}/1/costs/appellant/application/check-your-answers/1`)
					.send({});

				expect(postCheckAndConfirmResponse.statusCode).toBe(302);
				expect(postCheckAndConfirmResponse.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1'
				);

				const caseDetailsResponse = await request.get(`${baseUrl}/1`);

				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Appellant costs application added</p>');
			});

			it('should render a success notification banner when a new version of an appellant costs document was uploaded', async () => {
				nock('http://test/')
					.get('/appeals/1/document-folders/1')
					.reply(200, costsFolderInfoAppellantApplication)
					.persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/').post('/appeals/1/documents').reply(200);
				nock('http://test/').post('/appeals/1/documents/1').reply(200);
				nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);

				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/appellant/application/upload-documents/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const postCheckAndConfirmResponse = await request
					.post(`${baseUrl}/1/costs/appellant/application/check-your-answers/1`)
					.send({});

				expect(postCheckAndConfirmResponse.statusCode).toBe(302);

				await request.get(`${baseUrl}/1`);

				const addDocumentVersionResponse = await request
					.post(`${baseUrl}/1/costs/appellant/application/upload-documents/1/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentVersionResponse.statusCode).toBe(302);

				const postVersionCheckAndConfirmResponse = await request
					.post(`${baseUrl}/1/costs/appellant/application/check-your-answers/1/1`)
					.send({});

				expect(postVersionCheckAndConfirmResponse.statusCode).toBe(302);
				expect(postVersionCheckAndConfirmResponse.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1'
				);

				const caseDetailsResponse2 = await request.get(`${baseUrl}/1`);

				const notificationBanner2ElementHTML = parseHtml(caseDetailsResponse2.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBanner2ElementHTML).toMatchSnapshot();
				expect(notificationBanner2ElementHTML).toContain('Success</h3>');
				expect(notificationBanner2ElementHTML).toContain('Document updated</p>');
			});

			it('should render a success notification banner when an LPA costs document was uploaded', async () => {
				nock('http://test/')
					.get('/appeals/1/document-folders/2')
					.reply(200, costsFolderInfoLpaApplication)
					.persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/').post('/appeals/1/documents').reply(200);
				nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);

				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/lpa/application/upload-documents/2`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const postCheckAndConfirmResponse = await request
					.post(`${baseUrl}/1/costs/lpa/application/check-your-answers/2`)
					.send({});

				expect(postCheckAndConfirmResponse.statusCode).toBe(302);
				expect(postCheckAndConfirmResponse.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1'
				);

				const caseDetailsResponse = await request.get(`${baseUrl}/1`);

				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('LPA costs application added</p>');
			});

			it('should render a success notification banner when a new version of an LPA costs document was uploaded', async () => {
				nock('http://test/')
					.get('/appeals/1/document-folders/2')
					.reply(200, costsFolderInfoLpaApplication)
					.persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/').post('/appeals/1/documents').reply(200);
				nock('http://test/').post('/appeals/1/documents/1').reply(200);
				nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);

				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/lpa/application/upload-documents/2`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const postCheckAndConfirmResponse = await request
					.post(`${baseUrl}/1/costs/lpa/application/check-your-answers/2`)
					.send({});

				expect(postCheckAndConfirmResponse.statusCode).toBe(302);

				await request.get(`${baseUrl}/1`);

				const addDocumentVersionResponse = await request
					.post(`${baseUrl}/1/costs/lpa/application/upload-documents/2/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentVersionResponse.statusCode).toBe(302);

				const postVersionCheckAndConfirmResponse = await request
					.post(`${baseUrl}/1/costs/lpa/application/check-your-answers/2/1`)
					.send({});

				expect(postVersionCheckAndConfirmResponse.statusCode).toBe(302);
				expect(postVersionCheckAndConfirmResponse.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1'
				);

				const caseDetailsResponse2 = await request.get(`${baseUrl}/1`);

				const notificationBanner2ElementHTML = parseHtml(caseDetailsResponse2.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBanner2ElementHTML).toMatchSnapshot();
				expect(notificationBanner2ElementHTML).toContain('Success</h3>');
				expect(notificationBanner2ElementHTML).toContain('Document updated</p>');
			});

			it('should render a success notification banner when a costs decision document was uploaded', async () => {
				nock('http://test/')
					.get('/appeals/1/document-folders/3')
					.reply(200, costsFolderInfoDecision)
					.persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/').post('/appeals/1/documents').reply(200);
				nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);

				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/3`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const checkAndConfirmResponse = await request
					.post(`${baseUrl}/1/costs/decision/check-and-confirm/3`)
					.send({
						confirm: 'yes'
					});

				expect(checkAndConfirmResponse.statusCode).toBe(302);
				expect(checkAndConfirmResponse.text).toEqual(
					`Found. Redirecting to /appeals-service/appeal-details/1`
				);

				const caseDetailsResponse = await request.get(`${baseUrl}/1`);

				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Costs decision uploaded</p>');
			});

			it('should render a success notification banner when a new version of a costs decision document was uploaded', async () => {
				nock('http://test/')
					.get('/appeals/1/document-folders/3')
					.reply(200, costsFolderInfoDecision)
					.persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/').post('/appeals/1/documents').reply(200);
				nock('http://test/').post('/appeals/1/documents/1').reply(200);
				nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);

				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/3`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const checkAndConfirmResponse = await request
					.post(`${baseUrl}/1/costs/decision/check-and-confirm/3`)
					.send({
						confirm: 'yes'
					});

				expect(checkAndConfirmResponse.statusCode).toBe(302);

				await request.get(`${baseUrl}/1`);

				const addDocumentVersionResponse = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/3/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentVersionResponse.statusCode).toBe(302);

				const postVersionCheckAndConfirmResponse = await request
					.post(`${baseUrl}/1/costs/decision/check-and-confirm/3/1`)
					.send({
						confirm: 'yes'
					});

				expect(postVersionCheckAndConfirmResponse.statusCode).toBe(302);
				expect(postVersionCheckAndConfirmResponse.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1'
				);

				const caseDetailsResponse2 = await request.get(`${baseUrl}/1`);

				const notificationBanner2ElementHTML = parseHtml(caseDetailsResponse2.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBanner2ElementHTML).toMatchSnapshot();
				expect(notificationBanner2ElementHTML).toContain('Success</h3>');
				expect(notificationBanner2ElementHTML).toContain('Document updated</p>');
			});

			it('should render a success notification banner when a service user was updated', async () => {
				nock('http://test/').get(`/appeals/1`).reply(200, appealData);
				nock('http://test/').patch(`/appeals/1/service-user`).reply(200, {
					serviceUserId: 1
				});
				nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);
				const validData = {
					firstName: 'Jessica',
					lastName: 'Jones',
					emailAddress: ''
				};
				await request.post(`${baseUrl}/1/service-user/change/agent`).send(validData);

				const caseDetailsResponse = await request.get(`${baseUrl}/1`);

				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Agent details updated</p>');
			});

			it('should render a success notification banner when the lpa application reference was updated', async () => {
				const appealId = appealData.appealId.toString();
				nock.cleanAll();
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, { ...appealData, lpaQuestionnaireId: undefined })
					.persist();
				nock('http://test/').patch(`/appeals/${appealId}`).reply(200, {
					planningApplicationReference: '12345/A/67890'
				});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const validData = {
					planningApplicationReference: '12345/A/67890'
				};

				await request
					.post(`${baseUrl}/${appealId}/appellant-case/lpa-reference/change`)
					.send(validData);

				const caseDetailsResponse = await request.get(`${baseUrl}/1`);

				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Appeal updated</p>');
			});

			it('should render a success notification banner when the inspector access was updated', async () => {
				const appealId = appealData.appealId;
				const appellantCaseId = appealData.appellantCaseId;
				const validData = {
					inspectorAccessRadio: 'yes',
					inspectorAccessDetails: 'Details'
				};

				nock('http://test/')
					.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, {
						...validData
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				await request
					.post(`${baseUrl}/${appealId}/inspector-access/change/appellant`)
					.send(validData);

				const caseDetailsResponse = await request.get(`${baseUrl}/1`);
				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Inspector access (appellant) updated</p>');
			});

			it('should render a success notification banner when the safety risks was updated', async () => {
				const appealId = appealData.appealId;
				const appellantCaseId = appealData.appellantCaseId;
				const validData = {
					safetyRisksRadio: 'yes',
					safetyRisksDetails: 'Details'
				};

				nock('http://test/')
					.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, {
						...validData
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				await request.post(`${baseUrl}/${appealId}/safety-risks/change/appellant`).send(validData);

				const caseDetailsResponse = await request.get(`${baseUrl}/1`);
				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain(
					'Site health and safety risks (appellant answer) updated</p>'
				);
			});

			it('should render a success notification banner when a cross-team correspondence document was uploaded', async () => {
				nock('http://test/')
					.get('/appeals/1/document-folders/4')
					.reply(200, folderInfoCrossTeamCorrespondence)
					.persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/').post('/appeals/1/documents').reply(200);
				nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);
				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/internal-correspondence/cross-team/upload-documents/4`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const postCheckAndConfirmResponse = await request
					.post(`${baseUrl}/1/internal-correspondence/cross-team/check-your-answers/4`)
					.send({});

				expect(postCheckAndConfirmResponse.statusCode).toBe(302);
				expect(postCheckAndConfirmResponse.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1'
				);

				const caseDetailsResponse = await request.get(`${baseUrl}/1`);

				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Cross-team correspondence added</p>');
			});

			it('should render a success notification banner when an inspector correspondence document was uploaded', async () => {
				nock('http://test/')
					.get('/appeals/1/document-folders/5')
					.reply(200, folderInfoInspectorCorrespondence)
					.persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/').post('/appeals/1/documents').reply(200);
				nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);
				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/internal-correspondence/inspector/upload-documents/5`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const postCheckAndConfirmResponse = await request
					.post(`${baseUrl}/1/internal-correspondence/inspector/check-your-answers/5`)
					.send({});

				expect(postCheckAndConfirmResponse.statusCode).toBe(302);
				expect(postCheckAndConfirmResponse.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1'
				);

				const caseDetailsResponse = await request.get(`${baseUrl}/1`);

				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Inspector correspondence added</p>');
			});

			it('should render an important notification banner when the appeal has unreviewed IP comments', async () => {
				nock('http://test/')
					.get('/appeals/2')
					.reply(200, {
						...appealDataFullPlanning,
						appealId: 2,
						appealStatus: 'statements',
						appealTimetable: {
							...appealDataFullPlanning.appealTimetable,
							ipCommentsDueDate: futureDate,
							lpaStatementDueDate: futureDate
						},
						documentationSummary: {
							...appealDataFullPlanning.documentationSummary,
							ipComments: {
								status: 'received',
								counts: {
									awaiting_review: 1,
									valid: 0,
									published: 0
								}
							}
						}
					});
				nock('http://test/').get(`/appeals/2/case-notes`).reply(200, caseNotes);

				const caseDetailsResponse = await request.get(`${baseUrl}/2`);

				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();

				const unprettifiedElementHtml = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement,
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedElementHtml).toContain('Important</h3>');
				expect(unprettifiedElementHtml).toContain(
					'<p class="govuk-notification-banner__heading">Interested party comments awaiting review</p>'
				);
				expect(unprettifiedElementHtml).toContain(
					'<p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/2/interested-party-comments?backUrl=%2Fappeals-service%2Fappeal-details%2F2" data-cy="banner-review-ip-comments">Review <span class="govuk-visually-hidden">interested party comments</span></a></p>'
				);
			});

			it('should render a "Appeal ready for validation" important notification banner with a link to validate the appeal when the appeal status is "validation"', async () => {
				const appealId = 2;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'validation',
						documentationSummary: {
							...appealData.documentationSummary,
							appellantCase: {
								...appealData.documentationSummary.appellantCase,
								dueDate: futureDate,
								status: 'received'
							}
						}
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner'
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Important</h3>');
				expect(notificationBannerElementHTML).toContain('Appeal ready for validation</p>');
				expect(notificationBannerElementHTML).toContain(
					`href="/appeals-service/appeal-details/${appealId}/appellant-case?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}"`
				);
				expect(notificationBannerElementHTML).toContain('data-cy="validate-appeal"');
				expect(notificationBannerElementHTML).toContain(
					'Validate <span class="govuk-visually-hidden">appeal</span></a>'
				);
			});

			it('should render a "LPA questionnaire ready for review" important notification banner with a link to review the questionnaire when the appeal status is "lpa_questionnaire" and the appeal has an LPA questionnaire ID', async () => {
				const appealId = 2;
				const lpaQuestionnaireId = 123;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'lpa_questionnaire',
						lpaQuestionnaireId,
						documentationSummary: {
							...appealData.documentationSummary,
							lpaQuestionnaire: {
								...appealData.documentationSummary.lpaQuestionnaire,
								status: 'received',
								dueDate: futureDate
							}
						}
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner'
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Important</h3>');
				expect(notificationBannerElementHTML).toContain('LPA questionnaire ready for review</p>');
				expect(notificationBannerElementHTML).toContain(
					`href="/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}"`
				);
				expect(notificationBannerElementHTML).toContain(
					'data-cy="review-lpa-questionnaire-banner"'
				);
				expect(notificationBannerElementHTML).toContain(
					'Review <span class="govuk-visually-hidden">LPA questionnaire</span></a>'
				);
			});

			it('should not render a "LPA questionnaire ready for review" important notification banner when the appeal status is "lpa_questionnaire" but the appeal does not have an LPA questionnaire ID', async () => {
				const appealId = 2;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'lpa_questionnaire',
						lpaQuestionnaireId: null
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);
				const notificationBannerElement = response.text.includes('govuk-notification-banner');
				expect(notificationBannerElement).toBe(false);
			});

			it('should render a "Site visit ready to set up" important notification banner with a link to schedule the site visit when the appeal status is "event"', async () => {
				const appealId = 2;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'event'
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner'
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Important</h3>');
				expect(notificationBannerElementHTML).toContain('Site visit ready to set up</p>');
				expect(notificationBannerElementHTML).toContain(
					`href="/appeals-service/appeal-details/${appealId}/site-visit/schedule-visit?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}"`
				);
				expect(notificationBannerElementHTML).toContain('data-cy="set-up-site-visit-banner"');
				expect(notificationBannerElementHTML).toContain('Set up site visit</a>');
			});

			describe('final comments', () => {
				const appealId = 3;
				const testCases = [
					{
						name: 'appellant',
						importantBannerHeading: 'Appellant final comments awaiting review',
						successBannerHeading: 'Appellant final comments redacted and accepted',
						visuallyHiddenText: 'appellant final comments',
						origin: 'citizen'
					},
					{
						name: 'lpa',
						importantBannerHeading: 'LPA final comments awaiting review',
						successBannerHeading: 'LPA final comments redacted and accepted',
						visuallyHiddenText: 'L P A final comments',
						origin: 'lpa'
					}
				];

				const resetMocks = () => {
					nock.cleanAll();
					nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
						.reply(200, finalCommentsForReview)
						.persist();
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
						.reply(200, finalCommentsForReview)
						.persist();
				};

				beforeEach(() => {
					resetMocks();
				});

				for (const testCase of testCases) {
					it(`should render an "${testCase.importantBannerHeading}" important notification banner when the appeal has unreviewed ${testCase.name} final comments`, async () => {
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealDataFullPlanning,
								appealId,
								appealStatus: 'final_comments',
								documentationSummary: {
									...appealDataFullPlanning.documentationSummary,
									[`${testCase.name}FinalComments`]: {
										status: 'received',
										receivedAt: pastDate,
										representationStatus: 'awaiting_review'
									}
								}
							});
						nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

						const response = await request.get(`${baseUrl}/${appealId}`);

						const unprettifiedElementHtml = parseHtml(response.text, {
							skipPrettyPrint: true
						}).innerHTML;

						expect(unprettifiedElementHtml).toContain('Important</h3>');
						expect(unprettifiedElementHtml).toContain(
							`<p class="govuk-notification-banner__heading">${testCase.importantBannerHeading}</p>`
						);
						expect(unprettifiedElementHtml).toContain(
							`<p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealId}/final-comments/${testCase.name}?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}" data-cy="banner-review-${testCase.name}-final-comments">Review <span class="govuk-visually-hidden">${testCase.visuallyHiddenText}</span></a></p>`
						);
					});

					it(`should render an "${testCase.successBannerHeading}" success notification banner, and not render an "${testCase.importantBannerHeading}" notification banner, when an ${testCase.name} final comment is redacted and accepted`, async () => {
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealDataFullPlanning,
								appealId,
								appealStatus: 'final_comments',
								appealTimetable: {
									...appealDataFullPlanning.appealTimetable,
									finalCommentsDueDate: futureDate
								},
								documentationSummary: {
									...appealDataFullPlanning.documentationSummary,
									[`${testCase.name}FinalComments`]: {
										status: 'received',
										receivedAt: pastDate,
										representationStatus: 'awaiting_review'
									}
								}
							})
							.persist();

						const redactedRepresentation = 'Test redacted final comment text';
						const redactPagePostResponse = await request
							.post(`${baseUrl}/${appealId}/final-comments/${testCase.name}/redact`)
							.send({
								redactedRepresentation
							});

						expect(redactPagePostResponse.statusCode).toBe(302);

						nock('http://test/')
							.patch(`/appeals/${appealId}/reps/3670`)
							.reply(200, {
								...finalCommentsForReview.items[0],
								origin: testCase.origin,
								status: 'valid'
							});

						const confirmRedactPagePostResponse = await request
							.post(`${baseUrl}/${appealId}/final-comments/${testCase.name}/redact/confirm`)
							.send({});

						expect(confirmRedactPagePostResponse.statusCode).toBe(302);

						resetMocks();
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealDataFullPlanning,
								appealId,
								appealStatus: 'final_comments',
								appealTimetable: {
									...appealDataFullPlanning.appealTimetable,
									finalCommentsDueDate: futureDate
								},
								documentationSummary: {
									...appealDataFullPlanning.documentationSummary,
									[`${testCase.name}FinalComments`]: {
										status: 'received',
										receivedAt: pastDate,
										representationStatus: 'valid'
									}
								}
							});

						const response = await request.get(`${baseUrl}/${appealId}`);

						const unprettifiedElementHtml = parseHtml(response.text, {
							skipPrettyPrint: true
						}).innerHTML;

						expect(unprettifiedElementHtml).toContain('Success</h3>');
						expect(unprettifiedElementHtml).toContain(
							`<p class="govuk-notification-banner__heading"> ${testCase.successBannerHeading}</p>`
						);
						expect(unprettifiedElementHtml).not.toContain('Important</h3>');
						expect(unprettifiedElementHtml).not.toContain(
							`<p class="govuk-notification-banner__heading">${testCase.importantBannerHeading}</p>`
						);
					});
				}
			});

			describe('banner ordering', () => {
				it('should render success banners before (above) important banners', async () => {
					const appealId = 2;
					const appealInValidationStatus = {
						...appealData,
						appealId,
						appealStatus: 'validation',
						documentationSummary: {
							...appealData.documentationSummary,
							appellantCase: {
								...appealData.documentationSummary.appellantCase,
								dueDate: futureDate,
								status: 'received'
							}
						}
					};

					nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealInValidationStatus);
					nock('http://test/')
						.patch(`/appeals/${appealId}`)
						.reply(200, { caseOfficer: 'updatedCaseOfficerId' });
					nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

					await request.post(`${baseUrl}/${appealId}/assign-user/case-officer/1/confirm`).send({
						confirm: 'yes'
					});

					nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealInValidationStatus);

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const firstBannerHtml = parseHtml(response.text, {
						rootElement: `.govuk-notification-banner[data-index='0']`,
						skipPrettyPrint: true
					}).innerHTML;
					expect(firstBannerHtml).toContain(
						'<h3 class="govuk-notification-banner__title" id="govuk-notification-banner-title"> Success</h3>'
					);

					const secondBannerHtml = parseHtml(response.text, {
						rootElement: `.govuk-notification-banner[data-index='1']`,
						skipPrettyPrint: true
					}).innerHTML;
					expect(secondBannerHtml).toContain(
						'<h3 class="govuk-notification-banner__title" id="govuk-notification-banner-title"> Important</h3>'
					);
				});
			});
		});
		describe('Case notes', () => {
			it('should render the case note details', async () => {
				const appealId = appealData.appealId.toString();
				nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData);
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				const element = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: '.govuk-details'
				}).innerHTML;
				expect(element).toMatchSnapshot();
				expect(element).toContain('2 case notes');
				expect(element).toContain('A case note you should see.</p>');
			});
			it('should submit a new case note and re-render case details', async () => {
				nock.cleanAll();
				const appealId = appealData.appealId.toString();
				const caseNotesResponse = [...caseNotes];
				const comment = 'This is a new comment';
				nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData).persist();
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotesResponse);
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview)
					.persist();
				const submitRequest = nock('http://test/')
					.post(`/appeals/${appealId}/case-notes`)
					.reply(200, {});
				await request.get(`${baseUrl}/${appealId}`);

				const response = await request.post(`${baseUrl}/${appealId}`).send({ comment: comment });
				expect(response.statusCode).toBe(302);
				caseNotesResponse.push({
					createdAt: '2024-10-03T10:00:00.000Z',
					comment,
					azureAdUserId: '923ac03b-9031-4cf4-8b17-348c274321f9'
				});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotesResponse);
				const renderResponse = await request.get(`${baseUrl}/${appealId}`);
				expect(renderResponse.statusCode).toBe(200);
				expect(submitRequest.isDone()).toBe(true);

				const element = parseHtml(renderResponse.text, {
					skipPrettyPrint: true,
					rootElement: '.govuk-details'
				}).innerHTML;
				expect(element).toContain('3 case notes');
				expect(element).toContain('This is a new comment</p>');
			});
			it('should not submit and  re-render case details with an error if the string is empty', async () => {
				nock.cleanAll();
				const appealId = appealData.appealId.toString();
				const caseNotesResponse = [...caseNotes];
				const comment = '';
				nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData).persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/case-notes`)
					.reply(200, caseNotesResponse)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview)
					.persist();
				const submitRequest = nock('http://test/')
					.post(`/appeals/${appealId}/case-notes`)
					.reply(200, {});
				await request.get(`${baseUrl}/${appealId}`);

				const response = await request.post(`${baseUrl}/${appealId}`).send({ comment: comment });
				expect(response.statusCode).toBe(200);

				const pageElements = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
				const element = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: '.govuk-details'
				}).innerHTML;
				expect(pageElements).toContain('error-summary');
				expect(element).toContain('2 case notes');
				expect(submitRequest.isDone()).toBe(false);
			});
			it('should not submit and re-render case details with an error if the comment exceeds 300 characters', async () => {
				nock.cleanAll();
				const appealId = appealData.appealId.toString();
				const caseNotesResponse = [...caseNotes];
				const comment = 'a'.repeat(301); // Create a string that's 301 characters long

				nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData).persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/case-notes`)
					.reply(200, caseNotesResponse)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview)
					.persist();
				const submitRequest = nock('http://test/')
					.post(`/appeals/${appealId}/case-notes`)
					.reply(200, {});

				await request.get(`${baseUrl}/${appealId}`);

				const response = await request.post(`${baseUrl}/${appealId}`).send({ comment: comment });
				expect(response.statusCode).toBe(200);

				const pageElements = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
				const element = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: '.govuk-details'
				}).innerHTML;

				expect(pageElements).toContain('error-summary');
				expect(pageElements).toContain('Case note must be 300 characters or less');
				expect(element).toContain('2 case notes');
				expect(submitRequest.isDone()).toBe(false);
			});
		});
		it('should redirect to 500 page if it fails to post', async () => {
			nock.cleanAll();
			const appealId = appealData.appealId;
			const comment = 'This is a new comment';
			nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData).persist();
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

			nock('http://test/')
				.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
				.reply(200, appellantFinalCommentsAwaitingReview);
			nock('http://test/')
				.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
				.reply(200, lpaFinalCommentsAwaitingReview);

			const submitRequest = nock('http://test/').post(`/appeals/${appealId}/case-notes`).reply(500);
			await request.get(`${baseUrl}/${appealId}`);

			const response = await request.post(`${baseUrl}/${appealId}`).send({ comment: comment });
			expect(response.statusCode).toBe(500);
			expect(submitRequest.isDone()).toBe(true);
		});
		describe('Case download', () => {
			it('should render the case download link', async () => {
				const appealId = appealData.appealId.toString();
				nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData);
				const response = await request.get(`${baseUrl}/${appealId}`);

				const element = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: '#download-case-files'
				}).innerHTML;
				expect(element).toContain('/documents/1/bulk-download');
				expect(element).toContain('Download case');
			});
		});

		it('should render the received appeal details for a valid appealId with no linked/other appeals', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').get(`/appeals/${appealId}`).reply(200, undefined);
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Case details</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Linked appeals</dt><dd class="govuk-summary-list__value"><span>No appeals</span>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Linked appeals</dt><dd class="govuk-summary-list__value"><span>No appeals</span>'
			);

			expect(unprettifiedElement.innerHTML).not.toContain(
				`href="/appeals-service/appeal-details/${appealId}/inspector-access/change/lpa"`
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				`href="/appeals-service/appeal-details/${appealId}/neighbouring-sites/change/affected"`
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				`href="/appeals-service/appeal-details/${appealId}/safety-risks/change/lpa"`
			);
		});

		it('should render the header with navigation containing links to the personal list, national list, and sign out route, without any active modifier classes', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').get(`/appeals/${appealId}`).reply(200, undefined);
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text, { rootElement: 'header' });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				'<a class="govuk-header__link" href="/appeals-service/personal-list">Assigned to me</a>'
			);
			expect(element.innerHTML).toContain(
				'<a class="govuk-header__link" href="/appeals-service/all-cases">All cases</a>'
			);
			expect(element.innerHTML).toContain(
				'<a class="govuk-header__link" href="/auth/signout">Sign out</a>'
			);
		});

		it('should render the received appeal details for a valid appealId with single linked/other appeals', async () => {
			const appealId = '2';

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealData,
					appealId,
					linkedAppeals: [
						{
							appealId: 1,
							appealReference: 'APP/Q9999/D/21/725284'
						}
					],
					otherAppeals: [
						{
							appealId: 3,
							appealReference: 'APP/Q9999/D/21/765413'
						}
					]
				});
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Linked appeals</dt><dd class="govuk-summary-list__value"><ul class="govuk-list govuk-list--bullet"><li><a href="/appeals-service/appeal-details/1" class="govuk-link" data-cy="linked-appeal-725284" aria-label="Appeal 7 2 5 2 8 4">725284</a> (Child)</li></ul>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Related appeals</dt><dd class="govuk-summary-list__value"><ul class="govuk-list govuk-list--bullet"><li><a href="/appeals-service/appeal-details/3" class="govuk-link" data-cy="related-appeal-765413" aria-label="Appeal 7 6 5 4 1 3">765413</a></li></ul>'
			);
		});

		it('should render the received appeal details for a valid appealId with multiple linked/other appeals', async () => {
			const appealId = '3';

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealData,
					appealId,
					linkedAppeals: [
						{
							appealId: 4,
							appealReference: 'APP/Q9999/D/21/725284'
						},
						{
							appealId: 5,
							appealReference: 'APP/Q9999/D/21/725285'
						}
					],
					otherAppeals: [
						{
							appealId: 6,
							appealReference: 'APP/Q9999/D/21/765413'
						},
						{
							appealId: 7,
							appealReference: 'APP/Q9999/D/21/765414'
						}
					]
				});
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Linked appeals</dt><dd class="govuk-summary-list__value"><ul class="govuk-list govuk-list--bullet"><li><a href="/appeals-service/appeal-details/4" class="govuk-link" data-cy="linked-appeal-725284" aria-label="Appeal 7 2 5 2 8 4">725284</a> (Child)</li><li><a href="/appeals-service/appeal-details/5" class="govuk-link" data-cy="linked-appeal-725285" aria-label="Appeal 7 2 5 2 8 5">725285</a> (Child)</li></ul>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Related appeals</dt><dd class="govuk-summary-list__value"><ul class="govuk-list govuk-list--bullet"><li><a href="/appeals-service/appeal-details/6" class="govuk-link" data-cy="related-appeal-765413" aria-label="Appeal 7 6 5 4 1 3">765413</a></li><li><a href="/appeals-service/appeal-details/7" class="govuk-link" data-cy="related-appeal-765414" aria-label="Appeal 7 6 5 4 1 4">765414</a></li></ul>'
			);
		});

		it('should render the received appeal details for a valid appealId without start date', async () => {
			const appealId = '2';

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, startedAt: null });
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Case details</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(
				'Valid date</dt><dd class="govuk-summary-list__value"> 23 May 2023</dd>'
			);
		});

		it('should render a page not found when the appealId is not valid/does not exist', async () => {
			const appealIdThatDoesNotExist = 999;

			nock('http://test/').get(`/appeals/${appealIdThatDoesNotExist}`).reply(404);
			nock('http://test/')
				.get(`/appeals/${appealIdThatDoesNotExist}/case-notes`)
				.reply(200, caseNotes);
			const response = await request.get(`${baseUrl}/${appealIdThatDoesNotExist}`);

			expect(response.statusCode).toBe(404);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Page not found</h1>');
		});

		it('should render an Issue a decision notification banner with action link to issue decision flow when the appealStatus is ready for final review', async () => {
			const appealId = '2';

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealStatus: 'issue_determination' });
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: '.govuk-notification-banner'
			}).innerHTML;
			expect(notificationBannerElementHTML).toContain('Important</h3>');
			expect(notificationBannerElementHTML).toContain('Ready for decision</p>');
			expect(notificationBannerElementHTML).toContain(
				`href="/appeals-service/appeal-details/1/issue-decision/decision?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}">Issue decision</a>`
			);
		});

		it('should render a Decision inset panel when the appealStatus is complete', async () => {
			const appealId = '2';

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealStatus: 'complete' });
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const insetTextElementHTML = parseHtml(response.text, {
				rootElement: '.govuk-inset-text'
			}).innerHTML;
			expect(insetTextElementHTML).toContain('<p>Appeal completed:');
			expect(insetTextElementHTML).toContain('<p>Decision:');
			expect(insetTextElementHTML).toContain(
				'<p><span class="govuk-body">View decision letter</span>'
			);
		});

		it('should render the appellant case status as "Incomplete" if the appellant case validation status is incomplete, and the due date is in the future', async () => {
			const appealId = '2';

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealData,
					appealStatus: 'validation',
					documentationSummary: {
						appellantCase: {
							status: 'incomplete',
							dueDate: '2099-02-01T10:27:06.626Z'
						}
					}
				});
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			const response = await request.get(`${baseUrl}/${appealId}`);

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(
				'Appeal</th><td class="govuk-table__cell">Incomplete</td>'
			);
		});

		it('should render the appellant case status as "Incomplete" if the appellant case validation status is incomplete, and the due date is today', async () => {
			// doNotFakes here stop nock from timing out, by stopping jest from freezing time
			jest
				.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
				.setSystemTime(new Date('2024-02-15'));
			const appealId = '2';
			const today = new Date();

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealData,
					appealStatus: 'validation',
					documentationSummary: {
						appellantCase: {
							status: 'incomplete',
							dueDate: today.toISOString()
						}
					}
				});
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			const response = await request.get(`${baseUrl}/${appealId}`);

			jest.useRealTimers();

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(
				'Appeal</th><td class="govuk-table__cell">Incomplete</td>'
			);
		});

		it('should render an action link to the add linked appeal page in the linked appeals row, if there are no linked appeals', async () => {
			nock.cleanAll();
			nock('http://test/').get(`/appeals/${appealData.appealId}`).reply(200, appealData).persist();
			nock('http://test/').get(`/appeals/${appealData.appealId}/case-notes`).reply(200, caseNotes);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
				.reply(200, appellantFinalCommentsAwaitingReview);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
				.reply(200, lpaFinalCommentsAwaitingReview);
			const response = await request.get(`${baseUrl}/${appealData.appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const linkedAppealsRowElement = parseHtml(response.text, {
				rootElement: '.appeal-linked-appeals',
				skipPrettyPrint: true
			});
			expect(linkedAppealsRowElement.innerHTML).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/linked-appeals/add"'
			);
		});

		it('should render action links to the manage linked appeals page and the add linked appeal page in the linked appeals row, if there are linked appeals', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}`)
				.reply(200, {
					...appealData,
					linkedAppeals
				});
			nock('http://test/').get(`/appeals/${appealData.appealId}/case-notes`).reply(200, caseNotes);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
				.reply(200, appellantFinalCommentsAwaitingReview);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
				.reply(200, lpaFinalCommentsAwaitingReview);

			const response = await request.get(`${baseUrl}/${appealData.appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const linkedAppealsRowElement = parseHtml(response.text, {
				rootElement: '.appeal-linked-appeals',
				skipPrettyPrint: true
			});

			expect(linkedAppealsRowElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/1/linked-appeals/manage" data-cy="manage-linked-appeals">Manage<span class="govuk-visually-hidden"> Linked appeals</span></a>'
			);
			expect(linkedAppealsRowElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/1/linked-appeals/add" data-cy="add-linked-appeal">Add<span class="govuk-visually-hidden"> Linked appeals</span></a>'
			);
		});

		it('should not render action links to the manage linked appeals page or the add linked appeal page in the linked appeals row, if the appeal is linked as a child of an external lead appeal', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}`)
				.reply(200, {
					...appealData,
					linkedAppeals: linkedAppealsWithExternalLead
				});
			nock('http://test/').get(`/appeals/${appealData.appealId}/case-notes`).reply(200, caseNotes);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
				.reply(200, appellantFinalCommentsAwaitingReview);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
				.reply(200, lpaFinalCommentsAwaitingReview);

			const response = await request.get(`${baseUrl}/${appealData.appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.appeal-linked-appeals',
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain('Linked appeals</dt>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'href="/appeals-service/appeal-details/1/linked-appeals/add"'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'href="/appeals-service/appeal-details/1/linked-appeals/manage"'
			);
		});

		it('should render the case reference for each linked appeal in the linked appeals row, with each internal linked appeal item linking to the respective case details page, if there are linked appeals', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}`)
				.reply(200, {
					...appealData,
					linkedAppeals
				});
			nock('http://test/').get(`/appeals/${appealData.appealId}/case-notes`).reply(200, caseNotes);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
				.reply(200, appellantFinalCommentsAwaitingReview);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
				.reply(200, lpaFinalCommentsAwaitingReview);

			const response = await request.get(`${baseUrl}/${appealData.appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const linkedAppealsRowElement = parseHtml(response.text, {
				rootElement: '.appeal-linked-appeals',
				skipPrettyPrint: true
			});

			expect(linkedAppealsRowElement.innerHTML).toContain(
				'<a href="/appeals-service/appeal-details/5449"'
			);
			expect(linkedAppealsRowElement.innerHTML).toContain(
				'aria-label="Appeal 7 8 4 7 0 6">784706</a>'
			);
			expect(linkedAppealsRowElement.innerHTML).toContain(
				'<span class="govuk-body">87326527</span>'
			);
			expect(linkedAppealsRowElement.innerHTML).toContain(
				'<a href="/appeals-service/appeal-details/5464"'
			);
			expect(linkedAppealsRowElement.innerHTML).toContain(
				'aria-label="Appeal 1 4 0 0 7 9">140079</a>'
			);
			expect(linkedAppealsRowElement.innerHTML).toContain(
				'<a href="/appeals-service/appeal-details/5451"'
			);
			expect(linkedAppealsRowElement.innerHTML).toContain(
				'aria-label="Appeal 7 2 1 0 8 6">721086</a>'
			);
		});

		it('should render the lead or child status after the case reference link of each linked appeal in the linked appeals row, if there are linked appeals', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}`)
				.reply(200, {
					...appealData,
					linkedAppeals
				});
			nock('http://test/').get(`/appeals/${appealData.appealId}/case-notes`).reply(200, caseNotes);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
				.reply(200, appellantFinalCommentsAwaitingReview);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
				.reply(200, lpaFinalCommentsAwaitingReview);

			const response = await request.get(`${baseUrl}/${appealData.appealId}`);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const linkedAppealsRowElement = parseHtml(response.text, {
				rootElement: '.appeal-linked-appeals',
				skipPrettyPrint: true
			});

			expect(linkedAppealsRowElement.innerHTML).toContain('(Child)</li>');
			expect(linkedAppealsRowElement.innerHTML).toContain('(Lead)</li>');
		});

		it('should render a lead tag next to the appeal status tag if the appeal is a parent', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}`)
				.reply(200, {
					...appealData,
					isParentAppeal: true,
					isChildAppeal: false,
					linkedAppeals: linkedAppeals.filter(
						(linkedAppeal) => linkedAppeal.isParentAppeal === false
					)
				});
			nock('http://test/').get(`/appeals/${appealData.appealId}/case-notes`).reply(200, caseNotes);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
				.reply(200, appellantFinalCommentsAwaitingReview);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
				.reply(200, lpaFinalCommentsAwaitingReview);

			const response = await request.get(`${baseUrl}/${appealData.appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Lead</strong>');
		});

		it('should render a child tag next to the appeal status tag if the appeal is a child', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}`)
				.reply(200, {
					...appealData,
					isParentAppeal: false,
					isChildAppeal: true,
					linkedAppeals: linkedAppeals.filter(
						(linkedAppeal) => linkedAppeal.isParentAppeal === true
					)
				})
				.persist();
			nock('http://test/').get(`/appeals/${appealData.appealId}/case-notes`).reply(200, caseNotes);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
				.reply(200, appellantFinalCommentsAwaitingReview);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
				.reply(200, lpaFinalCommentsAwaitingReview);

			const response = await request.get(`${baseUrl}/${appealData.appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Child</strong>');
		});

		it('should render a "Appeal valid" notification banner with a link to start case when status is "READY_TO_START"', async () => {
			const appealId = 2;
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId, appealStatus: 'ready_to_start' });
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			const response = await request.get(`${baseUrl}/${appealId}`);

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text, { rootElement: '.govuk-notification-banner' });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Important</h3>');
			expect(element.innerHTML).toContain('Appeal valid</p>');
			expect(element.innerHTML).toContain(
				`href="/appeals-service/appeal-details/2/start-case/add?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}">Start case</a>`
			);
		});

		describe('"Progress case" important banners', () => {
			const appealId = 1;
			const appealStatus = 'final_comments';
			const testCases = [
				{
					conditionName: 'both Appellant and LPA Final Comments are valid',
					appealData: {
						...appealData,
						appealId,
						appealStatus,
						appealTimetable: {
							finalCommentsDueDate: '2024-09-24T22:59:00.000Z'
						},
						documentationSummary: {
							lpaFinalComments: {
								representationStatus: 'valid'
							},
							appellantFinalComments: {
								representationStatus: 'valid'
							}
						}
					},
					bannerText: 'Share final comments'
				},
				{
					conditionName: 'Appellant Final Comments are valid (but not LPA)',
					appealData: {
						...appealData,
						appealId,
						appealStatus,
						appealTimetable: {
							finalCommentsDueDate: '2024-09-24T22:59:00.000Z'
						},
						documentationSummary: {
							lpaFinalComments: {
								representationStatus: null
							},
							appellantFinalComments: {
								representationStatus: 'valid'
							}
						}
					},
					bannerText: 'Share final comments'
				},
				{
					conditionName: 'LPA Final Comments are valid (but not Appellant)',
					appealData: {
						...appealData,
						appealId,
						appealStatus,
						appealTimetable: {
							finalCommentsDueDate: '2024-09-24T22:59:00.000Z'
						},
						documentationSummary: {
							lpaFinalComments: {
								representationStatus: 'valid'
							},
							appellantFinalComments: {
								representationStatus: null
							}
						}
					},
					bannerText: 'Share final comments'
				},
				{
					conditionName: 'both Appellant and LPA Final Comments are absent or invalid',
					appealData: {
						...appealData,
						appealId,
						appealStatus,
						appealTimetable: {
							finalCommentsDueDate: '2024-09-24T22:59:00.000Z'
						},
						documentationSummary: {
							lpaFinalComments: {
								representationStatus: null
							},
							appellantFinalComments: {
								representationStatus: null
							}
						}
					},
					bannerText: 'Progress case'
				}
			];

			beforeEach(() => {
				nock.cleanAll();
			});

			for (const testCase of testCases) {
				it(`should render a "${testCase.bannerText}" important banner with the link to progress case from final comments with the expected content when Final Comments Due Date has passed and ${testCase.conditionName}.`, async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...testCase.appealData
						})
						.persist();
					nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
					nock('http://test/')
						.get(`/appeals/${appealId}/reps/count?status=awaiting_review`)
						.reply(200, {
							statement: 0,
							comment: 0,
							lpa_final_comment: 1,
							appellant_final_comment: 1
						});

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);
					const element = parseHtml(response.text, { rootElement: '.govuk-notification-banner' });

					expect(element.innerHTML).toMatchSnapshot();
					expect(element.innerHTML).toContain('Important</h3>');
					expect(element.innerHTML).toContain(
						`href="/appeals-service/appeal-details/1/share?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}"`
					);
					expect(element.innerHTML).toContain(`${testCase.bannerText}</a>`);
				});
			}
		});

		describe('Documentation', () => {
			describe('LPA Questionnaire', () => {
				const appealId = 3;

				beforeEach(() => {
					nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
					nock('http://test/')
						.get(`/appeals/${appealId}/reps/count?status=awaiting_review`)
						.reply(200, {
							statement: 0,
							comment: 0,
							lpa_final_comment: 0,
							appellant_final_comment: 0
						});
				});

				it('should render an "LPA Questionnaire" row with a status of "Incomplete" if the LPA questionnaire status is Incomplete and the due date has not yet passed', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							appealId,
							appealTimetable: {
								...appealDataFullPlanning.appealTimetable,
								lpaQuestionnaireDueDate: '3000-01-15T00:00:00.000Z'
							},
							documentationSummary: {
								...appealDataFullPlanning.documentationSummary,
								lpaQuestionnaire: {
									...appealDataFullPlanning.documentationSummary.lpaQuestionnaire,
									status: 'Incomplete'
								}
							}
						});

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

					expect(unprettifiedHTML).toContain('Documentation</th>');
					expect(unprettifiedHTML).toContain(
						'LPA questionnaire</th><td class="govuk-table__cell">Incomplete</td>'
					);
				});

				it('should render an "LPA Questionnaire" row with a status of "Overdue" if the LPA questionnaire status is Incomplete and the due date has passed', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							appealId,
							documentationSummary: {
								...appealDataFullPlanning.documentationSummary,
								lpaQuestionnaire: {
									...appealDataFullPlanning.documentationSummary.lpaQuestionnaire,
									status: 'Incomplete',
									dueDate: '2025-01-15T00:00:00.000Z'
								}
							}
						});

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

					expect(unprettifiedHTML).toContain('Documentation</th>');
					expect(unprettifiedHTML).toContain(
						'LPA questionnaire</th><td class="govuk-table__cell">Overdue</td>'
					);
				});
			});

			describe('Final comments', () => {
				const appealId = 3;
				const testCases = [
					{
						name: 'appellant',
						rowLabel: 'Appellant final comments',
						documentationSummaryKey: 'appellantFinalComments',
						reviewPageRoute: 'final-comments/appellant',
						cyAttribute: 'review-appellant-final-comments',
						viewCyAttribute: 'view-appellant-final-comments',
						actionLinkHiddenText: 'appellant final comments'
					},
					{
						name: 'LPA',
						rowLabel: 'LPA final comments',
						documentationSummaryKey: 'lpaFinalComments',
						reviewPageRoute: 'final-comments/lpa',
						cyAttribute: 'review-lpa-final-comments',
						viewCyAttribute: 'view-lpa-final-comments',
						actionLinkHiddenText: 'LPA final comments'
					}
				];

				beforeEach(() => {
					nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
					nock('http://test/')
						.get(`/appeals/${appealId}/reps/count?status=awaiting_review`)
						.reply(200, {
							statement: 0,
							comment: 0,
							lpa_final_comment: 0,
							appellant_final_comment: 0
						});
				});

				for (const testCase of testCases) {
					it(`should not render an "${testCase.rowLabel}" row, if the appeal type is "householder" (HAS)`, async () => {
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealData,
								appealId
							});

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.statusCode).toBe(200);

						const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

						expect(unprettifiedHTML).toContain('Documentation</th>');
						expect(unprettifiedHTML).not.toContain(`${testCase.rowLabel}</th>`);
					});

					it(`should render an "${testCase.rowLabel}" row with a status of "Not received" and nothing in the "Received" column, and no action link, if the appeal type is "planning appeal", and the appeal does not have ${testCase.name} final comments awaiting review`, async () => {
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealDataFullPlanning,
								appealId,
								documentationSummary: {
									...appealDataFullPlanning.documentationSummary,
									[testCase.documentationSummaryKey]: {
										status: 'not_received',
										receivedAt: null,
										representationStatus: null
									}
								}
							});

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.statusCode).toBe(200);

						const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

						expect(unprettifiedHTML).toContain('Documentation</th>');
						expect(unprettifiedHTML).toContain(
							`${testCase.rowLabel}</th><td class="govuk-table__cell">No final comments</td><td class="govuk-table__cell">Due by 12 October 2023</td>`
						);
					});

					it(`should render an "${testCase.rowLabel}" row with a status of "Ready to review", and the expected date in the "Received" column, and a "Review" action link with the expected URL, if the appeal type is "planning appeal", and the appeal has ${testCase.name} final comments awaiting review`, async () => {
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealDataFullPlanning,
								appealId,
								documentationSummary: {
									...appealDataFullPlanning.documentationSummary,
									[testCase.documentationSummaryKey]: {
										status: 'received',
										receivedAt: '2024-12-17T17:36:19.631Z',
										representationStatus: 'awaiting_review'
									}
								}
							});

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.statusCode).toBe(200);

						const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

						expect(unprettifiedHTML).toContain('Documentation</th>');
						expect(unprettifiedHTML).toContain(
							`${testCase.rowLabel}</th><td class="govuk-table__cell">Ready to review</td><td class="govuk-table__cell">Due by 12 October 2023</td><td class="govuk-table__cell govuk-!-text-align-right"><a href="/appeals-service/appeal-details/${appealId}/${testCase.reviewPageRoute}?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}" data-cy="${testCase.cyAttribute}" class="govuk-link">Review<span class="govuk-visually-hidden"> ${testCase.actionLinkHiddenText}</span></a></td>`
						);
					});

					it(`should render an "${testCase.rowLabel}" row with a status of "Accepted", and the expected date in the "Received" column, and a "View" action link with the expected URL, if the appeal type is "planning appeal", and the appeal has valid/accepted ${testCase.name} final comments`, async () => {
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealDataFullPlanning,
								appealId,
								documentationSummary: {
									...appealDataFullPlanning.documentationSummary,
									[testCase.documentationSummaryKey]: {
										status: 'received',
										receivedAt: '2024-12-17T17:36:19.631Z',
										representationStatus: 'valid'
									}
								}
							});

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.statusCode).toBe(200);

						const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

						expect(unprettifiedHTML).toContain('Documentation</th>');
						expect(unprettifiedHTML).toContain(
							`${testCase.rowLabel}</th><td class="govuk-table__cell">Accepted</td><td class="govuk-table__cell">17 December 2024</td><td class="govuk-table__cell govuk-!-text-align-right"><a href="/appeals-service/appeal-details/${appealId}/${testCase.reviewPageRoute}?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}" data-cy="${testCase.viewCyAttribute}" class="govuk-link">View<span class="govuk-visually-hidden"> ${testCase.actionLinkHiddenText}</span></a></td>`
						);
					});

					it(`should render an "${testCase.rowLabel}" row with a status of "Rejected", and the expected date in the "Received" column, and a "View" action link with the expected URL, if the appeal type is "planning appeal", and the appeal has invalid ${testCase.name} final comments`, async () => {
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealDataFullPlanning,
								appealId,
								documentationSummary: {
									...appealDataFullPlanning.documentationSummary,
									[testCase.documentationSummaryKey]: {
										status: 'received',
										receivedAt: '2024-12-17T17:36:19.631Z',
										representationStatus: 'invalid'
									}
								}
							});

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.statusCode).toBe(200);

						const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

						expect(unprettifiedHTML).toContain('Documentation</th>');
						expect(unprettifiedHTML).toContain(
							`${testCase.rowLabel}</th><td class="govuk-table__cell">Rejected</td><td class="govuk-table__cell">17 December 2024</td><td class="govuk-table__cell govuk-!-text-align-right"><a href="/appeals-service/appeal-details/${appealId}/${testCase.reviewPageRoute}?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}" data-cy="${testCase.viewCyAttribute}" class="govuk-link">View<span class="govuk-visually-hidden"> ${testCase.actionLinkHiddenText}</span></a></td>`
						);
					});
				}
			});
		});

		describe('Timetable', () => {
			const appealId = 3;
			beforeEach(() => {
				nock.cleanAll();
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealId}/reps/count?status=awaiting_review`)
					.reply(200, {
						statement: 0,
						comment: 0,
						lpa_final_comment: 0,
						appellant_final_comment: 0
					});
			});

			describe('Valid date', () => {
				beforeEach(() => {
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
						.reply(200, { items: [] });
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
						.reply(200, { items: [] });
				});

				it('should render a "Timetable" with only a Valid date row with no date and no action link', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							validAt: null,
							startedAt: null,
							appealId
						});
					const response = await request.get(`${baseUrl}/${appealId}`);
					expect(response.statusCode).toBe(200);

					const validDateRow = parseHtml(response.text, {
						rootElement: `.appeal-valid-date`,
						skipPrettyPrint: true
					}).innerHTML;

					expect(validDateRow).toContain(`<dt class="govuk-summary-list__key"> Valid date</dt>`);

					expect(validDateRow).toContain(
						'<dd class="govuk-summary-list__value"> Not validated</dd>'
					);

					expect(validDateRow).toContain('data-cy="-valid-date"><span');

					const caseTimeTable = parseHtml(response.text, {
						rootElement: '.appeal-case-timetable'
					}).innerHTML;

					expect(caseTimeTable).toMatchSnapshot();
				});

				it('should render a "Timetable" with only a Valid date row with no date and a validate action link', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							validAt: null,
							startedAt: null,
							caseOfficer: '2cb7735e-c4cf-410b-b773-5ec4cf110b87',
							appealId
						});
					const response = await request.get(`${baseUrl}/${appealId}`);
					expect(response.statusCode).toBe(200);

					const validDateRow = parseHtml(response.text, {
						rootElement: `.appeal-valid-date`,
						skipPrettyPrint: true
					}).innerHTML;

					expect(validDateRow).toContain(`<dt class="govuk-summary-list__key"> Valid date</dt>`);

					expect(validDateRow).toContain(
						'<dd class="govuk-summary-list__value"> Not validated</dd>'
					);

					expect(validDateRow).toContain('data-cy="validate-valid-date">Validate<span');

					const caseTimeTable = parseHtml(response.text, {
						rootElement: '.appeal-case-timetable'
					}).innerHTML;

					expect(caseTimeTable).toMatchSnapshot();
				});

				it('should render a "Timetable" with a Valid date row and a Start date row including no date and start action link', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							startedAt: null,
							caseOfficer: '2cb7735e-c4cf-410b-b773-5ec4cf110b87',
							appealId
						});
					const response = await request.get(`${baseUrl}/${appealId}`);
					expect(response.statusCode).toBe(200);

					const validDateRow = parseHtml(response.text, {
						rootElement: `.appeal-valid-date`,
						skipPrettyPrint: true
					}).innerHTML;

					expect(validDateRow).toContain(`<dt class="govuk-summary-list__key"> Valid date</dt>`);

					expect(validDateRow).toContain('<dd class="govuk-summary-list__value"> 23 May 2023</dd>');

					expect(validDateRow).toContain('data-cy="change-valid-date">Change<span');

					const startDateRow = parseHtml(response.text, {
						rootElement: `.appeal-start-date`,
						skipPrettyPrint: true
					}).innerHTML;

					expect(startDateRow).toContain(`<dt class="govuk-summary-list__key"> Start date</dt>`);

					expect(startDateRow).toContain('<dd class="govuk-summary-list__value"> Not started</dd>');

					expect(startDateRow).toContain('data-cy="start-start-case-date">Start<span');

					const caseTimeTable = parseHtml(response.text, {
						rootElement: '.appeal-case-timetable'
					}).innerHTML;

					expect(caseTimeTable).toMatchSnapshot();
				});

				it('should render a "Timetable" with all rows with the Start date row including a date and change action link', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							caseOfficer: '2cb7735e-c4cf-410b-b773-5ec4cf110b87',
							appealId
						});
					const response = await request.get(`${baseUrl}/${appealId}`);
					expect(response.statusCode).toBe(200);

					const validDateRow = parseHtml(response.text, {
						rootElement: `.appeal-valid-date`,
						skipPrettyPrint: true
					}).innerHTML;

					expect(validDateRow).toContain(`<dt class="govuk-summary-list__key"> Valid date</dt>`);

					expect(validDateRow).toContain('<dd class="govuk-summary-list__value"> 23 May 2023</dd>');

					expect(validDateRow).toContain('data-cy="-valid-date"><span');

					const startDateRow = parseHtml(response.text, {
						rootElement: `.appeal-start-date`,
						skipPrettyPrint: true
					}).innerHTML;

					expect(startDateRow).toContain(`<dt class="govuk-summary-list__key"> Start date</dt>`);

					expect(startDateRow).toContain('<dd class="govuk-summary-list__value"> 23 May 2023</dd>');

					expect(startDateRow).toContain('data-cy="change-start-case-date">Change<span');

					const caseTimeTable = parseHtml(response.text, {
						rootElement: '.appeal-case-timetable'
					}).innerHTML;

					expect(caseTimeTable).toMatchSnapshot();
				});
				it('should render a "Timetable" with all rows with the Start date without an action link', async () => {
					const testDocumentationSummary = {
						...appealDataFullPlanning.documentationSummary,
						lpaQuestionnaire: { status: 'received' }
					};
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							documentationSummary: testDocumentationSummary,
							caseOfficer: '2cb7735e-c4cf-410b-b773-5ec4cf110b87',
							appealId
						});
					const response = await request.get(`${baseUrl}/${appealId}`);
					expect(response.statusCode).toBe(200);

					const validDateRow = parseHtml(response.text, {
						rootElement: `.appeal-valid-date`,
						skipPrettyPrint: true
					}).innerHTML;

					expect(validDateRow).toContain(`<dt class="govuk-summary-list__key"> Valid date</dt>`);

					expect(validDateRow).toContain('<dd class="govuk-summary-list__value"> 23 May 2023</dd>');

					expect(validDateRow).toContain('data-cy="-valid-date"><span');

					const startDateRow = parseHtml(response.text, {
						rootElement: `.appeal-start-date`,
						skipPrettyPrint: true
					}).innerHTML;

					expect(startDateRow).toContain(`<dt class="govuk-summary-list__key"> Start date</dt>`);

					expect(startDateRow).toContain('<dd class="govuk-summary-list__value"> 23 May 2023</dd>');

					expect(startDateRow).toContain('data-cy="-start-case-date"><span');

					expect(response.text).toContain(`appeal-lpa-questionnaire-due-date`);

					const caseTimeTable = parseHtml(response.text, {
						rootElement: '.appeal-case-timetable'
					}).innerHTML;

					expect(caseTimeTable).toMatchSnapshot();
				});
			});

			describe('Final comments', () => {
				beforeEach(() => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							appealId,
							appealTimetable: {
								finalCommentsDueDate: '2025-01-20T23:59:00.000Z'
							}
						});
				});

				it(`should render an "Final comments due" row with the expected label, final comments due date, and a "Change" action link with the expected URL, if there are final comments awaiting review`, async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
						.reply(200, appellantFinalCommentsAwaitingReview);
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
						.reply(200, lpaFinalCommentsAwaitingReview);

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const unprettifiedHTML = parseHtml(response.text, {
						rootElement: `.appeal-final-comments-due-date`,
						skipPrettyPrint: true
					}).innerHTML;

					expect(unprettifiedHTML).toContain(
						`<dt class="govuk-summary-list__key"> Final comments due</dt>`
					);
					expect(unprettifiedHTML).toContain(
						'<dd class="govuk-summary-list__value"> 20 January 2025</dd>'
					);
					expect(unprettifiedHTML).toContain(
						`href="/appeals-service/appeal-details/${appealId}/appeal-timetables/final-comments" data-cy="change-final-comments-due-date">Change<span class="govuk-visually-hidden"> Final comments due</span></a>`
					);
				});

				it(`should render an "Final comments due" row with the expected label, final comments due date, and no "Change" action link, if there are valid/accepted final comments`, async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
						.reply(200, {
							...appellantFinalCommentsAwaitingReview,
							items: [
								{
									...appellantFinalCommentsAwaitingReview.items[0],
									status: 'valid'
								}
							]
						});
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
						.reply(200, {
							...lpaFinalCommentsAwaitingReview,
							items: [
								{
									...lpaFinalCommentsAwaitingReview.items[0],
									status: 'valid'
								}
							]
						});

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const unprettifiedHTML = parseHtml(response.text, {
						rootElement: `.appeal-final-comments-due-date`,
						skipPrettyPrint: true
					}).innerHTML;

					expect(unprettifiedHTML).toContain(
						`<dt class="govuk-summary-list__key"> Final comments due</dt>`
					);
					expect(unprettifiedHTML).toContain(
						'<dd class="govuk-summary-list__value"> 20 January 2025</dd>'
					);
				});
			});
		});

		describe('Hearing', () => {
			const appealId = 3;

			beforeEach(() => {
				nock.cleanAll();
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);
			});

			it('should not render the Hearing accordion for HAS cases', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Case details</h1>');
				expect(unprettifiedHTML).not.toContain('<div id="case-details-hearing-section">');
				expect(unprettifiedHTML).not.toContain('Hearing</span></h2>');
			});

			for (const procedureType of [APPEAL_CASE_PROCEDURE.WRITTEN, APPEAL_CASE_PROCEDURE.INQUIRY]) {
				it(`should not render the Hearing accordion for s78 cases with a procedureType of ${procedureType}`, async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							appealId,
							procedureType
						});

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

					expect(unprettifiedHTML).toContain('Case details</h1>');
					expect(unprettifiedHTML).not.toContain('<div id="case-details-hearing-section">');
					expect(unprettifiedHTML).not.toContain('Hearing</span></h2>');
				});
			}

			it('should render the Hearing accordion with the expected content for s78 cases with a procedureType of "Hearing"', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealDataFullPlanning,
						appealId,
						procedureType: APPEAL_CASE_PROCEDURE.HEARING
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Case details</h1>');
				expect(unprettifiedHTML).toContain('<div id="case-details-hearing-section">');
				expect(unprettifiedHTML).toContain('Hearing</span></h2>');

				const hearingSectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-hearing-section'
				}).innerHTML;

				expect(hearingSectionHtml).toMatchSnapshot();

				const unprettifiedHearingSectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-hearing-section',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedHearingSectionHtml).toContain(
					`href="/appeals-service/appeal-details/${appealId}/hearing/setup" role="button" draggable="false" class="govuk-button" data-module="govuk-button"> Set up hearing</a>`
				);
				expect(unprettifiedHearingSectionHtml).toContain('Hearing estimates</h3>');
				expect(unprettifiedHearingSectionHtml).toContain(
					`href="/appeals-service/appeal-details/${appealId}/hearing/add-estimates">Add hearing estimates</a>`
				);
			});
		});

		describe('Costs', () => {
			it('should render a "Appellant costs application" row in the costs accordion', async () => {
				const appealId = 2;

				nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData);
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

				const response = await request.get(`${baseUrl}/${appealId}`);

				const headerHtml = parseHtml(response.text, {
					rootElement: '.appeal-costs-appellant-application-documentation',
					skipPrettyPrint: true
				}).innerHTML;

				expect(headerHtml).toMatchSnapshot();
				expect(headerHtml).toContain('Appellant costs application</th>');

				const statusHtml = parseHtml(response.text, {
					rootElement: '.appeal-costs-appellant-application-status',
					skipPrettyPrint: true
				}).innerHTML;

				expect(statusHtml).toMatchSnapshot();
				expect(statusHtml).toContain('No documents available</td>');
			});

			it('should render a "Costs decision" row in the costs accordion', async () => {
				const appealId = 2;

				nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData);
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

				const response = await request.get(`${baseUrl}/${appealId}`);

				const headerHtml = parseHtml(response.text, {
					rootElement: '.appeal-costs-decision-documentation',
					skipPrettyPrint: true
				}).innerHTML;

				expect(headerHtml).toMatchSnapshot();
				expect(headerHtml).toContain('Costs decision</th>');

				const statusHtml = parseHtml(response.text, {
					rootElement: '.appeal-costs-decision-status',
					skipPrettyPrint: true
				}).innerHTML;

				expect(statusHtml).toMatchSnapshot();
				expect(statusHtml).toContain('No documents available</td>');
			});
		});

		describe('Appeal decision', () => {
			it('should render a row in the case overview accordion with with "Issue" action link to the issue decision start page, if the appeal status is "issue_determination"', async () => {
				const appealId = 2;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'issue_determination',
						decision: {
							...appealData.decision,
							outcome: null
						}
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				const rowHtml = parseHtml(response.text, {
					rootElement: '.govuk-summary-list__row.appeal-decision',
					skipPrettyPrint: true
				}).innerHTML;

				expect(rowHtml).toMatchSnapshot();
				expect(rowHtml).toContain('Decision</dt>');
				expect(rowHtml).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/2/issue-decision/decision?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}" data-cy="issue-decision">Issue<span class="govuk-visually-hidden"> Decision</span></a>`
				);
			});

			const appealStatusesWithoutIssueDetermination = [
				'assign_case_officer',
				'awaiting_transfer',
				'closed',
				'complete',
				'evidence',
				'final_comments',
				'invalid',
				'lpa_questionnaire',
				'ready_to_start',
				'statements',
				'transferred',
				'validation',
				'withdrawn',
				'witnesses'
			];

			for (const appealStatus of appealStatusesWithoutIssueDetermination) {
				it(`should render a row in the case overview accordion with no action link, if the appeal status is anything other than "issue_determination" (${appealStatus})`, async () => {
					const appealId = 2;

					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealData,
							appealId,
							appealStatus,
							decision: {
								...appealData.decision,
								outcome: null
							}
						});
					nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
					const response = await request.get(`${baseUrl}/${appealId}`);

					const rowHtml = parseHtml(response.text, {
						rootElement: '.govuk-summary-list__row.appeal-decision',
						skipPrettyPrint: true
					}).innerHTML;

					expect(rowHtml).toMatchSnapshot();
					expect(rowHtml).toContain('Decision</dt>');
					expect(rowHtml).not.toContain(
						'href="/appeals-service/appeal-details/2/issue-decision/decision"'
					);
				});
			}

			it('should render a row in the case documentation accordion with "Appeal decision" in the Documentation (label) column', async () => {
				const response = await request.get(`${baseUrl}/1`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-documentation',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain('Decision</th>');
			});

			it('should render a row in the case documentation accordion with "Awaiting decision" in the Status column, if a decision has not yet been issued', async () => {
				const response = await request.get(`${baseUrl}/1`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-status',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain('Awaiting decision</td>');
			});

			it('should render a row in the case documentation accordion with "Sent" in the Status column, if a decision has been issued', async () => {
				const appealId = 2;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'complete',
						decision: {
							documentId: '448efec9-43d4-406a-92b7-1aecbdcd5e87',
							folderId: 72,
							letterDate: '2024-06-26T00:00:00.000Z',
							outcome: 'allowed',
							virusCheckStatus: 'not_scanned'
						}
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-status',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain('Issued</td>');
			});

			it('should render a row in the case documentation accordion with "Not applicable" in the Due date column', async () => {
				const appealId = 2;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						decision: {
							letterDate: null
						}
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-due-date',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain(
					'<td class="govuk-table__cell appeal-decision-due-date">Not applicable</td>'
				);
			});

			it('should render a row in the case documentation accordion with "Issue" link to the issue decision start page in the Actions column, if the appeal status is "issue_determination"', async () => {
				const appealId = 2;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'issue_determination'
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-actions',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain(
					`href="/appeals-service/appeal-details/2/issue-decision/decision?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}">Issue<span class="govuk-visually-hidden"> decision</span></a>`
				);
			});

			it('should render a row in the case documentation accordion with no link in the Actions column, if the appeal status is anything other than "issue_determination", "complete" or "invalid"', async () => {
				const appealId = 2;

				const statuses = [
					'assign_case_officer',
					'validation',
					'ready_to_start',
					'lpa_questionnaire',
					'statement_review',
					'final_comment_review',
					'withdrawn',
					'closed',
					'awaiting_transfer',
					'transferred'
				];

				for (const status of statuses) {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealData,
							appealId,
							appealStatus: status
						});
					nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
						.reply(200, appellantFinalCommentsAwaitingReview);
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
						.reply(200, lpaFinalCommentsAwaitingReview);

					const response = await request.get(`${baseUrl}/${appealId}`);

					const columnHtml = parseHtml(response.text, {
						rootElement: '.appeal-decision-actions',
						skipPrettyPrint: true
					}).innerHTML;

					expect(columnHtml).toMatchSnapshot();
					expect(columnHtml).toContain(
						'<td class="govuk-table__cell govuk-!-text-align-right appeal-decision-actions"></td>'
					);
				}
			});

			it('should render a row in the case documentation accordion with "View" download link to the decision document in the Actions column, if the appeal status is "complete" and the document virus scan is complete and the scan result indicates the document is safe', async () => {
				const appealId = 2;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'complete',
						decision: {
							documentId: '448efec9-43d4-406a-92b7-1aecbdcd5e87',
							folderId: 72,
							letterDate: '2024-06-26T00:00:00.000Z',
							documentName: 'test-document.txt',
							outcome: 'allowed',
							virusCheckStatus: 'scanned'
						}
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-actions',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain(
					`<td class="govuk-table__cell govuk-!-text-align-right appeal-decision-actions"><a class="govuk-link" href="/appeals-service/appeal-details/2/issue-decision/decision?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}">View<span class="govuk-visually-hidden"> decision</span></a></td>`
				);
			});
		});
	});

	it('should not render a back button', async () => {
		const appealId = '2';

		nock('http://test/')
			.get(`/appeals/${appealId}`)
			.reply(200, {
				...appealData,
				appealId
			});
		nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

		const response = await request.get(`${baseUrl}/${appealId}`);
		const element = parseHtml(response.text, { rootElement: 'body' });

		const backButton = element?.querySelector('.govuk-back-link');

		expect(backButton).toBeNull();

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).not.toContain('class="govuk-back-link"');
	});
});
