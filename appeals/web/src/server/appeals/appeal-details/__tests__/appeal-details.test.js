import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import {
	appealData,
	linkedAppeals,
	linkableAppealSummaryBackOffice,
	linkableAppealSummaryHorizon,
	siteVisitData,
	costsFolderInfoAppellant,
	costsFolderInfoLpa,
	costsFolderInfoDecision,
	documentRedactionStatuses,
	appealCostsDocumentItem,
	linkedAppealsWithExternalLead,
	fileUploadInfo
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('appeal-details', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /:appealId', () => {
		describe('Notification banners', () => {
			const notificationBannerElement = '.govuk-notification-banner';
			it('should render a "This appeal is awaiting transfer" success notification banner with a link to add the Horizon reference of the transferred appeal when the appeal is awaiting transfer', async () => {
				const appealId = 2;

				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, { ...appealData, appealId, appealStatus: 'awaiting_transfer' });

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
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
					'href="/appeals-service/appeal-details/2/assign-user/case-officer"'
				);
				expect(notificationBannerElementHTML).toContain('Assign case officer</a>');
			});

			it('should render a "Horizon reference added" success notification banner, a "Transferred" status tag, and an inset text component with the appeal type and horizon link for the transferred appeal, when the appeal was successfully transferred to horizon', async () => {
				nock.cleanAll();

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
					rootElement: '.govuk-tag'
				}).innerHTML;
				const insetTextElementHTML = parseHtml(response.text, {
					rootElement: '.govuk-inset-text'
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toMatch('Horizon reference added</p>');

				//TODO: BOAT-1100: Move the tag test to it's own test
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
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}`)
					.reply(200, appealData)
					.persist();

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
				const appealReference = '12345';

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
				const appealReference = '12345';

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
				const appealReference = '12345';

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
				const appealReference = '12345';

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

			it('should render a success notification banner when the site visit type was updated', async () => {
				nock('http://test/').get(`/appeals/1`).reply(200, appealData);
				nock('http://test/').patch('/appeals/1/site-visits/0').reply(200, siteVisitData);

				await request.post(`${baseUrl}/1/site-visit/set-visit-type`).send({
					'visit-type': 'accompanied'
				});
				const caseDetailsResponse = await request.get(`${baseUrl}/1`);

				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Site visit type has been selected</p>');
			});

			it('should render a success notification banner when an appellant costs document was uploaded', async () => {
				nock('http://test/')
					.get('/appeals/1/document-folders/1')
					.reply(200, costsFolderInfoAppellant)
					.persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses);
				nock('http://test/').post('/appeals/1/documents').reply(200);

				const selectDocumentTypeResponse = await request
					.post(`${baseUrl}/1/costs/appellant/select-document-type/1`)
					.send({
						'costs-document-type': '1'
					});

				expect(selectDocumentTypeResponse.statusCode).toBe(302);

				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/appellant/upload-documents/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const postCheckAndConfirmResponse = await request
					.post(`${baseUrl}/1/costs/appellant/check-your-answers/1`)
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
				expect(notificationBannerElementHTML).toContain('Appellant costs documents uploaded</p>');
			});

			it('should render a success notification banner when an LPA costs document was uploaded', async () => {
				nock('http://test/')
					.get('/appeals/1/document-folders/2')
					.reply(200, costsFolderInfoLpa)
					.persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses);
				nock('http://test/').post('/appeals/1/documents').reply(200);

				const selectDocumentTypeResponse = await request
					.post(`${baseUrl}/1/costs/lpa/select-document-type/2`)
					.send({
						'costs-document-type': '1'
					});

				expect(selectDocumentTypeResponse.statusCode).toBe(302);

				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/lpa/upload-documents/2`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const postCheckAndConfirmResponse = await request
					.post(`${baseUrl}/1/costs/lpa/check-your-answers/2`)
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
				expect(notificationBannerElementHTML).toContain('LPA costs documents uploaded</p>');
			});

			it('should render a success notification banner when a costs decision document was uploaded', async () => {
				nock('http://test/')
					.get('/appeals/1/document-folders/3')
					.reply(200, costsFolderInfoDecision)
					.persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses);
				nock('http://test/').post('/appeals/1/documents').reply(200);

				const selectDocumentTypeResponse = await request
					.post(`${baseUrl}/1/costs/decision/select-document-type/3`)
					.send({
						'costs-document-type': '1'
					});

				expect(selectDocumentTypeResponse.statusCode).toBe(302);

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

			it('should render a success notification banner when a service user was updated', async () => {
				nock('http://test/').get(`/appeals/1`).reply(200, appealData);
				nock('http://test/').patch(`/appeals/1/service-user`).reply(200, {
					serviceUserId: 1
				});
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
				nock('http://test/').patch(`/appeals/${appealId}`).reply(200, {
					planningApplicationReference: '12345/A/67890'
				});

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
				expect(notificationBannerElementHTML).toContain('LPA application reference updated</p>');
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

			it('should render a success notification banner when the neighbouring site affected value is updated', async () => {
				const appealId = appealData.appealId;
				const lpaQuestionnaireId = appealData.lpaQuestionnaireId;

				nock('http://test/')
					.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, {});

				await request.get(`${baseUrl}/${appealId}/neighbouring-sites/change/affected`);

				await request
					.post(`${baseUrl}/${appealId}/neighbouring-sites/change/affected`)
					.send({ neighbouringSiteAffected: 'yes' });

				const caseDetailsResponse = await request.get(`${baseUrl}/1`);
				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain(
					'Neighbouring site affected status updated</p>'
				);
			});
		});

		it('should render the received appeal details for a valid appealId with no linked/other appeals', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').get(`/appeals/${appealId}`).reply(200, undefined);

			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Case details</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Linked appeals</dt><dd class="govuk-summary-list__value"><span>No appeals</span>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Related appeals</dt><dd class="govuk-summary-list__value"><span>No appeals</span>'
			);
		});

		it('should render the header with navigation containing links to the personal list, national list, and sign out route, without any active modifier classes', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').get(`/appeals/${appealId}`).reply(200, undefined);

			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text, { rootElement: 'header' });

			expect(element.innerHTML).toMatchSnapshot();
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

			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Case details</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(
				'Start date</dt><dd class="govuk-summary-list__value"> Not added</dd>'
			);
		});

		it('should render a page not found when the appealId is not valid/does not exist', async () => {
			const appealIdThatDoesNotExist = 999;

			nock('http://test/').get(`/appeals/${appealIdThatDoesNotExist}`).reply(404);

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

			const response = await request.get(`${baseUrl}/${appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: '.govuk-notification-banner'
			}).innerHTML;
			expect(notificationBannerElementHTML).toContain('Important</h3>');
			expect(notificationBannerElementHTML).toContain('Ready for decision</p>');
			expect(notificationBannerElementHTML).toContain(
				'href="/appeals-service/appeal-details/1/issue-decision/decision">Issue decision</a>'
			);
		});

		it('should render a Decision inset panel when the appealStatus is complete', async () => {
			const appealId = '2';

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealStatus: 'complete' });

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

			const response = await request.get(`${baseUrl}/${appealId}`);

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(
				'Appellant case</th><td class="govuk-table__cell">Incomplete</td>'
			);
		});

		it('should render the appellant case status as "Incomplete" if the appellant case validation status is incomplete, and the due date is today', async () => {
			// Do not fakes here stop nock from timing out, by stopping jest from freezing time
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

			const response = await request.get(`${baseUrl}/${appealId}`);

			jest.useRealTimers();

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(
				'Appellant case</th><td class="govuk-table__cell">Incomplete</td>'
			);
		});

		it('should render the appellant case status as "Overdue" if the appellant case validation status is incomplete, and the due date is in the past', async () => {
			const appealId = '2';

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealData,
					appealStatus: 'validation',
					documentationSummary: {
						appellantCase: {
							status: 'incomplete',
							dueDate: '2024-02-01T10:27:06.626Z'
						}
					}
				});

			const response = await request.get(`${baseUrl}/${appealId}`);

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(
				'Appellant case</th><td class="govuk-table__cell">Overdue</td>'
			);
		});

		it('should render an action link to the add linked appeal page in the linked appeals row, if there are no linked appeals', async () => {
			nock.cleanAll();
			nock('http://test/').get(`/appeals/${appealData.appealId}`).reply(200, appealData).persist();

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

			const response = await request.get(`${baseUrl}/${appealData.appealId}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const linkedAppealsRowElement = parseHtml(response.text, {
				rootElement: '.appeal-linked-appeals',
				skipPrettyPrint: true
			});

			expect(linkedAppealsRowElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/1/linked-appeals/manage" data-cy="manage-linked-appeals"> Manage<span class="govuk-visually-hidden"> Linked appeals</span></a>'
			);
			expect(linkedAppealsRowElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/1/linked-appeals/add" data-cy="add-linked-appeal"> Add<span class="govuk-visually-hidden"> Linked appeals</span></a>'
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

			const response = await request.get(`${baseUrl}/${appealId}`);

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text, { rootElement: '.govuk-notification-banner' });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Important</h3>');
			expect(element.innerHTML).toContain('Appeal valid</p>');
			expect(element.innerHTML).toContain(
				'href="/appeals-service/appeal-details/2/start-case/add">Start case</a>'
			);
		});

		describe('Costs', () => {
			it('should render an appellant costs row in the case documentation accordion with empty status and received columns, and "add" action button, if the appellant costs documents folder is empty', async () => {
				const appealId = 2;
				nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData);

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const appellantCostsDocumentationElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-appellant-documentation'
				});
				const appellantCostsStatusElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-appellant-status'
				});
				const appellantCostsDueDateElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-appellant-due-date'
				});
				const appellantCostsActionsElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-appellant-actions'
				});

				expect(appellantCostsDocumentationElement.innerHTML).toEqual(
					'<th scope="row" class="govuk-table__header appeal-costs-appellant-documentation">Costs (appellant)</th>'
				);
				expect(appellantCostsStatusElement.innerHTML).toEqual(
					'<td class="govuk-table__cell appeal-costs-appellant-status"></td>'
				);
				expect(appellantCostsDueDateElement.innerHTML).toEqual(
					'<td class="govuk-table__cell appeal-costs-appellant-due-date"></td>'
				);
				expect(appellantCostsActionsElement.innerHTML).not.toContain(
					'/costs/appellant/manage-documents/1">Manage</a>'
				);
				expect(appellantCostsActionsElement.innerHTML).toContain(
					'/costs/appellant/select-document-type/1">Add</a>'
				);
			});

			it('should render an LPA costs row in the case documentation accordion with empty status and received columns, and "add" action button, if the LPA costs documents folder is empty', async () => {
				const appealId = 2;
				nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData);

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const lpaCostsDocumentationElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-lpa-documentation'
				});
				const lpaCostsStatusElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-lpa-status'
				});
				const lpaCostsDueDateElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-lpa-due-date'
				});
				const lpaCostsActionsElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-lpa-actions'
				});

				expect(lpaCostsDocumentationElement.innerHTML).toEqual(
					'<th scope="row" class="govuk-table__header appeal-costs-lpa-documentation">Costs (LPA)</th>'
				);
				expect(lpaCostsStatusElement.innerHTML).toEqual(
					'<td class="govuk-table__cell appeal-costs-lpa-status"></td>'
				);
				expect(lpaCostsDueDateElement.innerHTML).toEqual(
					'<td class="govuk-table__cell appeal-costs-lpa-due-date"></td>'
				);
				expect(lpaCostsActionsElement.innerHTML).not.toContain(
					'/costs/lpa/manage-documents/2">Manage</a>'
				);
				expect(lpaCostsActionsElement.innerHTML).toContain(
					'/costs/lpa/select-document-type/2">Add</a>'
				);
			});

			it('should render a costs decision row in the case documentation accordion with empty status and received columns, and "add" action button, if the costs decision documents folder is empty', async () => {
				const appealId = 2;
				nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData);

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const decisionCostsDocumentationElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-decision-documentation'
				});
				const decisionCostsStatusElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-decision-status'
				});
				const decisionCostsDueDateElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-decision-due-date'
				});
				const decisionCostsActionsElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-decision-actions'
				});

				expect(decisionCostsDocumentationElement.innerHTML).toEqual(
					'<th scope="row" class="govuk-table__header appeal-costs-decision-documentation">Costs decision</th>'
				);
				expect(decisionCostsStatusElement.innerHTML).toEqual(
					'<td class="govuk-table__cell appeal-costs-decision-status"></td>'
				);
				expect(decisionCostsDueDateElement.innerHTML).toEqual(
					'<td class="govuk-table__cell appeal-costs-decision-due-date"></td>'
				);
				expect(decisionCostsActionsElement.innerHTML).not.toContain(
					'/costs/decision/manage-documents/3">Manage</a>'
				);
				expect(decisionCostsActionsElement.innerHTML).toContain(
					'/costs/decision/upload-documents/3">Add</a>'
				);
			});

			it('should render an appellant costs row in the case documentation accordion with "Received" status, empty received column, and "add" and "manage" action buttons, if there are documents in the appellant costs documents folder', async () => {
				const appealId = 3;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						costs: {
							appellantFolder: {
								caseId: 1,
								folderId: 1,
								path: 'appeal_costs/appellant',
								documents: [appealCostsDocumentItem]
							}
						}
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const appellantCostsDocumentationElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-appellant-documentation'
				});
				const appellantCostsStatusElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-appellant-status'
				});
				const appellantCostsDueDateElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-appellant-due-date'
				});
				const appellantCostsActionsElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-appellant-actions'
				});

				expect(appellantCostsDocumentationElement.innerHTML).toEqual(
					'<th scope="row" class="govuk-table__header appeal-costs-appellant-documentation">Costs (appellant)</th>'
				);
				expect(appellantCostsStatusElement.innerHTML).toEqual(
					'<td class="govuk-table__cell appeal-costs-appellant-status">Received</td>'
				);
				expect(appellantCostsDueDateElement.innerHTML).toEqual(
					'<td class="govuk-table__cell appeal-costs-appellant-due-date"></td>'
				);
				expect(appellantCostsActionsElement.innerHTML).toContain(
					'/costs/appellant/manage-documents/1">Manage</a>'
				);
				expect(appellantCostsActionsElement.innerHTML).toContain(
					'/costs/appellant/select-document-type/1">Add</a>'
				);
			});

			it('should render an LPA costs row in the case documentation accordion with "Received" status, empty received column, and "add" and "manage" action buttons, if there are documents in the LPA costs documents folder', async () => {
				const appealId = 3;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						costs: {
							lpaFolder: {
								caseId: 1,
								folderId: 2,
								path: 'appeal_costs/lpa',
								documents: [appealCostsDocumentItem]
							}
						}
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const lpaCostsDocumentationElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-lpa-documentation'
				});
				const lpaCostsStatusElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-lpa-status'
				});
				const lpaCostsDueDateElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-lpa-due-date'
				});
				const lpaCostsActionsElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-lpa-actions'
				});

				expect(lpaCostsDocumentationElement.innerHTML).toEqual(
					'<th scope="row" class="govuk-table__header appeal-costs-lpa-documentation">Costs (LPA)</th>'
				);
				expect(lpaCostsStatusElement.innerHTML).toEqual(
					'<td class="govuk-table__cell appeal-costs-lpa-status">Received</td>'
				);
				expect(lpaCostsDueDateElement.innerHTML).toEqual(
					'<td class="govuk-table__cell appeal-costs-lpa-due-date"></td>'
				);
				expect(lpaCostsActionsElement.innerHTML).toContain(
					'/costs/lpa/manage-documents/2">Manage</a>'
				);
				expect(lpaCostsActionsElement.innerHTML).toContain(
					'/costs/lpa/select-document-type/2">Add</a>'
				);
			});

			it('should render a costs decision row in the case documentation accordion with "Uploaded" status, empty received column, and "add" and "manage" action buttons, if there are documents in the costs decision documents folder', async () => {
				const appealId = 3;
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						costs: {
							decisionFolder: {
								caseId: 1,
								folderId: 3,
								path: 'appeal_costs/decision',
								documents: [appealCostsDocumentItem]
							}
						}
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const decisionCostsDocumentationElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-decision-documentation'
				});
				const decisionCostsStatusElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-decision-status'
				});
				const decisionCostsDueDateElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-decision-due-date'
				});
				const decisionCostsActionsElement = parseHtml(response.text, {
					rootElement: '.appeal-costs-decision-actions'
				});

				expect(decisionCostsDocumentationElement.innerHTML).toEqual(
					'<th scope="row" class="govuk-table__header appeal-costs-decision-documentation">Costs decision</th>'
				);
				expect(decisionCostsStatusElement.innerHTML).toEqual(
					'<td class="govuk-table__cell appeal-costs-decision-status">Uploaded</td>'
				);
				expect(decisionCostsDueDateElement.innerHTML).toEqual(
					'<td class="govuk-table__cell appeal-costs-decision-due-date"></td>'
				);
				expect(decisionCostsActionsElement.innerHTML).toContain(
					'/costs/decision/manage-documents/3">Manage</a>'
				);
				expect(decisionCostsActionsElement.innerHTML).toContain(
					'/costs/decision/upload-documents/3">Add</a>'
				);
			});
		});

		describe('Appeal decision', () => {
			it('should render a row in the case documentation accordion with "Appeal decision" in the Documentation (label) column', async () => {
				const response = await request.get(`${baseUrl}/1`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-documentation',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain('Appeal decision</th>');
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

				const response = await request.get(`${baseUrl}/${appealId}`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-status',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain('Sent</td>');
			});

			it('should render a row in the case documentation accordion with no text in the Due date column', async () => {
				const response = await request.get(`${baseUrl}/1`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-due-date',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain(
					'<td class="govuk-table__cell appeal-decision-due-date"></td>'
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

				const response = await request.get(`${baseUrl}/${appealId}`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-actions',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain(
					'href="/appeals-service/appeal-details/2/issue-decision/decision">Issue</a>'
				);
			});

			it('should render a row in the case documentation accordion with no link in the Actions column, if the appeal status is anything other than "issue_determination" or "complete"', async () => {
				const appealId = 2;

				const statuses = [
					'assign_case_officer',
					'validation',
					'ready_to_start',
					'lpa_questionnaire',
					'statement_review',
					'final_comment_review',
					'invalid',
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

					const response = await request.get(`${baseUrl}/${appealId}`);

					const columnHtml = parseHtml(response.text, {
						rootElement: '.appeal-decision-actions',
						skipPrettyPrint: true
					}).innerHTML;

					expect(columnHtml).toMatchSnapshot();
					expect(columnHtml).toContain(
						status === 'awaiting_transfer'
							? '<td class="govuk-table__cell appeal-decision-actions"></td>'
							: '<td class="govuk-table__cell appeal-decision-actions"><ul class="govuk-summary-list__actions-list"></ul></td>'
					);
				}
			});

			it('should render a row in the case documentation accordion with "Virus scanning" status tag in the Actions column, if the appeal status is "complete" and the document virus scan is pending', async () => {
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

				const response = await request.get(`${baseUrl}/${appealId}`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-actions',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain(
					'<li class="govuk-summary-list__actions-list-item"><strong class="govuk-tag govuk-tag--yellow single-line">Virus scanning</strong></li>'
				);
			});

			it('should render a row in the case documentation accordion with "Virus found" status tag in the Actions column, if the appeal status is "complete" and the document virus scan is complete and the scan result indicates the document is unsafe', async () => {
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
							virusCheckStatus: 'affected'
						}
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-actions',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain(
					'<li class="govuk-summary-list__actions-list-item"><strong class="govuk-tag govuk-tag--red single-line">Virus detected</strong></li>'
				);
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
							outcome: 'allowed',
							virusCheckStatus: 'scanned'
						}
					});

				const response = await request.get(`${baseUrl}/${appealId}`);

				const columnHtml = parseHtml(response.text, {
					rootElement: '.appeal-decision-actions',
					skipPrettyPrint: true
				}).innerHTML;

				expect(columnHtml).toMatchSnapshot();
				expect(columnHtml).toContain(
					'<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="/documents/2/download/448efec9-43d4-406a-92b7-1aecbdcd5e87/preview/">View</a></li>'
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

		const response = await request.get(`${baseUrl}/${appealId}`);
		const element = parseHtml(response.text, { rootElement: 'body' });

		const backButton = element?.querySelector('.govuk-back-link');

		expect(backButton).toBeNull();

		expect(element.innerHTML).toMatchSnapshot();
	});
});
