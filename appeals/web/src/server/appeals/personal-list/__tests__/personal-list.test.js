// @ts-nocheck
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import {
	assignedAppealsPage1,
	assignedAppealsPage2,
	assignedAppealsPage3,
	assignedAppealsInFinalCommentsStatus
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { mapAppealStatusToActionRequiredHtml } from '../personal-list.mapper.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/personal-list';

function getDateDaysInFutureISO(days) {
	const date = new Date(new Date().setDate(new Date().getDate() + days));
	return date.toISOString();
}

describe('personal-list', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /', () => {
		it('should render the first page of the personal list with the expected content and pagination', async () => {
			nock('http://test/')
				.get('/appeals/my-appeals?pageNumber=1&pageSize=5')
				.reply(200, assignedAppealsPage1);

			const response = await request.get(`${baseUrl}${'?pageNumber=1&pageSize=5'}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Cases assigned to you</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Filters</span>');
			expect(unprettifiedElement.innerHTML).toContain('Show cases with status</label>');
			expect(unprettifiedElement.innerHTML).toContain('<option value="all"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="ready_to_start"');
			expect(unprettifiedElement.innerHTML).toContain('option value="lpa_questionnaire"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="issue_determination"');
			expect(unprettifiedElement.innerHTML).toContain('Apply</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filter</a>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal reference</th>');
			expect(unprettifiedElement.innerHTML).toContain('Lead or child</th>');
			expect(unprettifiedElement.innerHTML).toContain('Action required</th>');
			expect(unprettifiedElement.innerHTML).toContain('Due by</th>');
			expect(unprettifiedElement.innerHTML).toContain('Case status</th>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<nav class="govuk-pagination" role="navigation" aria-label="results"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'aria-label="Page 1" aria-current="page"> 1</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 2"> 2</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<span class="govuk-pagination__link-title">Next</span>'
			);
		});

		it('should render the second page of the personal list with the expected content and pagination', async () => {
			nock('http://test/')
				.get('/appeals/my-appeals?pageNumber=2&pageSize=5')
				.reply(200, assignedAppealsPage2);

			const response = await request.get(`${baseUrl}${'?pageNumber=2&pageSize=5'}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Cases assigned to you</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Filters</span>');
			expect(unprettifiedElement.innerHTML).toContain('Show cases with status</label>');
			expect(unprettifiedElement.innerHTML).toContain('<option value="all"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="ready_to_start"');
			expect(unprettifiedElement.innerHTML).toContain('option value="lpa_questionnaire"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="issue_determination"');
			expect(unprettifiedElement.innerHTML).toContain('Apply</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filter</a>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal reference</th>');
			expect(unprettifiedElement.innerHTML).toContain('Lead or child</th>');
			expect(unprettifiedElement.innerHTML).toContain('Action required</th>');
			expect(unprettifiedElement.innerHTML).toContain('Due by</th>');
			expect(unprettifiedElement.innerHTML).toContain('Case status</th>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<nav class="govuk-pagination" role="navigation" aria-label="results"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<span class="govuk-pagination__link-title">Previous</span>'
			);
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 1"> 1</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'aria-label="Page 2" aria-current="page"> 2</a>'
			);
		});

		it('should render the second page of the personal list with applied filter, the expected content and pagination', async () => {
			nock('http://test/')
				.get('/appeals/my-appeals?pageNumber=2&pageSize=1&status=lpa_questionnaire')
				.reply(200, assignedAppealsPage3);

			const response = await request.get(
				`${baseUrl}${'?pageNumber=2&pageSize=1&appealStatusFilter=lpa_questionnaire'}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Cases assigned to you</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Filters</span>');
			expect(unprettifiedElement.innerHTML).toContain('Show cases with status</label>');
			expect(unprettifiedElement.innerHTML).toContain('<option value="all"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="ready_to_start"');
			expect(unprettifiedElement.innerHTML).toContain('option value="lpa_questionnaire" selected');
			expect(unprettifiedElement.innerHTML).toContain('<option value="issue_determination"');
			expect(unprettifiedElement.innerHTML).toContain('Apply</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filter</a>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal reference</th>');
			expect(unprettifiedElement.innerHTML).toContain('Lead or child</th>');
			expect(unprettifiedElement.innerHTML).toContain('Action required</th>');
			expect(unprettifiedElement.innerHTML).toContain('Due by</th>');
			expect(unprettifiedElement.innerHTML).toContain('Case status</th>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<nav class="govuk-pagination" role="navigation" aria-label="results"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<span class="govuk-pagination__link-title">Previous</span>'
			);
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 1"> 1</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'aria-label="Page 2" aria-current="page"> 2</a>'
			);
		});

		it('should render the header with navigation containing links to the personal list (with active modifier class), national list, and sign out route', async () => {
			nock('http://test/')
				.get('/appeals/my-appeals?pageNumber=1&pageSize=30')
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
				.get('/appeals/my-appeals?pageNumber=1&pageSize=30')
				.reply(200, assignedAppealsPage1);

			const response = await request.get(`${baseUrl}${'?pageNumber=1&pageSize=30'}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Cases assigned to you</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/189" aria-label="Appeal 4 5 8 6 7 3">458673</a></strong></td><td class="govuk-table__cell"><strong class="govuk-tag govuk-tag--grey single-line">Lead</strong>'
			);
		});

		it('should render a child status tag in the lead or child column, for appeals linked as a child', async () => {
			nock('http://test/')
				.get('/appeals/my-appeals?pageNumber=1&pageSize=30')
				.reply(200, assignedAppealsPage1);

			const response = await request.get(`${baseUrl}${'?pageNumber=1&pageSize=30'}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Cases assigned to you</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/161" aria-label="Appeal 6 8 5 0 2 0">685020</a></strong></td><td class="govuk-table__cell"><strong class="govuk-tag govuk-tag--grey single-line">Child</strong>'
			);
		});

		it('should render an empty cell in the lead or child column, for appeals with no linked appeals (neither parent nor child)', async () => {
			nock('http://test/')
				.get('/appeals/my-appeals?pageNumber=1&pageSize=30')
				.reply(200, assignedAppealsPage1);

			const response = await request.get(`${baseUrl}${'?pageNumber=1&pageSize=30'}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Cases assigned to you</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/162" aria-label="Appeal 4 2 4 9 4 2">424942</a></strong></td><td class="govuk-table__cell"></td>'
			);
		});

		it('should render a message when there are no cases assigned to the user', async () => {
			nock('http://test/')
				.get('/appeals/my-appeals?pageNumber=1&pageSize=5')
				.reply(200, { items: [], totalItems: 0, page: 1, totalPages: 1, pageSize: 5 });

			const response = await request.get(`${baseUrl}?pageNumber=1&pageSize=5`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('There are currently no cases assigned to you.</h1>');
			expect(element.innerHTML).toContain('Search all cases</a>');
		});

		describe('final comments', () => {
			it('should display "Awaiting final comments" text in the action required column for cases in final comments status with no received final comments', async () => {
				nock('http://test/')
					.get('/appeals/my-appeals?status=final_comments&pageNumber=1&pageSize=30')
					.reply(200, assignedAppealsInFinalCommentsStatus);

				const response = await request.get(
					`${baseUrl}${'?appealStatusFilter=final_comments&pageNumber=1&pageSize=30'}`
				);

				const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHtml).toContain('action-required">Awaiting final comments</td>');
			});

			it('should display a "Review appellant final comments" link in the action required column for cases with appellant final comments awaiting review', async () => {
				nock('http://test/')
					.get('/appeals/my-appeals?status=final_comments&pageNumber=1&pageSize=30')
					.reply(200, {
						...assignedAppealsInFinalCommentsStatus,
						items: [
							{
								...assignedAppealsInFinalCommentsStatus.items[0],
								documentationSummary: {
									...assignedAppealsInFinalCommentsStatus.items[0].documentationSummary,
									appellantFinalComments: {
										receivedAt: '2025-01-29T10:19:51.401Z',
										representationStatus: 'awaiting_review',
										status: 'received'
									}
								}
							}
						]
					});

				const response = await request.get(
					`${baseUrl}${'?appealStatusFilter=final_comments&pageNumber=1&pageSize=30'}`
				);

				const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHtml).toContain(
					'action-required"><a class="govuk-link" href="/appeals-service/appeal-details/24281/final-comments/appellant">Review appellant final comments<span class="govuk-visually-hidden"> for appeal 24281</span></a></td>'
				);
			});

			it('should display a "Review LPA final comments" link in the action required column for cases with LPA final comments awaiting review', async () => {
				nock('http://test/')
					.get('/appeals/my-appeals?status=final_comments&pageNumber=1&pageSize=30')
					.reply(200, {
						...assignedAppealsInFinalCommentsStatus,
						items: [
							{
								...assignedAppealsInFinalCommentsStatus.items[0],
								documentationSummary: {
									...assignedAppealsInFinalCommentsStatus.items[0].documentationSummary,
									lpaFinalComments: {
										receivedAt: '2025-01-29T10:19:51.401Z',
										representationStatus: 'awaiting_review',
										status: 'received'
									}
								}
							}
						]
					});

				const response = await request.get(
					`${baseUrl}${'?appealStatusFilter=final_comments&pageNumber=1&pageSize=30'}`
				);

				const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHtml).toContain(
					'action-required"><a class="govuk-link" href="/appeals-service/appeal-details/24281/final-comments/lpa">Review LPA final comments<span class="govuk-visually-hidden"> for appeal 24281</span></a></td>'
				);
			});

			it('should display both "Review appellant final comments" and "Review LPA final comments" links in the action required column for cases with appellant and LPA final comments awaiting review', async () => {
				nock('http://test/')
					.get('/appeals/my-appeals?status=final_comments&pageNumber=1&pageSize=30')
					.reply(200, {
						...assignedAppealsInFinalCommentsStatus,
						items: [
							{
								...assignedAppealsInFinalCommentsStatus.items[0],
								documentationSummary: {
									...assignedAppealsInFinalCommentsStatus.items[0].documentationSummary,
									appellantFinalComments: {
										receivedAt: '2025-01-29T10:19:51.401Z',
										representationStatus: 'awaiting_review',
										status: 'received'
									},
									lpaFinalComments: {
										receivedAt: '2025-01-29T10:19:51.401Z',
										representationStatus: 'awaiting_review',
										status: 'received'
									}
								}
							}
						]
					});

				const response = await request.get(
					`${baseUrl}${'?appealStatusFilter=final_comments&pageNumber=1&pageSize=30'}`
				);

				const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHtml).toContain(
					'action-required"><a class="govuk-link" href="/appeals-service/appeal-details/24281/final-comments/appellant">Review appellant final comments<span class="govuk-visually-hidden"> for appeal 24281</span></a><br><a class="govuk-link" href="/appeals-service/appeal-details/24281/final-comments/lpa">Review LPA final comments<span class="govuk-visually-hidden"> for appeal 24281</span></a></td>'
				);
			});
		});
		describe('"Progress case" actions', () => {
			const testCases = [
				{
					conditionName: 'both Appellant and LPA Final Comments are valid',
					appealData: {
						...assignedAppealsInFinalCommentsStatus,
						items: [
							{
								...assignedAppealsInFinalCommentsStatus.items[0],
								appealTimetable: {
									...assignedAppealsInFinalCommentsStatus.items[0].appealTimetable,
									finalCommentsDueDate: '2024-09-14T10:26:42.558Z'
								},
								documentationSummary: {
									...assignedAppealsInFinalCommentsStatus.items[0].documentationSummary,
									lpaFinalComments: {
										status: 'received',
										receivedAt: '2024-02-14T10:26:42.558Z',
										representationStatus: 'valid',
										counts: { awaiting_review: 0, valid: 1, published: 0 }
									},
									appellantFinalComments: {
										status: 'received',
										receivedAt: '2024-02-14T10:26:42.558Z',
										representationStatus: 'valid',
										counts: { awaiting_review: 0, valid: 1, published: 0 }
									}
								}
							}
						]
					},
					linkText: 'Share final comments'
				},
				{
					conditionName: 'Appellant Final Comments are valid (but not LPA)',
					appealData: {
						...assignedAppealsInFinalCommentsStatus,
						items: [
							{
								...assignedAppealsInFinalCommentsStatus.items[0],
								appealTimetable: {
									...assignedAppealsInFinalCommentsStatus.items[0].appealTimetable,
									finalCommentsDueDate: '2024-09-14T10:26:42.558Z'
								},
								documentationSummary: {
									...assignedAppealsInFinalCommentsStatus.items[0].documentationSummary,
									lpaFinalComments: {
										status: 'received',
										receivedAt: '2024-02-14T10:26:42.558Z',
										representationStatus: null,
										counts: { awaiting_review: 0, valid: 0, published: 0 }
									},
									appellantFinalComments: {
										status: 'received',
										receivedAt: '2024-02-14T10:26:42.558Z',
										representationStatus: 'valid',
										counts: { awaiting_review: 0, valid: 1, published: 0 }
									}
								}
							}
						]
					},
					linkText: 'Share final comments'
				},
				{
					conditionName: 'LPA Final Comments are valid (but not Appellant)',
					appealData: {
						...assignedAppealsInFinalCommentsStatus,
						items: [
							{
								...assignedAppealsInFinalCommentsStatus.items[0],
								appealTimetable: {
									...assignedAppealsInFinalCommentsStatus.items[0].appealTimetable,
									finalCommentsDueDate: '2024-09-14T10:26:42.558Z'
								},
								documentationSummary: {
									...assignedAppealsInFinalCommentsStatus.items[0].documentationSummary,
									lpaFinalComments: {
										status: 'received',
										receivedAt: '2024-02-14T10:26:42.558Z',
										representationStatus: 'valid',
										counts: { awaiting_review: 0, valid: 1, published: 0 }
									},
									appellantFinalComments: {
										status: 'received',
										receivedAt: '2024-02-14T10:26:42.558Z',
										representationStatus: null,
										counts: { awaiting_review: 0, valid: 0, published: 0 }
									}
								}
							}
						]
					},
					linkText: 'Share final comments'
				},
				{
					conditionName: 'both Appellant and LPA Final Comments are absent or invalid',
					appealData: {
						...assignedAppealsInFinalCommentsStatus,
						items: [
							{
								...assignedAppealsInFinalCommentsStatus.items[0],
								appealTimetable: {
									...assignedAppealsInFinalCommentsStatus.items[0].appealTimetable,
									finalCommentsDueDate: '2024-09-14T10:26:42.558Z'
								},
								documentationSummary: {
									...assignedAppealsInFinalCommentsStatus.items[0].documentationSummary,
									lpaFinalComments: {
										status: 'received',
										receivedAt: '2024-02-14T10:26:42.558Z',
										representationStatus: null,
										counts: { awaiting_review: 0, valid: 0, published: 0 }
									},
									appellantFinalComments: {
										status: 'received',
										receivedAt: '2024-02-14T10:26:42.558Z',
										representationStatus: null,
										counts: { awaiting_review: 0, valid: 0, published: 0 }
									}
								}
							}
						]
					},
					linkText: 'Progress case'
				}
			];

			beforeEach(() => {
				nock.cleanAll();
			});

			for (const testCase of testCases) {
				it(`should render a "${testCase.linkText}" link to progress case from final comments when Final Comments Due Date has passed and ${testCase.conditionName}.`, async () => {
					nock('http://test/')
						.get('/appeals/my-appeals?status=final_comments&pageNumber=1&pageSize=30')
						.reply(200, testCase.appealData);

					const response = await request.get(
						`${baseUrl}${'?appealStatusFilter=final_comments&pageNumber=1&pageSize=30'}`
					);

					const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

					expect(unprettifiedHtml).toContain(
						`action-required"><a class="govuk-link" href="/appeals-service/appeal-details/24281/share">${testCase.linkText}</a></td>`
					);
				});
			}
		});
	});
});

