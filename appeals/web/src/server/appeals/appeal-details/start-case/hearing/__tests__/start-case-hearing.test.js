import { appealData } from '#testing/appeals/appeals.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform/testing/html-parser.js';
import nock from 'nock';
import supertest from 'supertest';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealDataWithoutStartDate = {
	...appealData,
	startedAt: null
};

describe('start case hearing flow', () => {
	beforeEach(() => {
		nock('http://test/')
			.get('/appeals/1')
			.reply(200, {
				...appealDataWithoutStartDate,
				appealType: 'Planning appeal'
			});
	});
	afterEach(teardown);

	const editEntrypoint = encodeURIComponent(`${baseUrl}/1/start-case/hearing`);
	describe('GET /start-case/hearing', () => {
		it('should render the date known page', async () => {
			const response = await request.get(`${baseUrl}/1/start-case/hearing`);
			expect(response.statusCode).toBe(200);

			const mainHtml = parseHtml(response.text).innerHTML;
			expect(mainHtml).toMatchSnapshot();

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-caption-l')?.innerHTML.trim()).toBe(
				'Appeal 351062 - start case'
			);
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Do you know the date and time of the hearing?'
			);
			expect(pageHtml.querySelector('input#date-known')).not.toBeNull();
			expect(pageHtml.querySelector('button:contains("Continue")')).not.toBeNull();
			expect(pageHtml.querySelector('a.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/1/start-case/select-procedure`
			);
		});

		it('should preselect a previously entered value', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			await request.post(`${baseUrl}/1/start-case/hearing`).send({ dateKnown: 'yes' });

			const response = await request.get(`${baseUrl}/1/start-case/hearing`);
			expect(response.statusCode).toBe(200);

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(
				pageHtml.querySelector('input[name="dateKnown"][value="yes"]')?.getAttribute('checked')
			).toBeDefined();
		});

		it('should render an edited value', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.twice()
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			await request.post(`${baseUrl}/1/start-case/hearing`).send({ dateKnown: 'no' });
			await request
				.post(`${baseUrl}/1/start-case/hearing?editEntrypoint=${editEntrypoint}`)
				.send({ dateKnown: 'yes' });

			const response = await request.get(
				`${baseUrl}/1/start-case/hearing?editEntrypoint=${editEntrypoint}`
			);
			expect(response.statusCode).toBe(200);

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(
				pageHtml.querySelector('input[name="dateKnown"][value="yes"]')?.getAttribute('checked')
			).toBeDefined();
		});

		it('should have a back link to the CYA page when editing', async () => {
			const response = await request.get(
				`${baseUrl}/1/start-case/hearing?editEntrypoint=${editEntrypoint}`
			);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/1/start-case/hearing/confirm`
			);
		});
	});

	describe('POST /start-case/hearing', () => {
		it('should redirect to the date page when the date is known', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request
				.post(`${baseUrl}/1/start-case/hearing`)
				.send({ dateKnown: 'yes' });
			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/1/start-case/hearing/date`);
		});

		it('should redirect to the CYA page when the date is not known', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request
				.post(`${baseUrl}/1/start-case/hearing`)
				.send({ dateKnown: 'no' });
			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/1/start-case/hearing/confirm`);
		});

		it('should return 400 on missing dateKnown with appropriate error message', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.post(`${baseUrl}/1/start-case/hearing`).send({});
			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});

			expect(errorSummaryHtml.querySelector('h2')?.innerHTML.trim()).toBe('There is a problem');
			expect(errorSummaryHtml.querySelector('.govuk-error-summary li')?.innerHTML.trim()).toContain(
				'Select yes if you know the date and time the hearing will take place'
			);
		});
	});
});
