import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import {
	activeDirectoryUsersData,
	appealsNationalList,
	appealTypesData,
	caseTeams,
	procedureTypesData
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { jest } from '@jest/globals';

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

/**
 *
 * @type {{ lpaCode: string; name: string }[]}
 */
const lpas = [];

/**
 *
 * @type {{ azureAdUserId: string; id: number }[]}
 */
const inspectors = activeDirectoryUsersData.map(({ id }, index) => ({
	azureAdUserId: id,
	id: index
}));

/**
 *
 * @type {{ azureAdUserId: string; id: number }[]}
 */
const caseOfficers = activeDirectoryUsersData.map(({ id }, index) => ({
	azureAdUserId: id,
	id: index
}));

describe('national-list', () => {
	beforeEach(() => {
		installMockApi();

		nock('http://test/').get('/appeals/appeal-types').reply(200, appealTypesData);
		nock('http://test/').get('/appeals/case-teams').reply(200, caseTeams);
		nock('http://test/').get('/appeals/procedure-types').reply(200, procedureTypesData);

		// @ts-ignore
		usersService.getUserById = jest
			.fn()
			.mockImplementation((id) => activeDirectoryUsersData.find((user) => user.id === id));
	});
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
				'Enter the appeal reference, planning application reference or postcode (including spaces)</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain('name="searchTerm" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('Search</button>');
			expect(unprettifiedElement.innerHTML).toContain('Filters</span>');
			expect(unprettifiedElement.innerHTML).toContain('Case status</label>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<select class="govuk-select" id="appeal-status-filter" name="appealStatusFilter"'
			);
			expect(unprettifiedElement.innerHTML).toContain('<option value="all"');

			for (const status of appealsNationalList.statusesInNationalList) {
				expect(unprettifiedElement.innerHTML).toContain(`<option value="${status}"`);
			}

			expect(unprettifiedElement.innerHTML).toContain('Inspector status</label>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<select class="govuk-select" id="inspector-status-filter" name="inspectorStatusFilter"'
			);
			expect(unprettifiedElement.innerHTML).toContain('<option value="all"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="assigned"');
			expect(unprettifiedElement.innerHTML).toContain('<option value="unassigned"');
			expect(unprettifiedElement.innerHTML).toContain('Apply filters</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filters</a>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal reference</th>');
			expect(unprettifiedElement.innerHTML).toContain('Site address</th>');
			expect(unprettifiedElement.innerHTML).toContain('Local planning authority (LPA)</th>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal type</th>');
			expect(unprettifiedElement.innerHTML).toContain('Case team');
			expect(unprettifiedElement.innerHTML).toContain('Status</th>');
		});

		it('should render correct appeal type dropdown in filters', async () => {
			nock('http://test/').get('/appeals?pageNumber=1&pageSize=30').reply(200, appealsNationalList);

			const response = await request.get(baseUrl);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Filters</span>');
			expect(unprettifiedElement.innerHTML).toContain('Householder</option>');
			expect(unprettifiedElement.innerHTML).toContain('Planning appeal</option>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Planning listed building and conservation area appeal</option>'
			);
			expect(unprettifiedElement.innerHTML).toContain('CAS advert</option>');
			expect(unprettifiedElement.innerHTML).toContain('CAS planning</option>');
		});

		it('should render correct case teams dropdown in filters', async () => {
			nock('http://test/').get('/appeals?pageNumber=1&pageSize=30').reply(200, appealsNationalList);

			const response = await request.get(baseUrl);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('All</option>');
			expect(unprettifiedElement.innerHTML).toContain('temp</option>');
			expect(unprettifiedElement.innerHTML).toContain('temp2</option>');
			expect(unprettifiedElement.innerHTML).toContain('temp3</option>');
		});

		it('should render correct appeal procedure dropdown in filters', async () => {
			nock('http://test/').get('/appeals?pageNumber=1&pageSize=30').reply(200, appealsNationalList);

			const response = await request.get(baseUrl);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Hearing</option>');
			expect(unprettifiedElement.innerHTML).toContain('Inquiry</option>');
			expect(unprettifiedElement.innerHTML).toContain('Written</option>');
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
				lpas,
				inspectors,
				caseOfficers,
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
				'<nav class="govuk-pagination" aria-label="Pagination">'
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
				'<nav class="govuk-pagination" aria-label="Pagination">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'aria-label="Page 1" aria-current="page"> 1</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain('aria-label="Page 2"> 2</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<li class="govuk-pagination__item govuk-pagination__item--ellipses"> &ctdot;</li>'
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
					statusesInNationalList: appealsNationalList.statusesInNationalList,
					lpas,
					inspectors,
					caseOfficers,
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
			expect(unprettifiedElement.innerHTML).toContain('Case status</label>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<select class="govuk-select" id="appeal-status-filter" name="appealStatusFilter"'
			);
			expect(unprettifiedElement.innerHTML).toContain('<option value="lpa_questionnaire" selected');
			expect(unprettifiedElement.innerHTML).toContain('Apply filters</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filters</a>');
		});

		it('should render national list - no search term - filter applied', async () => {
			nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&status=lpa_questionnaire')
				.reply(200, {
					itemCount: 1,
					items: [appealsNationalList.items[0]],
					statuses,
					statusesInNationalList: appealsNationalList.statusesInNationalList,
					lpas,
					inspectors,
					caseOfficers,
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
			expect(unprettifiedElement.innerHTML).toContain('Case status</label>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<select class="govuk-select" id="appeal-status-filter" name="appealStatusFilter"'
			);
			expect(unprettifiedElement.innerHTML).toContain('<option value="lpa_questionnaire" selected');
			expect(unprettifiedElement.innerHTML).toContain('Apply filters</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filters</a>');
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

		it('should render national list - appeal type filter applied', async () => {
			nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&appealTypeId=75')
				.reply(200, {
					itemCount: 1,
					items: [appealsNationalList.items[0]],
					statuses,
					lpas,
					inspectors,
					caseOfficers,
					page: 1,
					pageCount: 0,
					pageSize: 30
				});

			const response = await request.get(`${baseUrl}?appealTypeFilter=75`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Search all cases</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('1 result (filters applied)</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal type</label>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<select class="govuk-select" id="appeal-type-filter" name="appealTypeFilter"'
			);
			expect(unprettifiedElement.innerHTML).toContain('<option value="75" selected');
			expect(unprettifiedElement.innerHTML).toContain('Apply filters</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filters</a>');
		});
		it('should render national list - case team filter applied', async () => {
			nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&assignedTeamId=1')
				.reply(200, {
					itemCount: 1,
					items: [appealsNationalList.items[0]],
					statuses,
					lpas,
					inspectors,
					caseOfficers,
					page: 1,
					pageCount: 0,
					pageSize: 30
				});

			const response = await request.get(`${baseUrl}?caseTeamFilter=1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Search all cases</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('1 result (filters applied)</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Case team</label>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<select class="govuk-select" id="case-team-filter" name="caseTeamFilter" data-cy="filter-by-case-team">'
			);
			expect(unprettifiedElement.innerHTML).toContain('<option value="1" selected');
			expect(unprettifiedElement.innerHTML).toContain('Apply filters</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filters</a>');
		});

		it('should render national list - appeal procedure type filter applied', async () => {
			nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&procedureTypeId=1')
				.reply(200, {
					itemCount: 1,
					items: [appealsNationalList.items[0]],
					statuses,
					lpas,
					inspectors,
					caseOfficers,
					page: 1,
					pageCount: 0,
					pageSize: 30
				});

			const response = await request.get(`${baseUrl}?appealProcedureFilter=1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Search all cases</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('1 result (filters applied)</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal procedure</label>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<select class="govuk-select" id="appeal-procedure-filter" name="appealProcedureFilter"'
			);
			expect(unprettifiedElement.innerHTML).toContain('<option value="1" selected');
			expect(unprettifiedElement.innerHTML).toContain('Apply filters</button>');
			expect(unprettifiedElement.innerHTML).toContain('Clear filters</a>');
		});
	});
});
