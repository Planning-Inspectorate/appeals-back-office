import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details/1/appeal-decision';

describe('Appeal decision', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	it('should render "Appeal decision" Page', async () => {
		const response = await request.get(`${baseUrl}`);
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Appeal decision</h1>');
		expect(element.innerHTML).toContain('Decision</dt>');
		expect(element.innerHTML).toContain('Decision issued date</dt>');
		expect(element.innerHTML).toContain('Decision letter</dt>');
	});
});
