// @ts-nocheck
import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('planning-obligation', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /status/change', () => {
		it('should render the change planning obligation status page with "Not yet started" radio option checked if planningObligation.status is "not_started"', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					planningObligation: {
						...appellantCaseDataNotValidated.planningObligation,
						status: 'not_started'
					}
				});

			const response = await request.get(
				`${baseUrl}/1/appellant-case/planning-obligation/status/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'What is the status of your planning obligation?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="planningObligationStatusRadio" type="radio" value="not_started" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="planningObligationStatusRadio" type="radio" value="finalised">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="planningObligationStatusRadio" type="radio" value="not-applicable">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change planning obligation status page with "Finalised" radio option checked if planningObligation.status is "finalised"', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					planningObligation: {
						...appellantCaseDataNotValidated.planningObligation,
						status: 'finalised'
					}
				});

			const response = await request.get(
				`${baseUrl}/1/appellant-case/planning-obligation/status/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'What is the status of your planning obligation?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="planningObligationStatusRadio" type="radio" value="not_started">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="planningObligationStatusRadio" type="radio" value="finalised" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="planningObligationStatusRadio" type="radio" value="not-applicable">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change planning obligation status page with "Not applicable" radio option checked if planningObligation.status is null', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					planningObligation: {
						...appellantCaseDataNotValidated.planningObligation,
						status: null
					}
				});

			const response = await request.get(
				`${baseUrl}/1/appellant-case/planning-obligation/status/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'What is the status of your planning obligation?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="planningObligationStatusRadio" type="radio" value="not_started">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="planningObligationStatusRadio" type="radio" value="finalised">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="planningObligationStatusRadio" type="radio" value="not-applicable" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /status/change', () => {
		const validInputs = [
			{
				label: 'Not yet started',
				value: 'not_started'
			},
			{
				label: 'Finalised',
				value: 'finalised'
			},
			{
				label: 'Not applicable',
				value: null
			}
		];

		for (const validInput of validInputs) {
			it(`should call appellant cases PATCH endpoint and redirect to the appellant case page if "${validInput.label}" is selected`, async () => {
				const mockAppellantCasesPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/1/appellant-case/planning-obligation/status/change`)
					.send({
						planningObligationRadio: validInput.value
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
