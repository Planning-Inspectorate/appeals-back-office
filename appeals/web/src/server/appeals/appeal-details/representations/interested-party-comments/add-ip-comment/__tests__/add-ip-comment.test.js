// @ts-nocheck
import {
	appealData,
	documentRedactionStatuses,
	fileUploadInfo
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

const documentFolderInfo = [
	{
		caseId: '2',
		documents: [],
		folderId: 55539,
		path: 'representation/representationAttachments'
	}
];

describe('add-ip-comment', () => {
	beforeEach(() => {
		installMockApi();

		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, documentRedactionStatuses)
			.persist();
	});
	afterEach(teardown);

	describe('GET /add', () => {
		// eslint-disable-next-line jest/expect-expect
		it('should redirect to /add/ip-details', () => {
			return new Promise((resolve) => {
				request
					.get(`${baseUrl}/2/interested-party-comments/add?backUrl=/test/back/url`)
					.expect(302)
					.expect('Location', `./add/ip-details?backUrl=/test/back/url`)
					.end(resolve);
			});
		});
	});

	describe('GET /add/ip-details', () => {
		const appealId = 2;

		/** @type {*} */
		let pageHtml;

		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-details?backUrl=/test/back/url`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('main h1')?.innerHTML.trim()).toBe('Interested party details');
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

		it('should render the correct back link', () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				'/test/back/url'
			);
		});

		it('should render the correct back link when editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-details` +
					`?editEntrypoint=${baseUrl}/${appealId}/interested-party-comments/add/ip-details`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				'/appeals-service/appeal-details/2/interested-party-comments/add/check-your-answers'
			);
		});

		it('should render any previous response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
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

		it('should render the edited values if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.times(3)
				.reply(200, { ...appealData, appealId });

			await request.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`).send({
				firstName: 'First123',
				lastName: 'Last456',
				emailAddress: 'example@email.com'
			});
			await request
				.post(
					`${baseUrl}/${appealId}/interested-party-comments/add/ip-details` +
						`?editEntrypoint=${baseUrl}/${appealId}/interested-party-comments/add/ip-details`
				)
				.send({
					firstName: 'First64',
					lastName: 'Last32',
					emailAddress: 'example2@email.com'
				});

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-details` +
					`?editEntrypoint=${baseUrl}/${appealId}/interested-party-comments/add/ip-details`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(pageHtml.querySelector('input#first-name').getAttribute('value')).toEqual('First64');
			expect(pageHtml.querySelector('input#last-name').getAttribute('value')).toEqual('Last32');
			expect(pageHtml.querySelector('input#email-address').getAttribute('value')).toEqual(
				'example2@email.com'
			);
		});
	});

	describe('GET /add/check-address', () => {
		const appealId = 2;

		/** @type {*} */
		let pageHtml;

		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/check-address`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('main h1')?.innerHTML.trim()).toBe(
				'Did the interested party provide an address?'
			);
		});

		it('should render Yes and No radio buttons', () => {
			expect(pageHtml.querySelector('input[type="radio"][value="yes"]')).not.toBeNull();
			expect(pageHtml.querySelector('input[type="radio"][value="no"]')).not.toBeNull();
		});

		it('should render any previous response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			//set session data with post request
			await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/check-address`)
				.send({ addressProvided: 'no' });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/check-address`
			);

			pageHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(
				pageHtml.querySelector('input[type="radio"][value="no"]').getAttribute('checked')
			).toEqual('');
			expect(
				pageHtml.querySelector('input[type="radio"][value="yes"]').getAttribute('checked')
			).toBeUndefined();
		});

		it('should render the edited response if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.times(3)
				.reply(200, { ...appealData, appealId });

			await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/check-address`)
				.send({ addressProvided: 'no' });
			await request
				.post(
					`${baseUrl}/${appealId}/interested-party-comments/add/check-address` +
						`?editEntrypoint=${baseUrl}/${appealId}/interested-party-comments/add/check-address`
				)
				.send({ addressProvided: 'yes' });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/check-address` +
					`?editEntrypoint=${baseUrl}/${appealId}/interested-party-comments/add/check-address`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(
				pageHtml.querySelector('input[type="radio"][value="yes"]').getAttribute('checked')
			).toEqual('');
			expect(
				pageHtml.querySelector('input[type="radio"][value="no"]').getAttribute('checked')
			).toBeUndefined();
		});

		it('should render the correct back link', () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				'/appeals-service/appeal-details/2/interested-party-comments/add/ip-details'
			);
		});

		it('should render the correct back link when editing from this page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/check-address` +
					`?editEntrypoint=${baseUrl}/${appealId}/interested-party-comments/add/check-address`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				'/appeals-service/appeal-details/2/interested-party-comments/add/check-your-answers'
			);
		});

		it('should render the correct back link when editing from a previous page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/check-address` +
					`?editEntrypoint=${baseUrl}/${appealId}/interested-party-comments/add/ip-details`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				'/appeals-service/appeal-details/2/interested-party-comments/add/ip-details' +
					'?editEntrypoint=' +
					'%2Fappeals-service%2Fappeal-details%2F2%2Finterested-party-comments%2Fadd%2Fip-details'
			);
		});
	});

	describe('GET /add/ip-address', () => {
		const appealId = 2;

		/** @type {*} */
		let pageHtml;

		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('main h1')?.innerHTML.trim()).toBe(
				'Interested party&#39;s address'
			);
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
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
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

			pageHtml = parseHtml(response.text, { rootElement: 'body' });

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

		it('should render the edited response if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.times(3)
				.reply(200, { ...appealData, appealId });

			await request.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`).send({
				addressLine1: 'Line 1',
				addressLine2: 'Line 2',
				town: 'Town',
				county: 'County',
				postCode: 'AB1 2CD'
			});
			await request
				.post(
					`${baseUrl}/${appealId}/interested-party-comments/add/ip-address` +
						`?editEntrypoint=${baseUrl}/${appealId}/interested-party-comments/add/ip-address`
				)
				.send({
					addressLine1: 'Line 12',
					addressLine2: 'Line 22',
					town: 'Town2',
					county: 'County2',
					postCode: 'AB1 2CD2'
				});

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-address` +
					`?editEntrypoint=${baseUrl}/${appealId}/interested-party-comments/add/ip-address`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(pageHtml.querySelector('input#address-line-1').getAttribute('value')).toEqual(
				'Line 12'
			);
			expect(pageHtml.querySelector('input#address-line-2').getAttribute('value')).toEqual(
				'Line 22'
			);
			expect(pageHtml.querySelector('input#town').getAttribute('value')).toEqual('Town2');
			expect(pageHtml.querySelector('input#county').getAttribute('value')).toEqual('County2');
			expect(pageHtml.querySelector('input#post-code').getAttribute('value')).toEqual('AB1 2CD2');
		});

		it('should render the correct back link', async () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				'/appeals-service/appeal-details/2/interested-party-comments/add/check-address'
			);
		});

		it('should render the correct back link when editing from this page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-address` +
					`?editEntrypoint=${baseUrl}/${appealId}/interested-party-comments/add/ip-address`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				'/appeals-service/appeal-details/2/interested-party-comments/add/check-your-answers'
			);
		});

		it('should render the correct back link when editing from a previous page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-address` +
					`?editEntrypoint=${baseUrl}/${appealId}/interested-party-comments/add/check-address`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				'/appeals-service/appeal-details/2/interested-party-comments/add/check-address' +
					'?editEntrypoint=' +
					'%2Fappeals-service%2Fappeal-details%2F2%2Finterested-party-comments%2Fadd%2Fcheck-address'
			);
		});
	});

	describe('POST /add/ip-details', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
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
				.get(`/appeals/${appealId}?include=all`)
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
				.get(`/appeals/${appealId}?include=all`)
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

	describe('GET /add/upload', () => {
		const appealId = 2;
		let pageHtml;

		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

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

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/upload`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the upload page with correct document title', () => {
			expect(pageHtml.innerHTML).toContain(
				'data-document-title="interested party comment document"'
			);
		});
	});

	describe('POST /add/upload', () => {
		const appealId = 2;

		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });
		});

		it(`should render a 500 error page if upload-info is not present in the request body`, async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/document-folders?path=representation/representationAttachments`)
				.reply(200, documentFolderInfo);

			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/upload`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it(`should render a 500 error page if request body upload-info is in an incorrect format`, async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/document-folders?path=representation/representationAttachments`)
				.reply(200, documentFolderInfo);

			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/upload`)
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

		it(`should render a 500 error page if request body upload-info is present but currentFolder is missing`, async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/document-folders?path=representation/representationAttachments`)
				.reply(200);

			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/upload`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should redirect to the add document details page if upload info is present and in the correct format', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/document-folders?path=representation/representationAttachments`)
				.reply(200, documentFolderInfo);

			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/upload`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to ${baseUrl}/${appealId}/interested-party-comments/add/add-document-details`
			);
		});
	});

	describe('GET /add/add-document-details', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}/document-folders?path=representation/representationAttachments`)
				.reply(200, documentFolderInfo)
				.persist();

			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId })
				.persist();
		});

		it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/add-document-details`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add documents details page', async () => {
			await request.post(`${baseUrl}/${appealId}/interested-party-comments/add/upload`).send({
				'upload-info': fileUploadInfo
			});

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/add-document-details`
			);
			expect(response.statusCode).toBe(200);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('Add document details</span');
			expect(unprettifiedElement.innerHTML).toContain(
				`Appeal ${appealData.appealReference}: Interested party comments</h1>`
			);
		});
	});

	describe('POST /add/add-document-details', () => {
		const appealId = 2;

		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/document-folders?path=representation/representationAttachments`)
				.reply(200, documentFolderInfo)
				.persist();

			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId, appealStatus: 'statements' })
				.persist();

			await request.post(`${baseUrl}/${appealId}/interested-party-comments/add/upload`).send({
				'upload-info': fileUploadInfo
			});
		});

		it(`should re-render add documents details page with service error message if the request body is in an incorrect format`, async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/add-document-details`)
				.send({});

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain(
				`Appeal ${appealData.appealReference}: Interested party comments</h1>`
			);

			const errorSummaryElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary'
			});

			expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
		});

		it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value`, async () => {
			const testCases = [
				{
					value: '',
					expectedError: `Received date must include a day`
				},
				{
					value: 'a',
					expectedError: `Received date day must be a number`
				},
				{
					value: '0',
					expectedError: `Received date day must be between 1 and 31`
				},
				{
					value: '32',
					expectedError: `Received date day must be between 1 and 31`
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/${appealId}/interested-party-comments/add/add-document-details`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: testCase.value,
									month: '2',
									year: '2030'
								},
								redactionStatus: 3
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`Appeal ${appealData.appealReference}: Interested party comments</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should re-render the document details page with the expected error message if receivedDate month is an invalid value`, async () => {
			const testCases = [
				{
					value: '',
					expectedError: `Received date must include a month`
				},
				{
					value: 'a',
					expectedError: `Received date must be a real date`
				},
				{
					value: '0',
					expectedError: `Received date month must be between 1 and 12`
				},
				{
					value: '13',
					expectedError: `Received date month must be between 1 and 12`
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/${appealId}/interested-party-comments/add/add-document-details`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: '1',
									month: testCase.value,
									year: '2030'
								},
								redactionStatus: 3
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`Appeal ${appealData.appealReference}: Interested party comments</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should re-render the document details page with the expected error message if receivedDate year is an invalid value`, async () => {
			const testCases = [
				{
					value: '',
					expectedError: `Received date must include a year`
				},
				{
					value: 'a',
					expectedError: `Received date year must be a number`
				},
				{
					value: '202',
					expectedError: `Received date year must be 4 digits`
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/${appealId}/interested-party-comments/add/add-document-details`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: '1',
									month: '2',
									year: testCase.value
								},
								redactionStatus: 3
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`Appeal ${appealData.appealReference}: Interested party comments</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should re-render add documents details page if receivedDate is not a valid date`, async () => {
			const testCases = [
				{
					value: {
						day: '29',
						month: '2',
						year: 2023
					},
					expectedError: `Received date must be a real date`
				},
				{
					value: {
						day: '',
						month: '',
						year: ''
					},
					expectedError: `Enter the date`
				},
				{
					value: {
						day: '2',
						month: '',
						year: ''
					},
					expectedError: `Received date must include a month and year`
				},
				{
					value: {
						day: '',
						month: '2',
						year: ''
					},
					expectedError: `Received date must include a day and year`
				},
				{
					value: {
						day: '',
						month: '',
						year: '2025'
					},
					expectedError: `Received date must include a day and month`
				},
				{
					value: {
						day: '14',
						month: '2',
						year: '3095'
					},
					expectedError: `Received date must be in the past`
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/${appealId}/interested-party-comments/add/add-document-details`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: testCase.value,
								redactionStatus: 3
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`Appeal ${appealData.appealReference}: Interested party comments</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should redirect to check your answers if valid details posted`, async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/add-document-details`)
				.send({
					items: [
						{
							documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: {
								day: '1',
								month: '2',
								year: '2023'
							},
							redactionStatus: 3
						}
					]
				});

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe(
				`Found. Redirecting to ${baseUrl}/${appealId}/interested-party-comments/add/check-your-answers`
			);
		});
	});

	describe('GET /check-your-answers', () => {
		const appealId = 2;

		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/document-folders?path=representation/representationAttachments`)
				.reply(200, documentFolderInfo)
				.persist();

			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId })
				.persist();
		});

		it(`should render check your answers page with correct content`, async () => {
			const response1 = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/upload`)
				.send({
					'upload-info': fileUploadInfo
				});
			expect(response1.statusCode).toBe(302);

			const response2 = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/add-document-details`)
				.send({
					items: [
						{
							documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: {
								day: '1',
								month: '2',
								year: '2023'
							},
							redactionStatus: 3
						}
					]
				});
			expect(response2.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/check-your-answers`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span');
			expect(unprettifiedElement.innerHTML).toContain(
				`Check details and add interested party comment</h1>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Contact details</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Address Provided</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Interested party comment document</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt" target="_blank">test-document.txt</a></dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/interested-party-comments/add/upload?editEntrypoint=`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`>Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/interested-party-comments/add/add-document-details?editEntrypoint=`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`>Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Add comment</button>');
		});
	});

	describe('POST /check-your-answers', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/').post(`/appeals/${appealId}/reps/comment`).reply(200);
			nock('http://test/').post(`/appeals/${appealId}/documents`).reply(200);
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });
			jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
		});

		it('should send an API request to create a new document', async () => {
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

			nock('http://test/').post(`/appeals/${appealId}/comment`, comment).reply(302);

			const response = await request.get(`${baseUrl}/${appealId}/interested-party-comments/add`);

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toContain('/add/ip-details');
		});
	});
});
