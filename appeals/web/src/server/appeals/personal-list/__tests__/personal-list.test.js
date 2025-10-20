// @ts-nocheck
import { mapActionLinksForAppeal } from '#appeals/personal-list/personal-list.mapper.js';
import {
	appealDataToGetRequiredActions,
	assignedAppealsPage1,
	assignedAppealsPage2,
	baseAppealDataToGetRequiredActions
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/personal-list';

describe('personal-list', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /', () => {
		it('should render the first page of the personal list with the expected content and pagination', async () => {
			nock('http://test/')
				.get('/appeals/personal-list?pageNumber=1&pageSize=5')
				.reply(200, assignedAppealsPage1);

			const response = await request.get(`${baseUrl}${'?pageNumber=1&pageSize=5'}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Your appeals</h1>');
			expect(element.innerHTML).toContain('View another case officer’s appeals</a>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Filters</span>');
			expect(unprettifiedElement.innerHTML).toContain('Show cases with status</label>');
			expect(unprettifiedElement.innerHTML).toContain('<option value="all"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="final_comments"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="lpa_questionnaire"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="statements"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="ready_to_start"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="validation"');
			expect(unprettifiedElement.innerHTML).toContain('Apply</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filter</a>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal reference</th>');
			expect(unprettifiedElement.innerHTML).toContain('Lead or child</th>');
			expect(unprettifiedElement.innerHTML).toContain('Action required</th>');
			expect(unprettifiedElement.innerHTML).toContain('Due by</th>');
			expect(unprettifiedElement.innerHTML).toContain('Case status</th>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<nav class="govuk-pagination" aria-label="Pagination">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'aria-label="Page 1" aria-current="page"> 1</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 2"> 2</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<span class="govuk-pagination__link-title"> Next'
			);
		});

		it('should render the second page of the personal list with the expected content and pagination', async () => {
			nock('http://test/')
				.get('/appeals/personal-list?pageNumber=2&pageSize=5')
				.reply(200, assignedAppealsPage2);

			const response = await request.get(`${baseUrl}${'?pageNumber=2&pageSize=5'}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Your appeals</h1>');
			expect(element.innerHTML).toContain('View another case officer’s appeals</a>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Filters</span>');
			expect(unprettifiedElement.innerHTML).toContain('Show cases with status');
			expect(unprettifiedElement.innerHTML).toContain('<option value="all"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="awaiting_transfer"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="event"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="lpa_questionnaire"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="final_comments"');
			expect(unprettifiedElement.innerHTML).toContain('Apply</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filter</a>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal reference</th>');
			expect(unprettifiedElement.innerHTML).toContain('Lead or child</th>');
			expect(unprettifiedElement.innerHTML).toContain('Action required</th>');
			expect(unprettifiedElement.innerHTML).toContain('Due by</th>');
			expect(unprettifiedElement.innerHTML).toContain('Case status</th>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<nav class="govuk-pagination" aria-label="Pagination">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<span class="govuk-pagination__link-title"> Previous'
			);
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 1"> 1</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'aria-label="Page 2" aria-current="page"> 2</a>'
			);
		});

		it('should render the second page of the personal list with applied filter, the expected content and pagination', async () => {
			nock('http://test/')
				.get('/appeals/personal-list?pageNumber=2&pageSize=1&status=lpa_questionnaire')
				.reply(200, assignedAppealsPage2);

			const response = await request.get(
				`${baseUrl}${'?pageNumber=2&pageSize=1&appealStatusFilter=lpa_questionnaire'}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Your appeals</h1>');
			expect(element.innerHTML).toContain('View another case officer’s appeals</a>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Filters</span>');
			expect(unprettifiedElement.innerHTML).toContain('Show cases with status</label>');
			expect(unprettifiedElement.innerHTML).toContain('<option value="all"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="awaiting_transfer"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="event"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="lpa_questionnaire" selected');
			expect(unprettifiedElement.innerHTML).toContain('<option value="final_comments"');
			expect(unprettifiedElement.innerHTML).toContain('Apply</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filter</a>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal reference</th>');
			expect(unprettifiedElement.innerHTML).toContain('Lead or child</th>');
			expect(unprettifiedElement.innerHTML).toContain('Action required</th>');
			expect(unprettifiedElement.innerHTML).toContain('Due by</th>');
			expect(unprettifiedElement.innerHTML).toContain('Case status</th>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<nav class="govuk-pagination" aria-label="Pagination">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<span class="govuk-pagination__link-title"> Previous'
			);
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 1"> 1</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'aria-label="Page 2" aria-current="page"> 2</a>'
			);
		});

		it('should render the header with navigation containing links to the personal list (with active modifier class), national list, and sign out route', async () => {
			nock('http://test/')
				.get('/appeals/personal-list?pageNumber=1&pageSize=30')
				.reply(200, assignedAppealsPage1);

			const response = await request.get(baseUrl);
			const element = parseHtml(response.text, { rootElement: 'header' });

			expect(element.innerHTML).toMatchSnapshot();

			const headerNavigationHtml = parseHtml(response.text, {
				rootElement: '.pins-header-navigation',
				skipPrettyPrint: true
			}).innerHTML;

			expect(headerNavigationHtml).toContain(
				'<li class="govuk-header__navigation-item govuk-header__navigation-item--active"><a class="govuk-header__link" href="/appeals-service/personal-list">Assigned to me</a>'
			);
			expect(headerNavigationHtml).toContain('href="/appeals-service/all-cases">All cases</a>');
			expect(headerNavigationHtml).toContain('href="/auth/signout">Sign out</a>');
		});

		it('should render a lead status tag in the lead or child column, for appeals linked as a parent', async () => {
			nock('http://test/')
				.get('/appeals/personal-list?pageNumber=1&pageSize=30')
				.reply(200, assignedAppealsPage1);

			const response = await request.get(`${baseUrl}${'?pageNumber=1&pageSize=30'}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Your appeals</h1>');
			expect(element.innerHTML).toContain('View another case officer’s appeals</a>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/28535" aria-label="Appeal 6 0 2 8 5 3 5">6028535</a></strong></td><td class="govuk-table__cell"><strong class="govuk-tag govuk-tag--grey">Lead</strong>'
			);
		});

		it('should render a child status tag in the lead or child column, for appeals linked as a child', async () => {
			nock('http://test/')
				.get('/appeals/personal-list?pageNumber=1&pageSize=30')
				.reply(200, assignedAppealsPage1);

			const response = await request.get(`${baseUrl}${'?pageNumber=1&pageSize=30'}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Your appeals</h1>');
			expect(element.innerHTML).toContain('View another case officer’s appeals</a>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/28524" aria-label="Appeal 6 0 2 8 5 2 4">6028524</a></strong></td><td class="govuk-table__cell"><strong class="govuk-tag govuk-tag--grey">Child</strong>'
			);
		});

		it('should render an empty cell in the lead or child column, for appeals with no linked appeals (neither parent nor child)', async () => {
			nock('http://test/')
				.get('/appeals/personal-list?pageNumber=1&pageSize=30')
				.reply(200, assignedAppealsPage1);

			const response = await request.get(`${baseUrl}${'?pageNumber=1&pageSize=30'}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Your appeals</h1>');
			expect(element.innerHTML).toContain('View another case officer’s appeals</a>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/28526" aria-label="Appeal 6 0 2 8 5 2 6">6028526</a></strong></td><td class="govuk-table__cell"></td>'
			);
		});

		it('should render a message when there are no cases assigned to the user', async () => {
			nock('http://test/')
				.get('/appeals/personal-list?pageNumber=1&pageSize=5')
				.reply(200, { items: [], totalItems: 0, page: 1, totalPages: 1, pageSize: 5 });

			const response = await request.get(`${baseUrl}?pageNumber=1&pageSize=5`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('You are not assigned to any appeals</h1>');
			expect(element.innerHTML).toContain('View another case officer’s appeals</a>');

			expect(element.innerHTML).toContain('Search all cases</a>');
		});
	});

	describe('mapActionLinksForAppeal', () => {
		const appealId = 1;
		const lpaQuestionnaireId = 1;
		const testCases = [
			{
				name: 'Mark as transferred',
				requiredAction: 'addHorizonReference',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/change-appeal-type/add-horizon-reference?backUrl=%2Fappeals-service%2Fpersonal-list">Mark as transferred<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Set up site visit',
				requiredAction: 'arrangeSiteVisit',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/site-visit/schedule-visit?backUrl=%2Fappeals-service%2Fpersonal-list">Set up site visit<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Awaiting appellant update',
				requiredAction: 'awaitingAppellantUpdate',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/appellant-case?backUrl=%2Fappeals-service%2Fpersonal-list">Awaiting appellant update<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`,
					nonCaseOfficer: 'Awaiting appellant update'
				}
			},
			{
				name: 'Awaiting final comments',
				requiredAction: 'awaitingFinalComments',
				expectedHtml: {
					caseOfficer: 'Awaiting final comments'
				}
			},
			{
				name: 'Awaiting IP comments',
				requiredAction: 'awaitingIpComments',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/interested-party-comments?backUrl=%2Fappeals-service%2Fpersonal-list">Awaiting IP comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Awaiting LPA questionnaire',
				requiredAction: 'awaitingLpaQuestionnaire',
				expectedHtml: {
					caseOfficer: 'Awaiting LPA questionnaire'
				}
			},
			{
				name: 'Awaiting LPA statement',
				requiredAction: 'awaitingLpaStatement',
				expectedHtml: {
					caseOfficer: `<span>Awaiting LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></span>`
				}
			},
			{
				name: 'Update questionnaire',
				requiredAction: 'awaitingLpaUpdate',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}?backUrl=%2Fappeals-service%2Fpersonal-list">Update questionnaire<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`,
					nonCaseOfficer: 'Update questionnaire'
				}
			},
			{
				name: 'Issue decision',
				requiredAction: 'issueDecision',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/issue-decision/decision?backUrl=%2Fappeals-service%2Fpersonal-list">Issue decision<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'LPA questionnaire overdue',
				requiredAction: 'lpaQuestionnaireOverdue',
				expectedHtml: {
					caseOfficer: 'LPA questionnaire overdue'
				}
			},
			{
				name: 'Progress case',
				requiredAction: 'progressFromFinalComments',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/share?backUrl=%2Fappeals-service%2Fpersonal-list">Progress case</a>`
				}
			},
			{
				name: 'Progress to final comments',
				requiredAction: 'progressFromStatements',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/share?backUrl=%2Fappeals-service%2Fpersonal-list">Progress to final comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Review appellant case',
				requiredAction: 'reviewAppellantCase',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/appellant-case?backUrl=%2Fappeals-service%2Fpersonal-list">Review appellant case<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Review appellant final comments',
				requiredAction: 'reviewAppellantFinalComments',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/appellant?backUrl=%2Fappeals-service%2Fpersonal-list">Review appellant final comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Review IP comments',
				requiredAction: 'reviewIpComments',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/interested-party-comments?backUrl=%2Fappeals-service%2Fpersonal-list">Review IP comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Review LPA final comments',
				requiredAction: 'reviewLpaFinalComments',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/lpa?backUrl=%2Fappeals-service%2Fpersonal-list">Review LPA final comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Review LPA questionnaire',
				requiredAction: 'reviewLpaQuestionnaire',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}?backUrl=%2Fappeals-service%2Fpersonal-list">Review LPA questionnaire<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`,
					nonCaseOfficer: 'Review LPA questionnaire'
				}
			},
			{
				name: 'Review LPA statement',
				requiredAction: 'reviewLpaStatement',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-statement?backUrl=%2Fappeals-service%2Fpersonal-list">Review LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Share final comments',
				requiredAction: 'shareFinalComments',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/share?backUrl=%2Fappeals-service%2Fpersonal-list">Share final comments</a>`
				}
			},
			{
				name: 'Share IP comments and LPA statement',
				requiredAction: 'shareIpCommentsAndLpaStatement',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/share?backUrl=%2Fappeals-service%2Fpersonal-list">Share IP comments and LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Start case',
				requiredAction: 'startAppeal',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/start-case/add?backUrl=%2Fappeals-service%2Fpersonal-list">Start case<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`,
					nonCaseOfficer: 'Start case',
					childAppeal: ''
				}
			},
			{
				name: 'Update LPA statement',
				requiredAction: 'updateLpaStatement',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-statement?backUrl=%2Fappeals-service%2Fpersonal-list">Update LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Add number of residential units S78',
				requiredAction: 'addResidencesNetChangeS78',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/residential-units/new?backUrl=%2Fappeals-service%2Fpersonal-list">Add number of residential units<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Add number of residential units S20',
				requiredAction: 'addResidencesNetChangeS20',
				expectedHtml: {
					caseOfficer: `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/residential-units/new?backUrl=%2Fappeals-service%2Fpersonal-list">Add number of residential units<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				}
			},
			{
				name: 'Awaiting proof of evidence and witnesses',
				requiredAction: 'awaitingProofOfEvidenceAndWitnesses',
				expectedHtml: {
					caseOfficer: 'Awaiting proof of evidence and witnesses'
				}
			}
		];

		for (const testCase of testCases) {
			it(`should return the expected "${testCase.name}" action link HTML when getRequiredActionsForAppeal returns "${testCase.requiredAction}" and "isCaseOfficer" is true`, async () => {
				const result = mapActionLinksForAppeal(
					appealDataToGetRequiredActions[testCase.requiredAction],
					true,
					{ originalUrl: baseUrl }
				);

				expect(result).toBe(testCase.expectedHtml.caseOfficer);
			});

			if ('nonCaseOfficer' in testCase.expectedHtml) {
				it(`should return the expected "${testCase.name}" action link HTML when getRequiredActionsForAppeal returns "${testCase.requiredAction}" and "isCaseOfficer" is false`, async () => {
					const result = mapActionLinksForAppeal(
						appealDataToGetRequiredActions[testCase.requiredAction],
						false,
						{ originalUrl: baseUrl }
					);

					expect(result).toBe(testCase.expectedHtml.nonCaseOfficer);
				});
			}

			if ('childAppeal' in testCase.expectedHtml) {
				it(`should not return an action link HTML when getRequiredActionsForAppeal returns "${testCase.requiredAction}" and "isChildAppeal" is true`, async () => {
					const result = mapActionLinksForAppeal(
						{ ...appealDataToGetRequiredActions[testCase.requiredAction], isChildAppeal: true },
						true,
						{ originalUrl: baseUrl }
					);

					expect(result).toBe(testCase.expectedHtml.childAppeal);
				});
			}
		}

		it('should return an empty string if appealId is undefined', async () => {
			const result = mapActionLinksForAppeal(
				{
					...baseAppealDataToGetRequiredActions,
					appealId: undefined
				},
				true,
				{ originalUrl: baseUrl }
			);

			expect(result).toBe('');
		});

		it('should return an empty string if getRequiredActionsForAppeal returns "reviewLpaQuestionnaire" but lpaQuestionnaireId is null or undefined', async () => {
			const resultForNull = mapActionLinksForAppeal(
				{
					...baseAppealDataToGetRequiredActions,
					lpaQuestionnaireId: null
				},
				true,
				{ originalUrl: baseUrl }
			);

			expect(resultForNull).toBe('');

			const resultForUndefined = mapActionLinksForAppeal(
				{
					...baseAppealDataToGetRequiredActions,
					lpaQuestionnaireId: undefined
				},
				true,
				{ originalUrl: baseUrl }
			);

			expect(resultForUndefined).toBe('');
		});
	});
});
