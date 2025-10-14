// @ts-nocheck
import usersService from '#appeals/appeal-users/users-service.js';
import {
	activeDirectoryUsersData,
	appealData,
	appellantCaseDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { behavesLikeAddressForm } from '#testing/app/shared-examples/address-form.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId.toString();
const baseUrl = '/appeals-service/appeal-details';

describe('site-address', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /appellant-case/site-address/change/:siteId', () => {
		it('should render change site address page with the expected content', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/appellant-case/site-address/change/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('What is the address of the appeal site?</h1>');
			expect(element.innerHTML).toContain('Continue</button>');
		});

		it('should render the change site address page with a back link to the appellant case page, if no back link query is present', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/appellant-case/site-address/change/1`
			);
			const backLinkHtml = parseHtml(response.text, { rootElement: '.govuk-back-link' }).innerHTML;

			expect(backLinkHtml).toContain(
				`href="/appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});
	});

	describe('GET /appeal-details/:appealId/site-address/change/:siteId', () => {
		it('should render change site address page with the expected content', async () => {
			const response = await request.get(`${baseUrl}/${appealId}/site-address/change/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('What is the address of the appeal site?</h1>');
			expect(element.innerHTML).toContain('Continue</button>');
		});

		it('should render the change site address page with a back link to the appeal details page, if accessed from the appeal details page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/site-address/change/1?backUrl=%2Fappeals-service%2Fappeal-details%2F1`
			);
			const backLinkHtml = parseHtml(response.text, { rootElement: '.govuk-back-link' }).innerHTML;

			expect(backLinkHtml).toContain(`href="/appeals-service/appeal-details/${appealId}"`);
		});
	});

	describe('POST /appellant-case/site-address/change/:siteId', () => {
		beforeEach(() => {
			nock('http://test/').patch(`/appeals/${appealId}/addresses/1`).reply(200, {
				addressLine1: '1 Grove Cottage',
				county: 'Devon',
				postcode: 'NR35 2ND',
				town: 'Woodton'
			});
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
		});

		behavesLikeAddressForm({
			request,
			url: `${baseUrl}/${appealData.appealId}/appellant-case/site-address/change/1`
		});

		it('should redirect to the appellant case page', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-address/change/1`)
				.send({
					addressLine1: '1 Grove Cottage',
					county: 'Devon',
					postCode: 'NR35 2ND',
					town: 'Woodton'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});

		it('should display an appropriate success banner on the appellant case page after redirecting', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-address/change/1`)
				.send({
					addressLine1: '1 Grove Cottage',
					county: 'Devon',
					postCode: 'NR35 2ND',
					town: 'Woodton'
				});

			expect(response.statusCode).toBe(302);

			const appellantCaseResponse = await request.get(`${baseUrl}/${appealId}/appellant-case`);
			const notificationBannerElementHTML = parseHtml(appellantCaseResponse.text, {
				rootElement: '.govuk-notification-banner'
			}).innerHTML;

			expect(notificationBannerElementHTML).toContain('Success</h3>');
			expect(notificationBannerElementHTML).toContain('Site address updated</p>');
		});
	});

	describe('POST /appeal-details/:appealId/site-address/change/:siteId', () => {
		beforeEach(() => {
			nock('http://test/').patch(`/appeals/${appealId}/addresses/1`).reply(200, {
				addressLine1: '1 Grove Cottage',
				county: 'Devon',
				postcode: 'NR35 2ND',
				town: 'Woodton'
			});
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
		});

		behavesLikeAddressForm({
			request,
			url: `${baseUrl}/${appealData.appealId}/site-address/change/1`
		});

		it('should redirect to the case details page', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/site-address/change/1`).send({
				addressLine1: '1 Grove Cottage',
				county: 'Devon',
				postCode: 'NR35 2ND',
				town: 'Woodton'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}`
			);
		});

		it('should display an appropriate success banner on the case details page after redirecting', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/site-address/change/1`).send({
				addressLine1: '1 Grove Cottage',
				county: 'Devon',
				postCode: 'NR35 2ND',
				town: 'Woodton'
			});

			expect(response.statusCode).toBe(302);

			// @ts-ignore
			usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
			// @ts-ignore
			usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);

			const caseDetailsResponse = await request.get(`${baseUrl}/${appealId}`);
			const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
				rootElement: '.govuk-notification-banner'
			}).innerHTML;

			expect(notificationBannerElementHTML).toContain('Success</h3>');
			expect(notificationBannerElementHTML).toContain('Site address updated</p>');
		});
	});
});
