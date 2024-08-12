import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import {
	appealData,
	appellantCaseDataIncompleteOutcome
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('lpa-changed-description', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render developmentDescription.isChanged page from appeals details', async () => {
			const appealId = appealData.appealId;
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const response = await request.get(
				`${baseUrl}/${appealId}/appellant-case/lpa-changed-description/change`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'Did the LPA change the description of the development?</h1>'
			);
		});
	});

	describe('POST /change', () => {
		it('should re-direct to appellant case page when data is valid for LPA and came from appellant case', async () => {
			const appealId = appealData.appealId;
			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});

			const validData = {
				lpaChangedDescriptionRadio: 'yes'
			};

			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/lpa-changed-description/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(apiCall.isDone()).toBe(true);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});
	});
});
