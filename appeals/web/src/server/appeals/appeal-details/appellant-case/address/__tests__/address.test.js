import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';
import { behavesLikeAddressForm } from '#testing/app/shared-examples/address-form.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('site-address', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /add', () => {
		it('should render updateSiteAddress page', async () => {
			const appealId = appealData.appealId.toString();
			const response = await request.get(
				`${baseUrl}/${appealId}/appellant-case/site-address/change/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('What is the address of the appeal site?</h1>');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change/:siteId', () => {
		behavesLikeAddressForm({
			request,
			url: `${baseUrl}/${appealData.appealId}/appellant-case/site-address/change/1`
		});

		it('should redirect to the appellant case page', async () => {
			const appealId = appealData.appealId.toString();
			nock('http://test/').patch(`/appeals/${appealId}/addresses/1`).reply(200, {
				addressLine1: '1 Grove Cottage',
				county: 'Devon',
				postcode: 'NR35 2ND',
				town: 'Woodton'
			});
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-case`)
				.reply(200, appealData);

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
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});
	});
});
