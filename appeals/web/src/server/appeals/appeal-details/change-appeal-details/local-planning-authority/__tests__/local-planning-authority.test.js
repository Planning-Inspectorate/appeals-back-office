import { parseHtml } from '@pins/platform';
import { createTestEnvironment } from '#testing/index.js';
import supertest from 'supertest';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();

const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

const lpaList = [
	{
		lpaCode: 'Q1111',
		name: 'System Test Borough Council 2',
		email: 'test@example.com'
	},
	{
		lpaCode: 'MAID',
		name: 'Maidstone Borough Council',
		email: 'test2@example.com'
	},
	{
		lpaCode: 'BARN',
		name: 'Barnsley Metropolitan Borough Council',
		email: 'test3@example.com'
	},
	{
		lpaCode: 'Q9999',
		name: 'System Test Borough Council',
		email: 'test4@example.com'
	}
];

const lpa = lpaList[1];

describe('change-appeal-details/local-planning-authority', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/').get('/appeals/local-planning-authorities').reply(200, lpaList);
		nock('http://test/').get('/appeals/1/lpa').reply(200, lpa);
	});
	afterEach(teardown);

	describe('GET change-appeal-details/local-planning-authority', () => {
		it('should render the local planning authority page', async () => {
			const response = await request.get(
				`${baseUrl}/1/change-appeal-details/local-planning-authority`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Local planning authority');
			expect(element.innerHTML).not.toContain(lpaList[0].name);
			expect(element.innerHTML).toContain(lpaList[1].name);
			expect(element.innerHTML).toContain(lpaList[2].name);
			expect(element.innerHTML).not.toContain(lpaList[3].name);
			expect(element.innerHTML).toContain(`value="${lpa.lpaCode}" checked`);
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});
});
