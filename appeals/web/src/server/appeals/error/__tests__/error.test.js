import supertest from 'supertest';

import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';

const baseUrl = '/appeals-service/error';
const { app, installMockApi, teardown } = createTestEnvironment();
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

// Can create other error page tests as well

describe('404 Not Found', () => {
	/** @type {import('supertest').Response} */
	let response;
	/** @type {any} */
	let element;

	beforeAll(async () => {
		response = await request.get('/url-that-does-not-exist');
		element = parseHtml(response.text);
	});

	it('should return a 404 status code', () => {
		expect(response.statusCode).toBe(404);
	});

	it('should render the custom 404 page content', () => {
		const heading = element.querySelector('h1');
		expect(heading).not.toBeNull();
		expect(heading.textContent).toContain('Page not found');

		expect(element.textContent).toContain('If you typed the web address, check it is correct.');
		expect(element.textContent).toContain(
			'If you pasted the web address, check you copied the entire address.'
		);
		expect(element.textContent).toContain(
			'If the web address is correct or you selected a link or button, report an IT problem.'
		);
	});

	it('should contain link that redirects to LittleFish support', () => {
		const linkText = 'report an IT problem.';

		const link = Array.from(element.querySelectorAll('a')).find(
			(a) => a.textContent.trim() === linkText
		);

		expect(link).not.toBeNull();

		expect(link.getAttribute('href')).toBe(
			'https://intranet.planninginspectorate.gov.uk/task/report-it-problem/'
		);
	});
});

describe('500 Internal Server Error', () => {
	/** @type {import('supertest').Response} */
	let response;
	/** @type {any} */
	let element;

	beforeAll(async () => {
		installMockApi();
		nock('http://test/').get('/appeals/1').reply(500, 'Internal API Error');

		response = await request.get('/appeals-service/appeal-details/1');
		element = parseHtml(response.text);

		teardown();
	});

	it('should return a 500 status code', () => {
		expect(response.statusCode).toBe(500);
	});

	it('should render the custom 500 page content', () => {
		const heading = element.querySelector('h1');
		expect(heading).not.toBeNull();
		expect(heading.textContent).toContain('Sorry, there is a problem with the service');

		expect(element.textContent).toContain('Try again later.');
		expect(element.textContent).toContain('Report an IT problem if the problem continues.');
	});

	it('should contain link that redirects to LittleFish support', () => {
		const linkText = 'Report an IT problem';

		const link = Array.from(element.querySelectorAll('a')).find(
			(a) => a.textContent.trim() === linkText
		);

		expect(link).not.toBeNull();

		expect(link.getAttribute('href')).toBe(
			'https://intranet.planninginspectorate.gov.uk/task/report-it-problem/'
		);
	});
});
