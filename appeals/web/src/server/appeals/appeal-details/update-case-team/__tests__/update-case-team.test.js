// @ts-nocheck
import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';
import { caseTeams } from '#testing/app/fixtures/referencedata.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../site-visit.service.js').UpdateOrCreateSiteVisitParameters} UpdateOrCreateSiteVisitParameters
 */

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const siteVisitPath = '/case-team';

describe('update-case-team', () => {
	/**
	 * @type {import("superagent").Response}
	 */
	let selectTeamResponse;
	/**
	 * @type {import("superagent").Response}
	 */
	let renderSelectPage;
	beforeEach(() => {
		installMockApi();
	});
	afterEach(teardown);

	describe('GET /case-team/edit', () => {
		it('should render the update case team page', async () => {
			nock('http://test/').get('/appeals/case-teams').reply(200, caseTeams);

			const response = await request.get(`${baseUrl}/1${siteVisitPath}/edit`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			expect(element.innerHTML).toContain('Appeal 351062 - update case team');
			expect(element.innerHTML).toContain('Case team');
			expect(element.innerHTML).toContain('temp@email.com');
			expect(element.innerHTML).toContain('temp2@email.com');
			expect(element.innerHTML).toContain('temp3@email.com');
			expect(element.innerHTML).toContain('Unassign team');
			expect(element.innerHTML).toContain('This will remove the current case team from the appeal');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /case-team/edit', () => {
		it('should rerender the update case team page with when no case team selected', async () => {
			nock('http://test/').get('/appeals/case-teams').reply(200, caseTeams);

			const response = await request.post(`${baseUrl}/1${siteVisitPath}/edit`).send({
				'case-team': ''
			});
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('<a href="#case-team">Select the case team</a>');
			expect(element.innerHTML).toContain('There is a problem');
		});
		it('should submit the update case team page', async () => {
			nock('http://test/').get('/appeals/case-teams').reply(200, caseTeams);

			const response = await request.post(`${baseUrl}/1${siteVisitPath}/edit`).send({
				'case-team': '1'
			});
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(`Found. Redirecting to ${baseUrl}/1${siteVisitPath}/edit/check`);
		});
	});
	describe('GET /case-team/edit/check', () => {
		beforeEach(async () => {
			nock('http://test/').get('/appeals/case-teams').reply(200, caseTeams);
			nock('http://test/').get('/appeals/1/case-team').reply(200, { assignedTeamId: 1 });
			renderSelectPage = await request.get(`${baseUrl}/1${siteVisitPath}/edit`);
			selectTeamResponse = await request.post(`${baseUrl}/1${siteVisitPath}/edit`).send({
				'case-team': '1'
			});
			renderSelectPage = await request.get(`${baseUrl}/1${siteVisitPath}/edit`);
		});

		it('should render the check your answers page', async () => {
			expect(renderSelectPage.statusCode).toBe(500);
			expect(selectTeamResponse.statusCode).toBe(302);
			const response = await request.get(`${baseUrl}/1${siteVisitPath}/edit/check`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Case team</dt>');
			expect(element.innerHTML).toContain('<br>temp@email.com</dd>');
			expect(element.innerHTML).toContain('<dd class="govuk-summary-list__value">temp');
			expect(element.innerHTML).toContain('Change team</span>');
			expect(element.innerHTML).toContain('Update case team');
		});

		it('should redirect to the appeal detail page', async () => {
			nock('http://test/').patch('/appeals/1/case-team').reply(200, { assignedTeamId: 1 });

			expect(renderSelectPage.statusCode).toBe(500);
			expect(selectTeamResponse.statusCode).toBe(302);
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/edit/check`);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(`Found. Redirecting to ${baseUrl}/1`);
		});
	});
});
