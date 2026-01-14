import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import {
	appealCaseEnforcementInvalidReasons,
	appealData,
	appealDataAdvert,
	appealDataCasAdvert,
	appealDataCasPlanning,
	appealDataEnforcementNotice,
	appealDataFullPlanning,
	appealDataListedBuilding,
	appellantCaseDataInvalidOutcome,
	appellantCaseDataNotValidated,
	appellantCaseInvalidReasons
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { appellantEmailTemplate, lpaEmailTemplate } from '../invalid-appeal-data.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const baseUrl = `/appeals-service/appeal-details/${appealId}`;

const invalidReasonsWithoutText = appellantCaseInvalidReasons.filter(
	(reason) => reason.hasText === false
);
const invalidReasonsWithText = appellantCaseInvalidReasons.filter(
	(reason) => reason.hasText === true
);

const invalidReasonsWithoutTextIds = invalidReasonsWithoutText.map((reason) => reason.id);
const invalidReasonsWithTextIds = invalidReasonsWithText.map((reason) => reason.id);

describe('invalid-appeal', () => {
	afterEach(teardown);

	describe('GET / , /new', () => {
		beforeEach(() => {
			installMockApi();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the invalid reason page', async () => {
			const response = await request.get(`${baseUrl}/invalid/new`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Why is the appeal invalid?</h1>');
			expect(element.innerHTML).toContain('data-module="govuk-checkboxes">');
			expect(element.innerHTML).toContain(
				'for="invalid-reason">Appeal has not been submitted on time'
			);
			expect(element.innerHTML).toContain(
				'for="invalid-reason-2">Documents have not been submitted on time'
			);
			expect(element.innerHTML).toContain(
				'for="invalid-reason-3">The appellant does not have the right to appeal'
			);
			expect(element.innerHTML).toContain('for="invalid-reason-4">Other reason');
			expect(element.innerHTML).toContain('Continue</button>');
		});

		it('should render the invalid reason page for an enforcement notice', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, {
					...appealDataEnforcementNotice
				});
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);

			const response = await request.get(
				`/appeals-service/appeal-details/${appealDataEnforcementNotice.appealId}/invalid/new`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Why is the appeal invalid?</h1>');
			expect(element.innerHTML).toContain('<div class="govuk-hint">Select all that apply');
			expect(element.innerHTML).toContain('data-module="govuk-checkboxes">');
			expect(element.innerHTML).toContain(
				'for="invalid-reason">Appeal has not been submitted on time'
			);
			expect(element.innerHTML).toContain(
				'for="invalid-reason-2">Documents have not been submitted on time'
			);
			expect(element.innerHTML).toContain(
				'for="invalid-reason-3">The appellant does not have the right to appeal'
			);
			expect(element.innerHTML).toContain(
				'for="invalid-reason-4">Appellant does not have a legal interest in the land'
			);
			expect(element.innerHTML).toContain('for="invalid-reason-5">Ground (a) barred');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST  / , /new', () => {
		beforeEach(async () => {
			installMockApi();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the invalid reason page with the expected error message if no invalid reason was provided', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Select why the appeal is invalid</a>');
		});

		it('should re-render the invalid reason page with the expected error message if a single invalid reason with text was provided but the matching text property is an empty string', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: invalidReasonsWithTextIds[0],
				[`invalidReason-${invalidReasonsWithTextIds[0]}`]: ''
			});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if a single invalid reason with text was provided but the matching text property is an empty array', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: invalidReasonsWithTextIds[0],
				[`invalidReason-${invalidReasonsWithTextIds[0]}`]: []
			});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if multiple invalid reasons with text were provided but any of the matching text properties are empty strings', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
				[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'test reason text 1',
				[`invalidReason-${invalidReasonsWithTextIds[0]}`]: ''
			});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if multiple invalid reasons with text were provided but any of the matching text properties are empty arays', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
				[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'test reason text 1',
				[`invalidReason-${invalidReasonsWithTextIds[0]}`]: []
			});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if a single invalid reason with text was provided but the matching text property exceeds the character limit', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: invalidReasonsWithTextIds[0],
				[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'a'.repeat(
					textInputCharacterLimits.checkboxTextItemsLength + 1
				)
			});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				`Reason must be ${textInputCharacterLimits.checkboxTextItemsLength} characters or less</a>`
			);
		});

		it('should re-render the invalid reason page with the expected error message if multiple invalid reasons with text were provided but any of the matching text properties exceed the character limit', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
				[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'test reason text 1',
				[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'a'.repeat(
					textInputCharacterLimits.checkboxTextItemsLength + 1
				)
			});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				`Reason must be ${textInputCharacterLimits.checkboxTextItemsLength} characters or less</a>`
			);
		});

		it('should redirect to the check and confirm page if a single invalid reason without text was provided', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: invalidReasonsWithoutTextIds[0]
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/invalid/check'
			);
		});

		it('should redirect to the CYA page if a single invalid reason with text within the character limit was provided', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: invalidReasonsWithTextIds[0],
				[`invalidReason-${invalidReasonsWithTextIds[0]}`]: [
					'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength)
				]
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/invalid/check'
			);
		});

		it('should redirect to the check and confirm page if multiple invalid reasons without text were provided', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: invalidReasonsWithoutTextIds
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/invalid/check'
			);
		});

		it('should redirect to the check and confirm page if multiple invalid reasons with text within the character limit were provided', async () => {
			const response = await request.post(`${baseUrl}/invalid/new`).send({
				invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
				[`invalidReason-${invalidReasonsWithTextIds[0]}`]: [
					'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength)
				],
				[`invalidReason-${invalidReasonsWithTextIds[1]}`]: [
					'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength),
					'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength)
				]
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/invalid/check'
			);
		});
	});

	describe('GET /check', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/0').reply(500).persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
			nock('http://test/')
				.post(`/appeals/notify-preview/appeal-invalid.content.md`)
				.reply(200, appellantEmailTemplate);
			nock('http://test/')
				.post(`/appeals/notify-preview/appeal-invalid-lpa.content.md`)
				.reply(200, lpaEmailTemplate);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it.each([
			['householder', appealData, FEEDBACK_FORM_LINKS.HAS],
			['full planning', appealDataFullPlanning, FEEDBACK_FORM_LINKS.S78],
			['listed building', appealDataListedBuilding, FEEDBACK_FORM_LINKS.S20],
			['cas planning', appealDataCasPlanning, FEEDBACK_FORM_LINKS.CAS_PLANNING],
			['cas advert', appealDataCasAdvert, FEEDBACK_FORM_LINKS.CAS_ADVERTS],
			['full advert', appealDataAdvert, FEEDBACK_FORM_LINKS.FULL_ADVERTS]
		])(
			'should render the invalid appeal check page for %s appeal',
			async (_, appealData, expectedAppealFeedbackLink) => {
				nock('http://test/').get(`/appeals/1?include=all`).reply(200, appealData).persist();

				await request.post(`${baseUrl}/invalid/new`).send({
					invalidReason: invalidReasonsWithoutTextIds[0]
				});
				nock('http://test/').get('/appeals/1/case-team-email').reply(200, {
					id: 1,
					email: 'caseofficers@planninginspectorate.gov.uk',
					name: 'standard email'
				});
				const response = await request.get(`${baseUrl}/invalid/check`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Check details and mark appeal as invalid</h1>');
				expect(element.innerHTML).toContain('Preview email to appellant');
				expect(element.innerHTML).toContain('Preview email to LPA');

				expect(generateNotifyPreview).toHaveBeenCalledWith(
					expect.anything(),
					'appeal-invalid.content.md',
					expect.objectContaining({
						feedback_link: expectedAppealFeedbackLink
					})
				);
				expect(generateNotifyPreview).toHaveBeenCalledWith(
					expect.anything(),
					'appeal-invalid-lpa.content.md',
					expect.objectContaining({
						feedback_link: FEEDBACK_FORM_LINKS.LPA
					})
				);
			}
		);
	});

	describe('GET /view', () => {
		beforeEach(() => {
			installMockApi();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataInvalidOutcome);
			nock('http://test/')
				.get('/appeals/1/appeal-status/invalid/created-date')
				.reply(200, { createdDate: '2050-01-01T00:00:00.000Z' });
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the invalid appeal view page', async () => {
			const response = await request.get(`${baseUrl}/invalid/view`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Appeal marked as invalid</h1>');
			expect(element.innerHTML).toContain('Why is the appeal invalid?');
			expect(element.innerHTML).toContain('Invalid date');
		});
	});

	describe('GET /enforcement-notice', () => {
		beforeEach(async () => {
			installMockApi();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the enforcement notice page', async () => {
			const response = await request.get(`${baseUrl}/appellant-case/invalid/enforcement-notice`);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');

			expect(unprettifiedElement.innerHTML).toContain('Is the enforcement notice invalid?</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-radios__input" id="enforcementNoticeInvalid" name="enforcementNoticeInvalid" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-radios__input" id="enforcementNoticeInvalid-2" name="enforcementNoticeInvalid" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /enforcement-notice', () => {
		beforeEach(async () => {
			installMockApi();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the enforcement notice page with the expected error message if no reason was selected', async () => {
			const response = await request
				.post(`${baseUrl}/appellant-case/invalid/enforcement-notice`)
				.send({});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Select yes if the enforcement notice is invalid</a>'
			);
		});

		it('should redirect to /invalid/enforcement-notice-reason where enforcementNoticeInvalid is "yes"', async () => {
			const response = await request
				.post(`${baseUrl}/appellant-case/invalid/enforcement-notice`)
				.send({
					enforcementNoticeInvalid: 'yes'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/invalid/enforcement-notice-reason'
			);
		});

		it('should redirect to /invalid where enforcementNoticeInvalid is "no"', async () => {
			const response = await request
				.post(`${baseUrl}/appellant-case/invalid/enforcement-notice`)
				.send({
					enforcementNoticeInvalid: 'no'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/invalid'
			);
		});
	});

	describe('GET /other-live-appeals', () => {
		beforeEach(async () => {
			installMockApi();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the enforcement notice page', async () => {
			const response = await request.get(`${baseUrl}/appellant-case/invalid/other-live-appeals`);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');

			expect(unprettifiedElement.innerHTML).toContain(
				'Are there any other live appeals against the enforcement notice?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-radios__input" id="otherLiveAppeals" name="otherLiveAppeals" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-radios__input" id="otherLiveAppeals-2" name="otherLiveAppeals" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /other-live-appeals', () => {
		beforeEach(async () => {
			installMockApi();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the other live appeals page with the expected error message if no reason was selected', async () => {
			const response = await request
				.post(`${baseUrl}/appellant-case/invalid/other-live-appeals`)
				.send({});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Select yes if there are any other live appeals against the enforcement notice</a>'
			);
		});

		it('should redirect to check details screen on success', async () => {
			const response = await request
				.post(`${baseUrl}/appellant-case/invalid/other-live-appeals`)
				.send({
					otherLiveAppeals: 'no'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case/check-your-answers`
			);
		});
	});

	describe('GET /enforcement-notice-reason', () => {
		beforeEach(async () => {
			installMockApi();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-enforcement-invalid-reasons')
				.reply(200, appealCaseEnforcementInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the enforcement notice reasons page with no reasons selected', async () => {
			const response = await request.get(
				`${baseUrl}/appellant-case/invalid/enforcement-notice-reason`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');

			expect(unprettifiedElement.innerHTML).toContain(
				'Why is the enforcement notice invalid?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-checkboxes__item"><input class="govuk-checkboxes__input" id="invalid-reason" name="invalidReason" type="checkbox" value="1" data-aria-controls="conditional-invalid-reason"><label class="govuk-label govuk-checkboxes__label" for="invalid-reason"> Enforcement invalid reason one</label></div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /enforcement-notice-reason', () => {
		beforeEach(async () => {
			installMockApi();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-enforcement-invalid-reasons')
				.reply(200, appealCaseEnforcementInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the enforcement notice reasons page with the expected error message if no reason was selected', async () => {
			const response = await request
				.post(`${baseUrl}/appellant-case/invalid/enforcement-notice-reason`)
				.send({});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Select why the enforcement notice is invalid</a>'
			);
		});

		it('should re-render the enforcement notice reasons page with the expected error message if reasons were selected, but one has an empty text value', async () => {
			const response = await request
				.post(`${baseUrl}/appellant-case/invalid/enforcement-notice-reason`)
				.send({
					invalidReason: ['1', '2'],
					'invalidReason-1': 'has some text',
					'invalidReason-2': ''
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');

			const unprettifiedInvalidReason1 = parseHtml(response.text, {
				rootElement: `#conditional-invalid-reason`,
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedInvalidReason1).toContain('Enter a reason</label>');
			expect(unprettifiedInvalidReason1).toContain('value="has some text"');
			expect(unprettifiedInvalidReason1).not.toContain('Error:</span> Enter a reason</p>');

			const unprettifiedInvalidReason2 = parseHtml(response.text, {
				rootElement: `#conditional-invalid-reason-2`,
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedInvalidReason2).toContain('Enter a reason</label>');
			expect(unprettifiedInvalidReason2).toContain('value=""');
			expect(unprettifiedInvalidReason2).toContain('Error:</span> Enter a reason</p>');
		});

		it('should redirect to check details screen on success', async () => {
			const response = await request
				.post(`${baseUrl}/appellant-case/invalid/enforcement-notice-reason`)
				.send({
					invalidReason: ['1', '2'],
					'invalidReason-1': 'has some text',
					'invalidReason-2': 'has some other text'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case/invalid/enforcement-other-information`
			);
		});
	});

	describe('GET /enforcement-other-information', () => {
		beforeEach(async () => {
			installMockApi();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the enforcement other information page', async () => {
			const response = await request.get(
				`${baseUrl}/appellant-case/invalid/enforcement-other-information`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');

			expect(unprettifiedElement.innerHTML).toContain(
				'Do you want to add any other information?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="otherInformationValidRadio" type="radio" value="Yes" data-aria-controls="conditional-other-information-valid-radio">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="otherInformationValidRadio" type="radio" value="No">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the enforcement other information page with the correct back link', async () => {
			const response = await request.get(
				`${baseUrl}/appellant-case/invalid/enforcement-other-information`
			);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-back-link',
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain(
				'<a href="/appeals-service/appeal-details/1/appellant-case/invalid/enforcement-notice-reason" class="govuk-back-link">Back</a>'
			);
		});
	});

	describe('POST /enforcement-other-information', () => {
		beforeEach(async () => {
			installMockApi();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-enforcement-invalid-reasons')
				.reply(200, appealCaseEnforcementInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the enforcement other information page with the expected error message if neither yes or no is selected', async () => {
			const response = await request
				.post(`${baseUrl}/appellant-case/invalid/enforcement-other-information`)
				.send({});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Select yes if you want to add any other information</a>'
			);
		});

		it(`should re-render the 'Other Information' screen if selection is yes and other information is empty`, async () => {
			const response = await request
				.post(`${baseUrl}/appellant-case/invalid/enforcement-other-information`)
				.send({ otherInformationValidRadio: 'Yes', otherInformationDetails: '' });

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Enter other information</a>');
		});

		it('should redirect to check details screen on success', async () => {
			const response = await request
				.post(`${baseUrl}/appellant-case/invalid/enforcement-other-information`)
				.send({
					otherInformationValidRadio: 'Yes',
					otherInformationDetails: 'Enforcement other information'
				});
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case/invalid/check-details-and-mark-enforcement-as-invalid`
			);
		});
	});

	describe('GET /check-details-and-mark-enforcement-as-invalid', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated)
				.persist();
			nock('http://test/')
				.get('/appeals/appellant-case-enforcement-invalid-reasons')
				.reply(200, appealCaseEnforcementInvalidReasons)
				.persist();

			// Populate session data
			await request.post(`${baseUrl}/appellant-case`).send({ reviewOutcome: 'invalid' });
			await request
				.post(`${baseUrl}/appellant-case/invalid/enforcement-notice`)
				.send({ enforcementNoticeInvalid: 'yes' });
			await request.post(`${baseUrl}/appellant-case/invalid/enforcement-notice-reason`).send({
				invalidReason: ['1', '2'],
				'invalidReason-1': 'has some text',
				'invalidReason-2': 'has some other text'
			});
			await request.post(`${baseUrl}/appellant-case/invalid/enforcement-other-information`).send({
				otherInformationValidRadio: 'Yes',
				otherInformationDetails: 'Enforcement other information'
			});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the enforcement notice reasons page with no reasons selected', async () => {
			const response = await request.get(
				`${baseUrl}/appellant-case/invalid/check-details-and-mark-enforcement-as-invalid`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');

			expect(unprettifiedElement.innerHTML).toContain(
				'Check details and mark enforcement notice as invalid</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> What is the outcome of your review?</dt><dd class="govuk-summary-list__value"> Invalid</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Do you want to add any other information?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'>Yes: Enforcement other information</div></dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Mark enforcement notice as invalid</button>'
			);
		});
	});

	describe('POST /check-details-and-mark-enforcement-as-invalid', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated)
				.persist();
			nock('http://test/')
				.get('/appeals/appellant-case-enforcement-invalid-reasons')
				.reply(200, appealCaseEnforcementInvalidReasons)
				.persist();

			// Populate session data
			await request.post(`${baseUrl}/appellant-case`).send({ reviewOutcome: 'invalid' });
			await request
				.post(`${baseUrl}/appellant-case/invalid/enforcement-notice`)
				.send({ enforcementNoticeInvalid: 'yes' });
			await request.post(`${baseUrl}/appellant-case/invalid/enforcement-notice-reason`).send({
				invalidReason: ['1', '2'],
				'invalidReason-1': 'has some text',
				'invalidReason-2': 'has some other text'
			});
			await request.post(`${baseUrl}/appellant-case/invalid/enforcement-other-information`).send({
				otherInformationValidRadio: 'Yes',
				otherInformationDetails: 'Enforcement other information'
			});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should redirect to check details screen on success', async () => {
			const response = await request.post(
				`${baseUrl}/appellant-case/invalid/check-details-and-mark-enforcement-as-invalid`
			);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}`
			);
		});
	});
});
