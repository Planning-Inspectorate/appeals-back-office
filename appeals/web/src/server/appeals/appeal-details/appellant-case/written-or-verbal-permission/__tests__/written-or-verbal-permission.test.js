import { appealDataEnforcementNotice } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealDataEnforcementNotice.appealId;
const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

describe('written-or-verbal-permission', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}?include=appellantCase`)
			.reply(200, appealDataEnforcementNotice)
			.persist();
	});
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the written or verbal permission page', async () => {
			const response = await request.get(`${appellantCaseUrl}/written-or-verbal-permission/change`);

			const mainInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain(
				'Do you have written or verbal permission to use the land?</h1>'
			);

			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;

			expect(response.statusCode).toEqual(200);
			expect(backLinkInnerHtml).toContain(`href="${appellantCaseUrl}`);
		});
	});

	describe('POST /change', () => {
		it('should re-render the page with an error if no radio button is selected', async () => {
			const invalidData = {};
			const response = await request
				.post(`${appellantCaseUrl}/written-or-verbal-permission/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain(
				'Select yes if you have written or verbal permission to use the land</a>'
			);
		});

		it('should update via the api and re-direct to Appellant Case if a radio button is selected', async () => {
			nock('http://test/')
				.patch(
					`/appeals/${appealDataEnforcementNotice.appealId}/appellant-cases/${appealDataEnforcementNotice.appellantCaseId}`
				)
				.reply(200, {});

			const validData = { writtenOrVerbalPermission: 'yes' };

			const response = await request
				.post(`${appellantCaseUrl}/written-or-verbal-permission/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});
	});
});
