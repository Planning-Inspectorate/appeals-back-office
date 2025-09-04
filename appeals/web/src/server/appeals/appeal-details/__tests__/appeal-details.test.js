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
	lpaFinalCommentsAwaitingReview,
	folderInfoMainPartyCorrespondence,
	documentFileVersionInfo,
	documentFileInfo
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { dateISOStringToDisplayTime12hr } from '#lib/dates.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { omit } from 'lodash-es';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const {
	app: readOnlyApp,
	installMockApi: installReadOnlyMockApi,
	teardown: teardownReadOnly
} = createTestEnvironment({ groups: ['readonly'] });
const readOnlyRequest = supertest(readOnlyApp);
const baseUrl = '/appeals-service/appeal-details';
const pastDate = '2025-01-06T23:59:00.000Z';
const futureDate = '3000-01-06T23:59:00.000Z';

const linkedAppealsAreAllInternalAndNotALead = linkedAppeals.filter(
	(linkedAppeal) => !linkedAppeal.isParentAppeal && !linkedAppeal.externalSource
);

const appealStatuses = [
	{ appealStatus: 'assign_case_officer', statusPassedEvent: false },
	{ appealStatus: 'awaiting_transfer', statusPassedEvent: false },
	{ appealStatus: 'closed', statusPassedEvent: false },
	{ appealStatus: 'complete', statusPassedEvent: true },
	{ appealStatus: 'evidence', statusPassedEvent: false },
	{ appealStatus: 'final_comments', statusPassedEvent: false },
	{ appealStatus: 'invalid', statusPassedEvent: true },
	{ appealStatus: 'issue_determination', statusPassedEvent: true },
	{ appealStatus: 'lpa_questionnaire', statusPassedEvent: false },
	{ appealStatus: 'ready_to_start', statusPassedEvent: false },
	{ appealStatus: 'statements', statusPassedEvent: false },
	{ appealStatus: 'transferred', statusPassedEvent: false },
	{ appealStatus: 'validation', statusPassedEvent: false },
	{ appealStatus: 'withdrawn', statusPassedEvent: false },
	{ appealStatus: 'witnesses', statusPassedEvent: false }
];