describe('mapAppealStatusToActionRequiredHtml', () => {
	const appealId = 123;
	const lpaQuestionnaireId = 456;
	const appeal = {
		appealId,
		lpaQuestionnaireId,
		appealStatus: 'validation',
		appealType: 'appeal',
		appealSubtype: 'protection'
	};

	it('should return "Review appellant case" link for validation status with unvalidated appellant case', () => {
		const result = mapAppealStatusToActionRequiredHtml(appeal, true);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/appellant-case">Review appellant case<span class="govuk-visually-hidden"> for appeal 123</span></a>`
		);
	});

	it('should return "Awaiting appellant update" link for validation status with incomplete appellant case', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				documentationSummary: { appellantCase: { status: 'Incomplete' } }
			},
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/appellant-case">Awaiting appellant update<span class="govuk-visually-hidden"> for appeal 123</span></a>`
		);
	});

	it('should return "Awaiting appellant update" text for validation status with incomplete appellant case and isCaseOfficer false', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				documentationSummary: { appellantCase: { status: 'Incomplete' } }
			},
			false
		);
		expect(result).toEqual('Awaiting appellant update');
	});

	it('should return "Start case" link for ready_to_start status', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				appealStatus: 'ready_to_start',
				documentationSummary: { appellantCase: { status: 'Incomplete' } }
			},
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/start-case/add">Start case<span class="govuk-visually-hidden"> for appeal 123</span></a>`
		);
	});

	it('should return "Start case" text for ready_to_start status and isCaseOfficer false', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				appealStatus: 'ready_to_start',
				documentationSummary: { appellantCase: { status: 'Incomplete' } }
			},
			false
		);
		expect(result).toEqual('Start case');
	});

	it('should return "Awaiting LPA questionnaire" for lpa_questionnaire status with no LPA questionnaire ID', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				appealStatus: 'lpa_questionnaire',
				lpaQuestionnaireId: null,
				documentationSummary: { appellantCase: { status: 'Incomplete' } }
			},
			true
		);
		expect(result).toEqual('Awaiting LPA questionnaire');
	});

	it('should return "Awaiting LPA update" link for lpa_questionnaire status with incomplete LPA questionnaire', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				appealStatus: 'lpa_questionnaire',
				documentationSummary: { lpaQuestionnaire: { status: 'Incomplete' } }
			},
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}">Awaiting LPA update<span class="govuk-visually-hidden"> for appeal 123</span></a>`
		);
	});

	it('should return "Awaiting LPA update" text for lpa_questionnaire status with incomplete LPA questionnaire and isCaseOfficer false', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				appealStatus: 'lpa_questionnaire',
				documentationSummary: { lpaQuestionnaire: { status: 'Incomplete' } }
			},
			false
		);
		expect(result).toEqual('Awaiting LPA update');
	});

	it('should return "Review LPA questionnaire" for lpa_questionnaire status with LPA questionnaire', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				appealStatus: 'lpa_questionnaire',
				documentationSummary: { appellantCase: { status: 'Incomplete' } }
			},
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}">Review LPA questionnaire<span class="govuk-visually-hidden"> for appeal 123</span></a>`
		);
	});

	it('should return "Review LPA questionnaire" for lpa_questionnaire status with LPA questionnaire and isCaseOfficer false', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				appealStatus: 'lpa_questionnaire',
				documentationSummary: { appellantCase: { status: 'Incomplete' } }
			},
			false
		);
		expect(result).toEqual('Review LPA questionnaire');
	});

	it('should return "LPA questionnaire overdue" for lpa_questionnaire status with LPA questionnaire overdue', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				appealStatus: 'lpa_questionnaire',
				lpaQuestionnaireId: null,
				dueDate: '2024-01-01',
				documentationSummary: { appellantCase: { status: 'Incomplete' } }
			},
			true
		);
		expect(result).toEqual('LPA questionnaire overdue');
	});

	it('should return "Set up site visit" link for event status', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				appealStatus: 'event',
				lpaQuestionnaireId: null,
				documentationSummary: { appellantCase: { status: 'Incomplete' } }
			},
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/site-visit/schedule-visit">Set up site visit<span class="govuk-visually-hidden"> for appeal 123</span></a>`
		);
	});

	it('should return "Issue decision" link for issue_determination status', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				appealStatus: 'issue_determination',
				lpaQuestionnaireId: null
			},
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/issue-decision/decision">Issue decision<span class="govuk-visually-hidden"> for appeal 123</span></a>`
		);
	});

	it('should return "Update Horizon reference" link for awaiting_transfer status', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				appealStatus: 'awaiting_transfer',
				lpaQuestionnaireId: null
			},
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/change-appeal-type/add-horizon-reference">Update Horizon reference<span class="govuk-visually-hidden"> for appeal 123</span></a>`
		);
	});

	it('should be blank for any other status', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			{
				...appeal,
				appealStatus: 'some_other_status',
				lpaQuestionnaireId: null
			},
			true
		);
		expect(result).toEqual('');
	});

	describe('appeal status is statements', () => {
		let appealInStatementsStatus;

		beforeEach(() => {
			appealInStatementsStatus = {
				...appeal,
				appealStatus: 'statements',
				lpaQuestionnaireId: null,
				appealType: 'appeal',
				appealSubtype: 'protection',
				documentationSummary: {
					ipComments: {},
					lpaStatement: {}
				},
				appealTimetable: {}
			};
		});

		it('should return "Update LPA statement" link', () => {
			appealInStatementsStatus.documentationSummary.lpaStatement.representationStatus =
				'incomplete';
			appealInStatementsStatus.appealTimetable.ipCommentsDueDate = getDateDaysInFutureISO(-1);
			const result = mapAppealStatusToActionRequiredHtml(appealInStatementsStatus);
			expect(result).toContain('Update LPA statement<span');
			expect(result).toContain(`href="/appeals-service/appeal-details/${appealId}/lpa-statement"`);
		});

		it('should return "Review LPA statement" link', () => {
			appealInStatementsStatus.documentationSummary.lpaStatement.status = 'received';
			appealInStatementsStatus.appealTimetable.ipCommentsDueDate = getDateDaysInFutureISO(-1);
			const result = mapAppealStatusToActionRequiredHtml(appealInStatementsStatus);
			expect(result).toContain('Review LPA statement<span');
			expect(result).toContain(`href="/appeals-service/appeal-details/${appealId}/lpa-statement"`);
		});

		it('should return "Review IP comments" link', () => {
			appealInStatementsStatus.documentationSummary.lpaStatement.status = 'received';
			appealInStatementsStatus.appealTimetable.ipCommentsDueDate = getDateDaysInFutureISO(-1);
			const result = mapAppealStatusToActionRequiredHtml(appealInStatementsStatus);
			expect(result).toContain('Review IP comments<span');
			expect(result).toContain(
				`href="/appeals-service/appeal-details/${appealId}/interested-party-comments"`
			);
		});

		it('should return both "Awaiting LPA statement" text and "Progress to final comments" link', () => {
			appealInStatementsStatus.documentationSummary.lpaStatement.status = 'not_received';
			appealInStatementsStatus.appealTimetable.ipCommentsDueDate = getDateDaysInFutureISO(-1);
			appealInStatementsStatus.appealTimetable.lpaStatementDueDate = getDateDaysInFutureISO(-1);

			const result = mapAppealStatusToActionRequiredHtml(appealInStatementsStatus);
			const actions = result.split('<br>');

			expect(actions[0]).toContain('Awaiting LPA statement<span');
			expect(actions[1]).toContain('Progress to final comments<span');
			expect(actions[1]).toContain(`href="/appeals-service/appeal-details/${appealId}/share"`);
		});

		it('should return both "Awaiting LPA statement" text and "Share IP comments and LPA statement" link', () => {
			appealInStatementsStatus.documentationSummary.lpaStatement.status = 'not_received';
			appealInStatementsStatus.documentationSummary.lpaStatement.representationStatus = 'valid';
			appealInStatementsStatus.appealTimetable.ipCommentsDueDate = getDateDaysInFutureISO(-1);
			appealInStatementsStatus.appealTimetable.lpaStatementDueDate = getDateDaysInFutureISO(-1);

			const result = mapAppealStatusToActionRequiredHtml(appealInStatementsStatus);
			const actions = result.split('<br>');

			expect(actions[0]).toContain('Awaiting LPA statement<span');
			expect(actions[1]).toContain('Share IP comments and LPA statement<span');
			expect(actions[1]).toContain(`href="/appeals-service/appeal-details/${appealId}/share"`);
		});

		it('should return "Awaiting IP comments" link', () => {
			const result = mapAppealStatusToActionRequiredHtml(appealInStatementsStatus);
			expect(result).toContain('Awaiting IP comments<span');
			expect(result).toContain(
				`href="/appeals-service/appeal-details/${appealId}/interested-party-comments"`
			);
		});
	});
});
