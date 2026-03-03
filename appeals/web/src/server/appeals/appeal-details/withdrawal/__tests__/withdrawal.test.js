import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import {
	appealData,
	appealDataAdvert,
	appealDataCasAdvert,
	appealDataCasPlanning,
	appealDataEnforcementNotice,
	appealDataFullPlanning,
	appealDataLdc,
	appealDataListedBuilding,
	documentFileInfo,
	documentRedactionStatuses,
	fileUploadInfo,
	withdrawalRequestData
} from '#testing/appeals/appeals.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { appellantEmailTemplate, lpaEmailTemplate } from '../withdrawl-test-data.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const withdrawalPath = '/withdrawal';
const withdrawalRequestStartPath = '/new';
const checkYourAnswersPath = '/check-details';
const withdrawalRequestViewPath = '/view';
const mockAppealId = '1';

describe('withdrawal', () => {
	beforeEach(() => {
		installMockApi();
		jest
			.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
			.setSystemTime(new Date('2026-02-01T12:00:00.000Z'));
	});
	afterEach(() => {
		teardown();
		jest.useRealTimers();
	});

	describe('GET /new', () => {
		it('should render the withdrawal request upload page with a file upload component', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestStartPath}`
			);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(`Request to withdraw appeal</h1>`);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');
		});
	});

	describe('POST /new', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
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
				'Found. Redirecting to /appeals-service/appeal-details/1/withdrawal/check-details'
			);
		});
	});

	describe('GET /withdrawal/check-your-answers', () => {
		describe.each([
			['householder', appealData, FEEDBACK_FORM_LINKS.HAS],
			['full planning', appealDataFullPlanning, FEEDBACK_FORM_LINKS.S78],
			['listed building', appealDataListedBuilding, FEEDBACK_FORM_LINKS.S20],
			['cas planning', appealDataCasPlanning, FEEDBACK_FORM_LINKS.CAS_PLANNING],
			['cas advert', appealDataCasAdvert, FEEDBACK_FORM_LINKS.CAS_ADVERTS],
			['full advert', appealDataAdvert, FEEDBACK_FORM_LINKS.FULL_ADVERTS],
			['ldc', appealDataLdc, FEEDBACK_FORM_LINKS.LAWFUL_DEVELOPMENT_CERTIFICATE],
			['enforcement notice', appealDataEnforcementNotice, FEEDBACK_FORM_LINKS.ENFORCEMENT_NOTICE]
		])('for %s appeal', (_, appealData, expectedAppealFeedbackLink) => {
			beforeEach(async () => {
				nock.cleanAll();
				nock('http://test/').get(`/appeals/1?include=all`).reply(200, appealData).persist();
				nock('http://test/').get(`/appeals/${appealData.appealId}/case-team-email`).reply(200, {
					id: 1,
					email: 'caseofficers@planninginspectorate.gov.uk',
					name: 'standard email'
				});
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/')
					.post(`/appeals/notify-preview/appeal-withdrawn-appellant.content.md`)
					.reply(200, appellantEmailTemplate);
				nock('http://test/')
					.post(`/appeals/notify-preview/appeal-withdrawn-lpa.content.md`)
					.reply(200, lpaEmailTemplate);

				await request
					.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestStartPath}`)
					.send({ 'upload-info': fileUploadInfo });
			});

			afterEach(teardown);

			it('should render the check your answers page', async () => {
				const response = await request.get(
					`${baseUrl}/${mockAppealId}${withdrawalPath}${checkYourAnswersPath}`
				);
				nock('http://test/').get('/appeals/1/case-team-email').reply(200, {
					id: 1,
					email: 'caseofficers@planninginspectorate.gov.uk',
					name: 'standard email'
				});
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Check details and withdraw appeal</h1>');
				expect(element.innerHTML).toContain('Request to withdraw appeal');
				expect(element.innerHTML).toContain('Preview email to appellant</span>');
				expect(element.innerHTML).toContain('Preview email to LPA</span>');

				expect(generateNotifyPreview).toHaveBeenCalledWith(
					expect.anything(),
					'appeal-withdrawn-appellant.content.md',
					{
						feedback_link: expectedAppealFeedbackLink,
						appeal_reference_number: appealData.appealReference,
						enforcement_reference: appealData.enforcementNotice?.appellantCase?.reference || '',
						event_set: true,
						event_type: 'site visit',
						lpa_reference: appealData.planningApplicationReference,
						site_address: expect.any(String),
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						withdrawal_date: '1 February 2026'
					}
				);
				expect(generateNotifyPreview).toHaveBeenCalledWith(
					expect.anything(),
					'appeal-withdrawn-lpa.content.md',
					{
						feedback_link: FEEDBACK_FORM_LINKS.LPA,
						appeal_reference_number: appealData.appealReference,
						enforcement_reference: appealData.enforcementNotice?.appellantCase?.reference || '',
						event_set: true,
						event_type: 'site visit',
						lpa_reference: appealData.planningApplicationReference,
						site_address: expect.any(String),
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						withdrawal_date: '1 February 2026'
					}
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
				expect(unprettifiedElement.innerHTML).toContain('Withdraw appeal</button>');
			});
		});
	});

	describe('POST /withdrawal/check-details', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.post(`/appeals/notify-preview/appeal-withdrawn-appellant.content.md`)
				.reply(200, appellantEmailTemplate);
			nock('http://test/')
				.post(`/appeals/notify-preview/appeal-withdrawn-lpa.content.md`)
				.reply(200, lpaEmailTemplate);
			nock('http://test/').post(`/appeals/1/withdrawal`).reply(200);
			nock('http://test/').post('/appeals/1/documents').reply(200);

			await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${withdrawalRequestStartPath}`)
				.send({ 'upload-info': fileUploadInfo });
		});

		afterEach(teardown);

		it('should render the check your asnwers page with the expected error message if confirm checkbox is not checked', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}${withdrawalPath}${checkYourAnswersPath}`)
				.send({});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});
	describe('GET /view', () => {
		afterEach(teardown);

		it('should render a 404 error page for the view withdrawal request document folder page of the appeal that is not withdrawn', async () => {
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);

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
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealDataWithWithdrawalData);
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);

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
