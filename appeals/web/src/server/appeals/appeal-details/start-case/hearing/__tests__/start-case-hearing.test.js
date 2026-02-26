import usersService from '#appeals/appeal-users/users-service.js';
import {
	activeDirectoryUsersData,
	appealData,
	appellantFinalCommentsAwaitingReview,
	caseNotes,
	lpaFinalCommentsAwaitingReview
} from '#testing/appeals/appeals.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
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
		jest
			.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
			.setSystemTime(new Date('2025-09-19'));
		// @ts-ignore
		usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
		// @ts-ignore
		usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
		// @ts-ignore
		usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
		nock('http://test/')
			.get('/appeals/1?include=all')
			.reply(200, {
				...appealDataWithoutStartDate,
				appealType: 'Planning appeal'
			});
	});
	afterEach(() => {
		teardown();
		jest.useRealTimers();
	});

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
			expect(pageHtml.querySelector('main h1')?.innerHTML.trim()).toBe(
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
				.get('/appeals/1?include=all')
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
				.get('/appeals/1?include=all')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});
			nock('http://test/')
				.get('/appeals/2?include=all')
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
				.get('/appeals/1?include=all')
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
				.get('/appeals/1?include=all')
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

		it('should redirect to the estimation page when the date is not known', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request
				.post(`${baseUrl}/1/start-case/hearing`)
				.send({ dateKnown: 'no' });
			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/1/start-case/hearing/estimation`);
		});

		it('should return 400 on missing dateKnown with appropriate error message', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
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
			expect(pageHtml.querySelector('main h1')?.innerHTML.trim()).toBe('Hearing date and time');
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
				.get('/appeals/1?include=all')
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
				.get('/appeals/1?include=all')
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
		it('should redirect to the estimation page when a valid date and time are entered', async () => {
			const response = await request.post(`${baseUrl}/1/start-case/hearing/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});
			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/1/start-case/hearing/estimation`);
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

	describe('GET /start-case/hearing/estimation', () => {
		const editEntrypoint = encodeURIComponent(`${baseUrl}/1/start-case/hearing/estimation`);

		it('should render the estimation page', async () => {
			const response = await request.get(`${baseUrl}/1/start-case/hearing/estimation`);
			expect(response.statusCode).toBe(200);

			const mainHtml = parseHtml(response.text).innerHTML;
			expect(mainHtml).toMatchSnapshot();

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-caption-l')?.innerHTML.trim()).toBe(
				'Appeal 351062 - start case'
			);
			expect(pageHtml.querySelector('main h1')?.innerHTML.trim()).toBe(
				'Do you know the expected number of days to carry out the hearing?'
			);
			expect(pageHtml.querySelector('input#hearing-estimation-yes-no')).not.toBeNull();
			expect(pageHtml.querySelector('button:contains("Continue")')).not.toBeNull();
		});

		it('should have a back link to hearing date when date is known', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			await request.post(`${baseUrl}/1/start-case/hearing`).send({ dateKnown: 'yes' });
			const response = await request.get(`${baseUrl}/1/start-case/hearing/estimation`);
			expect(response.statusCode).toBe(200);

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/1/start-case/hearing/date`
			);
		});

		it('should have a back link to hearing known page when date is not known', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			await request.post(`${baseUrl}/1/start-case/hearing`).send({ dateKnown: 'no' });
			const response = await request.get(`${baseUrl}/1/start-case/hearing/estimation`);
			expect(response.statusCode).toBe(200);

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/1/start-case/hearing`
			);
		});

		it('should have a back link to the CYA page when editing', async () => {
			const response = await request.get(
				`${baseUrl}/1/start-case/hearing/estimation?editEntrypoint=${editEntrypoint}`
			);
			expect(response.statusCode).toBe(200);

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/1/start-case/hearing/confirm`
			);
		});
	});

	describe('POST /start-case/hearing/estimation', () => {
		it('should redirect to the CYA page when no is selected', async () => {
			const response = await request
				.post(`${baseUrl}/1/start-case/hearing/estimation`)
				.send({ hearingEstimationYesNo: 'no' });

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/1/start-case/hearing/confirm`);
		});

		it('should redirect to the CYA page when yes and an estimated day value are entered', async () => {
			const response = await request
				.post(`${baseUrl}/1/start-case/hearing/estimation`)
				.send({ hearingEstimationYesNo: 'yes', hearingEstimationDays: '3.5' });

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/1/start-case/hearing/confirm`);
		});

		it('should return 400 when hearingEstimationYesNo is missing', async () => {
			const response = await request.post(`${baseUrl}/1/start-case/hearing/estimation`).send({});
			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Select yes if you know the expected number of days to carry out the hearing'
			);
		});

		it('should return 400 when yes is selected and estimated days is missing', async () => {
			const response = await request
				.post(`${baseUrl}/1/start-case/hearing/estimation`)
				.send({ hearingEstimationYesNo: 'yes' });
			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Enter the expected number of days to carry out the hearing'
			);
		});
	});

	describe('GET /start-case/hearing/confirm', () => {
		it('should render the confirm page when date is known', async () => {
			nock('http://test/').get('/appeals/1/case-team-email').reply(200, {
				id: 1,
				email: 'caseofficers@planninginspectorate.gov.uk',
				name: 'standard email'
			});
			nock('http://test/')
				.get('/appeals/1?include=all')
				.times(5)
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});
			nock('http://test/')
				.post('/appeals/1/appeal-timetables/notify-preview', {
					procedureType: 'hearing',
					hearingStartTime: '3025-02-01T12:00:00.000Z',
					hearingEstimatedDays: '3'
				})
				.reply(200, {
					appellant: 'Rendered HTML for appellant preview',
					lpa: 'Rendered HTML for LPA preview'
				});

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
			await request.post(`${baseUrl}/1/start-case/hearing/estimation`).send({
				hearingEstimationYesNo: 'yes',
				hearingEstimationDays: '3'
			});
			const response = await request.get(`${baseUrl}/1/start-case/hearing/confirm`);

			expect(response.statusCode).toBe(200);
			const mainHtml = parseHtml(response.text).innerHTML;
			expect(mainHtml).toMatchSnapshot();

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-caption-l')?.innerHTML.trim()).toBe('Appeal 351062');
			expect(pageHtml.querySelector('main h1')?.innerHTML.trim()).toBe(
				'Check details and start case'
			);
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
			expect(
				pageHtml.querySelector('a[data-cy="change-hearing-estimation-known"]')?.getAttribute('href')
			).toBe(
				`${baseUrl}/1/start-case/hearing/estimation?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fstart-case%2Fhearing%2Festimation`
			);
			expect(
				pageHtml.querySelector('a[data-cy="change-hearing-estimation-days"]')?.getAttribute('href')
			).toBe(
				`${baseUrl}/1/start-case/hearing/estimation?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fstart-case%2Fhearing%2Festimation`
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
			nock('http://test/').get('/appeals/1/case-team-email').reply(200, {
				id: 1,
				email: 'caseofficers@planninginspectorate.gov.uk',
				name: 'standard email'
			});
			nock('http://test/')
				.get('/appeals/1?include=all')
				.times(4)
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});
			nock('http://test/')
				.post('/appeals/1/appeal-timetables/notify-preview', {
					procedureType: 'hearing'
				})
				.reply(200, {
					appellant: 'Rendered HTML for appellant preview',
					lpa: 'Rendered HTML for LPA preview'
				});

			// Set up the session values
			await request
				.post(`${baseUrl}/1/start-case/select-procedure`)
				.send({ appealProcedure: 'hearing' });
			await request.post(`${baseUrl}/1/start-case/hearing`).send({ dateKnown: 'no' });
			await request
				.post(`${baseUrl}/1/start-case/hearing/estimation`)
				.send({ hearingEstimationYesNo: 'no' });
			const response = await request.get(`${baseUrl}/1/start-case/hearing/confirm`);

			expect(response.statusCode).toBe(200);
			const mainHtml = parseHtml(response.text).innerHTML;
			expect(mainHtml).toMatchSnapshot();

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-caption-l')?.innerHTML.trim()).toBe('Appeal 351062');
			expect(pageHtml.querySelector('main h1')?.innerHTML.trim()).toBe(
				'Check details and start case'
			);
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
			expect(
				pageHtml.querySelector('a[data-cy="change-hearing-estimation-known"]')?.getAttribute('href')
			).toBe(
				`${baseUrl}/1/start-case/hearing/estimation?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fstart-case%2Fhearing%2Festimation`
			);
			expect(pageHtml.querySelector('a[data-cy="change-hearing-estimation-days"]')).toBeNull();
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

		it('should render an error message when the email preview fails', async () => {
			const personalisation = {
				appeal_reference_number: 'APP/Q9999/D/21/351062',
				lpa_reference: '48269/APP/2021/1482',
				site_address: '21 The Pavement, Wandsworth, SW4 0HY',
				appeal_type: 'Planning appeal',
				local_planning_authority: 'Wiltshire Council',
				start_date: '1 February 2025',
				questionnaire_due_date: '1 February 2025',
				lpa_statement_deadline: '1 March 2025',
				ip_comments_deadline: '1 April 2025',
				statement_of_common_ground_deadline: '1 May 2025',
				hearing_date: '',
				hearing_time: '',
				procedure_type: 'a hearing',
				child_appeals: []
			};
			nock('http://test/')
				.get('/appeals/1?include=all')
				.times(4)
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});
			nock('http://test/')
				.get('/appeals/1/appeal-timetables/calculate?procedureType=hearing')
				.reply(200, {
					startDate: '2025-02-01T12:00:00.000Z',
					lpaQuestionnaireDueDate: '2025-02-01T12:00:00.000Z',
					lpaStatementDueDate: '2025-03-01T12:00:00.000Z',
					ipCommentsDueDate: '2025-04-01T12:00:00.000Z',
					statementOfCommonGroundDueDate: '2025-05-01T12:00:00.000Z'
				});
			nock('http://test/')
				.post(
					'/appeals/notify-preview/appeal-valid-start-case-s78-appellant.content.md',
					personalisation
				)
				.reply(500);
			nock('http://test/')
				.post('/appeals/notify-preview/appeal-valid-start-case-s78-lpa.content.md', personalisation)
				.reply(500);
			nock('http://test/').get('/appeals/1/case-team-email').reply(200, {
				id: 1,
				email: 'caseofficers@planninginspectorate.gov.uk',
				name: 'standard email'
			});

			// Set up the session values
			await request
				.post(`${baseUrl}/1/start-case/select-procedure`)
				.send({ appealProcedure: 'hearing' });
			await request.post(`${baseUrl}/1/start-case/hearing`).send({ dateKnown: 'no' });
			await request
				.post(`${baseUrl}/1/start-case/hearing/estimation`)
				.send({ hearingEstimationYesNo: 'no' });
			const response = await request.get(`${baseUrl}/1/start-case/hearing/confirm`);

			expect(response.statusCode).toBe(200);
			const mainHtml = parseHtml(response.text).innerHTML;
			expect(mainHtml).toMatchSnapshot();

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });

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
			expect(appellantPreview).toContain('Failed to generate email preview');
			expect(lpaPreview).toContain('Failed to generate email preview');
		});
	});

	describe('POST /start-case/hearing/confirm', () => {
		it('should redirect to the appeal details page when submitted', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.times(5)
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal',
					completedStateList: ['lpa_questionnaire']
				});
			nock('http://test/')
				.post('/appeals/1/appeal-timetables', {
					startDate: '2025-09-18T23:00:00.000Z',
					procedureType: 'hearing',
					hearingStartTime: '3025-02-01T12:00:00.000Z',
					hearingEstimatedDays: '3'
				})
				.reply(201, {
					startDate: '2025-02-01T12:00:00.000Z',
					lpaQuestionnaireDueDate: '2025-02-01T12:00:00.000Z',
					lpaStatementDueDate: '2025-03-01T12:00:00.000Z',
					ipCommentsDueDate: '2025-04-01T12:00:00.000Z',
					statementOfCommonGroundDueDate: '2025-05-01T12:00:00.000Z'
				});
			nock('http://test/').get('/appeals/1/case-notes').reply(200, caseNotes);
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/reps?type=appellant_final_comment,lpa_final_comment`)
				.reply(200, {
					itemsCount: 2,
					items: [
						...appellantFinalCommentsAwaitingReview.items,
						...lpaFinalCommentsAwaitingReview.items
					]
				});
			nock('http://test/')
				.get(/appeals\/\d+\/appellant-cases\/\d+/)
				.reply(200, { planningObligation: { hasObligation: false } });

			// Set up the session values
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
			await request.post(`${baseUrl}/1/start-case/hearing/estimation`).send({
				hearingEstimationYesNo: 'yes',
				hearingEstimationDays: '3'
			});

			const response = await request.post(`${baseUrl}/1/start-case/hearing/confirm`).send({});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/1`);

			const caseDetailsResponse = await request.get(`${baseUrl}/1`);

			const caseDetailsHTML = parseHtml(caseDetailsResponse.text);

			expect(caseDetailsHTML.innerHTML).toMatchSnapshot();
			const banners = caseDetailsHTML.querySelectorAll('.govuk-notification-banner__heading');
			expect(banners).toHaveLength(3);
			expect(banners[0]?.innerHTML).toBe('Appeal started');
			expect(banners[1]?.innerHTML).toBe('Timetable started');
			expect(banners[2]?.innerHTML).toBe('Hearing set up');
		});
	});
});
