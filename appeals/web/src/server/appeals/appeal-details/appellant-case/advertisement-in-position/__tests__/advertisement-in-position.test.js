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
		it('should render change advertisement in position page with yes radio button selected when advertInPosition boolean is true', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					advertInPosition: true
				});

			const response = await request.get(
				`${baseUrl}/1/appellant-case/advertisement-in-position/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Is the advertisement in position?</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="advertisementInPosition" type="radio" value="yes" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="advertisementInPosition" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render change advertisement in position page with no radio button selected when advertInPosition boolean is false', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					advertInPosition: false
				});

			const response = await request.get(
				`${baseUrl}/1/appellant-case/advertisement-in-position/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Is the advertisement in position?</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="advertisementInPosition" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="advertisementInPosition" type="radio" value="no" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		const validAdvertInPositionValues = ['yes', 'no'];

		test.each([...validAdvertInPositionValues])(
			'should call appellant cases PATCH endpoint and redirect to the appellant case page if %s is selected',
			async (advertInPosition) => {
				const mockAppellantCasesPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/1/appellant-case/advertisement-in-position/change`)
					.send({
						advertInPosition: advertInPosition
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
