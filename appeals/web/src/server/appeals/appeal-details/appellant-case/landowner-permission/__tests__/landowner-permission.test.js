import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform/testing/html-parser.js';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('Advertisement in position page', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render change landowner permission page with yes radio button selected when landownerPermission boolean is true', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					landownerPermission: true
				});

			const response = await request.get(`${baseUrl}/1/appellant-case/landowner-permission/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Do you have the landowner&#39;s permission?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="landownerPermission" type="radio" value="yes" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="landownerPermission" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render change landowner permission page with no radio button selected when landownerPermission boolean is false', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					landownerPermission: false
				});

			const response = await request.get(`${baseUrl}/1/appellant-case/landowner-permission/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Do you have the landowner&#39;s permission?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="landownerPermission" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="landownerPermission" type="radio" value="no" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		const validLandownerPermissionValues = ['yes', 'no'];

		test.each([...validLandownerPermissionValues])(
			'should call appellant cases PATCH endpoint and redirect to the appellant case page if %s is selected',
			async (landownerPermission) => {
				const mockAppellantCasesPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/1/appellant-case/landowner-permission/change`)
					.send({
						landownerPermission: landownerPermission
					});

				expect(mockAppellantCasesPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
				);
			}
		);
	});
});
