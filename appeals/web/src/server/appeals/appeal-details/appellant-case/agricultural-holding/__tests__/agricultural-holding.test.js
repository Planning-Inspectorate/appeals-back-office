// @ts-nocheck
import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('agricultural-holding', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the change part of agricultural holding page with "no" radio option checked if agriculturalHolding.isPartOfAgriculturalHolding is false', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					agriculturalHolding: {
						...appellantCaseDataNotValidated.agriculturalHolding,
						isPartOfAgriculturalHolding: false
					}
				});

			const response = await request.get(`${baseUrl}/1/appellant-case/agricultural-holding/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Is the appeal site part of an agricultural holding?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="partOfAgriculturalHoldingRadio" type="radio" value="no" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="partOfAgriculturalHoldingRadio" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change part of agricultural holding page with "yes" radio option checked if agriculturalHolding.isPartOfAgriculturalHolding is true', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					agriculturalHolding: {
						...appellantCaseDataNotValidated.agriculturalHolding,
						isPartOfAgriculturalHolding: true
					}
				});

			const response = await request.get(`${baseUrl}/1/appellant-case/agricultural-holding/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Is the appeal site part of an agricultural holding?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="partOfAgriculturalHoldingRadio" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="partOfAgriculturalHoldingRadio" type="radio" value="yes" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		const validValues = ['Yes', 'No'];

		for (const validValue of validValues) {
			it(`should call appellant cases PATCH endpoint and redirect to the appellant case page if "${validValue}" is selected`, async () => {
				const mockAppellantCasesPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/1/appellant-case/agricultural-holding/change`)
					.send({
						partOfAgriculturalHoldingRadio: validValue.toLowerCase()
					});

				expect(mockAppellantCasesPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
				);
			});
		}
	});

	describe('GET /tenant/change', () => {
		it('should render the change tenant of agricultural holding page with "no" radio option checked if agriculturalHolding.isTenant is false', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					agriculturalHolding: {
						...appellantCaseDataNotValidated.agriculturalHolding,
						isTenant: false
					}
				});

			const response = await request.get(
				`${baseUrl}/1/appellant-case/agricultural-holding/tenant/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Are you a tenant of the agricultural holding?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="tenantOfAgriculturalHoldingRadio" type="radio" value="no" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="tenantOfAgriculturalHoldingRadio" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change tenant of agricultural holding page with "yes" radio option checked if agriculturalHolding.isTenant is true', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					agriculturalHolding: {
						...appellantCaseDataNotValidated.agriculturalHolding,
						isTenant: true
					}
				});

			const response = await request.get(
				`${baseUrl}/1/appellant-case/agricultural-holding/tenant/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Are you a tenant of the agricultural holding?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="tenantOfAgriculturalHoldingRadio" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="tenantOfAgriculturalHoldingRadio" type="radio" value="yes" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /tenant/change', () => {
		const validValues = ['Yes', 'No'];

		for (const validValue of validValues) {
			it(`should call appellant cases PATCH endpoint and redirect to the appellant case page if "${validValue}" is selected`, async () => {
				const mockAppellantCasesPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/1/appellant-case/agricultural-holding/tenant/change`)
					.send({
						tenantOfAgriculturalHoldingRadio: validValue.toLowerCase()
					});

				expect(mockAppellantCasesPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
				);
			});
		}
	});

	describe('GET /other-tenants/change', () => {
		it('should render the change other tenants of agricultural holding page with "no" radio option checked if agriculturalHolding.hasOtherTenants is false', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					agriculturalHolding: {
						...appellantCaseDataNotValidated.agriculturalHolding,
						hasOtherTenants: false
					}
				});

			const response = await request.get(
				`${baseUrl}/1/appellant-case/agricultural-holding/other-tenants/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Are there any other tenants?</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="otherTenantsOfAgriculturalHoldingRadio" type="radio" value="no" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="otherTenantsOfAgriculturalHoldingRadio" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change other tenants of agricultural holding page with "yes" radio option checked if agriculturalHolding.hasOtherTenants is true', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					agriculturalHolding: {
						...appellantCaseDataNotValidated.agriculturalHolding,
						hasOtherTenants: true
					}
				});

			const response = await request.get(
				`${baseUrl}/1/appellant-case/agricultural-holding/other-tenants/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Are there any other tenants?</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="otherTenantsOfAgriculturalHoldingRadio" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="otherTenantsOfAgriculturalHoldingRadio" type="radio" value="yes" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /other-tenants/change', () => {
		const validValues = ['Yes', 'No'];

		for (const validValue of validValues) {
			it(`should call appellant cases PATCH endpoint and redirect to the appellant case page if "${validValue}" is selected`, async () => {
				const mockAppellantCasesPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/1/appellant-case/agricultural-holding/other-tenants/change`)
					.send({
						otherTenantsOfAgriculturalHoldingRadio: validValue.toLowerCase()
					});

				expect(mockAppellantCasesPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
				);
			});
		}
	});
});
