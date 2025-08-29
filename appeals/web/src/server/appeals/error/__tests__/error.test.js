import supertest from 'supertest';

import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';

const baseUrl = '/appeals-service/error';
const { app } = createTestEnvironment();
const request = supertest(app);

describe('error page', () => {
	it('should render the error page if the error type is "fileTypesDoNotMatch"', async () => {
		const response = await request.get(
			`${baseUrl}?errorType=fileTypesDoNotMatch&backUrl=/appeals-service/appeal-details/1`
		);

		expect(response.statusCode).toBe(500);
		const responseHTML = parseHtml(response.text).innerHTML;
		expect(responseHTML).toContain('There is a problem</h1>');
		expect(responseHTML).toContain('We could not upload one of the files.</p>');
	});

	it('should render a 500 error page if the error type is not passed or found', async () => {
		const response = await request.get(
			`${baseUrl}?errorType=wrongErrorType&backUrl=/appeals-service/appeal-details/1`
		);

		expect(response.statusCode).toBe(500);
		const element = parseHtml(response.text);
		expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
	});
});
