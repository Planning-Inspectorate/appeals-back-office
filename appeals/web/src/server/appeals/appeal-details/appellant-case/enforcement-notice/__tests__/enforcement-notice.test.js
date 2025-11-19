import {
	appealData,
	appellantCaseDataIncompleteOutcome
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const appellantCaseId = appealData.appellantCaseId;
const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

describe('enforcement-notice', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the enforcement notice change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataIncompleteOutcome);
			const response = await request.get(`${appellantCaseUrl}/enforcement-notice/change`);

			const mainInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain('Have you received an enforcement notice?</h1>');
		});

		it('should render a back link to appellant case page on the enforcement notice change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataIncompleteOutcome);
			const response = await request.get(`${appellantCaseUrl}/enforcement-notice/change`);

			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;

			expect(response.statusCode).toEqual(200);
			expect(backLinkInnerHtml).toContain(`href="${appellantCaseUrl}`);
		});
	});

	describe('POST /change', () => {
		it('should re-direct to Appellant Case if "yes"', async () => {
			const validData = {
				enforcementNoticeRadio: 'yes'
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {});

			const response = await request
				.post(`${appellantCaseUrl}/enforcement-notice/change`)
				.send(validData);

			expect(apiCall.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});

		it('should re-direct to Appellant Case if "no"', async () => {
			const validData = {
				enforcementNoticeRadio: 'no'
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {});

			const response = await request
				.post(`${appellantCaseUrl}/enforcement-notice/change`)
				.send(validData);

			expect(apiCall.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});
	});
});
