import { appealDataEnforcementNotice } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealDataEnforcementNotice.appealId;
const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

describe('interest-in-land', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the interest in land page', async () => {
			const response = await request.get(`${appellantCaseUrl}/interest-in-land/change`);

			const mainInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain('What is your interest in the land?</h1>');

			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;

			expect(response.statusCode).toEqual(200);
			expect(backLinkInnerHtml).toContain(`href="${appellantCaseUrl}`);
		});

		it('should render the interest in land page with a radio selected if interestInLand exists on the Appellant Case', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, {
					enforcementNotice: {
						appellantCase: {
							interestInLand: 'owner'
						}
					}
				});
			const response = await request.get(`${appellantCaseUrl}/interest-in-land/change`);

			const mainInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain('What is your interest in the land?</h1>');
			expect(mainInnerHtml).toContain('type="radio" value="owner" checked>');
		});

		it('should render the interest in land page with a text field for other if exists on the Appellant Case', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, {
					enforcementNotice: {
						appellantCase: {
							interestInLand: 'other'
						}
					}
				});
			const response = await request.get(`${appellantCaseUrl}/interest-in-land/change`);

			const mainInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain('What is your interest in the land?</h1>');
			expect(mainInnerHtml).toContain('type="radio" value="other" checked');
			expect(mainInnerHtml).toContain(
				'<div class="govuk-radios__conditional" id="conditional-interest-in-land-radio-4">'
			);
		});
	});

	describe('POST /change', () => {
		it('should re-render the page with an error if no radio button is selected', async () => {
			const invalidData = {};
			const response = await request
				.post(`${appellantCaseUrl}/interest-in-land/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('What is your interest in the land?</a>');
		});

		it('should re-render the page with an error if the "Other" radio button is selected and no answer is given for interest in land', async () => {
			const invalidData = {
				interestInLandRadio: 'other'
			};

			const response = await request
				.post(`${appellantCaseUrl}/interest-in-land/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('What is your interest in the land?</a>');
		});

		it('should re-render the page with an error if the "Other" radio button is selected and the answer is given for interest in land is too long', async () => {
			const invalidData = {
				interestInLandRadio: 'other',
				interestInLandOther: '1'.repeat(1001)
			};

			const response = await request
				.post(`${appellantCaseUrl}/interest-in-land/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain(
				'Your interest in the land must be 1000 characters or less</a>'
			);
		});

		it('should update via the api and re-direct to Appellant Case if a radio button is selected', async () => {
			nock('http://test/')
				.patch(`/appeals/1/appellant-cases/${appealDataEnforcementNotice.appellantCaseId}`)
				.reply(200, {});

			const validData = { interestInLandRadio: 'tenant' };

			const response = await request
				.post(`${appellantCaseUrl}/interest-in-land/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});

		it('should update via the api and re-direct to Appellant Case if the "Other" radio button is selected, and an interest in land answer is given', async () => {
			nock('http://test/')
				.patch(`/appeals/1/appellant-cases/${appealDataEnforcementNotice.appellantCaseId}`)
				.reply(200, {});

			const validData = { interestInLandRadio: 'other', interestInLandOther: 'My interest' };
			const response = await request
				.post(`${appellantCaseUrl}/interest-in-land/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});
	});
});
