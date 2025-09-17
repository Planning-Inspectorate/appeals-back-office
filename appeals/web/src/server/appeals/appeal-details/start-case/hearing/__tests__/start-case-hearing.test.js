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

		it('should not preselect a previously entered value for a different appeal', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});
			nock('http://test/')
				.get('/appeals/2')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			await request.post(`${baseUrl}/2/start-case/hearing`).send({ dateKnown: 'yes' });

			const response = await request.get(`${baseUrl}/1/start-case/hearing`);
			expect(response.statusCode).toBe(200);

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(
				pageHtml.querySelector('input[name="dateKnown"][value="yes"]')?.getAttribute('checked')
			).toBeUndefined();
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

	describe('GET /start-case/hearing/date', () => {
		const editEntrypoint = encodeURIComponent(`${baseUrl}/1/start-case/hearing/date`);

		it('should render the date page', async () => {
			const response = await request.get(`${baseUrl}/1/start-case/hearing/date`);
			expect(response.statusCode).toBe(200);

			const mainHtml = parseHtml(response.text).innerHTML;
			expect(mainHtml).toMatchSnapshot();

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-caption-l')?.innerHTML.trim()).toBe(
				'Appeal 351062 - start case'
			);
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Hearing date and time');
			expect(pageHtml.querySelector('input#hearing-date-day')).not.toBeNull();
			expect(pageHtml.querySelector('input#hearing-date-month')).not.toBeNull();
			expect(pageHtml.querySelector('input#hearing-date-year')).not.toBeNull();
			expect(pageHtml.querySelector('input#hearing-time-hour')).not.toBeNull();
			expect(pageHtml.querySelector('input#hearing-time-minute')).not.toBeNull();
			expect(pageHtml.querySelector('button:contains("Continue")')).not.toBeNull();
			expect(pageHtml.querySelector('a.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/1/start-case/hearing`
			);
		});

		it('should render previously entered values', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			await request.post(`${baseUrl}/1/start-case/hearing/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			const response = await request.get(`${baseUrl}/1/start-case/hearing/date`);
			expect(response.statusCode).toBe(200);

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('input#hearing-date-day')?.getAttribute('value')).toBe('01');
			expect(pageHtml.querySelector('input#hearing-date-month')?.getAttribute('value')).toBe('02');
			expect(pageHtml.querySelector('input#hearing-date-year')?.getAttribute('value')).toBe('3025');
			expect(pageHtml.querySelector('input#hearing-time-hour')?.getAttribute('value')).toBe('12');
			expect(pageHtml.querySelector('input#hearing-time-minute')?.getAttribute('value')).toBe('00');
		});

		it('should render edited values', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.twice()
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			await request.post(`${baseUrl}/1/start-case/hearing/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});
			await request
				.post(`${baseUrl}/1/start-case/hearing/date?editEntrypoint=${editEntrypoint}`)
				.send({
					'hearing-date-day': '08',
					'hearing-date-month': '09',
					'hearing-date-year': '3025',
					'hearing-time-hour': '13',
					'hearing-time-minute': '00'
				});

			const response = await request.get(
				`${baseUrl}/1/start-case/hearing/date?editEntrypoint=${editEntrypoint}`
			);
			expect(response.statusCode).toBe(200);

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('input#hearing-date-day')?.getAttribute('value')).toBe('08');
			expect(pageHtml.querySelector('input#hearing-date-month')?.getAttribute('value')).toBe('09');
			expect(pageHtml.querySelector('input#hearing-date-year')?.getAttribute('value')).toBe('3025');
			expect(pageHtml.querySelector('input#hearing-time-hour')?.getAttribute('value')).toBe('13');
			expect(pageHtml.querySelector('input#hearing-time-minute')?.getAttribute('value')).toBe('00');
		});

		it('should have a back link to the CYA page when editing', async () => {
			const response = await request.get(
				`${baseUrl}/1/start-case/hearing/date?editEntrypoint=${editEntrypoint}`
			);
			expect(response.statusCode).toBe(200);

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/1/start-case/hearing/confirm`
			);
		});
	});

	describe('POST /start-case/hearing/date', () => {
		it('should redirect to the CYA page when a valid date and time are entered', async () => {
			const response = await request.post(`${baseUrl}/1/start-case/hearing/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});
			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/1/start-case/hearing/confirm`);
		});

		it('should return 400 on invalid date with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/1/start-case/hearing/date`).send({
				'hearing-date-day': '31',
				'hearing-date-month': '02',
				'hearing-date-year': '2025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Hearing date must be a real date');
		});

		it('should return 400 on missing date with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/1/start-case/hearing/date`).send({
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter the hearing date');
		});

		it('should return 400 on date in the past with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/1/start-case/hearing/date`).send({
				'hearing-date-day': '28',
				'hearing-date-month': '02',
				'hearing-date-year': '1999',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('The hearing date must be in the future');
		});

		it('should return 400 on invalid time with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/1/start-case/hearing/date`).send({
				'hearing-date-day': '28',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '99',
				'hearing-time-minute': '99'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a real hearing time');
		});

		it('should return 400 on missing time with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/1/start-case/hearing/date`).send({
				'hearing-date-day': '28',
				'hearing-date-month': '02',
				'hearing-date-year': '3025'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter the hearing time');
		});
	});

	describe('GET /start-case/hearing/confirm', () => {
		it('should render the confirm page when date is known', async () => {
			const personalisation = {
				appeal_reference_number: 'APP/Q9999/D/21/351062',
				lpa_reference: '48269/APP/2021/1482',
				site_address: '21 The Pavement, Wandsworth, SW4 0HY',
				appeal_type: 'Planning appeal',
				local_planning_authority: 'Wiltshire Council',
				start_date: '1 February 2025',
				questionnaire_due_date: '1 February 2025'
			};
			nock('http://test/')
				.get('/appeals/1')
				.times(3)
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});
			nock('http://test/')
				.get('/appeals/1/appeal-timetables/calculate?procedureType=hearing')
				.reply(200, {
					startDate: '2025-02-01T12:00:00.000Z',
					lpaQuestionnaireDueDate: '2025-02-01T12:00:00.000Z'
				});
			nock('http://test/')
				.post(
					'/appeals/notify-preview/appeal-valid-start-case-appellant.content.md',
					personalisation
				)
				.reply(200, { renderedHtml: 'Rendered HTML for appellant preview' });
			nock('http://test/')
				.post('/appeals/notify-preview/appeal-valid-start-case-lpa.content.md', personalisation)
				.reply(200, { renderedHtml: 'Rendered HTML for LPA preview' });

			await request
				.post(`${baseUrl}/1/start-case/select-procedure`)
				.send({ appealProcedure: 'hearing' });
			await request.post(`${baseUrl}/1/start-case/hearing`).send({ dateKnown: 'yes' });
			await request.post(`${baseUrl}/1/start-case/hearing/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});
			const response = await request.get(`${baseUrl}/1/start-case/hearing/confirm`);

			expect(response.statusCode).toBe(200);
			const mainHtml = parseHtml(response.text).innerHTML;
			expect(mainHtml).toMatchSnapshot();

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-caption-l')?.innerHTML.trim()).toBe('Appeal 351062');
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Check details and start case');
			expect(
				pageHtml.querySelector('a[data-cy="change-appeal-procedure"]')?.getAttribute('href')
			).toBe(
				`${baseUrl}/1/start-case/select-procedure?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fstart-case%2Fselect-procedure`
			);
			expect(pageHtml.querySelector('a[data-cy="change-date-known"]')?.getAttribute('href')).toBe(
				`${baseUrl}/1/start-case/hearing?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fstart-case%2Fhearing`
			);
			expect(pageHtml.querySelector('a[data-cy="change-hearing-date"]')?.getAttribute('href')).toBe(
				`${baseUrl}/1/start-case/hearing/date?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fstart-case%2Fhearing%2Fdate`
			);
			expect(pageHtml.querySelector('a[data-cy="change-hearing-time"]')?.getAttribute('href')).toBe(
				`${baseUrl}/1/start-case/hearing/date?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fstart-case%2Fhearing%2Fdate`
			);
			expect(pageHtml.innerHTML).toContain(
				'We’ll start the timetable now and send emails to the relevant parties.'
			);
			expect(pageHtml.querySelector('button:contains("Start case")')).not.toBeNull();

			expect(
				pageHtml.querySelector('details[data-cy="preview-email-to-appellant"]')
			).not.toBeNull();
			expect(pageHtml.querySelector('details[data-cy="preview-email-to-lpa"]')).not.toBeNull();

			const appellantPreview = pageHtml.querySelector(
				'details[data-cy="preview-email-to-appellant"] .govuk-details__text'
			)?.innerHTML;
			const lpaPreview = pageHtml.querySelector(
				'details[data-cy="preview-email-to-lpa"] .govuk-details__text'
			)?.innerHTML;
			expect(appellantPreview).toContain('Rendered HTML for appellant preview');
			expect(lpaPreview).toContain('Rendered HTML for LPA preview');
		});

		it('should render the confirm page when date is not known', async () => {
			const personalisation = {
				appeal_reference_number: 'APP/Q9999/D/21/351062',
				lpa_reference: '48269/APP/2021/1482',
				site_address: '21 The Pavement, Wandsworth, SW4 0HY',
				appeal_type: 'Planning appeal',
				local_planning_authority: 'Wiltshire Council',
				start_date: '',
				questionnaire_due_date: '1 February 2025'
			};
			nock('http://test/')
				.get('/appeals/1')
				.twice()
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});
			nock('http://test/')
				.get('/appeals/1/appeal-timetables/calculate?procedureType=hearing')
				.reply(200, {
					lpaQuestionnaireDueDate: '2025-02-01T12:00:00.000Z'
				});
			nock('http://test/')
				.post(
					'/appeals/notify-preview/appeal-valid-start-case-appellant.content.md',
					personalisation
				)
				.reply(200, { renderedHtml: 'Rendered HTML for appellant preview' });
			nock('http://test/')
				.post('/appeals/notify-preview/appeal-valid-start-case-lpa.content.md', personalisation)
				.reply(200, { renderedHtml: 'Rendered HTML for LPA preview' });

			await request
				.post(`${baseUrl}/1/start-case/select-procedure`)
				.send({ appealProcedure: 'hearing' });
			await request.post(`${baseUrl}/1/start-case/hearing`).send({ dateKnown: 'no' });
			const response = await request.get(`${baseUrl}/1/start-case/hearing/confirm`);

			expect(response.statusCode).toBe(200);
			const mainHtml = parseHtml(response.text).innerHTML;
			expect(mainHtml).toMatchSnapshot();

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-caption-l')?.innerHTML.trim()).toBe('Appeal 351062');
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Check details and start case');
			expect(
				pageHtml.querySelector('a[data-cy="change-appeal-procedure"]')?.getAttribute('href')
			).toBe(
				`${baseUrl}/1/start-case/select-procedure?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fstart-case%2Fselect-procedure`
			);
			expect(pageHtml.querySelector('a[data-cy="change-date-known"]')?.getAttribute('href')).toBe(
				`${baseUrl}/1/start-case/hearing?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fstart-case%2Fhearing`
			);
			expect(pageHtml.querySelector('a[data-cy="change-hearing-date"]')).toBeNull();
			expect(pageHtml.querySelector('a[data-cy="change-hearing-time"]')).toBeNull();
			expect(pageHtml.innerHTML).toContain(
				'We’ll start the timetable now and send emails to the relevant parties.'
			);
			expect(pageHtml.querySelector('button:contains("Start case")')).not.toBeNull();

			expect(
				pageHtml.querySelector('details[data-cy="preview-email-to-appellant"]')
			).not.toBeNull();
			expect(pageHtml.querySelector('details[data-cy="preview-email-to-lpa"]')).not.toBeNull();

			const appellantPreview = pageHtml.querySelector(
				'details[data-cy="preview-email-to-appellant"] .govuk-details__text'
			)?.innerHTML;
			const lpaPreview = pageHtml.querySelector(
				'details[data-cy="preview-email-to-lpa"] .govuk-details__text'
			)?.innerHTML;
			expect(appellantPreview).toContain('Rendered HTML for appellant preview');
			expect(lpaPreview).toContain('Rendered HTML for LPA preview');
		});
	});
});
