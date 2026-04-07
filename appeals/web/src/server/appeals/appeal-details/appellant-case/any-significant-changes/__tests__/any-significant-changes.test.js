import {
	appealDataEnforcementNotice,
	appellantCaseDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealDataEnforcementNotice.appealId;
const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

describe('significant-changes', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}?include=appellantCase`)
			.reply(200, appealDataEnforcementNotice)
			.persist();
		nock('http://test/')
			.get(`/appeals/${appealId}/appellant-cases/0`)
			.reply(200, appellantCaseDataNotValidated)
			.persist();
	});
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the significant changes page', async () => {
			const response = await request.get(`${appellantCaseUrl}/any-significant-changes/change`);
			const mainInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain(
				'Have there been any significant changes that would affect the application?</h1>'
			);

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
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/0`)
				.reply(200, { ...appellantCaseDataNotValidated, anySignificantChanges: 'yes' })
				.persist();

			const response = await request.get(`${appellantCaseUrl}/any-significant-changes/change`);

			const mainInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain(
				'Have there been any significant changes that would affect the application?</h1>'
			);
			expect(mainInnerHtml).toContain('type="radio" value="yes" checked>');
		});
	});

	describe('POST /change', () => {
		it('should re-render the page with an error if no radio button is selected', async () => {
			const invalidData = {};
			const response = await request
				.post(`${appellantCaseUrl}/any-significant-changes/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain(
				'Select yes if you have any significant changes that would affect the application</a>'
			);
		});
	});
});
