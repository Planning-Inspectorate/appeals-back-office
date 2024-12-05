import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { appealsNationalList } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/all-cases';
const statuses = [
	'assign_case_officer',
	'ready_to_start',
	'lpa_questionnaire',
	'issue_determination',
	'complete'
];

describe('national-list', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /', () => {
		it('should render national list - no pagination', async () => {
			nock('http://test/').get('/appeals?pageNumber=1&pageSize=30').reply(200, appealsNationalList);

			const response = await request.get(baseUrl);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Search all cases</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Enter appeal reference or postcode (include spaces)</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain('name="searchTerm" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('Search</button>');
			expect(unprettifiedElement.innerHTML).toContain('Filters</span>');
			expect(unprettifiedElement.innerHTML).toContain('Filter by case status</label>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<select class="govuk-select" id="appeal-status-filter" name="appealStatusFilter"'
			);
			expect(unprettifiedElement.innerHTML).toContain('<option value="all"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="assign_case_officer"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="ready_to_start"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="lpa_questionnaire"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="issue_determination"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="complete"');
			expect(unprettifiedElement.innerHTML).toContain('Filter by inspector status</label>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<select class="govuk-select" id="inspector-status-filter" name="inspectorStatusFilter"'
			);
			expect(unprettifiedElement.innerHTML).toContain('<option value="all"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="assigned"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="unassigned"');
			expect(unprettifiedElement.innerHTML).toContain('Apply</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filter</a>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal reference</th>');
			expect(unprettifiedElement.innerHTML).toContain('Site address</th>');
			expect(unprettifiedElement.innerHTML).toContain('Local planning authority (LPA)</th>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal type</th>');
			expect(unprettifiedElement.innerHTML).toContain('Status</th>');
		});

		it('should render national list - search term', async () => {
			nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&searchTerm=BS7%208LQ')
				.reply(200, appealsNationalList);

			const response = await request.get(`${baseUrl}?&searchTerm=BS7%208LQ`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Search all cases</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('2 results for BS7 8LQ</h2>');
		});

		it('should render national list - search term - no result', async () => {
			nock('http://test/').get('/appeals?pageNumber=1&pageSize=30&searchTerm=NORESULT').reply(200, {
				itemCount: 0,
				items: [],
				statuses,
				page: 1,
				pageCount: 0,
				pageSize: 30
			});

			const response = await request.get(`${baseUrl}?&searchTerm=NORESULT`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Search all cases</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('No results found for NORESULT</h2>');
		});

		it('should render national list - 10 pages - all page indexes in one row', async () => {
			nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30')
				.reply(200, { ...appealsNationalList, pageCount: 10 });

			const response = await request.get(baseUrl);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Search all cases</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<nav class="govuk-pagination" role="navigation" aria-label="results">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'aria-label="Page 1" aria-current="page"> 1</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 2"> 2</a>');
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 3"> 3</a>');
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 4"> 4</a>');
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 5"> 5</a>');
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 6"> 6</a>');
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 7"> 7</a>');
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 8"> 8</a>');
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 9"> 9</a>');
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 10"> 10</a>');
		});

		it('should render national list - 15 pages - pagination with ellipsis logic', async () => {
			nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30')
				.reply(200, { ...appealsNationalList, pageCount: 15 });

			const response = await request.get(baseUrl);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Search all cases</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<nav class="govuk-pagination" role="navigation" aria-label="results">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'aria-label="Page 1" aria-current="page"> 1</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 2"> 2</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<li class="govuk-pagination__item govuk-pagination__item--ellipses">&ctdot;</li>'
			);
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 15"> 15</a>');
		});

		it('should render national list - search term - filter applied', async () => {
			nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&searchTerm=BS7%208LQ&status=lpa_questionnaire')
				.reply(200, {
					itemCount: 1,
					items: [appealsNationalList.items[0]],
					statuses,
					page: 1,
					pageCount: 0,
					pageSize: 30
				});

			const response = await request.get(
				`${baseUrl}?searchTerm=BS7%208LQ&appealStatusFilter=lpa_questionnaire`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Search all cases</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'1 result for BS7 8LQ (filters applied)</h2>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Filter by case status</label>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<select class="govuk-select" id="appeal-status-filter" name="appealStatusFilter"'
			);
			expect(unprettifiedElement.innerHTML).toContain('<option value="lpa_questionnaire" selected');
			expect(unprettifiedElement.innerHTML).toContain('Apply</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filter</a>');
		});

		it('should render national list - no search term - filter applied', async () => {
			nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&status=lpa_questionnaire')
				.reply(200, {
					itemCount: 1,
					items: [appealsNationalList.items[0]],
					statuses,
					page: 1,
					pageCount: 0,
					pageSize: 30
				});

			const response = await request.get(`${baseUrl}?appealStatusFilter=lpa_questionnaire`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Search all cases</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('1 result (filters applied)</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Filter by case status</label>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<select class="govuk-select" id="appeal-status-filter" name="appealStatusFilter"'
			);
			expect(unprettifiedElement.innerHTML).toContain('<option value="lpa_questionnaire" selected');
			expect(unprettifiedElement.innerHTML).toContain('Apply</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filter</a>');
		});

		it('should render the header with navigation containing links to the personal list, national list (with active modifier class), and sign out route', async () => {
			nock('http://test/').get('/appeals?pageNumber=1&pageSize=30').reply(200, appealsNationalList);

			const response = await request.get(baseUrl);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Search all cases</h1>');

			const headerNavigationHtml = parseHtml(response.text, {
				rootElement: '.pins-header-navigation',
				skipPrettyPrint: true
			}).innerHTML;

			expect(headerNavigationHtml).toContain(
				'href="/appeals-service/personal-list">Assigned to me</a>'
			);
			expect(headerNavigationHtml).toContain(
				'<li class="govuk-header__navigation-item govuk-header__navigation-item--active"><a class="govuk-header__link" href="/appeals-service/all-cases">All cases</a>'
			);
			expect(headerNavigationHtml).toContain('href="/auth/signout">Sign out</a>');
		});
	});
});
