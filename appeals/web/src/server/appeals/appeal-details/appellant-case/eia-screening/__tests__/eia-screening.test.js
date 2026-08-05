// @ts-nocheck
import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('eia-screening', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the change eia screening page with "no" radio option checked if screeningOpinionIndicatesEiaRequired is false', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					screeningOpinionIndicatesEiaRequired: false
				});

			const response = await request.get(`${baseUrl}/1/appellant-case/eia-screening/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Did you submit an environmental statement with the application?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="eiaScreeningRadio" type="radio" value="no" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="eiaScreeningRadio" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change eia screening page with "yes" radio option checked if screeningOpinionIndicatesEiaRequired is true', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					screeningOpinionIndicatesEiaRequired: true
				});

			const response = await request.get(`${baseUrl}/1/appellant-case/eia-screening/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Did you submit an environmental statement with the application?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="eiaScreeningRadio" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="eiaScreeningRadio" type="radio" value="yes" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		const validValues = ['Yes', 'No'];

		for (const validValue of validValues) {
			it(`should call appellant cases PATCH endpoint and redirect to the appellant case page if "${validValue}" is selected`, async () => {
				const mockAppellantCasesPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`, {
						screeningOpinionIndicatesEiaRequired: validValue === 'Yes'
					})
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/1/appellant-case/eia-screening/change`)
					.send({
						eiaScreeningRadio: validValue.toLowerCase()
					});

				expect(mockAppellantCasesPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
				);
			});
		}

		it('should render the change eia screening page with an error if no option is selected', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					screeningOpinionIndicatesEiaRequired: false
				});

			const response = await request
				.post(`${baseUrl}/1/appellant-case/eia-screening/change`)
				.send({});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Did you submit an environmental statement with the application?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Select yes if the appellant submitted an environmental statement with the application</a>'
			);
		});
	});
});
