import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import {
	assignedAppealsPage1,
	assignedAppealsPage2,
	assignedAppealsPage3
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { mapAppealStatusToActionRequiredHtml } from '../personal-list.mapper.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/personal-list';

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
	});
});

describe('mapAppealStatusToActionRequiredHtml', () => {
	const appealId = 123;
	const lpaQuestionnaireId = 456;

	it('should return "Review appellant case" link for validation status with unvalidated appellant case', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'validation',
			false,
			lpaQuestionnaireId,
			'',
			'',
			'',
			'',
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/appellant-case">Review appellant case</a>`
		);
	});

	it('should return "Awaiting appellant update" link for validation status with incomplete appellant case', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'validation',
			false,
			lpaQuestionnaireId,
			'Incomplete',
			'',
			'',
			'',
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/appellant-case">Awaiting appellant update</a>`
		);
	});

	it('should return "Awaiting appellant update" text for validation status with incomplete appellant case and isCaseOfficer false', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'validation',
			false,
			lpaQuestionnaireId,
			'Incomplete',
			'',
			'',
			'',
			false
		);
		expect(result).toEqual('Awaiting appellant update');
	});

	it('should return "Start case" link for ready_to_start status', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'ready_to_start',
			false,
			lpaQuestionnaireId,
			'',
			'',
			'',
			'',
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/start-case/add">Start case</a>`
		);
	});

	it('should return "Start case" text for ready_to_start status and isCaseOfficer false', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'ready_to_start',
			false,
			lpaQuestionnaireId,
			'',
			'',
			'',
			'',
			false
		);
		expect(result).toEqual('Start case');
	});

	it('should return "Awaiting LPA questionnaire" for lpa_questionnaire status with no LPA questionnaire ID', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'lpa_questionnaire',
			false,
			null,
			'',
			'',
			'',
			'',
			true
		);
		expect(result).toEqual('Awaiting LPA questionnaire');
	});

	it('should return "Awaiting LPA update" link for lpa_questionnaire status with incomplete LPA questionnaire', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'lpa_questionnaire',
			false,
			lpaQuestionnaireId,
			'',
			'Incomplete',
			'',
			'',
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}">Awaiting LPA update</a>`
		);
	});

	it('should return "Awaiting LPA update" text for lpa_questionnaire status with incomplete LPA questionnaire and isCaseOfficer false', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'lpa_questionnaire',
			false,
			lpaQuestionnaireId,
			'',
			'Incomplete',
			'',
			'',
			false
		);
		expect(result).toEqual('Awaiting LPA update');
	});

	it('should return "Review LPA questionnaire" for lpa_questionnaire status with LPA questionnaire', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'lpa_questionnaire',
			false,
			lpaQuestionnaireId,
			'',
			'',
			'',
			'',
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}">Review LPA questionnaire</a>`
		);
	});

	it('should return "Review LPA questionnaire" for lpa_questionnaire status with LPA questionnaire and isCaseOfficer false', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'lpa_questionnaire',
			false,
			lpaQuestionnaireId,
			'',
			'',
			'',
			'',
			false
		);
		expect(result).toEqual('Review LPA questionnaire');
	});

	it('should return "LPA questionnaire overdue" for lpa_questionnaire status with LPA questionnaire overdue', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'lpa_questionnaire',
			false,
			null,
			'',
			'',
			'',
			'2024-01-01',
			true
		);
		expect(result).toEqual('LPA questionnaire overdue');
	});

	it('should return "Issue decision" link for issue_determination status', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'issue_determination',
			false,
			null,
			'',
			'',
			'',
			'',
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/issue-decision/decision">Issue decision</a>`
		);
	});

	it('should return "Update Horizon reference" link for awaiting_transfer status', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'awaiting_transfer',
			false,
			null,
			'',
			'',
			'',
			'',
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/change-appeal-type/add-horizon-reference">Update Horizon reference</a>`
		);
	});

	it('should return "View case" link for any other status', () => {
		const result = mapAppealStatusToActionRequiredHtml(
			appealId,
			'some_other_status',
			false,
			null,
			'',
			'',
			'',
			'',
			true
		);
		expect(result).toEqual(
			`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}">View case</a>`
		);
	});
});
