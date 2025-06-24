import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

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

	it('should render "Appeal decision" with content', async () => {
		nock('http://test/')
			.get('/appeals/1/documents/e1e90a49-fab3-44b8-a21a-bb73af089f6b/versions')
			.reply(200, {
				latestDocumentVersion: {
					version: 2
				},
				allVersions: [
					{
						dateReceived: '2022-06-11T23:00:00.000Z'
					}
				]
			});

		const response = await request.get(`${baseUrl}`);
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Appeal decision</h1>');
		expect(element.innerHTML).toContain('Dismissed</dd>');
		expect(element.innerHTML).toContain('12 June 2022 (reissued on 25 December 2023)</dd>');
		expect(element.innerHTML).toContain('decision-letter.pdf</a>');
	});
});
