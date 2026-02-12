import { appealData, lpaQuestionnaireData } from '#testing/app/fixtures/referencedata.js';

import { createTestEnvironment } from '#testing/index.js';

import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
const lpaQuestionnaireUrl = `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`;

describe('appeal-under-act-section', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the ldc type page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireData);

			const response = await request.get(`${lpaQuestionnaireUrl}/appeal-under-act-section/change`);

			const mainInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain(
				'What type of lawful development certificate is the appeal about?</h1>'
			);

			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;

			expect(response.statusCode).toEqual(200);
			expect(backLinkInnerHtml).toContain(`href="${lpaQuestionnaireUrl}`);
		});
	});

	describe('POST /change', () => {
		it('should update via the api and re-direct to LPAQ if a radio button is selected', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {});

			const validData = { appealUnderActSection: 'existing-development' };

			const response = await request
				.post(`${lpaQuestionnaireUrl}/appeal-under-act-section/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(`Found. Redirecting to ${lpaQuestionnaireUrl}`);
		});

		it('should re-render the page with an error if no radio button is selected', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireData);
			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {});
			const invalidData = { appealUnderActSection: undefined };
			const response = await request
				.post(`${lpaQuestionnaireUrl}/appeal-under-act-section/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);
			expect(elementInnerHtml).toMatchSnapshot();

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain(
				'Select what type of lawful development certificate the appeal is about</a>'
			);
		});
	});
});
