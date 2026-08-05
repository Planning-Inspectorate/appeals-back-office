import {
	appealData,
	appealDataEnforcementNotice,
	appellantCaseDataNotValidated,
	appellantCaseIncompleteReasons,
	appellantCaseInvalidReasons,
	documentRedactionStatuses
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appellantCasePagePath = '/appellant-case';
const invalidOutcomePagePath = '/invalid';
const incompleteOutcomePagePath = '/incomplete';
const updateDueDatePagePath = '/date';
const checkYourAnswersPagePath = '/check-your-answers';

const invalidReasonsWithoutText = appellantCaseInvalidReasons.filter(
	(reason) => reason.hasText === false
);
const invalidReasonsWithText = appellantCaseInvalidReasons.filter(
	(reason) => reason.hasText === true
);
const incompleteReasonsWithoutText = appellantCaseIncompleteReasons.filter(
	(reason) => reason.hasText === false
);
const incompleteReasonsWithText = appellantCaseIncompleteReasons.filter(
	(reason) => reason.hasText === true
);

const invalidReasonsWithoutTextIds = invalidReasonsWithoutText.map((reason) => reason.id);
const invalidReasonsWithTextIds = invalidReasonsWithText.map((reason) => reason.id);
const incompleteReasonsWithoutTextIds = incompleteReasonsWithoutText.map((reason) => reason.id);
const incompleteReasonsWithTextIds = incompleteReasonsWithText.map((reason) => reason.id);

describe('appellant-case check-your-answers', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /appellant-case/check-your-answers', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
			nock('http://test/')
				.get('/appeals/appellant-case-incomplete-reasons')
				.reply(200, appellantCaseIncompleteReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the 500 error page if required data is not present in the session', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${checkYourAnswersPagePath}`
			);

			expect(response.statusCode).toBe(500);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should render the check your answers page with the expected content if outcome is "invalid" and required data is present in the session', async () => {
			// post to invalid reason page controller is necessary to set required data in the session
			const invalidReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`invalidReason-${invalidReasonsWithTextIds[1]}`]: [
						'test reason text 1',
						'test reason text 2'
					]
				});

			expect(invalidReasonPostResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${checkYourAnswersPagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Check your answers before confirming your review</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Review outcome</dt><dd class="govuk-summary-list__value"> Invalid</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Confirming this review will inform the relevant parties of the outcome.</div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});

		it('should render the check your answers page with the expected content if outcome is "incomplete" and required data is present in the session', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			// post to update date page controller is necessary to set updated due date
			const updateDateResponse = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': '12',
					'due-date-year': '3000'
				});

			expect(updateDateResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${checkYourAnswersPagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Check your answers before confirming your review</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Review outcome</dt><dd class="govuk-summary-list__value"> Incomplete</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Confirming this review will inform the relevant parties of the outcome.</div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});

		it('should render the check your answers page with the expected content if the outcome is "invalid" and the appeal type is enforcement notice', async () => {
			// mocking for enforcement notice
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}?include=all`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
			nock('http://test/')
				.get('/appeals/appellant-case-incomplete-reasons')
				.reply(200, appellantCaseIncompleteReasons);
			nock('http://test/')
				.post(`/appeals/notify-preview/enforcement-appeal-invalid-appellant.content.md`)
				.reply(200, { renderedHtml: '' });
			nock('http://test/')
				.post(`/appeals/notify-preview/enforcement-appeal-invalid-lpa.content.md`)
				.reply(200, { renderedHtml: '' });
			nock('http://test/')
				.get(`/appeals/${appealDataEnforcementNotice.appealId}/case-team-email`)
				.reply(200, {
					id: 1,
					email: 'caseofficers@planninginspectorate.gov.uk',
					name: 'standard email'
				});

			// post to incomplete reason page controller is necessary to set required data in the session
			const enforcementNoticeInvalidResponse = await request
				.post(`${baseUrl}/1/appellant-case/invalid/enforcement-notice`)
				.send({ enforcementNoticeInvalid: 'no' });
			expect(enforcementNoticeInvalidResponse.statusCode).toBe(302);

			const invalidReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`invalidReason-${invalidReasonsWithTextIds[1]}`]: [
						'test reason text 1',
						'test reason text 2'
					]
				});
			expect(invalidReasonPostResponse.statusCode).toBe(302);

			const otherLiveAppealsResponse = await request
				.post(`${baseUrl}/1/appellant-case/invalid/other-live-appeals`)
				.send({ otherLiveAppeals: 'no' });
			expect(otherLiveAppealsResponse.statusCode).toBe(302);

			// post to update date page controller is necessary to set updated due date
			const updateDateResponse = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': '12',
					'due-date-year': '3000'
				});

			expect(updateDateResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${checkYourAnswersPagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Check details and mark appeal as invalid</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Review decision</dt><dd class="govuk-summary-list__value"> Invalid</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Is the enforcement notice invalid?</dt><dd class="govuk-summary-list__value"> No</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there any other live appeals against the enforcement notice?</dt><dd class="govuk-summary-list__value"> No</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'We will mark the appeal as invalid and send an email to the relevant parties.</div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Mark appeal as invalid</button>');
			expect(element.innerHTML).toContain('Check details and mark appeal as invalid</h1>');
			expect(element.innerHTML).toContain('Preview email to appellant');
			expect(element.innerHTML).toContain('Preview email to LPA');
		});
	});

	describe('POST /appellant-case/check-your-answers', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should send a patch request to the appellant-cases API endpoint and redirect to the appeal details page, if posted outcome was "invalid"', async () => {
			// post to invalid reason page controller is necessary to set required data in the session
			const invalidReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithoutTextIds[0]
				});

			expect(invalidReasonPostResponse.statusCode).toBe(302);

			const mockedAppellantCasesEndpoint = nock('http://test/')
				.patch('/appeals/1/appellant-cases/0')
				.reply(200, { validationOutcome: 'invalid' });

			const response = await request.post(
				`${baseUrl}/1${appellantCasePagePath}${checkYourAnswersPagePath}`
			);

			expect(mockedAppellantCasesEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should send a patch request to the appellant-cases API endpoint and redirect to the appeal details page, if posted outcome was "incomplete"', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithoutTextIds[0]
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const mockedAppellantCasesEndpoint = nock('http://test/')
				.patch('/appeals/1/appellant-cases/0')
				.reply(200, { validationOutcome: 'incomplete' });

			const response = await request.post(
				`${baseUrl}/1${appellantCasePagePath}${checkYourAnswersPagePath}`
			);

			expect(mockedAppellantCasesEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});
});
