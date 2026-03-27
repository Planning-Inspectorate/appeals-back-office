import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);

describe('Accessibility Statement', () => {
	beforeAll(teardown);

	beforeEach(() => {
		installMockApi();
	});

	afterEach(teardown);

	describe('GET /accessibility-statement', () => {
		it('should render the accessibility statement page successfully', async () => {
			const response = await request.get('/accessibility-statement');

			const element = parseHtml(response.text);

			expect(response.status).toEqual(200);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Accessibility statement');
			expect(element.innerHTML).toContain('This service is partially compliant');
			expect(element.innerHTML).toContain('Manage appeals');
		});
	});
});
