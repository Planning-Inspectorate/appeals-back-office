// @ts-nocheck
import { appealData, fileUploadInfo } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('add-ip-comment', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /add', () => {
		// eslint-disable-next-line jest/expect-expect
		it('should redirect to /add/ip-details', () => {
			return new Promise((resolve) => {
				request
					.get(`${baseUrl}/2/interested-party-comments/add`)
					.expect(302)
					.expect('Location', `./add/ip-details`)
					.end(resolve);
			});
		});
	});

	describe('GET /add/ip-details', () => {
		const appealId = 2;

		/** @type {*} */
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`
			);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Interested party&#39;s details');
		});

		it('should render a First name field', () => {
			expect(pageHtml.querySelector('input#first-name')).not.toBeNull();
		});

		it('should render a Last name field', () => {
			expect(pageHtml.querySelector('input#last-name')).not.toBeNull();
		});

		it('should render an Email address field', () => {
			expect(pageHtml.querySelector('input#email-address')).not.toBeNull();
		});

		it('should render any previous response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			//set session data with post request
			await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`)
				.send({ firstName: 'First123', lastName: 'Last456', emailAddress: 'example@email.com' });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`
			);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#first-name').getAttribute('value')).toEqual('First123');
			expect(pageHtml.querySelector('input#last-name').getAttribute('value')).toEqual('Last456');
			expect(pageHtml.querySelector('input#email-address').getAttribute('value')).toEqual(
				'example@email.com'
			);
		});
	});

	describe('GET /add/check-address', () => {
		const appealId = 2;

		/** @type {*} */
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/check-address`
			);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Did the interested party provide an address?'
			);
		});

		it('should render Yes and No radio buttons', () => {
			expect(pageHtml.querySelector('input[type="radio"][value="yes"]')).not.toBeNull();
			expect(pageHtml.querySelector('input[type="radio"][value="no"]')).not.toBeNull();
		});

		it('should render any previous response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			//set session data with post request
			await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/check-address`)
				.send({ addressProvided: 'no' });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/check-address`
			);

			pageHtml = parseHtml(response.text);

			expect(
				pageHtml.querySelector('input[type="radio"][value="no"]').getAttribute('checked')
			).toEqual('');
			expect(
				pageHtml.querySelector('input[type="radio"][value="yes"]').getAttribute('checked')
			).toBeUndefined();
		});
	});

	describe('GET /add/ip-address', () => {
		const appealId = 2;

		/** @type {*} */
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`
			);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Interested party&#39;s address');
		});

		it('should render an Address line 1 field', () => {
			expect(pageHtml.querySelector('input#address-line-1')).not.toBeNull();
		});

		it('should render an Address line 2 field', () => {
			expect(pageHtml.querySelector('input#address-line-2')).not.toBeNull();
		});

		it('should render a Town or city field', () => {
			expect(pageHtml.querySelector('input#town')).not.toBeNull();
		});

		it('should render a County field', () => {
			expect(pageHtml.querySelector('input#county')).not.toBeNull();
		});

		it('should render a Postcode field', () => {
			expect(pageHtml.querySelector('input#post-code')).not.toBeNull();
		});

		it('should render any previous response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			//set session data with post request
			await request.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`).send({
				addressLine1: 'Line 1',
				addressLine2: 'Line 2',
				town: 'Town',
				county: 'County',
				postCode: 'AB1 2CD'
			});

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`
			);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#address-line-1').getAttribute('value')).toEqual(
				'Line 1'
			);
			expect(pageHtml.querySelector('input#address-line-2').getAttribute('value')).toEqual(
				'Line 2'
			);
			expect(pageHtml.querySelector('input#town').getAttribute('value')).toEqual('Town');
			expect(pageHtml.querySelector('input#county').getAttribute('value')).toEqual('County');
			expect(pageHtml.querySelector('input#post-code').getAttribute('value')).toEqual('AB1 2CD');
		});
	});

	describe('POST /add/ip-details', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to the next step when all fields are correctly populated', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`)
				.send({ firstName: 'First', lastName: 'Last', emailAddress: 'example@email.com' });

			expect(response.statusCode).toBe(302);
		});

		it('should redirect to the next step when only the required fields are populated', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`)
				.send({ firstName: 'First', lastName: 'Last' });

			expect(response.statusCode).toBe(302);
		});

		it('should return 400 when required fields are missing', async () => {
			const response = await request.post(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`
			);
			expect(response.statusCode).toBe(400);
		});

		it('should return 400 when fields are entered incorrectly', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`)
				.send({ firstName: 'First', lastName: 'Last', emailAddress: 'invalid' });

			expect(response.statusCode).toBe(400);
		});
	});

	describe('POST /add/check-address', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to the next step when Yes is selected', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/check-address`)
				.send({ addressProvided: 'yes' });

			expect(response.statusCode).toBe(302);
		});

		it('should redirect to the next step when No is selected', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/check-address`)
				.send({ addressProvided: 'no' });

			expect(response.statusCode).toBe(302);
		});

		it('should return 400 when no option is selected', async () => {
			const response = await request.post(
				`${baseUrl}/${appealId}/interested-party-comments/add/check-address`
			);
			expect(response.statusCode).toBe(400);
		});
	});

	describe('POST /add/ip-address', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to the next step when all fields are populated correctly', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`)
				.send({
					addressLine1: 'Line 1',
					addressLine2: 'Line 2',
					town: 'Town',
					county: 'County',
					postCode: 'AB1 2CD'
				});

			expect(response.statusCode).toBe(302);
		});

		it('should redirect to the next step when only required fields are populated', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`)
				.send({
					addressLine1: 'Line 1',
					town: 'Town',
					postCode: 'AB1 2CD'
				});

			expect(response.statusCode).toBe(302);
		});

		it('should return 400 when required fields are missing', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`)
				.send({
					town: 'Town',
					postCode: 'AB1 2CD'
				});

			expect(response.statusCode).toBe(400);
		});

		it('should return 400 when fields are entered incorrectly', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`)
				.send({
					addressLine1: 'Line 1',
					town: 'Town',
					postCode: 'invalid'
				});

			expect(response.statusCode).toBe(400);
		});
	});

	describe('GET /date-submitted', () => {
		const appealId = 2;

		/** @type {*} */
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			jest
				.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
				.setSystemTime(new Date('2024-10-30'));

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/date-submitted`
			);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the date submitted page', () => {
			expect(pageHtml).not.toBeNull();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'When did the interested party submit the comment?'
			);
		});

		it('should render day, month, and year input fields', () => {
			expect(pageHtml.querySelector('input#date-day')).not.toBeNull();
			expect(pageHtml.querySelector('input#date-month')).not.toBeNull();
			expect(pageHtml.querySelector('input#date-year')).not.toBeNull();
		});
	});

	describe('POST /date-submitted', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
			jest
				.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
				.setSystemTime(new Date('2024-10-30'));
		});

		it('should redirect on valid today date input', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/date-submitted`)
				.send({
					'date-day': '30',
					'date-month': '10',
					'date-year': '2024'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				'/appeals-service/appeal-details/2/interested-party-comments/add/check-your-answers'
			);
		});

		it('should redirect on valid yesterday date input', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/date-submitted`)
				.send({
					'date-day': '30',
					'date-month': '10',
					'date-year': '2024'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				'/appeals-service/appeal-details/2/interested-party-comments/add/check-your-answers'
			);
		});

		it('should return 400 on valid tomorow date input with appropriate error messages', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/date-submitted`)
				.send({
					'date-day': '31',
					'date-month': '10',
					'date-year': '2024'
				});

			expect(response.statusCode).toBe(400);

			const element = parseHtml(response.text);
			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'When did the interested party submit the comment?'
			);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Submitted date must be today or in the past');
		});

		it('should return 400 on empty date fields with appropriate error messages', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/date-submitted`)
				.send({
					'date-day': '',
					'date-month': '',
					'date-year': ''
				});

			expect(response.statusCode).toBe(400);

			const element = parseHtml(response.text);
			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'When did the interested party submit the comment?'
			);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter the submitted date');
		});

		it('should return 400 on invalid date input with appropriate error messages', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/date-submitted`)
				.send({
					'date-day': '99',
					'date-month': '99',
					'date-year': '9999'
				});

			expect(response.statusCode).toBe(400);

			const element = parseHtml(response.text);
			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'When did the interested party submit the comment?'
			);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Submitted date day must be between 1 and 31');
		});
	});

	describe('GET /check-your-answers', () => {
		const appealId = 2;

		/** @type {*} */
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/check-your-answers`
			);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Check details and add interested party comment'
			);
		});

		it('should render a summary list', () => {
			expect(pageHtml.querySelector('dl.govuk-summary-list')).not.toBeNull();
		});
	});

	describe('POST /check-your-answers', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/').post(`/appeals/${appealId}/reps/comment`).reply(200);
			nock('http://test/').post(`/appeals/${appealId}/documents`).reply(200);
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
			jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
		});

		it('should send an API request to create a new document', async () => {
			const documentFolderInfo = [
				{
					caseId: '2',
					documents: [],
					folderId: 55539,
					path: 'representation/representationAttachments'
				}
			];

			nock('http://test/')
				.get(`/appeals/${appealId}/document-folders?path=representation/representationAttachments`)
				.reply(200, documentFolderInfo);
			nock('http://test/').get(`/appeals/document-redaction-statuses`).reply(200, 1);
			const addDocumentsResponse = await request
				.post(`${baseUrl}/2/interested-party-comments/add/upload`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);
		});

		it('should send an API request to create a new document with correct redactionStatusId', async () => {
			const documentFolderInfo = [
				{
					caseId: '2',
					documents: [],
					folderId: 55539,
					path: 'representation/representationAttachments'
				}
			];

			nock('http://test/')
				.get(`/appeals/document-redaction-statuses`)
				.reply(200, [
					{ id: 1, key: 'unredacted' },
					{ id: 2, key: 'no_redaction_required' },
					{ id: 3, key: 'redacted' }
				]);

			nock('http://test/')
				.get(`/appeals/${appealId}/document-folders?path=representation/representationAttachments`)
				.reply(200, documentFolderInfo);
			nock('http://test/').get(`/appeals/document-redaction-statuses`).reply(200, 1);
			const addDocumentsResponse = await request
				.post(`${baseUrl}/2/interested-party-comments/add/upload`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);
		});

		it('should createIPComment on successful submission', async () => {
			const appealId = 2;
			const comment = {
				ipDetails: {
					firstName: 'Kevin',
					lastName: 'Fowler',
					email: 'kevin.fowler@email.com'
				},
				ipAddress: {
					addressLine1: 'Example line 1',
					town: 'London',
					postCode: 'AB1 2CD'
				},
				attachments: ['1a14cb3a-35ef-4f93-a597-61010e6b0ad8'],
				redactionStatus: 'unredacted'
			};

			nock('http://test/').post(`/appeals/${appealId}/comments`, comment).reply(302);

			const response = await request.get(`${baseUrl}/${appealId}/interested-party-comments/add`);

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toContain('/add/ip-details');
		});
	});
});
