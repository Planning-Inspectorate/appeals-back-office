import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('application outcome', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render application outcome page from appeals details', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(
				`${baseUrl}/${appealId}/appellant-case/application-outcome/change`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('What was the outcome of the application?</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="applicationOutcomeRadio" type="radio" value="granted"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="applicationOutcomeRadio" type="radio" value="refused"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="applicationOutcomeRadio" type="radio" value="not_received"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		it('should re-direct to lpaq page when data is valid for LPA and came from lpa-questionnaire', async () => {
			const appealId = appealData.appealId;
			const validData = {
				lpaChangedDescriptionRadio: 'granted'
			};

			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/application-outcome`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to appeals-service/appeal-details/${appealId}/appellant-case/change`
			);
		});
	});
});
