// @ts-nocheck
import { caseTeams } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../site-visit.service.js').UpdateOrCreateSiteVisitParameters} UpdateOrCreateSiteVisitParameters
 */

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const caseTeamPath = '/case-team';

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
		nock('http://test/').get('/appeals/case-teams').reply(200, caseTeams);
	});
	afterEach(teardown);

	describe('GET /case-team/edit', () => {
		it('should render the update case team page', async () => {
			const response = await request.get(`${baseUrl}/1${caseTeamPath}/edit`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			expect(element.innerHTML).toContain('Appeal 351062 - update case team');
			expect(element.innerHTML).toContain('Case team');
			expect(element.innerHTML).toContain('temp (temp@email.com)');
			expect(element.innerHTML).toContain('temp2 (temp2@email.com)');
			expect(element.innerHTML).toContain('temp3 (temp3@email.com)');
			expect(element.innerHTML).toContain('temp3');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /case-team/edit', () => {
		it('should rerender the update case team page with when no case team selected', async () => {
			const response = await request.post(`${baseUrl}/1${caseTeamPath}/edit`).send({
				'case-team': ''
			});
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				'<a href="#case-team">Enter a team name or team email address</a>'
			);
			expect(element.innerHTML).toContain('There is a problem');
		});
		it('should submit the update case team page', async () => {
			const response = await request.post(`${baseUrl}/1${caseTeamPath}/edit`).send({
				'case-team': '1'
			});
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(`Found. Redirecting to ${baseUrl}/1${caseTeamPath}/edit/check`);
		});
	});

	describe('/case-team/edit/check', () => {
		describe('GET name and email available', () => {
			beforeEach(async () => {
				nock('http://test/').get('/appeals/1/case-team').reply(200, { assignedTeamId: 1 });
				renderSelectPage = await request.get(`${baseUrl}/1${caseTeamPath}/edit`);
				selectTeamResponse = await request.post(`${baseUrl}/1${caseTeamPath}/edit`).send({
					'case-team': '1'
				});
				renderSelectPage = await request.get(`${baseUrl}/1${caseTeamPath}/edit`);
			});
			it('should render the check your answers page', async () => {
				expect(renderSelectPage.statusCode).toBe(500);
				expect(selectTeamResponse.statusCode).toBe(302);
				const response = await request.get(`${baseUrl}/1${caseTeamPath}/edit/check`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Case team</dt>');
				expect(element.innerHTML).toContain('<br>temp@email.com</dd>');
				expect(element.innerHTML).toContain('<dd class="govuk-summary-list__value">temp');
				expect(element.innerHTML).toContain('Change team</span>');
				expect(element.innerHTML).toContain('Update case team');
			});
		});
		describe('GET name only available', () => {
			beforeEach(async () => {
				nock('http://test/').get('/appeals/1/case-team').reply(200, { assignedTeamId: 4 });
				renderSelectPage = await request.get(`${baseUrl}/1${caseTeamPath}/edit`);
				selectTeamResponse = await request.post(`${baseUrl}/1${caseTeamPath}/edit`).send({
					'case-team': '4'
				});
				renderSelectPage = await request.get(`${baseUrl}/1${caseTeamPath}/edit`);
			});
			it('should render the check your answers page', async () => {
				expect(renderSelectPage.statusCode).toBe(500);
				expect(selectTeamResponse.statusCode).toBe(302);
				const response = await request.get(`${baseUrl}/1${caseTeamPath}/edit/check`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('temp4</dd>');
				expect(element.innerHTML).toContain('Change team</span>');
				expect(element.innerHTML).toContain('Update case team');
			});
		});
		describe('POST', () => {
			it('should redirect to the appeal detail page', async () => {
				nock('http://test/').patch('/appeals/1/case-team').reply(200, { assignedTeamId: 1 });

				expect(renderSelectPage.statusCode).toBe(500);
				expect(selectTeamResponse.statusCode).toBe(302);
				const response = await request.post(`${baseUrl}/1${caseTeamPath}/edit/check`);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(`Found. Redirecting to ${baseUrl}/1`);
			});
		});
	});
});