describe('appeal-details', () => {
	beforeEach(() => {
		installMockApi();
		installReadOnlyMockApi();
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

		nock('http://test/')
			.get(/appeals\/\d+\/appellant-cases\/\d+/)
			.reply(200, { planningObligation: { hasObligation: false } });
	});
	afterEach(() => {
		teardown();
		teardownReadOnly();
	});

	describe('GET /:appealId', () => {
		describe('Team section', () => {
			it('should render the case-team section for appeal with team name and email displayed"', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'ready_to_start'
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);
				const element = parseHtml(response.text, { rootElement: '.appeal-case-team' });

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Test Team');
				expect(element.innerHTML).toContain('test@emai.com');
			});

			it('should render the case-team section for appeal with not assigned displayed when no team is assigned"', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'ready_to_start',
						assignedTeam: {}
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);
				const element = parseHtml(response.text, { rootElement: '.appeal-case-team' });

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('<li>Not assigned</li>');
			});
			it('should render the case-team section for appeal with not assigned displayed when only team name exists"', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'ready_to_start',
						assignedTeam: { id: 4, name: 'Just a name', email: null }
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);
				const element = parseHtml(response.text, { rootElement: '.appeal-case-team' });

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Just a name');
			});
		});
		describe('Notification banners', () => {
			const notificationBannerElement = '.govuk-notification-banner';

			describe('Success banners', () => {
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
						`href="/appeals-service/appeal-details/2/assign-case-officer/search-case-officer?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}"`
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
							},
							assignedTeamId: 1,
							assignedTeam: {}
						})
						.persist();

					nock('http://test/').get('/appeals/transferred-appeal/123').reply(200, {
						caseFound: true
					});
					nock('http://test/')
						.post(`/appeals/${appealId}/appeal-transfer-confirmation`)
						.reply(200, { success: true });
					nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

					await request
						.post(`${baseUrl}/${appealId}/change-appeal-type/add-horizon-reference`)
						.send({
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

				it('should render a "Address added" success notification banner when an inspector/3rd party neighbouring site was added', async () => {
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
					nock('http://test/')
						.get(/appeals\/\d+\/appellant-cases\/\d+/)
						.reply(200, { planningObligation: { hasObligation: false } });

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
					expect(notificationBannerElementHTML).toContain('Address added</p>');
				});

				it('should render a "Address updated" success notification banner when an inspector/3rd party neighbouring site was updated', async () => {
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
					nock('http://test/')
						.get(/appeals\/\d+\/appellant-cases\/\d+/)
						.reply(200, { planningObligation: { hasObligation: false } });

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
					expect(notificationBannerElementHTML).toContain('Address updated</p>');
				});

				it('should render a "Address removed" success notification banner when an inspector/3rd party neighbouring site was removed', async () => {
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
					nock('http://test/')
						.get(/appeals\/\d+\/appellant-cases\/\d+/)
						.reply(200, { planningObligation: { hasObligation: false } });

					await request.post(`${baseUrl}/1/neighbouring-sites/remove/site/1`).send({
						'remove-neighbouring-site': 'yes'
					});

					const response = await request.get(`${baseUrl}/${appealData.appealId}`);

					const notificationBannerElementHTML = parseHtml(response.text, {
						rootElement: notificationBannerElement
					}).innerHTML;
					expect(notificationBannerElementHTML).toMatchSnapshot();
					expect(notificationBannerElementHTML).toContain('Success</h3>');
					expect(notificationBannerElementHTML).toContain('Address removed</p>');
				});

				it('should render a "Linked appeal added" success notification banner when the appeal was successfully linked as the lead of a back-office appeal', async () => {
					const appealReference = '1234567';

					nock.cleanAll();
					nock('http://test/')
						.get(`/appeals/linkable-appeal/${appealReference}/linked`)
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
					nock('http://test/')
						.get(/appeals\/\d+\/appellant-cases\/\d+/)
						.reply(200, { planningObligation: { hasObligation: false } });

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
					expect(element.innerHTML).toContain('Linked appeal added');
				});

				it('should render a success notification banner with appropriate content if the appeal was just linked as the lead of a legacy (Horizon) appeal', async () => {
					const appealReference = '1234567';

					nock.cleanAll();
					nock('http://test/')
						.get(`/appeals/linkable-appeal/${appealReference}/linked`)
						.reply(200, linkableAppealSummaryHorizon);
					nock('http://test/')
						.get(`/appeals/${appealData.appealId}`)
						.reply(200, appealData)
						.persist();
					nock('http://test/')
						.post(`/appeals/${appealData.appealId}/link-legacy-appeal`)
						.reply(200, {
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
					nock('http://test/')
						.get(/appeals\/\d+\/appellant-cases\/\d+/)
						.reply(200, { planningObligation: { hasObligation: false } });

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
					expect(notificationBannerElementHTML).toContain('Linked appeal added');
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
					nock('http://test/')
						.get('/appeals/1/appellant-cases/0')
						.reply(200, { planningObligation: { hasObligation: false } })
						.persist();

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
					expect(notificationBanner2ElementHTML).toContain(
						'>Appellant costs application updated</p>'
					);
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
					nock('http://test/')
						.get('/appeals/1/appellant-cases/0')
						.reply(200, { planningObligation: { hasObligation: false } })
						.persist();

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
					expect(notificationBanner2ElementHTML).toContain('LPA costs application updated</p>');
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
					nock('http://test/')
						.get('/appeals/1/appellant-cases/0')
						.reply(200, { planningObligation: { hasObligation: false } })
						.persist();

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

				it('should render a success notification banner when a agent was updated', async () => {
					nock('http://test/').get(`/appeals/1`).reply(200, appealData);
					nock('http://test/').patch(`/appeals/1/service-user`).reply(200, {
						serviceUserId: 1
					});
					nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);
					const validData = {
						firstName: 'Jessica',
						lastName: 'Jones',
						emailAddress: 'jessica.jones@email.com',
						phoneNumber: '+44 7700084402'
					};
					await request.post(`${baseUrl}/1/service-user/change/agent`).send(validData);

					const caseDetailsResponse = await request.get(`${baseUrl}/1`);

					const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
						rootElement: notificationBannerElement
					}).innerHTML;
					expect(notificationBannerElementHTML).toMatchSnapshot();
					expect(notificationBannerElementHTML).toContain('Success</h3>');
					expect(notificationBannerElementHTML).toContain(
						'Agent&#39;s contact details updated</p>'
					);
				});

				it('should render a success notification banner when an appellant was updated', async () => {
					nock('http://test/').get(`/appeals/1`).reply(200, appealData);
					nock('http://test/').patch(`/appeals/1/service-user`).reply(200, {
						serviceUserId: 1
					});
					nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);
					const validData = {
						firstName: 'Jessica',
						lastName: 'Jones',
						emailAddress: 'jessica.jones@email.com',
						phoneNumber: '+44 7700084402'
					};
					await request.post(`${baseUrl}/1/service-user/change/appellant`).send(validData);

					const caseDetailsResponse = await request.get(`${baseUrl}/1`);

					const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
						rootElement: notificationBannerElement
					}).innerHTML;
					expect(notificationBannerElementHTML).toMatchSnapshot();
					expect(notificationBannerElementHTML).toContain('Success</h3>');
					expect(notificationBannerElementHTML).toContain(
						'Appellant&#39;s contact details updated</p>'
					);
				});

				it('should render a success notification banner when the lpa application reference was updated', async () => {
					const appealId = appealData.appealId.toString();
					nock.cleanAll();
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, { ...appealData, lpaQuestionnaireId: undefined })
						.persist();
					nock('http://test/')
						.get(/appeals\/\d+\/appellant-cases\/\d+/)
						.reply(200, { planningObligation: { hasObligation: false } });
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
					expect(notificationBannerElementHTML).toContain(
						'Inspector access (appellant) updated</p>'
					);
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
					await request
						.post(`${baseUrl}/${appealId}/safety-risks/change/appellant`)
						.send(validData);

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

				it('should render a success notification banner when a main party correspondence document was uploaded', async () => {
					nock('http://test/')
						.get('/appeals/1/document-folders/4')
						.reply(200, folderInfoMainPartyCorrespondence)
						.persist();
					nock('http://test/')
						.get('/appeals/document-redaction-statuses')
						.reply(200, documentRedactionStatuses)
						.persist();
					nock('http://test/').post('/appeals/1/documents').reply(200);
					nock('http://test/').get(`/appeals/1/case-notes`).reply(200, caseNotes);
					const addDocumentsResponse = await request
						.post(`${baseUrl}/1/internal-correspondence/main-party/upload-documents/4`)
						.send({
							'upload-info': fileUploadInfo
						});

					expect(addDocumentsResponse.statusCode).toBe(302);

					const postCheckAndConfirmResponse = await request
						.post(`${baseUrl}/1/internal-correspondence/main-party/check-your-answers/4`)
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
					expect(notificationBannerElementHTML).toContain('Main party correspondence added</p>');
				});

				it('should render a success notification banner when a hearing is setup', async () => {
					const appealId = 1;
					const dateValues = {
						'hearing-date-day': '01',
						'hearing-date-month': '02',
						'hearing-date-year': '3025',
						'hearing-time-hour': '12',
						'hearing-time-minute': '00'
					};
					const addressValues = {
						addressLine1: 'Flat 9',
						addressLine2: '123 Gerbil Drive',
						town: 'Blarberton',
						county: 'Slabshire',
						postCode: 'X25 3YZ'
					};
					nock('http://test/')
						.post(`/appeals/${appealId}/hearing`, {
							hearingStartTime: '3025-02-01T12:00:00.000Z',
							address: { ...omit(addressValues, 'postCode'), postcode: addressValues.postCode }
						})
						.reply(201, { hearingId: 1 });

					// set session data with post requests to previous pages
					await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send(dateValues);
					await request
						.post(`${baseUrl}/${appealId}/hearing/setup/address`)
						.send({ addressKnown: 'yes' });
					await request
						.post(`${baseUrl}/${appealId}/hearing/setup/address-details`)
						.send(addressValues);

					const postCheckAndConfirmResponse = await request
						.post(`${baseUrl}/1/hearing/setup/check-details`)
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
					expect(notificationBannerElementHTML).toContain('Hearing set up</p>');
				});

				it('should render a success notification banner when a hearing is changed', async () => {
					const appealId = 1;
					const dateValues = {
						'hearing-date-day': '01',
						'hearing-date-month': '02',
						'hearing-date-year': '3025',
						'hearing-time-hour': '12',
						'hearing-time-minute': '00'
					};
					const addressValues = {
						addressLine1: 'Flat 9',
						addressLine2: '123 Gerbil Drive',
						town: 'Blarberton',
						county: 'Slabshire',
						postCode: 'X25 3YZ'
					};
					nock('http://test/')
						.patch(`/appeals/${appealId}/hearing/0`, {
							hearingStartTime: '3025-02-01T12:00:00.000Z',
							address: { ...omit(addressValues, 'postCode'), postcode: addressValues.postCode }
						})
						.reply(201, { hearingId: 1 });

					// set session data with post requests to previous pages
					await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send(dateValues);
					await request
						.post(`${baseUrl}/${appealId}/hearing/change/address`)
						.send({ addressKnown: 'yes' });
					await request
						.post(`${baseUrl}/${appealId}/hearing/change/address-details`)
						.send(addressValues);

					const postCheckAndConfirmResponse = await request
						.post(`${baseUrl}/1/hearing/change/check-details`)
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
					expect(notificationBannerElementHTML).toContain('Hearing updated</p>');
				});
			});

			describe('Important banners', () => {
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
							siteVisit: undefined,
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

				describe('residential units banner', () => {
					const appealId = 2;
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

					it('should render a "Add number of residential units" important notification banner a link to add residential units when numberOfResidencesNetChange has not been added', async () => {
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealData,
								appealId,
								appealType: 'Planning appeal'
							});
						nock('http://test/')
							.get(/appeals\/\d+\/appellant-cases\/\d+/)
							.reply(200, {
								planningObligation: { hasObligation: false },
								numberOfResidencesNetChange: null
							});

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.statusCode).toBe(200);
						const notificationBannerElementHTML = parseHtml(response.text, {
							rootElement: '.govuk-notification-banner'
						}).innerHTML;
						expect(notificationBannerElementHTML).toMatchSnapshot();
						expect(notificationBannerElementHTML).toContain('Important</h3>');
						expect(notificationBannerElementHTML).toContain(
							`href="/appeals-service/appeal-details/${appealId}/residential-units/new?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}"`
						);
						expect(notificationBannerElementHTML).toContain('data-cy="add-residences-net-change"');
						expect(notificationBannerElementHTML).toContain('Add number of residential units</a>');
					});

					it('should render a "Add number of residential units" important notification banner even when case is complete if numberOfResidencesNetChange has not been added', async () => {
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealData,
								appealId,
								appealType: 'Planning appeal',
								appealStatus: 'complete'
							});
						nock('http://test/')
							.get(/appeals\/\d+\/appellant-cases\/\d+/)
							.reply(200, {
								planningObligation: { hasObligation: false },
								numberOfResidencesNetChange: null
							});

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.statusCode).toBe(200);
						const notificationBannerElementHTML = parseHtml(response.text, {
							rootElement: '.govuk-notification-banner'
						}).innerHTML;
						expect(notificationBannerElementHTML).toMatchSnapshot();
						expect(notificationBannerElementHTML).toContain('Important</h3>');
						expect(notificationBannerElementHTML).toContain(
							`href="/appeals-service/appeal-details/${appealId}/residential-units/new?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}"`
						);
						expect(notificationBannerElementHTML).toContain('data-cy="add-residences-net-change"');
						expect(notificationBannerElementHTML).toContain('Add number of residential units</a>');
					});

					it('should not render a "Add number of residential units" important notification banner when appeal type is not S78', async () => {
						nock.cleanAll();
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealData,
								appealId,
								appealType: 'Householder'
							});
						nock('http://test/')
							.get('/appeals/2/reps?type=appellant_final_comment')
							.reply(200, appellantFinalCommentsAwaitingReview);
						nock('http://test/')
							.get('/appeals/2/reps?type=lpa_final_comment')
							.reply(200, lpaFinalCommentsAwaitingReview);

						nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
						nock('http://test/')
							.get(/appeals\/\d+\/appellant-cases\/\d+/)
							.reply(200, {
								planningObligation: { hasObligation: false },
								numberOfResidencesNetChange: null
							});

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.statusCode).toBe(200);
						expect(response.text).not.toContain('Important</h3>');
						expect(response.text).not.toContain(
							`href="/appeals-service/appeal-details/${appealId}/residential-units/new?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}"`
						);
						expect(response.text).not.toContain('data-cy="add-residences-net-change"');
						expect(response.text).not.toContain('Add number of residential units</a>');
					});

					it('should not render a "Add number of residential units" important notification banner if numberOfResidencesNetChange has been added', async () => {
						nock.cleanAll();
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealData,
								appealId,
								appealType: 'Householder'
							});
						nock('http://test/')
							.get('/appeals/2/reps?type=appellant_final_comment')
							.reply(200, appellantFinalCommentsAwaitingReview);
						nock('http://test/')
							.get('/appeals/2/reps?type=lpa_final_comment')
							.reply(200, lpaFinalCommentsAwaitingReview);

						nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
						nock('http://test/')
							.get(/appeals\/\d+\/appellant-cases\/\d+/)
							.reply(200, {
								planningObligation: { hasObligation: false },
								numberOfResidencesNetChange: 1
							});

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.statusCode).toBe(200);
						expect(response.text).not.toContain('Important</h3>');
						expect(response.text).not.toContain(
							`href="/appeals-service/appeal-details/${appealId}/residential-units/new?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}"`
						);
						expect(response.text).not.toContain('data-cy="add-residences-net-change"');
						expect(response.text).not.toContain('Add number of residential units</a>');
					});

					it('should not render a "Add number of residential units" important notification banner if numberOfResidencesNetChange has been added and set to 0', async () => {
						nock.cleanAll();
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealData,
								appealId,
								appealType: 'Householder'
							});
						nock('http://test/')
							.get('/appeals/2/reps?type=appellant_final_comment')
							.reply(200, appellantFinalCommentsAwaitingReview);
						nock('http://test/')
							.get('/appeals/2/reps?type=lpa_final_comment')
							.reply(200, lpaFinalCommentsAwaitingReview);

						nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
						nock('http://test/')
							.get(/appeals\/\d+\/appellant-cases\/\d+/)
							.reply(200, {
								planningObligation: { hasObligation: false },
								numberOfResidencesNetChange: 0
							});

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.statusCode).toBe(200);
						expect(response.text).not.toContain('Important</h3>');
						expect(response.text).not.toContain(
							`href="/appeals-service/appeal-details/${appealId}/residential-units/new?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}"`
						);
						expect(response.text).not.toContain('data-cy="add-residences-net-change"');
						expect(response.text).not.toContain('Add number of residential units</a>');
					});
				});
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
					nock('http://test/')
						.get(/appeals\/\d+\/appellant-cases\/\d+/)
						.reply(200, { planningObligation: { hasObligation: false } });
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
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } })
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
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } })
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
			it('should not submit and re-render case details with an error if the comment exceeds the character limit', async () => {
				nock.cleanAll();
				const appealId = appealData.appealId.toString();
				const caseNotesResponse = [...caseNotes];
				const comment = 'a'.repeat(501);

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
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } })
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
				expect(pageElements).toContain(
					`Case note must be ${textInputCharacterLimits.caseNoteTextInputLength} characters or less`
				);
				expect(element).toContain('2 case notes');
				expect(submitRequest.isDone()).toBe(false);
			});
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

		describe('Status tags', () => {
			const testCases = [
				{
					appealStatus: 'assign_case_officer',
					statusTagContent: 'Assign case officer',
					statusTagColour: 'green'
				},
				{ appealStatus: 'validation', statusTagContent: 'Validation', statusTagColour: 'green' },
				{
					appealStatus: 'ready_to_start',
					statusTagContent: 'Ready to start',
					statusTagColour: 'green'
				},
				{
					appealStatus: 'lpa_questionnaire',
					statusTagContent: 'LPA questionnaire',
					statusTagColour: 'green'
				},
				{ appealStatus: 'statements', statusTagContent: 'Statements', statusTagColour: 'green' },
				{
					appealStatus: 'final_comments',
					statusTagContent: 'Final comments',
					statusTagColour: 'green'
				},
				{ appealStatus: 'evidence', statusTagContent: 'Evidence', statusTagColour: 'green' },
				{
					appealStatus: 'site_visit_ready_to_set_up',
					statusTagContent: 'Site visit ready to set up',
					statusTagColour: 'green'
				},
				{
					appealStatus: 'awaiting_site_visit',
					statusTagContent: 'Awaiting site visit',
					statusTagColour: 'yellow'
				},
				{
					appealStatus: 'hearing_ready_to_set_up',
					statusTagContent: 'Hearing ready to set up',
					statusTagColour: 'green'
				},
				{
					appealStatus: 'hearing_set_up',
					statusTagContent: 'Hearing set up',
					statusTagColour: 'grey'
				},
				{
					appealStatus: 'hearing_updated',
					statusTagContent: 'Hearing updated',
					statusTagColour: 'grey'
				},
				{
					appealStatus: 'awaiting_hearing',
					statusTagContent: 'Awaiting hearing',
					statusTagColour: 'yellow'
				},
				{
					appealStatus: 'inquiry_ready_to_set_up',
					statusTagContent: 'Inquiry ready to set up',
					statusTagColour: 'green'
				},
				{
					appealStatus: 'awaiting_inquiry',
					statusTagContent: 'Awaiting inquiry',
					statusTagColour: 'yellow'
				},
				{
					appealStatus: 'issue_determination',
					statusTagContent: 'Issue decision',
					statusTagColour: 'green'
				},
				{ appealStatus: 'complete', statusTagContent: 'Complete', statusTagColour: 'blue' },
				{ appealStatus: 'invalid', statusTagContent: 'Invalid', statusTagColour: 'grey' },
				{ appealStatus: 'withdrawn', statusTagContent: 'Withdrawn', statusTagColour: 'grey' },
				{
					appealStatus: 'awaiting_transfer',
					statusTagContent: 'Awaiting transfer',
					statusTagColour: 'green'
				},
				{ appealStatus: 'transferred', statusTagContent: 'Transferred', statusTagColour: 'grey' }
			];

			for (const testCase of testCases) {
				it(`should render a status tag with the content "${testCase.statusTagContent}" and a ${testCase.statusTagColour} modifier class if appeal status is ${testCase.appealStatus}`, async () => {
					const appealId = 2;

					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealData,
							appealId,
							appealStatus: testCase.appealStatus
						});
					nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

					const response = await request.get(`${baseUrl}/${appealId}`);

					const statusTagHtml = parseHtml(response.text, {
						rootElement: '#main-content .govuk-tag',
						skipPrettyPrint: true
					}).innerHTML;

					expect(statusTagHtml).toMatchSnapshot();
					expect(statusTagHtml).toContain(testCase.statusTagContent);
					expect(statusTagHtml).toContain(`govuk-tag govuk-tag--${testCase.statusTagColour}`);
				});
			}
		});

		describe('Linked appeals', () => {
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
					'Linked appeals</dt><dd class="govuk-summary-list__value"><span>No linked appeals</span>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'Linked appeals</dt><dd class="govuk-summary-list__value"><span>No linked appeals</span>'
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

			it('should render an action link to the manage linked appeals page, if there are linked appeals, the status is not past LPA Questionnaire, all the linked appeals are children and internal', async () => {
				nock.cleanAll();
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}`)
					.reply(200, {
						...appealData,
						appealStatus: 'lpa_questionnaire',
						linkedAppeals: linkedAppealsAreAllInternalAndNotALead
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
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } });

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
			});

			it('should render an action link to the add linked appeals page, if the appeal is a lead appeal in a state before STATEMENTS', async () => {
				nock.cleanAll();
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}`)
					.reply(200, {
						...appealData,
						isParentAppeal: true,
						appealStatus: 'lpa_questionnaire',
						linkedAppeals: linkedAppealsAreAllInternalAndNotALead
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
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } });

				const response = await request.get(`${baseUrl}/${appealData.appealId}`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const linkedAppealsRowElement = parseHtml(response.text, {
					rootElement: '.appeal-linked-appeals',
					skipPrettyPrint: true
				});

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
						isParentAppeal: false,
						linkedAppeals: linkedAppealsWithExternalLead
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
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } });

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
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/case-notes`)
					.reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } });

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
					'Linked appeals</dt><dd class="govuk-summary-list__value"><a href="/appeals-service/appeal-details/1" class="govuk-link" data-cy="linked-appeal-725284" aria-label="Appeal 7 2 5 2 8 4">725284</a>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'Related appeals</dt><dd class="govuk-summary-list__value"><ul class="govuk-list govuk-list--bullet"><li><a href="/appeals-service/appeal-details/3" class="govuk-link" data-cy="related-appeal-765413" aria-label="Appeal 7 6 5 4 1 3">765413</a>'
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
					'Linked appeals</dt><dd class="govuk-summary-list__value"><ul class="govuk-list govuk-list--bullet"><li><a href="/appeals-service/appeal-details/4" class="govuk-link" data-cy="linked-appeal-725284" aria-label="Appeal 7 2 5 2 8 4">725284</a></li><li><a href="/appeals-service/appeal-details/5" class="govuk-link" data-cy="linked-appeal-725285" aria-label="Appeal 7 2 5 2 8 5">725285</a></li></ul>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'Related appeals</dt><dd class="govuk-summary-list__value"><ul class="govuk-list govuk-list--bullet"><li><a href="/appeals-service/appeal-details/6" class="govuk-link" data-cy="related-appeal-765413" aria-label="Appeal 7 6 5 4 1 3">765413</a></li><li><a href="/appeals-service/appeal-details/7" class="govuk-link" data-cy="related-appeal-765414" aria-label="Appeal 7 6 5 4 1 4">765414</a></li></ul>'
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
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/case-notes`)
					.reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } });

				const response = await request.get(`${baseUrl}/${appealData.appealId}`);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const linkedAppealsRowElement = parseHtml(response.text, {
					rootElement: '.appeal-linked-appeals',
					skipPrettyPrint: true
				});

				expect(linkedAppealsRowElement.innerHTML).toContain('(lead)</li>');
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
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/case-notes`)
					.reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } });

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
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/case-notes`)
					.reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } });

				const response = await request.get(`${baseUrl}/${appealData.appealId}`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Child</strong>');
			});

			it('should not render a "Appeal valid" notification banner when status is "READY_TO_START" and appeal is a linked child appeal', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'ready_to_start',
						isChildAppeal: true
					});
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);
				const element = parseHtml(response.text, { rootElement: '.govuk-main-wrapper' });

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).not.toContain('govuk-notification-banner');
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

		it('should render a Decision inset panel when the appealStatus is complete', async () => {
			const appealId = '2';

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealData,
					appealStatus: 'complete',
					completedStateList: ['awaiting_event']
				});
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			nock('http://test/')
				.get('/appeals/1/documents/e1e90a49-fab3-44b8-a21a-bb73af089f6b/versions')
				.reply(200, documentFileVersionInfo);
			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const insetTextElementHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: '.govuk-inset-text'
			}).innerHTML;
			expect(insetTextElementHTML).toContain('<li>Decision: Dismissed</li>');
			expect(insetTextElementHTML).toContain(
				'<li>Decision issued on 4 August 2023 (updated on 11 October 2023)</li>'
			);
			expect(insetTextElementHTML).toContain(
				'<li><a class="govuk-link" href="/appeals-service/appeal-details/1/issue-decision/view-decision?backUrl=%2Fappeals-service%2Fappeal-details%2F2">View decision</a></li>'
			);
		});

		it('should render the view decision page', async () => {
			const appealId = '2';

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealData,
					appealStatus: 'complete',
					completedStateList: ['awaiting_event']
				});
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			nock('http://test/')
				.get('/appeals/1/documents/e1e90a49-fab3-44b8-a21a-bb73af089f6b/versions')
				.reply(200, documentFileVersionInfo);
			const response = await request.get(`${baseUrl}/${appealId}/issue-decision/view-decision`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const innerHTML = parseHtml(response.text).innerHTML;
			expect(innerHTML).toContain('Dismissed');
			expect(innerHTML).toContain('4 August 2023 (reissued on 11 October 2023)');
			expect(innerHTML).toContain(
				'download href="/documents/1/download/e1e90a49-fab3-44b8-a21a-bb73af089f6b/decision-letter.pdf'
			);
		});

		it('should render a Decision inset panel when the appealStatus is complete and only one version exists', async () => {
			const appealId = '2';

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealData,
					appealStatus: 'complete',
					completedStateList: ['awaiting_event']
				});
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			nock('http://test/')
				.get('/appeals/1/documents/e1e90a49-fab3-44b8-a21a-bb73af089f6b/versions')
				.reply(200, documentFileInfo);
			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const insetTextElementHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: '.govuk-inset-text'
			}).innerHTML;
			expect(insetTextElementHTML).toContain('<li>Decision: Dismissed</li>');
			expect(insetTextElementHTML).toContain('<li>Decision issued on 25 December 2023</li>');
			expect(insetTextElementHTML).toContain(
				'<li><a class="govuk-link" href="/appeals-service/appeal-details/1/issue-decision/view-decision?backUrl=%2Fappeals-service%2Fappeal-details%2F2">View decision</a></li>'
			);
		});

		it('should render a Decision inset panel when the appealStatus isinvalid', async () => {
			const appealId = '2';

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealData,
					decision: {
						outcome: 'invalid',
						letterDate: '2023-12-25T00:00:00.000Z'
					},
					appealStatus: 'invalid'
				});
			nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			nock('http://test/')
				.get('/appeals/1/documents/e1e90a49-fab3-44b8-a21a-bb73af089f6b/versions')
				.reply(200, documentFileInfo);
			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const insetTextElementHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: '.govuk-inset-text'
			}).innerHTML;
			expect(insetTextElementHTML).toContain('<li>Decision: Invalid</li>');
			expect(insetTextElementHTML).toContain('<li>Decision issued on 25 December 2023</li>');
			expect(insetTextElementHTML).toContain(
				'<li><a class="govuk-link" href="/appeals-service/appeal-details/1/issue-decision/view-decision?backUrl=%2Fappeals-service%2Fappeal-details%2F2">View decision</a></li>'
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
					nock('http://test/')
						.get(/appeals\/\d+\/appellant-cases\/\d+/)
						.reply(200, { planningObligation: { hasObligation: false } });

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

		describe('Overview', () => {
			const appealId = 2;
			beforeEach(() => {
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
			});

			it('should render a "Is there a net gain or loss of residential units?" row in the overview accordion for S78', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealType: 'Planning appeal'
					});
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, {
						planningObligation: { hasObligation: false },
						numberOfResidencesNetChange: null
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				const rowHtml = parseHtml(response.text, {
					rootElement: '.appeal-net-residence-change',
					skipPrettyPrint: true
				}).innerHTML;

				expect(rowHtml).toMatchSnapshot();
				expect(rowHtml).toContain('Is there a net gain or loss of residential units?</dt>');
				expect(rowHtml).toContain('Not provided</dd>');
			});

			it('should not render a "Is there a net gain or loss of residential units?" row in the overview accordion if not S78 appeal', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealType: 'Householder'
					});
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, {
						planningObligation: { hasObligation: false },
						numberOfResidencesNetChange: null
					});

				const response = await request.get(`${baseUrl}/${appealId}`);
				expect(response.text).not.toContain(
					'Is there a net gain or loss of residential units?</dt>'
				);
			});

			it('should render net-residence-gain-or-loss row as "Net gain" in the overview accordion for S78 if numberOfResidencesNetChange has a positive value', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealType: 'Planning appeal'
					});
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, {
						planningObligation: { hasObligation: false },
						numberOfResidencesNetChange: 1
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				const rowHtml = parseHtml(response.text, {
					rootElement: '.appeal-net-residence-gain-or-loss',
					skipPrettyPrint: true
				}).innerHTML;

				expect(rowHtml).toMatchSnapshot();
				expect(rowHtml).toContain('Net gain</dt>');
				expect(rowHtml).toContain('1</dd>');
			});

			it('should render net-residence-gain-or-loss row as "Net loss" in the overview accordion for S78 if numberOfResidencesNetChange has a negative value', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealType: 'Planning appeal'
					});
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, {
						planningObligation: { hasObligation: false },
						numberOfResidencesNetChange: -1
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				const rowHtml = parseHtml(response.text, {
					rootElement: '.appeal-net-residence-gain-or-loss',
					skipPrettyPrint: true
				}).innerHTML;

				expect(rowHtml).toMatchSnapshot();
				expect(rowHtml).toContain('Net loss</dt>');
				expect(rowHtml).toContain('1</dd>');
			});

			it('should not render net-residence-gain-or-loss row in the overview accordion for S78 if numberOfResidencesNetChange is 0', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealType: 'Planning appeal'
					});
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, {
						planningObligation: { hasObligation: false },
						numberOfResidencesNetChange: 0
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.text).not.toContain('.appeal-net-residence-gain-or-loss');
			});

			it('should not render net-residence-gain-or-loss row in the overview accordion for S78 if numberOfResidencesNetChange is not given', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealType: 'Planning appeal'
					});
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, {
						planningObligation: { hasObligation: false },
						numberOfResidencesNetChange: null
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.text).not.toContain('.appeal-net-residence-gain-or-loss');
			});

			it('should not render net-residence-gain-or-loss row in the overview accordion if appeal type is not S78', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealType: 'Householder'
					});
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, {
						planningObligation: { hasObligation: false },
						numberOfResidencesNetChange: 1
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.text).not.toContain('.appeal-net-residence-gain-or-loss');
			});

			it('Should display procedure type change link because type is S78 and lpastatement status is not received', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealType: APPEAL_TYPE.S78,
						procedureType: APPEAL_CASE_PROCEDURE.WRITTEN,
						documentationSummary: {
							lpaStatement: {
								status: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
							}
						}
					});
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, {
						planningObligation: { hasObligation: false },
						numberOfResidencesNetChange: null
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.text).toContain(
					'<a class="govuk-link" href="/appeals-service/appeal-details/2/change-appeal-procedure-type/change-selected-procedure-type" data-cy="change-case-procedure">Change<span class="govuk-visually-hidden"> Appeal procedure</span></a>'
				);
			});

			it('Should not display procedure type change link because type is S78 and lpastatement status is received', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealType: APPEAL_TYPE.S78,
						procedureType: APPEAL_CASE_PROCEDURE.WRITTEN,
						documentationSummary: {
							lpaStatement: {
								status: APPEAL_REPRESENTATION_STATUS.PUBLISHED
							}
						}
					});
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, {
						planningObligation: { hasObligation: false },
						numberOfResidencesNetChange: null
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.text).not.toContain(
					'<a class="govuk-link" href="/appeals-service/appeal-details/2/change-appeal-details/case-procedure" data-cy="change-case-procedure">Change<span class="govuk-visually-hidden"> Appeal procedure</span></a>'
				);
			});

			it('Should not display case proceudre change link because appeal type is not S78', async () => {
				const appealId = 2;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealType: APPEAL_TYPE.HOUSEHOLDER,
						procedureType: APPEAL_CASE_PROCEDURE.WRITTEN,
						documentationSummary: {
							lpaStatement: {
								status: APPEAL_REPRESENTATION_STATUS.VALID
							}
						}
					});
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, {
						planningObligation: { hasObligation: false },
						numberOfResidencesNetChange: null
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.text).not.toContain(
					'<a class="govuk-link" href="/appeals-service/appeal-details/2/change-appeal-details/case-procedure" data-cy="change-case-procedure">Change<span class="govuk-visually-hidden"> Appeal procedure</span></a>'
				);
			});
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
						actionLinkHiddenText: 'Appellant final comments'
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

					it(`should not render an "${testCase.rowLabel}" row, if the appeal is a child linked appeal`, async () => {
						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealDataFullPlanning,
								isChildAppeal: true,
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

			describe('Interested party comments', () => {
				const appealId = 3;

				beforeEach(() => {
					nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				});

				it('should not render an "Interested party comments" row if the appeal type is "Householder" (HAS)', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealData,
							appealId,
							appealType: 'Householder'
						});

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

					expect(unprettifiedHTML).toContain('Documentation</th>');
					expect(unprettifiedHTML).not.toContain('Interested party comments</th>');
				});

				it('should render an "Interested party comments" row with a status of "No interested party comments received", and an "Add" action link to the first page of the add IP comment flow, if the appeal type is "planning appeal", and the appeal does not have IP comments awaiting review, and the statements due date has elapsed', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealData,
							appealId,
							appealType: 'Planning appeal',
							appealTimetable: {
								...appealData.appealTimetable,
								ipCommentsDueDate: '2025-05-06T22:59:00.000Z'
							},
							documentationSummary: {
								ipComments: {
									status: 'not_received',
									receivedAt: null,
									counts: {},
									isRedacted: false
								}
							}
						});
					nock('http://test/')
						.get(`/appeals/${appealId}/reps/count?status=awaiting_review`)
						.reply(200, {
							statement: 0,
							comment: 0,
							lpa_final_comment: 0,
							appellant_final_comment: 0
						});

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

					expect(unprettifiedHTML).toContain('Documentation</th>');
					expect(unprettifiedHTML).toContain('Interested party comments</th>');
					expect(unprettifiedHTML).toContain('No interested party comments received</td>');
					expect(unprettifiedHTML).toContain(
						`<a href="/appeals-service/appeal-details/${appealId}/interested-party-comments/add/ip-details?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}" data-cy="review-ip-comments" class="govuk-link">Add<span class="govuk-visually-hidden"> interested party comments</span></a>`
					);
				});
			});

			describe('Environmental services team review', () => {
				const appealId = 3;
				const testCase = [
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
				});

				it('should not render an "Environmental services team review" row if the review is not required', async () => {
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
							},
							eiaScreeningRequired: false
						});

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

					expect(unprettifiedHTML).toContain('Documentation</th>');
					expect(unprettifiedHTML).not.toContain('Environmental services team review</th>');
				});

				it('should render exactly one "Environmental services team review" row if the review is required', async () => {
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
							},
							eiaScreeningRequired: true
						});

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

					expect(unprettifiedHTML).toContain('Documentation</th>');
					expect(
						unprettifiedHTML.match(/Environmental services team review<\/th>/g) || []
					).toHaveLength(1);
				});
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
					nock('http://test/')
						.get(/appeals\/\d+\/appellant-cases\/\d+/)
						.reply(200, { planningObligation: { hasObligation: false } });
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

				it('should render a "Timetable" with all rows with the Start & IP comments due date rows, both including a date and change action link', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							caseOfficer: '2cb7735e-c4cf-410b-b773-5ec4cf110b87',
							appealId,
							appealTimetable: {
								...appealDataFullPlanning.appealTimetable,
								ipCommentsDueDate: new Date('2025-4-29')
							},
							documentationSummary: {
								...appealDataFullPlanning.documentationSummary,
								ipComments: {}
							}
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

					const ipCommentsDueDateRow = parseHtml(response.text, {
						rootElement: '.appeal-ip-comments-due-date',
						skipPrettyPrint: true
					}).innerHTML;

					expect(ipCommentsDueDateRow).toContain(
						`<dt class="govuk-summary-list__key"> Interested party comments due</dt>`
					);

					expect(ipCommentsDueDateRow).toContain(
						'<dd class="govuk-summary-list__value"> 29 April 2025</dd>'
					);

					expect(ipCommentsDueDateRow).toContain(
						'data-cy="change-ip-comments-due-date">Change<span'
					);

					const caseTimeTable = parseHtml(response.text, {
						rootElement: '.appeal-case-timetable'
					}).innerHTML;

					expect(caseTimeTable).toMatchSnapshot();
				});

				it('should render a "Timetable" with all rows with the IP comments due date and change link displaying when published IP comments count equals zero', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							caseOfficer: '2cb7735e-c4cf-410b-b773-5ec4cf110b87',
							appealId,
							appealTimetable: {
								...appealDataFullPlanning.appealTimetable,
								ipCommentsDueDate: new Date('2025-4-29')
							},
							documentationSummary: {
								...appealDataFullPlanning.documentationSummary,
								ipComments: { count: 0 }
							}
						});
					const response = await request.get(`${baseUrl}/${appealId}`);
					expect(response.statusCode).toBe(200);

					const ipCommentsDueDateRow = parseHtml(response.text, {
						rootElement: '.appeal-ip-comments-due-date',
						skipPrettyPrint: true
					}).innerHTML;

					expect(ipCommentsDueDateRow).toContain(
						`<dt class="govuk-summary-list__key"> Interested party comments due</dt>`
					);

					expect(ipCommentsDueDateRow).toContain(
						'<dd class="govuk-summary-list__value"> 29 April 2025</dd>'
					);

					expect(ipCommentsDueDateRow).toContain(
						'data-cy="change-ip-comments-due-date">Change<span'
					);
				});

				it('should render a "Timetable" with all rows with the Start date and IP comments due date without an action link', async () => {
					const testDocumentationSummary = {
						...appealDataFullPlanning.documentationSummary,
						lpaQuestionnaire: { status: 'received' },
						ipComments: { counts: { published: 1 } }
					};

					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							documentationSummary: testDocumentationSummary,
							appealTimetable: {
								...appealDataFullPlanning.appealTimetable,
								ipCommentsDueDate: new Date('2025-4-29')
							},
							caseOfficer: '2cb7735e-c4cf-410b-b773-5ec4cf110b87',
							appealId,
							completedStateList: ['statements']
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

					const ipCommentsDueDateRow = parseHtml(response.text, {
						rootElement: '.appeal-ip-comments-due-date',
						skipPrettyPrint: true
					}).innerHTML;

					expect(ipCommentsDueDateRow).toContain(
						`<dt class="govuk-summary-list__key"> Interested party comments due</dt>`
					);

					expect(ipCommentsDueDateRow).toContain(
						'<dd class="govuk-summary-list__value"> 29 April 2025</dd>'
					);

					expect(ipCommentsDueDateRow).not.toContain(
						'data-cy="change-ip-comments-due-date">Change<span'
					);

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
					nock('http://test/')
						.get(/appeals\/\d+\/appellant-cases\/\d+/)
						.reply(200, { planningObligation: { hasObligation: false } });
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
						`href="/appeals-service/appeal-details/${appealId}/timetable/edit" data-cy="change-final-comments-due-date">Change<span class="govuk-visually-hidden"> Final comments due</span></a>`
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

			describe('for a hearing case', () => {
				beforeEach(() => {
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
						.reply(200, { items: [] });
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
						.reply(200, { items: [] });
				});

				it('should render the correct rows when case has started and has no planning obligation', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							appealId,
							validAt: '2025-01-01T00:00:00.000Z',
							startedAt: '2025-01-01T00:00:00.000Z',
							procedureType: APPEAL_CASE_PROCEDURE.HEARING,
							appealTimetable: {
								validAt: '2025-01-01T00:00:00.000Z',
								startedAt: '2025-01-01T00:00:00.000Z',
								lpaQuestionnaireDueDate: '2025-01-02T00:00:00.000Z',
								lpaStatementDueDate: '2025-01-03T00:00:00.000Z',
								ipCommentsDueDate: '2025-01-04T00:00:00.000Z',
								finalCommentsDueDate: '2025-01-05T00:00:00.000Z',
								statementOfCommonGroundDueDate: '2025-01-06T00:00:00.000Z'
							},
							hearing: null
						});
					nock('http://test/')
						.get(`/appeals/${appealId}/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
						.reply(200, { planningObligation: { hasObligation: false } });

					const response = await request.get(`${baseUrl}/${appealId}`);
					expect(response.statusCode).toBe(200);

					const timetableRows = parseHtml(response.text, {
						rootElement: 'dl.govuk-summary-list.appeal-case-timetable',
						skipPrettyPrint: true
					}).querySelectorAll('.govuk-summary-list__row');

					expect(timetableRows.length).toBe(7);
					expect(
						timetableRows[0].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Valid date');
					expect(
						timetableRows[0].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('1 January 2025');
					expect(
						timetableRows[1].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Start date');
					expect(
						timetableRows[1].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('1 January 2025');
					expect(
						timetableRows[2].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('LPA questionnaire due');
					expect(
						timetableRows[2].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('2 January 2025');
					expect(timetableRows[2].querySelector('dd.govuk-summary-list__actions')).toBeFalsy();
					expect(
						timetableRows[3].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('LPA statement due');
					expect(
						timetableRows[3].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('3 January 2025');
					expect(
						timetableRows[3]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[4].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Interested party comments due');
					expect(
						timetableRows[4].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('4 January 2025');
					expect(
						timetableRows[4]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[5].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Statement of common ground due');
					expect(
						timetableRows[5].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('6 January 2025');
					expect(
						timetableRows[5]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[6].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Hearing date');
					expect(
						timetableRows[6].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('Not set up');
					expect(
						timetableRows[6]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/hearing/setup`);
				});

				it('should render the correct rows when case has started and has planning obligation', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							appealId,
							validAt: '2025-01-01T00:00:00.000Z',
							startedAt: '2025-01-01T00:00:00.000Z',
							procedureType: APPEAL_CASE_PROCEDURE.HEARING,
							hearing: null,
							appealTimetable: {
								validAt: '2025-01-01T00:00:00.000Z',
								startedAt: '2025-01-01T00:00:00.000Z',
								lpaQuestionnaireDueDate: '2025-01-02T00:00:00.000Z',
								lpaStatementDueDate: '2025-01-03T00:00:00.000Z',
								ipCommentsDueDate: '2025-01-04T00:00:00.000Z',
								finalCommentsDueDate: '2025-01-05T00:00:00.000Z',
								statementOfCommonGroundDueDate: '2025-01-06T00:00:00.000Z'
							}
						});
					nock('http://test/')
						.get(`/appeals/${appealId}/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
						.reply(200, { planningObligation: { hasObligation: true } });

					const response = await request.get(`${baseUrl}/${appealId}`);
					expect(response.statusCode).toBe(200);

					const timetableRows = parseHtml(response.text, {
						rootElement: 'dl.govuk-summary-list.appeal-case-timetable',
						skipPrettyPrint: true
					}).querySelectorAll('.govuk-summary-list__row');

					expect(timetableRows.length).toBe(8);
					expect(
						timetableRows[0].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Valid date');
					expect(
						timetableRows[0].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('1 January 2025');
					expect(
						timetableRows[1].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Start date');
					expect(
						timetableRows[1].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('1 January 2025');
					expect(
						timetableRows[2].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('LPA questionnaire due');
					expect(
						timetableRows[2].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('2 January 2025');
					expect(timetableRows[2].querySelector('dd.govuk-summary-list__actions')).toBeFalsy();
					expect(
						timetableRows[3].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('LPA statement due');
					expect(
						timetableRows[3].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('3 January 2025');
					expect(
						timetableRows[3]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[4].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Interested party comments due');
					expect(
						timetableRows[4].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('4 January 2025');
					expect(
						timetableRows[4]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[5].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Statement of common ground due');
					expect(
						timetableRows[5].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('6 January 2025');
					expect(
						timetableRows[5]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[6].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Planning obligation due');
					expect(
						timetableRows[6].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('Not provided');
					expect(
						timetableRows[6]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[7].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Hearing date');
					expect(
						timetableRows[7].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('Not set up');
					expect(
						timetableRows[7]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/hearing/setup`);
				});

				it('should render the correct rows when case has started and planning obligation date has been set', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							appealId,
							validAt: '2025-01-01T00:00:00.000Z',
							startedAt: '2025-01-01T00:00:00.000Z',
							procedureType: APPEAL_CASE_PROCEDURE.HEARING,
							hearing: null,
							appealTimetable: {
								validAt: '2025-01-01T00:00:00.000Z',
								startedAt: '2025-01-01T00:00:00.000Z',
								lpaQuestionnaireDueDate: '2025-01-02T00:00:00.000Z',
								lpaStatementDueDate: '2025-01-03T00:00:00.000Z',
								ipCommentsDueDate: '2025-01-04T00:00:00.000Z',
								finalCommentsDueDate: '2025-01-05T00:00:00.000Z',
								statementOfCommonGroundDueDate: '2025-01-06T00:00:00.000Z',
								planningObligationDueDate: '2025-01-07T00:00:00.000Z'
							}
						});
					nock('http://test/')
						.get(`/appeals/${appealId}/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
						.reply(200, { planningObligation: { hasObligation: true } });

					const response = await request.get(`${baseUrl}/${appealId}`);
					expect(response.statusCode).toBe(200);

					const timetableRows = parseHtml(response.text, {
						rootElement: 'dl.govuk-summary-list.appeal-case-timetable',
						skipPrettyPrint: true
					}).querySelectorAll('.govuk-summary-list__row');

					expect(timetableRows.length).toBe(8);
					expect(
						timetableRows[0].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Valid date');
					expect(
						timetableRows[0].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('1 January 2025');
					expect(
						timetableRows[1].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Start date');
					expect(
						timetableRows[1].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('1 January 2025');
					expect(
						timetableRows[2].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('LPA questionnaire due');
					expect(
						timetableRows[2].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('2 January 2025');
					expect(timetableRows[2].querySelector('dd.govuk-summary-list__actions')).toBeFalsy();
					expect(
						timetableRows[3].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('LPA statement due');
					expect(
						timetableRows[3].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('3 January 2025');
					expect(
						timetableRows[3]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[4].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Interested party comments due');
					expect(
						timetableRows[4].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('4 January 2025');
					expect(
						timetableRows[4]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[5].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Statement of common ground due');
					expect(
						timetableRows[5].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('6 January 2025');
					expect(
						timetableRows[5]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[6].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Planning obligation due');
					expect(
						timetableRows[6].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('7 January 2025');
					expect(
						timetableRows[6]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[7].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Hearing date');
					expect(
						timetableRows[7].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('Not set up');
					expect(
						timetableRows[7]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/hearing/setup`);
				});

				it('should render the correct rows when case has started and hearing has been set up', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							appealId,
							validAt: '2025-01-01T00:00:00.000Z',
							startedAt: '2025-01-01T00:00:00.000Z',
							procedureType: APPEAL_CASE_PROCEDURE.HEARING,
							hearing: {
								hearingStartTime: '2025-01-08T10:00:00.000Z'
							},
							appealTimetable: {
								validAt: '2025-01-01T00:00:00.000Z',
								startedAt: '2025-01-01T00:00:00.000Z',
								lpaQuestionnaireDueDate: '2025-01-02T00:00:00.000Z',
								lpaStatementDueDate: '2025-01-03T00:00:00.000Z',
								ipCommentsDueDate: '2025-01-04T00:00:00.000Z',
								finalCommentsDueDate: '2025-01-05T00:00:00.000Z',
								statementOfCommonGroundDueDate: '2025-01-06T00:00:00.000Z'
							}
						});
					nock('http://test/')
						.get(`/appeals/${appealId}/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
						.reply(200, { planningObligation: { hasObligation: true } });

					const response = await request.get(`${baseUrl}/${appealId}`);
					expect(response.statusCode).toBe(200);

					const timetableRows = parseHtml(response.text, {
						rootElement: 'dl.govuk-summary-list.appeal-case-timetable',
						skipPrettyPrint: true
					}).querySelectorAll('.govuk-summary-list__row');

					expect(timetableRows.length).toBe(8);
					expect(
						timetableRows[0].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Valid date');
					expect(
						timetableRows[0].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('1 January 2025');
					expect(
						timetableRows[1].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Start date');
					expect(
						timetableRows[1].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('1 January 2025');
					expect(
						timetableRows[2].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('LPA questionnaire due');
					expect(
						timetableRows[2].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('2 January 2025');
					expect(timetableRows[2].querySelector('dd.govuk-summary-list__actions')).toBeFalsy();
					expect(
						timetableRows[3].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('LPA statement due');
					expect(
						timetableRows[3].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('3 January 2025');
					expect(
						timetableRows[3]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[4].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Interested party comments due');
					expect(
						timetableRows[4].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('4 January 2025');
					expect(
						timetableRows[4]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[5].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Statement of common ground due');
					expect(
						timetableRows[5].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('6 January 2025');
					expect(
						timetableRows[5]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[6].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Planning obligation due');
					expect(
						timetableRows[6].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('Not provided');
					expect(
						timetableRows[6]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[7].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Hearing date');
					expect(
						timetableRows[7].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('10:00am on 8 January 2025');
					expect(
						timetableRows[7]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/hearing/change/date`);
				});
			});

			describe('for an inquiry case', () => {
				beforeEach(() => {
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
						.reply(200, { items: [] });
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
						.reply(200, { items: [] });
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=appellant_proofs_evidence`)
						.reply(200, { items: [] });
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=lpa_proofs_evidence`)
						.reply(200, { items: [] });
				});

				it('should render the correct rows when case procedure is Inquiry and case started and has no planning obligation', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							appealId,
							validAt: '2025-01-01T00:00:00.000Z',
							startedAt: '2025-01-01T00:00:00.000Z',
							procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
							inquiry: {
								inquiryStartTime: '2025-02-01T10:00:00.000Z'
							},
							appealTimetable: {
								validAt: '2025-01-01T00:00:00.000Z',
								startedAt: '2025-01-01T00:00:00.000Z',
								lpaQuestionnaireDueDate: '2025-01-02T00:00:00.000Z',
								lpaStatementDueDate: '2025-01-03T00:00:00.000Z',
								ipCommentsDueDate: '2025-01-04T00:00:00.000Z',
								finalCommentsDueDate: '2025-01-05T00:00:00.000Z',
								statementOfCommonGroundDueDate: '2025-01-06T00:00:00.000Z',
								proofOfEvidenceAndWitnessesDueDate: '2025-01-07T00:00:00.000Z'
							},
							hearing: null
						});
					nock('http://test/')
						.get(`/appeals/${appealId}/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
						.reply(200, { planningObligation: { hasObligation: false } });

					const response = await request.get(`${baseUrl}/${appealId}`);
					expect(response.statusCode).toBe(200);

					const timetableRows = parseHtml(response.text, {
						rootElement: 'dl.govuk-summary-list.appeal-case-timetable',
						skipPrettyPrint: true
					}).querySelectorAll('.govuk-summary-list__row');

					expect(timetableRows.length).toBe(8);
					expect(
						timetableRows[0].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Valid date');
					expect(
						timetableRows[0].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('1 January 2025');
					expect(
						timetableRows[1].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Start date');
					expect(
						timetableRows[1].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('1 January 2025');
					expect(
						timetableRows[2].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('LPA questionnaire due');
					expect(
						timetableRows[2].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('2 January 2025');
					expect(timetableRows[2].querySelector('dd.govuk-summary-list__actions')).toBeFalsy();
					expect(
						timetableRows[3].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('LPA statement due');
					expect(
						timetableRows[3].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('3 January 2025');
					expect(
						timetableRows[3]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[4].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Interested party comments due');
					expect(
						timetableRows[4].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('4 January 2025');
					expect(
						timetableRows[4]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[5].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Statement of common ground due');
					expect(
						timetableRows[5].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('6 January 2025');
					expect(
						timetableRows[5]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[6].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Proof of evidence and witness due');
					expect(
						timetableRows[6].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('7 January 2025');
					expect(
						timetableRows[7].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Inquiry');
					expect(
						timetableRows[7].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('10:00am on 1 February 2025');
				});

				it('should render the correct rows when case is Inquiry and case has started and has planning obligation', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							appealId,
							validAt: '2025-01-01T00:00:00.000Z',
							startedAt: '2025-01-01T00:00:00.000Z',
							procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
							inquiry: {
								inquiryStartTime: '2025-02-01T10:00:00.000Z'
							},
							appealTimetable: {
								validAt: '2025-01-01T00:00:00.000Z',
								startedAt: '2025-01-01T00:00:00.000Z',
								lpaQuestionnaireDueDate: '2025-01-02T00:00:00.000Z',
								lpaStatementDueDate: '2025-01-03T00:00:00.000Z',
								ipCommentsDueDate: '2025-01-04T00:00:00.000Z',
								finalCommentsDueDate: '2025-01-05T00:00:00.000Z',
								statementOfCommonGroundDueDate: '2025-01-06T00:00:00.000Z',
								proofOfEvidenceAndWitnessesDueDate: '2025-01-07T00:00:00.000Z',
								planningObligationDueDate: '2025-01-09T00:00:00.000Z'
							}
						});
					nock('http://test/')
						.get(`/appeals/${appealId}/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
						.reply(200, { planningObligation: { hasObligation: true } });

					const response = await request.get(`${baseUrl}/${appealId}`);
					expect(response.statusCode).toBe(200);

					const timetableRows = parseHtml(response.text, {
						rootElement: 'dl.govuk-summary-list.appeal-case-timetable',
						skipPrettyPrint: true
					}).querySelectorAll('.govuk-summary-list__row');

					expect(timetableRows.length).toBe(9);
					expect(
						timetableRows[0].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Valid date');
					expect(
						timetableRows[0].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('1 January 2025');
					expect(
						timetableRows[1].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Start date');
					expect(
						timetableRows[1].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('1 January 2025');
					expect(
						timetableRows[2].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('LPA questionnaire due');
					expect(
						timetableRows[2].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('2 January 2025');
					expect(timetableRows[2].querySelector('dd.govuk-summary-list__actions')).toBeFalsy();
					expect(
						timetableRows[3].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('LPA statement due');
					expect(
						timetableRows[3].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('3 January 2025');
					expect(
						timetableRows[3]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[4].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Interested party comments due');
					expect(
						timetableRows[4].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('4 January 2025');
					expect(
						timetableRows[4]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[5].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Statement of common ground due');
					expect(
						timetableRows[5].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('6 January 2025');
					expect(
						timetableRows[5]
							.querySelector('dd.govuk-summary-list__actions')
							.querySelector('a.govuk-link')
							.getAttribute('href')
					).toBe(`${baseUrl}/${appealId}/timetable/edit`);
					expect(
						timetableRows[6].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Planning obligation due');
					expect(
						timetableRows[6].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('9 January 2025');
					expect(
						timetableRows[7].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Proof of evidence and witness due');
					expect(
						timetableRows[7].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('7 January 2025');
					expect(
						timetableRows[8].querySelector('dt.govuk-summary-list__key').textContent.trim()
					).toBe('Inquiry');
					expect(
						timetableRows[8].querySelector('dd.govuk-summary-list__value').textContent.trim()
					).toBe('10:00am on 1 February 2025');
				});
			});

			describe('for a child appeal', () => {
				beforeEach(() => {
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
						.reply(200, { items: [] });
					nock('http://test/')
						.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
						.reply(200, { items: [] });
				});

				it('should not contain any change action links', async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							appealId,
							isChildAppeal: true,
							validAt: '2025-01-01T00:00:00.000Z',
							startedAt: '2025-01-01T00:00:00.000Z',
							appealTimetable: {
								validAt: '2025-01-01T00:00:00.000Z',
								startedAt: '2025-01-01T00:00:00.000Z',
								lpaQuestionnaireDueDate: '2025-01-02T00:00:00.000Z',
								lpaStatementDueDate: '2025-01-03T00:00:00.000Z',
								ipCommentsDueDate: '2025-01-04T00:00:00.000Z',
								finalCommentsDueDate: '2025-01-05T00:00:00.000Z',
								statementOfCommonGroundDueDate: '2025-01-06T00:00:00.000Z',
								proofOfEvidenceAndWitnessesDueDate: '2025-01-07T00:00:00.000Z'
							},
							hearing: null
						});
					nock('http://test/')
						.get(`/appeals/${appealId}/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
						.reply(200, {});

					const response = await request.get(`${baseUrl}/${appealId}`);

					const element = parseHtml(response.text, { rootElement: '.appeal-case-timetable' });

					expect(element.innerHTML).not.toContain('>Change<span');

					expect(element.innerHTML).toMatchSnapshot();
					expect(response.statusCode).toBe(200);
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
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } });
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=appellant_proofs_evidence`)
					.reply(200, { items: [] });
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=lpa_proofs_evidence`)
					.reply(200, { items: [] });
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

			[
				{ title: 'not a linked appeal' },
				{
					title: 'a linked child appeal',
					isChildAppeal: true,
					isParentAppeal: false
				},
				{
					title: 'a linked lead appeal',
					isChildAppeal: false,
					isParentAppeal: true
				}
			].map((config) =>
				it(`should ${
					config.isChildAppeal ? 'not ' : ''
				}render the site accordion for HAS cases when ${config.title}`, async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealData,
							...config,
							appealId
						});

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

					expect(unprettifiedHTML).toContain('Case details</h1>');
					if (config.isChildAppeal) {
						// eslint-disable-next-line jest/no-conditional-expect
						expect(unprettifiedHTML).not.toContain('Site</span></h2>');
					} else {
						// eslint-disable-next-line jest/no-conditional-expect
						expect(unprettifiedHTML).toContain('Site</span></h2>');
					}
				})
			);

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

			[
				{ title: 'not a linked appeal' },
				{
					title: 'a linked child appeal',
					isChildAppeal: true,
					isParentAppeal: false
				},
				{
					title: 'a linked lead appeal',
					isChildAppeal: false,
					isParentAppeal: true
				}
			].map((config) =>
				it(`should ${
					config.isChildAppeal ? 'not ' : ''
				}render the site accordion for S78 cases when ${config.title}`, async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealDataFullPlanning,
							...config,
							appealId
						});

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

					expect(unprettifiedHTML).toContain('Case details</h1>');
					if (config.isChildAppeal) {
						// eslint-disable-next-line jest/no-conditional-expect
						expect(unprettifiedHTML).not.toContain('Site</span></h2>');
					} else {
						// eslint-disable-next-line jest/no-conditional-expect
						expect(unprettifiedHTML).toContain('Site</span></h2>');
					}
				})
			);

			for (const procedureType of [APPEAL_CASE_PROCEDURE.HEARING, APPEAL_CASE_PROCEDURE.INQUIRY]) {
				it(`should not render the site accordion for s78 cases with a procedureType of ${procedureType}`, async () => {
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
					expect(unprettifiedHTML).not.toContain('<div id="case-details-site-section">');
					expect(unprettifiedHTML).not.toContain('Site</span></h2>');
				});
			}

			it('should render the Hearing accordion with the expected content for s78 cases with a procedureType of "Hearing"', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealDataFullPlanning,
						appealId,
						procedureType: APPEAL_CASE_PROCEDURE.HEARING,
						hearing: null
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Case details</h1>');
				expect(unprettifiedHTML).toContain('<div id="case-details-hearing-section">');
				expect(unprettifiedHTML).toContain('Hearing</span></h2>');

				const hearingSectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-hearing-section'
				});

				expect(hearingSectionHtml.innerHTML).toMatchSnapshot();

				const button = hearingSectionHtml.querySelector(
					'a.govuk-button:contains("Set up hearing")'
				);

				expect(button?.attributes?.href).toEqual(
					`${baseUrl}/${appealId}/hearing/setup?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}`
				);

				const unprettifiedHearingSectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-hearing-section',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedHearingSectionHtml).toContain('Hearing estimates</h3>');
				expect(unprettifiedHearingSectionHtml).toContain(
					`href="/appeals-service/appeal-details/${appealId}/hearing/estimates/add">Add hearing estimates</a>`
				);
			});

			it('should render empty states for Hearing accordion when hearing is not set up and user is read only', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealDataFullPlanning,
						appealId,
						procedureType: APPEAL_CASE_PROCEDURE.HEARING,
						hearing: null
					});

				const response = await readOnlyRequest.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Case details</h1>');
				expect(unprettifiedHTML).toContain('<div id="case-details-hearing-section">');
				expect(unprettifiedHTML).toContain('Hearing</span></h2>');

				const hearingSectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-hearing-section'
				});

				expect(hearingSectionHtml.innerHTML).toMatchSnapshot();

				const button = hearingSectionHtml.querySelector(
					'a.govuk-button:contains("Set up hearing")'
				);
				expect(button).toBeFalsy();

				const unprettifiedHearingSection = parseHtml(response.text, {
					rootElement: '#case-details-hearing-section',
					skipPrettyPrint: true
				});
				const unprettifiedHearingSectionHtml = unprettifiedHearingSection.innerHTML;

				expect(unprettifiedHearingSectionHtml).toContain('Hearing estimates</h3>');

				expect(unprettifiedHearingSection.querySelectorAll('p.govuk-body')).toHaveLength(2);
				expect(
					unprettifiedHearingSection.querySelectorAll('p.govuk-body')[0].textContent.trim()
				).toBe('Not set up');
				expect(
					unprettifiedHearingSection.querySelectorAll('p.govuk-body')[1].textContent.trim()
				).toBe('Not set up');
			});

			it('should render no change links for Hearing accordion when hearing is set up and user is read only', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealDataFullPlanning,
						appealId,
						procedureType: APPEAL_CASE_PROCEDURE.HEARING,
						hearing: {
							hearingId: '123',
							hearingStartTime: '2025-05-15T12:00:00.000Z',
							address: {
								addressLine1: '123 Main St',
								addressLine2: 'Apt 1',
								town: 'Anytown',
								county: 'Anycounty',
								postcode: 'AA1 1AA'
							}
						},
						hearingEstimate: {
							preparationTime: 1,
							sittingTime: 2.5,
							reportingTime: 3
						}
					});

				const response = await readOnlyRequest.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Case details</h1>');
				expect(unprettifiedHTML).toContain('<div id="case-details-hearing-section">');
				expect(unprettifiedHTML).toContain('Hearing</span></h2>');

				const hearingSectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-hearing-section'
				});

				expect(hearingSectionHtml.innerHTML).toMatchSnapshot();

				const button = hearingSectionHtml.querySelector(
					'a.govuk-button:contains("Set up hearing")'
				);
				expect(button).toBeFalsy();

				const unprettifiedHearingSection = parseHtml(response.text, {
					rootElement: '#case-details-hearing-section',
					skipPrettyPrint: true
				});

				expect(
					unprettifiedHearingSection.querySelectorAll('dd.govuk-summary-list__value')
				).toHaveLength(7);
				expect(
					unprettifiedHearingSection
						.querySelectorAll('dd.govuk-summary-list__value')[0]
						.textContent.trim()
				).toBe('15 May 2025');
				expect(
					unprettifiedHearingSection
						.querySelectorAll('dd.govuk-summary-list__value')[1]
						.textContent.trim()
				).toBe('1:00pm');
				expect(
					unprettifiedHearingSection
						.querySelectorAll('dd.govuk-summary-list__value')[2]
						.textContent.trim()
				).toBe('Yes');
				expect(
					unprettifiedHearingSection
						.querySelectorAll('dd.govuk-summary-list__value')[3]
						.innerHTML.trim()
				).toBe('123 Main St<br>Apt 1<br>Anytown<br>Anycounty<br>AA1 1AA');
				expect(
					unprettifiedHearingSection
						.querySelectorAll('dd.govuk-summary-list__value')[4]
						.textContent.trim()
				).toBe('1 day');
				expect(
					unprettifiedHearingSection
						.querySelectorAll('dd.govuk-summary-list__value')[5]
						.textContent.trim()
				).toBe('2.5 days');
				expect(
					unprettifiedHearingSection
						.querySelectorAll('dd.govuk-summary-list__value')[6]
						.textContent.trim()
				).toBe('3 days');

				expect(unprettifiedHearingSection.querySelector('a[data-cy="change-date"]')).toBeFalsy();
				expect(unprettifiedHearingSection.querySelector('a[data-cy="change-time"]')).toBeFalsy();
				expect(
					unprettifiedHearingSection.querySelector(
						'a[data-cy="change-whether-the-address-is-known-or-not"]'
					)
				).toBeFalsy();
				expect(
					unprettifiedHearingSection.querySelector('a[data-cy="change-preparation-time"]')
				).toBeFalsy();
				expect(
					unprettifiedHearingSection.querySelector('a[data-cy="change-sitting-time"]')
				).toBeFalsy();
				expect(
					unprettifiedHearingSection.querySelector('a[data-cy="change-reporting-time"]')
				).toBeFalsy();
			});

			it('should render the hearing details summary list when hearing is present with address', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealDataFullPlanning,
						appealId,
						procedureType: APPEAL_CASE_PROCEDURE.HEARING,
						hearing: {
							hearingId: '123',
							hearingStartTime: '2025-05-15T12:00:00.000Z',
							address: {
								addressLine1: '123 Main St',
								addressLine2: 'Apt 1',
								town: 'Anytown',
								county: 'Anycounty',
								postcode: 'AA1 1AA'
							}
						}
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
				});

				expect(
					unprettifiedHearingSectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[0]
						?.innerHTML.trim()
				).toEqual('15 May 2025');
				expect(
					unprettifiedHearingSectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[1]
						?.innerHTML.trim()
				).toEqual(dateISOStringToDisplayTime12hr('2025-05-15T12:00:00.000Z'));
				expect(
					unprettifiedHearingSectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[2]
						?.innerHTML.trim()
				).toEqual('Yes');
				expect(
					unprettifiedHearingSectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[3]
						?.innerHTML.split('<br>')
						.map((line) => line.trim())
				).toEqual(['123 Main St', 'Apt 1', 'Anytown', 'Anycounty', 'AA1 1AA']);
				expect(
					unprettifiedHearingSectionHtml.querySelector('a[data-cy="change-date"]')?.attributes?.href
				).toEqual(
					`${baseUrl}/${appealId}/hearing/change/date?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}`
				);
				expect(
					unprettifiedHearingSectionHtml.querySelector('a[data-cy="change-time"]')?.attributes?.href
				).toEqual(
					`${baseUrl}/${appealId}/hearing/change/date?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}`
				);
				expect(
					unprettifiedHearingSectionHtml.querySelector(
						'a[data-cy="change-whether-the-address-is-known-or-not"]'
					)?.attributes?.href
				).toEqual(
					`${baseUrl}/${appealId}/hearing/change/address?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}`
				);
				expect(
					unprettifiedHearingSectionHtml.querySelector('a[data-cy="change-address"]')?.attributes
						?.href
				).toEqual(
					`${baseUrl}/${appealId}/hearing/change/address-details?backUrl=%2Fappeals-service%2Fappeal-details%2F${appealId}`
				);
			});

			it('should render the hearing details summary list when hearing is present with no address', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealDataFullPlanning,
						appealId,
						procedureType: APPEAL_CASE_PROCEDURE.HEARING,
						hearing: {
							hearingId: '123',
							hearingStartTime: '2025-05-15T12:00:00.000Z'
						}
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
				});

				expect(
					unprettifiedHearingSectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[0]
						?.innerHTML.trim()
				).toEqual('15 May 2025');
				expect(
					unprettifiedHearingSectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[1]
						?.innerHTML.trim()
				).toEqual(dateISOStringToDisplayTime12hr('2025-05-15T12:00:00.000Z'));
				expect(
					unprettifiedHearingSectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[2]
						?.innerHTML.trim()
				).toEqual('No');
				expect(
					unprettifiedHearingSectionHtml.querySelectorAll('dd.govuk-summary-list__value')?.[3]
				).toBeFalsy();
			});

			it('should render the cancel hearing link when hearing is present and in the future', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealDataFullPlanning,
						appealId,
						procedureType: APPEAL_CASE_PROCEDURE.HEARING,
						hearing: {
							hearingId: '123',
							hearingStartTime: '2999-05-15T12:00:00.000Z'
						}
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
				});

				expect(
					unprettifiedHearingSectionHtml.querySelector('#cancelHearing')?.attributes?.href
				).toEqual(`${baseUrl}/${appealId}/hearing/cancel`);
			});

			it('should render the Hearing estimates summary list when estimates are present', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealDataFullPlanning,
						appealId,
						procedureType: APPEAL_CASE_PROCEDURE.HEARING,
						hearingEstimate: {
							preparationTime: 1,
							sittingTime: 2.5,
							reportingTime: 3
						},
						hearing: null
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

				expect(unprettifiedHearingSectionHtml).toContain('Hearing estimates</h3>');
				expect(unprettifiedHearingSectionHtml).toContain(
					'<dd class="govuk-summary-list__value"> 1 day</dd>'
				);
				expect(unprettifiedHearingSectionHtml).toContain(
					'<dd class="govuk-summary-list__value"> 2.5 days</dd>'
				);
				expect(unprettifiedHearingSectionHtml).toContain(
					'<dd class="govuk-summary-list__value"> 3 days</dd>'
				);
				expect(unprettifiedHearingSectionHtml).toContain(
					`<dd class="govuk-summary-list__actions"><a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/hearing/estimates/change"`
				);
			});
		});

		describe('Costs', () => {
			it('should render a "Appellant application" row in the costs accordion', async () => {
				const appealId = 2;

				nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData);
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

				const response = await request.get(`${baseUrl}/${appealId}`);

				const headerHtml = parseHtml(response.text, {
					rootElement: '.appeal-costs-appellant-application-documentation',
					skipPrettyPrint: true
				}).innerHTML;

				expect(headerHtml).toMatchSnapshot();
				expect(headerHtml).toContain('Appellant application</th>');

				const statusHtml = parseHtml(response.text, {
					rootElement: '.appeal-costs-appellant-application-status',
					skipPrettyPrint: true
				}).innerHTML;

				expect(statusHtml).toMatchSnapshot();
				expect(statusHtml).toContain('No documents available</td>');
			});
		});

		describe('Appeal decision', () => {
			it('should render a row in the case overview accordion with "Issue" action link to the issue decision start page, if the appeal status is "issue_determination"', async () => {
				const appealId = 2;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'issue_determination',
						completedStateList: ['awaiting_event'],
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

			appealStatuses
				.filter(({ statusPassedEvent }) => !statusPassedEvent)
				.forEach(({ appealStatus }) => {
					it(`should not render a row in the case overview accordion, if the appeal status is before "issue_determination" (${appealStatus})`, async () => {
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
						expect(response.text).not.toContain('govuk-summary-list__row appeal-decision');
					});
				});
		});

		describe('Appellant costs decision', () => {
			appealStatuses
				.filter(({ statusPassedEvent }) => statusPassedEvent)
				.forEach(({ appealStatus }) => {
					it(`should render a row in the case overview accordion, if the appeal status is "issue_determination" or after (${appealStatus})`, async () => {
						const appealId = 2;

						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealData,
								appealId,
								completedStateList: ['awaiting_event'],
								appealStatus: 'issue_determination',
								costs: {
									appellantApplicationFolder: {
										documents: [{ id: 1 }]
									}
								}
							});
						nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.text).toContain('govuk-summary-list__row costs-appellant-decision');

						const rowHtml = parseHtml(response.text, {
							rootElement: '.govuk-summary-list__row.costs-appellant-decision',
							skipPrettyPrint: true
						}).innerHTML;

						expect(rowHtml).toMatchSnapshot();
						expect(rowHtml).toContain('Appellant costs decision</dt>');
						expect(rowHtml).toContain(
							'Issue<span class="govuk-visually-hidden"> Appellant costs decision</span></a></dd></div>'
						);
					});
				});

			appealStatuses
				.filter(({ statusPassedEvent }) => !statusPassedEvent)
				.forEach(({ appealStatus }) => {
					it(`should not render a row in the case overview accordion , if the appeal status is before "issue_determination" (${appealStatus})`, async () => {
						const appealId = 2;

						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealData,
								appealId,
								completedStateList: ['event'],
								appealStatus,
								costs: {
									appellantApplicationFolder: {
										documents: [{ id: 1 }]
									}
								}
							});
						nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.text).not.toContain('govuk-summary-list__row costs-appellant-decision');
					});
				});
		});

		describe('LPA costs decision', () => {
			appealStatuses
				.filter(({ statusPassedEvent }) => statusPassedEvent)
				.forEach(({ appealStatus }) => {
					it(`should render a row in the case overview accordion, if the appeal status is "issue_determination" or after (${appealStatus})`, async () => {
						const appealId = 2;

						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealData,
								appealId,
								completedStateList: ['awaiting_event'],
								appealStatus,
								costs: {
									lpaApplicationFolder: {
										documents: [{ id: 1 }]
									}
								}
							});
						nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.text).toContain('govuk-summary-list__row costs-lpa-decision');

						const rowHtml = parseHtml(response.text, {
							rootElement: '.govuk-summary-list__row.costs-lpa-decision',
							skipPrettyPrint: true
						}).innerHTML;

						expect(rowHtml).toMatchSnapshot();
						expect(rowHtml).toContain('LPA costs decision</dt>');
						expect(rowHtml).toContain(
							'Issue<span class="govuk-visually-hidden"> LPA costs decision</span></a></dd></div>'
						);
					});
				});

			appealStatuses
				.filter(({ statusPassedEvent }) => !statusPassedEvent)
				.forEach(({ appealStatus }) => {
					it(`should not render a row in the case overview accordion , if the appeal status is before "issue_determination" (${appealStatus})`, async () => {
						const appealId = 2;

						nock('http://test/')
							.get(`/appeals/${appealId}`)
							.reply(200, {
								...appealData,
								appealId,
								completedStateList: ['event'],
								appealStatus,
								costs: {
									lpaApplicationFolder: {
										documents: [{ id: 1 }]
									}
								}
							});
						nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);

						const response = await request.get(`${baseUrl}/${appealId}`);

						expect(response.text).not.toContain('govuk-summary-list__row costs-lpa-decision');
					});
				});
		});

		describe('Inquiry', () => {
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
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=appellant_proofs_evidence`)
					.reply(200, { items: [] });
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=lpa_proofs_evidence`)
					.reply(200, { items: [] });
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } });
			});

			it('should not render the Inquiry accordion for HAS cases', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						procedureType: 'Inquiry'
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Case details</h1>');
				expect(unprettifiedHTML).not.toContain('<div id="case-details-inquiry-section">');
				expect(unprettifiedHTML).not.toContain('Inquiry</span></h2>');
			});

			it('should render the Site accordion for HAS cases', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						procedureType: 'Inquiry'
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Case details</h1>');
				expect(unprettifiedHTML).toContain('Site</span></h2>');
			});

			for (const procedureType of [APPEAL_CASE_PROCEDURE.WRITTEN, APPEAL_CASE_PROCEDURE.HEARING]) {
				it(`should not render the Inquiry accordion for s78 cases with a procedureType of ${procedureType}`, async () => {
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
					expect(unprettifiedHTML).not.toContain('<div id="case-details-inquiry-section">');
					expect(unprettifiedHTML).not.toContain('Inquiry</span></h2>');
				});
			}

			for (const procedureType of [APPEAL_CASE_PROCEDURE.HEARING, APPEAL_CASE_PROCEDURE.INQUIRY]) {
				it(`should not render the site accordion for s78 cases with a procedureType of ${procedureType}`, async () => {
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
					expect(unprettifiedHTML).not.toContain('<div id="case-details-site-section">');
					expect(unprettifiedHTML).not.toContain('Site</span></h2>');
				});
			}

			it('should render the Inquiry accordion with the expected content for s78 cases with a procedureType of "Inquiry"', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealDataFullPlanning,
						appealId,
						procedureType: APPEAL_CASE_PROCEDURE.INQUIRY
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Case details</h1>');
				expect(unprettifiedHTML).toContain('<div id="case-details-inquiry-section">');
				expect(unprettifiedHTML).toContain('Inquiry</span></h2>');

				const inquirySectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-inquiry-section'
				}).innerHTML;

				expect(inquirySectionHtml).toMatchSnapshot();

				const unprettifiedInquirySectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-inquiry-section',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedInquirySectionHtml).toContain('Inquiry estimates</h3>');
				expect(unprettifiedInquirySectionHtml).toContain(
					`href="/appeals-service/appeal-details/${appealId}/inquiry/estimates/add">Add inquiry estimates</a>`
				);
			});

			it('should render the inquiry details summary list when inquiry is present with address', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealDataFullPlanning,
						appealId,
						procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
						inquiry: {
							inquiryId: '123',
							inquiryStartTime: '2025-05-15T12:00:00.000Z',
							estimatedDays: 6,
							address: {
								addressLine1: '123 Main St',
								addressLine2: 'Apt 1',
								town: 'Anytown',
								county: 'Anycounty',
								postcode: 'AA1 1AA'
							}
						}
					});
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=appellant_proofs_evidence`)
					.reply(200, {});

				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=lpa_proofs_evidence`)
					.reply(200, {});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Case details</h1>');
				expect(unprettifiedHTML).toContain('<div id="case-details-inquiry-section">');
				expect(unprettifiedHTML).toContain('Inquiry</span></h2>');

				const inquirySectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-inquiry-section'
				}).innerHTML;

				expect(inquirySectionHtml).toMatchSnapshot();

				const unprettifiedInquirySectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-inquiry-section',
					skipPrettyPrint: true
				});

				expect(
					unprettifiedInquirySectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[0]
						?.innerHTML.trim()
				).toEqual('15 May 2025');
				expect(
					unprettifiedInquirySectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[1]
						?.innerHTML.trim()
				).toEqual(dateISOStringToDisplayTime12hr('2025-05-15T12:00:00.000Z'));
				expect(
					unprettifiedInquirySectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[2]
						?.innerHTML.trim()
				).toEqual('Yes');
				expect(
					unprettifiedInquirySectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[3]
						?.innerHTML.trim()
				).toEqual('6 Days');
				expect(
					unprettifiedInquirySectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[4]
						?.innerHTML.trim()
				).toEqual('Yes');
				expect(
					unprettifiedInquirySectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[5]
						?.innerHTML.split('<br>')
						.map((line) => line.trim())
				).toEqual(['123 Main St', 'Apt 1', 'Anytown', 'Anycounty', 'AA1 1AA']);
				expect(
					unprettifiedInquirySectionHtml.querySelector('a[data-cy="change-date"]')?.attributes?.href
				).toEqual(`${baseUrl}/${appealId}/inquiry/change/date`);
				expect(
					unprettifiedInquirySectionHtml.querySelector('a[data-cy="change-time"]')?.attributes?.href
				).toEqual(`${baseUrl}/${appealId}/inquiry/change/date`);
				expect(
					unprettifiedInquirySectionHtml.querySelector(
						'a[data-cy="change-whether-the-estimated-number-of-days-is-known-or-not"]'
					)?.attributes?.href
				).toEqual(`${baseUrl}/${appealId}/inquiry/change/estimation`);
				expect(
					unprettifiedInquirySectionHtml.querySelector('a[data-cy="change-estimated-days"]')
						?.attributes?.href
				).toEqual(`${baseUrl}/${appealId}/inquiry/change/estimation`);
				expect(
					unprettifiedInquirySectionHtml.querySelector(
						'a[data-cy="change-whether-the-address-is-known-or-not"]'
					)?.attributes?.href
				).toEqual(`${baseUrl}/${appealId}/inquiry/change/address`);
				expect(
					unprettifiedInquirySectionHtml.querySelector('a[data-cy="change-address"]')?.attributes
						?.href
				).toEqual(`${baseUrl}/${appealId}/inquiry/change/address-details`);
			});

			it('should render the inquiry details summary list when inquiry is present with no address', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealDataFullPlanning,
						appealId,
						procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
						inquiry: {
							inquiryId: '123',
							inquiryStartTime: '2025-05-15T12:00:00.000Z',
							estimatedDays: 6
						}
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Case details</h1>');
				expect(unprettifiedHTML).toContain('<div id="case-details-inquiry-section">');
				expect(unprettifiedHTML).toContain('Inquiry</span></h2>');

				const inquirySectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-inquiry-section'
				}).innerHTML;

				expect(inquirySectionHtml).toMatchSnapshot();

				const unprettifiedInquirySectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-inquiry-section',
					skipPrettyPrint: true
				});

				expect(
					unprettifiedInquirySectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[0]
						?.innerHTML.trim()
				).toEqual('15 May 2025');
				expect(
					unprettifiedInquirySectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[1]
						?.innerHTML.trim()
				).toEqual(dateISOStringToDisplayTime12hr('2025-05-15T12:00:00.000Z'));
				expect(
					unprettifiedInquirySectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[2]
						?.innerHTML.trim()
				).toEqual('Yes');
				expect(
					unprettifiedInquirySectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[3]
						?.innerHTML.trim()
				).toEqual('6 Days');
				expect(
					unprettifiedInquirySectionHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[4]
						?.innerHTML.trim()
				).toEqual('No');
				expect(
					unprettifiedInquirySectionHtml.querySelectorAll('dd.govuk-summary-list__value')?.[5]
				).toBeFalsy();
			});

			it('should render the Inquiry estimates summary list when estimates are present', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealDataFullPlanning,
						appealId,
						procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
						inquiryEstimate: {
							preparationTime: 1,
							sittingTime: 2.5,
							reportingTime: 3
						},
						inquiry: null
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Case details</h1>');
				expect(unprettifiedHTML).toContain('<div id="case-details-inquiry-section">');
				expect(unprettifiedHTML).toContain('Inquiry</span></h2>');

				const inquirySectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-inquiry-section'
				}).innerHTML;

				expect(inquirySectionHtml).toMatchSnapshot();

				const unprettifiedInquirySectionHtml = parseHtml(response.text, {
					rootElement: '#case-details-inquiry-section',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedInquirySectionHtml).toContain('Inquiry estimates</h3>');
				expect(unprettifiedInquirySectionHtml).toContain(
					'<dd class="govuk-summary-list__value"> 1 day</dd>'
				);
				expect(unprettifiedInquirySectionHtml).toContain(
					'<dd class="govuk-summary-list__value"> 2.5 days</dd>'
				);
				expect(unprettifiedInquirySectionHtml).toContain(
					'<dd class="govuk-summary-list__value"> 3 days</dd>'
				);
				expect(unprettifiedInquirySectionHtml).toContain(
					`<dd class="govuk-summary-list__actions"><a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/inquiry/estimates/change"`
				);
			});
		});

		describe('Cancel appeal', () => {
			const appealId = appealData.appealId.toString();

			beforeEach(() => {
				nock.cleanAll();
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=appellant_final_comment`)
					.reply(200, appellantFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
					.reply(200, lpaFinalCommentsAwaitingReview);
				nock('http://test/')
					.get(/appeals\/\d+\/appellant-cases\/\d+/)
					.reply(200, { planningObligation: { hasObligation: false } });
			});

			it('should render the cancel appeal section if appeal status is not withdrawn or invalid', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, { ...appealData, appealStatus: APPEAL_CASE_STATUS.VALIDATION });
				const response = await request.get(`${baseUrl}/${appealId}`);

				const cancelSection = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: '#case-details-cancel-section'
				}).innerHTML;
				expect(cancelSection).toContain('Cancel appeal</h3>');
				expect(cancelSection).toContain(
					`href="/appeals-service/appeal-details/${appealId}/cancel">Cancel appeal`
				);
			});

			it('should not render the cancel appeal section if appeal status is withdrawn', async () => {
				const appealId = appealData.appealId.toString();
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, { ...appealData, appealStatus: APPEAL_CASE_STATUS.WITHDRAWN });
				const response = await request.get(`${baseUrl}/${appealId}`);

				const element = parseHtml(response.text);
				const cancelSection = element?.querySelector('#case-details-cancel-section');

				expect(cancelSection).toBeNull();
			});

			it('should not render the cancel appeal section if appeal status is invalid', async () => {
				const appealId = appealData.appealId.toString();
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, { ...appealData, appealStatus: APPEAL_CASE_STATUS.INVALID });
				const response = await request.get(`${baseUrl}/${appealId}`);

				const element = parseHtml(response.text);
				const cancelSection = element?.querySelector('#case-details-cancel-section');

				expect(cancelSection).toBeNull();
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
