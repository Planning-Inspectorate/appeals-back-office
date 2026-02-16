import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import {
	appealCaseEnforcementInvalidReasons,
	appealDataEnforcementNotice,
	appellantCaseDataNotValidated,
	appellantCaseIncompleteReasons,
	missingDocumentOptions
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi } = createTestEnvironment();
const request = supertest(app);
const appealId = appealDataEnforcementNotice.appealId;
const baseUrl = `/appeals-service/appeal-details/${appealId}`;

describe('incomplete-appeal', () => {
	describe('enforcement notice appeal', () => {
		describe('GET /appellant-case/incomplete', () => {
			beforeEach(() => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
					.reply(200, appellantCaseDataNotValidated);
				nock('http://test/')
					.get('/appeals/appellant-case-incomplete-reasons')
					.reply(200, appellantCaseIncompleteReasons);
			});

			afterEach(() => {
				nock.cleanAll();
			});

			it('should render the incomplete reason page and content', async () => {
				const response = await request.get(`${baseUrl}/appellant-case/incomplete`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Why is the appeal incomplete?</h1>');
				expect(element.innerHTML).toContain('data-module="govuk-checkboxes">');

				// Checkbox content check
				if (!element.textContent) {
					throw new Error('Test setup failed: The main element was not found in the HTML');
				}
				const textContent = element.textContent.replace(/\s+/g, ' ').trim();
				expect(textContent).toContain('Missing documents');
				expect(textContent).toContain('Grounds and facts do not match');
				expect(textContent).toContain('Waiting for appellant to pay the fee');
				expect(textContent).toContain('Other');

				expect(element.innerHTML).toContain('Continue</button>');
			});
		});

		describe('POST /appellant-case/incomplete', () => {
			beforeEach(async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
					.reply(200, appellantCaseDataNotValidated);
				nock('http://test/')
					.get('/appeals/appellant-case-incomplete-reasons')
					.reply(200, appellantCaseIncompleteReasons);
			});

			afterEach(() => {
				nock.cleanAll();
			});

			it('should re-render the incomplete reason page with the expected error message if no incomplete reason was provided', async () => {
				const response = await request.post(`${baseUrl}/appellant-case/incomplete`).send({});

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;
				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain('Select why the appeal is incomplete</a>');
			});

			it('should re-render the incomplete reason page with the expected error message if "other" incomplete reason was provided but the matching text property is an empty string', async () => {
				const response = await request.post(`${baseUrl}/appellant-case/incomplete`).send({
					incompleteReason: 10,
					['incompleteReason-10']: ''
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

			it('should re-render the incomplete reason page with the expected error message if "other" incomplete reason was provided but the matching text property exceeds the character limit', async () => {
				const response = await request.post(`${baseUrl}/appellant-case/incomplete`).send({
					incompleteReason: 10,
					['incompleteReason-10']: 'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength + 1)
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

			it('should redirect to the missing documents page if selected', async () => {
				const response = await request.post(`${baseUrl}/appellant-case/incomplete`).send({
					incompleteReason: ['10', '12', '13', '14'],
					['incompleteReason-10']: 'a'
				});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to ${baseUrl}/appellant-case/incomplete/missing-documents`
				);
			});

			it('should redirect to the ground and facts do not match page if provided and missing documents is not provided', async () => {
				const response = await request.post(`${baseUrl}/appellant-case/incomplete`).send({
					incompleteReason: ['10', '13', '14'],
					['incompleteReason-10']: 'a'
				});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to ${baseUrl}/appellant-case/incomplete/grounds-facts-check`
				);
			});

			it('should redirect to the receipt due date page if provided and neither missing docs or grounds and facts were provided', async () => {
				const response = await request.post(`${baseUrl}/appellant-case/incomplete`).send({
					incompleteReason: ['10', '14'],
					['incompleteReason-10']: 'a'
				});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to ${baseUrl}/appellant-case/incomplete/receipt-due-date`
				);
			});

			it('should redirect to the appeal due date page if only the other information was provided', async () => {
				const response = await request.post(`${baseUrl}/appellant-case/incomplete`).send({
					incompleteReason: '10',
					['incompleteReason-10']: 'a'
				});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to ${baseUrl}/appellant-case/incomplete/date`
				);
			});
		});

		describe('GET /enforcement-notice-reason', () => {
			beforeEach(async () => {
				installMockApi();
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
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
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
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
				// Populate session data
				await request.post(`${baseUrl}/appellant-case`).send({ reviewOutcome: 'invalid' });

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

		describe('GET /check-details-and-mark-enforcement-as-incomplete', () => {
			beforeEach(async () => {
				nock.cleanAll();
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
					.reply(200, appellantCaseDataNotValidated)
					.persist();
				nock('http://test/')
					.get('/appeals/appellant-case-enforcement-invalid-reasons')
					.reply(200, appealCaseEnforcementInvalidReasons)
					.persist();
				nock('http://test/')
					.get('/appeals/appellant-case-enforcement-missing-documents')
					.reply(200, missingDocumentOptions);
				nock('http://test/')
					.get('/appeals/appellant-case-incomplete-reasons')
					.reply(200, appellantCaseIncompleteReasons);
			});

			afterEach(() => {
				nock.cleanAll();
			});

			it('should render the check details page where the enforcement notice is invalid', async () => {
				// Populate session data
				await request.post(`${baseUrl}/appellant-case`).send({ reviewOutcome: 'incomplete' });
				await request
					.post(`${baseUrl}/appellant-case/incomplete/enforcement-notice`)
					.send({ enforcementNoticeInvalid: 'yes' });
				await request.post(`${baseUrl}/appellant-case/incomplete/enforcement-notice-reason`).send({
					invalidReason: ['1', '2', '8'],
					'invalidReason-1': 'has some text',
					'invalidReason-2': 'has some other text',
					'invalidReason-6': 'another reason'
				});
				await request
					.post(`${baseUrl}/appellant-case/incomplete/enforcement-other-information`)
					.send({
						otherInformationValidRadio: 'Yes',
						otherInformationDetails: 'Enforcement other information'
					});

				const response = await request.get(
					`${baseUrl}/appellant-case/incomplete/check-details-and-mark-enforcement-as-incomplete`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');

				expect(unprettifiedElement.innerHTML).toContain(
					'Check details and mark appeal as incomplete</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<dt class="govuk-summary-list__key"> What is the outcome of your review?</dt><dd class="govuk-summary-list__value"> Incomplete</dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<dt class="govuk-summary-list__key"> Do you want to add any other information?</dt>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'>Yes: Enforcement other information</div></dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Mark appeal as incomplete</button>');
			});

			it('should render the check details page where the enforcement notice is valid', async () => {
				// Populate session data
				// review outcome
				await request.post(`${baseUrl}/appellant-case`).send({ reviewOutcome: 'incomplete' });
				// enforcement notice invalid
				await request
					.post(`${baseUrl}/appellant-case/invalid/enforcement-notice`)
					.send({ enforcementNoticeInvalid: 'no' });
				// why is appeal incomplete
				await request.post(`${baseUrl}/appellant-case/incomplete`).send({
					incompleteReason: ['12', '14', '10'],
					'incompleteReason-10': 'Some other reason text'
				});
				// which documents are incomplete
				await request.post(`${baseUrl}/appellant-case/incomplete/missing-documents`).send({
					missingDocuments: ['1', '2'],
					'missingDocuments-1': 'Where is this doc',
					'missingDocuments-2': 'Where is this other doc'
				});
				// ground (a) receipt due date
				await request.post(`${baseUrl}/appellant-case/incomplete/receipt-due-date`).send({
					'fee-receipt-due-date-day': '1',
					'fee-receipt-due-date-month': '5',
					'fee-receipt-due-date-year': '3000'
				});
				// appeal due date
				await request.post(`${baseUrl}/appellant-case/incomplete/date`).send({
					'due-date-day': '2',
					'due-date-month': '7',
					'due-date-year': '3000'
				});

				const response = await request.get(
					`${baseUrl}/appellant-case/incomplete/check-details-and-mark-enforcement-as-incomplete`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span>');

				expect(unprettifiedElement.innerHTML).toContain(
					'Check details and mark appeal as incomplete</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<dt class="govuk-summary-list__key"> What is the outcome of your review?</dt><dd class="govuk-summary-list__value"> Incomplete</dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<dt class="govuk-summary-list__key"> Is the enforcement notice invalid?</dt><dd class="govuk-summary-list__value"> No</dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<dt class="govuk-summary-list__key"> Why is the appeal incomplete?</dt>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<li>Waiting for appellant to pay the fee</li></ul></dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<dt class="govuk-summary-list__key"> Which documents are incomplete?</dt>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<li>Grounds of appeal supporting documents: Where is this doc</li>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<dt class="govuk-summary-list__key"> Ground (a) fee receipt due date</dt><dd class="govuk-summary-list__value"> 1 May 3000</dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<dt class="govuk-summary-list__key"> Appeal due date</dt><dd class="govuk-summary-list__value"> 2 July 3000</dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Mark appeal as incomplete</button>');
			});
		});

		describe('POST /check-details-and-mark-enforcement-as-incomplete', () => {
			beforeEach(async () => {
				nock.cleanAll();
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
					.reply(200, appellantCaseDataNotValidated)
					.persist();
				nock('http://test/')
					.get('/appeals/appellant-case-enforcement-invalid-reasons')
					.reply(200, appealCaseEnforcementInvalidReasons)
					.persist();
			});

			afterEach(() => {
				nock.cleanAll();
			});

			it('should redirect to case details on success where the enforcement notice is invalid', async () => {
				// Populate session data
				await request.post(`${baseUrl}/appellant-case`).send({ reviewOutcome: 'incomplete' });
				await request
					.post(`${baseUrl}/appellant-case/incomplete/enforcement-notice`)
					.send({ enforcementNoticeInvalid: 'yes' });
				await request.post(`${baseUrl}/appellant-case/incomplete/enforcement-notice-reason`).send({
					invalidReason: ['1', '2', '8'],
					'invalidReason-1': 'has some text',
					'invalidReason-2': 'has some other text',
					'invalidReason-6': 'another reason'
				});
				await request
					.post(`${baseUrl}/appellant-case/incomplete/enforcement-other-information`)
					.send({
						otherInformationValidRadio: 'Yes',
						otherInformationDetails: 'Enforcement other information'
					});

				nock('http://test/')
					.patch(`/appeals/5623/appellant-cases/0`, () => true)
					.reply(200);

				const response = await request.post(
					`${baseUrl}/appellant-case/incomplete/check-details-and-mark-enforcement-as-incomplete`
				);

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}`
				);
			});

			it('should redirect to case details on success where the enforcement notice is valid', async () => {
				// Populate session data
				// review outcome
				await request.post(`${baseUrl}/appellant-case`).send({ reviewOutcome: 'incomplete' });
				// enforcement notice invalid
				await request
					.post(`${baseUrl}/appellant-case/invalid/enforcement-notice`)
					.send({ enforcementNoticeInvalid: 'no' });
				// why is appeal incomplete
				await request.post(`${baseUrl}/appellant-case/incomplete`).send({
					incompleteReason: ['12', '14', '10'],
					'incompleteReason-10': 'Some other reason text'
				});
				// which documents are incomplete
				await request.post(`${baseUrl}/appellant-case/incomplete/missing-documents`).send({
					missingDocuments: ['1'],
					'missingDocuments-1': 'Missing doc'
				});
				// ground (a) receipt due date
				await request.post(`${baseUrl}/appellant-case/incomplete/receipt-due-date`).send({
					'fee-receipt-due-date-day': '1',
					'fee-receipt-due-date-month': '5',
					'fee-receipt-due-date-year': '3000'
				});
				// appeal due date
				await request.post(`${baseUrl}/appellant-case/incomplete/date`).send({
					'due-date-day': '2',
					'due-date-month': '7',
					'due-date-year': '3000'
				});

				nock('http://test/')
					.patch(`/appeals/5623/appellant-cases/0`, () => true)
					.reply(200);

				const response = await request.post(
					`${baseUrl}/appellant-case/incomplete/check-details-and-mark-enforcement-as-incomplete`
				);

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}`
				);
			});
		});

		describe('GET /missing-documents', () => {
			beforeEach(() => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
					.reply(200, appellantCaseDataNotValidated);
				nock('http://test/')
					.get('/appeals/appellant-case-incomplete-reasons')
					.reply(200, appellantCaseIncompleteReasons);
				nock('http://test/')
					.get('/appeals/appellant-case-enforcement-missing-documents')
					.reply(200, missingDocumentOptions);
			});

			afterEach(() => {
				nock.cleanAll();
			});

			it('should render the missing documents page and content', async () => {
				const response = await request.get(
					`${baseUrl}/appellant-case/incomplete/missing-documents`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Which documents are missing?</h1>');
				expect(element.innerHTML).toContain('data-module="govuk-checkboxes">');

				// Checkbox content check
				if (!element.textContent) {
					throw new Error('Test setup failed: The main element was not found in the HTML');
				}
				const textContent = element.textContent.replace(/\s+/g, ' ').trim();
				expect(textContent).toContain('Grounds of appeal supporting documents');
				expect(textContent).toContain('Enforcement notice');
				expect(textContent).toContain('Agreement to change the description of the development');
				expect(textContent).toContain('Planning obligation');
				expect(textContent).toContain('Application for an award of appeal costs');
				expect(textContent).toContain('Other');

				expect(element.innerHTML).toContain('Continue</button>');
			});
		});

		describe('POST /missing-documents', () => {
			beforeEach(() => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
					.reply(200, appellantCaseDataNotValidated);
				nock('http://test/')
					.get('/appeals/appellant-case-incomplete-reasons')
					.reply(200, appellantCaseIncompleteReasons);
				nock('http://test/')
					.get('/appeals/appellant-case-enforcement-missing-documents')
					.reply(200, missingDocumentOptions);
			});

			afterEach(() => {
				nock.cleanAll();
			});

			it('should render an error if no missing documents is selected', async () => {
				const response = await request
					.post(`${baseUrl}/appellant-case/incomplete/missing-documents`)
					.send({});
				const element = parseHtml(response.text);

				expect(element.innerHTML).toContain('govuk-error-summary__title');

				const errorLink = element.querySelector('.govuk-error-summary__list li a');
				expect(errorLink?.innerHTML.trim()).toBe('Select which documents are missing');
			});

			const missingDocumentTestCases = [
				{ name: 'Grounds of appeal supporting documents', id: '1' },
				{ name: 'Enforcement notice', id: '2' },
				{ name: 'Agreement to change the description of the development', id: '3' },
				{ name: 'Planning obligation', id: '4' },
				{ name: 'Application for an award of appeal costs', id: '5' },
				{ name: 'Other new supporting documents', id: '6' }
			];

			it.each(missingDocumentTestCases)(
				'should re-render missing document page if $name is selected but accompanying more information is not given',
				async ({ id }) => {
					const response = await request
						.post(`${baseUrl}/appellant-case/incomplete/missing-documents`)
						.send({
							missingDocuments: id,
							[`missingDocuments-${id}`]: ''
						});
					const element = parseHtml(response.text);

					expect(element.innerHTML).toContain('govuk-error-summary__title');

					const errorLink = element.querySelector('.govuk-error-summary__list li a');
					expect(errorLink?.innerHTML.trim()).toBe('Enter more information');
				}
			);

			it.each(missingDocumentTestCases)(
				'should re-render missing document page if $name is selected and accompanying more information is greater than 250 chars',
				async ({ id }) => {
					const longString =
						'The quick brown fox jumps over the lazy dog, but in the world of software development, we often find ourselves writing strings that serve no purpose other than to test the character limits of specific database columns or UI components like text areas. 12345';

					const response = await request
						.post(`${baseUrl}/appellant-case/incomplete/missing-documents`)
						.send({
							missingDocuments: id,
							[`missingDocuments-${id}`]: longString
						});
					const element = parseHtml(response.text);

					expect(element.innerHTML).toContain('govuk-error-summary__title');

					const errorLink = element.querySelector('.govuk-error-summary__list li a');
					expect(errorLink?.innerHTML.trim()).toBe(
						'More information must be 250 characters or less'
					);
				}
			);

			it('should redirect to "Ground (a) fee receipt due date" page if selection "Why is the appeal incomplete" page', async () => {
				// Populate session data
				await request.post(`${baseUrl}/appellant-case`).send({ reviewOutcome: 'invalid' });
				await request
					.post(`${baseUrl}/appellant-case/incomplete`)
					.send({ incompleteReason: ['12', '14'], ['incompleteReason-10']: '' });

				const response = await request
					.post(`${baseUrl}/appellant-case/incomplete/missing-documents`)
					.send({
						missingDocuments: '1',
						[`missingDocuments-1`]: 'longString'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case/incomplete/receipt-due-date`
				);
			});

			it('should redirect to "Update appeal due date" page if no other selection is made on "Why is the appeal incomplete" page', async () => {
				// Populate session data
				await request.post(`${baseUrl}/appellant-case`).send({ reviewOutcome: 'invalid' });
				await request
					.post(`${baseUrl}/appellant-case/incomplete`)
					.send({ incompleteReason: ['12'], ['incompleteReason-10']: '' });

				const response = await request
					.post(`${baseUrl}/appellant-case/incomplete/missing-documents`)
					.send({
						missingDocuments: '1',
						[`missingDocuments-1`]: 'longString'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case/incomplete/date`
				);
			});
		});

		describe('GET /receipt-due-date', () => {
			beforeEach(() => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
					.reply(200, appellantCaseDataNotValidated);
				nock('http://test/')
					.get('/appeals/appellant-case-incomplete-reasons')
					.reply(200, appellantCaseIncompleteReasons);
			});

			afterEach(() => {
				nock.cleanAll();
			});

			it('should render the receipt due date page and content', async () => {
				const response = await request.get(`${baseUrl}/appellant-case/incomplete/receipt-due-date`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Ground (a) fee receipt due date');
				expect(element.innerHTML).toContain('name="fee-receipt-due-date-day');
				expect(element.innerHTML).toContain('name="fee-receipt-due-date-month"');
				expect(element.innerHTML).toContain('name="fee-receipt-due-date-year"');
				expect(element.innerHTML).toContain('Continue</button>');
			});
		});

		describe('POST /receipt-due-date', () => {
			beforeEach(async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
					.reply(200, appellantCaseDataNotValidated);
				nock('http://test/')
					.get('/appeals/appellant-case-incomplete-reasons')
					.reply(200, appellantCaseIncompleteReasons);

				// Populate session data
				await request.post(`${baseUrl}/appellant-case`).send({ reviewOutcome: 'invalid' });
			});

			afterEach(() => {
				nock.cleanAll();
			});

			const invalidDateTestCases = [
				{
					name: 'all fields missing',
					payload: {
						'fee-receipt-due-date-day': '',
						'fee-receipt-due-date-month': '',
						'fee-receipt-due-date-year': ''
					},
					expectedError: 'Enter the ground (a) fee receipt due date'
				},
				{
					name: 'missing day',
					payload: {
						'fee-receipt-due-date-day': '',
						'fee-receipt-due-date-month': '10',
						'fee-receipt-due-date-year': '2050'
					},
					expectedError: 'The ground (a) fee receipt due date must include a day'
				},
				{
					name: 'missing month',
					payload: {
						'fee-receipt-due-date-day': '10',
						'fee-receipt-due-date-month': '',
						'fee-receipt-due-date-year': '2050'
					},
					expectedError: 'The ground (a) fee receipt due date must include a month'
				},
				{
					name: 'missing year',
					payload: {
						'fee-receipt-due-date-day': '10',
						'fee-receipt-due-date-month': '12',
						'fee-receipt-due-date-year': ''
					},
					expectedError: 'The ground (a) fee receipt due date must include a year'
				},
				{
					name: 'not a real date',
					payload: {
						'fee-receipt-due-date-day': '29',
						'fee-receipt-due-date-month': '2',
						'fee-receipt-due-date-year': '3000'
					},
					expectedError: 'The ground (a) fee receipt due date must be a real date'
				},
				{
					name: 'must be in the future',
					payload: {
						'fee-receipt-due-date-day': '25',
						'fee-receipt-due-date-month': '2',
						'fee-receipt-due-date-year': '1950'
					},
					expectedError: 'The ground (a) fee receipt due date must be in the future'
				}
			];

			it.each(invalidDateTestCases)(
				'should re-render edit timetable page with $name error',
				async ({ payload, expectedError }) => {
					const response = await request
						.post(`${baseUrl}/appellant-case/incomplete/receipt-due-date`)
						.send(payload);
					const element = parseHtml(response.text);

					expect(element.innerHTML).toContain('govuk-error-summary__title');

					const errorLink = element.querySelector('.govuk-error-summary__list li a');
					expect(errorLink?.innerHTML.trim()).toBe(expectedError);
				}
			);

			it('should redirect the update appeal due date page if the only "Missing documents" or "Grounds and facts do not match" were selected on the "Why is the appeal incomplete?" page', async () => {
				await request.post(`${baseUrl}/appellant-case/incomplete`).send({
					incompleteReason: ['12', '13', '14']
				});

				const response = await request
					.post(`${baseUrl}/appellant-case/incomplete/receipt-due-date`)
					.send({
						'fee-receipt-due-date-day': '1',
						'fee-receipt-due-date-month': '5',
						'fee-receipt-due-date-year': '3000'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case/incomplete/date`
				);
			});

			it('should redirect the check details page if the only "Missing documents" or "Grounds and facts do not match" were not selected on the "Why is the appeal incomplete?" page', async () => {
				await request.post(`${baseUrl}/appellant-case/incomplete`).send({
					incompleteReason: '14'
				});

				const response = await request
					.post(`${baseUrl}/appellant-case/incomplete/receipt-due-date`)
					.send({
						'fee-receipt-due-date-day': '1',
						'fee-receipt-due-date-month': '5',
						'fee-receipt-due-date-year': '3000'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case/incomplete/check-details-and-mark-enforcement-as-incomplete`
				);
			});
		});
	});
});
