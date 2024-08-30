// @ts-nocheck
import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('ownership-certificate', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the change ownership certificate submitted page with "No" radio option checked if ownershipCertificateSubmitted is false', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					ownershipCertificateSubmitted: false
				});

			const response = await request.get(
				`${baseUrl}/1/appellant-case/ownership-certificate/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Change ownership certificate or land declaration submitted</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownershipCertificateRadio" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownershipCertificateRadio" type="radio" value="no" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change ownership certificate submitted page with "Yes" radio option checked if ownershipCertificateSubmitted is true', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					ownershipCertificateSubmitted: true
				});

			const response = await request.get(
				`${baseUrl}/1/appellant-case/ownership-certificate/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Change ownership certificate or land declaration submitted</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownershipCertificateRadio" type="radio" value="yes" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownershipCertificateRadio" type="radio" value="no">'
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
					.post(`${baseUrl}/1/appellant-case/ownership-certificate/change`)
					.send({
						planningObligationRadio: validValue.toLowerCase()
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
