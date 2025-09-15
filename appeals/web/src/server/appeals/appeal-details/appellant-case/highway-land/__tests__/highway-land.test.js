import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);

const appealId = appealData.appealId;
const appellantCaseId = appealData.appellantCaseId;
const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

describe('highway-land', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the highwayLand change page when accessed from Appellant Case page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					highwayLand: false
				});
			const response = await request.get(`${appellantCaseUrl}/highway-land/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(response.statusCode).toEqual(200);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Is the appeal site on highway land?</h1>');
			expect(elementInnerHtml).toContain('Continue</button>');
		});

		it('should render a back link to appellant case page on the highwayLand change page when accessed from Appellant Case page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
			const response = await request.get(`${appellantCaseUrl}/highway-land/change`);

			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;

			expect(response.statusCode).toEqual(200);
			expect(backLinkInnerHtml).toContain(`href="${appellantCaseUrl}`);
		});
	});

	describe('POST /change', () => {
		it('should re-direct to Appellant Case if "yes" when accessed from Appellant Case page', async () => {
			const validData = {
				highwayLandRadio: 'yes'
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {});

			const response = await request
				.post(`${appellantCaseUrl}/highway-land/change`)
				.send(validData);

			expect(apiCall.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});

		it('should re-direct to Appellant Case if "no" when accessed from Appellant Case page', async () => {
			const validData = {
				highwayLandRadio: 'no'
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {});

			const response = await request
				.post(`${appellantCaseUrl}/highway-land/change`)
				.send(validData);

			expect(apiCall.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});
	});
});
