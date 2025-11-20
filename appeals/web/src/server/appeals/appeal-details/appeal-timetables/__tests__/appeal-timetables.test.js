import { appealData as baseAppealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details/1/appeal-timetables';

const finalCommentReviewData = {
	...baseAppealData,
	appealTimetable: {
		appealTimetableId: 1,
		finalCommentsDueDate: '2023-08-09'
	}
};

describe('Appeal Timetables', () => {
	afterEach(teardown);
	it('should render "Change final comments due date" page', async () => {
		nock('http://test/').get('/appeals/1?include=all').reply(200, finalCommentReviewData);

		const response = await request.get(`${baseUrl}/final-comments`);
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Change final comments due date</h1>');
		expect(element.innerHTML).toContain(
			'The current due date for the final comments is 9 August 2023'
		);
		expect(element.innerHTML).toContain(
			'name="due-date-day" type="text" value="9" inputmode="numeric">'
		);
		expect(element.innerHTML).toContain(
			'name="due-date-month" type="text" value="8" inputmode="numeric">'
		);
		expect(element.innerHTML).toContain(
			'name="due-date-year" type="text" value="2023" inputmode="numeric">'
		);
		expect(element.innerHTML).toContain('Confirm</button>');
	});

	it('should render "Change final comments due date" with error (no answer provided)', async () => {
		nock('http://test/').get('/appeals/1?include=all').reply(200, finalCommentReviewData);

		const response = await request.post(`${baseUrl}/final-comments`).send({
			'due-date-day': '',
			'due-date-month': '',
			'due-date-year': ''
		});
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Change final comments due date</h1>');
		expect(element.innerHTML).toContain('There is a problem</h2>');
		expect(element.innerHTML).toContain('Enter the date');
	});

	it('should render "Change final comments due date" with error (api error)', async () => {
		nock('http://test/').get('/appeals/1?include=all').reply(200, finalCommentReviewData);
		nock('http://test/')
			.patch('/appeals/1/appeal-timetables/1')
			.reply(400, {
				errors: {
					finalCommentsDueDate: 'must be a business day'
				}
			});

		const response = await request.post(`${baseUrl}/final-comments`).send({
			'due-date-day': '1',
			'due-date-month': '1',
			'due-date-year': '2050'
		});
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Change final comments due date</h1>');
		expect(element.innerHTML).toContain('There is a problem</h2>');
		expect(element.innerHTML).toContain('Date must be a business day</a>');
	});

	it('should redirect to the case details page', async () => {
		const monthVariants = ['1', 'January', 'Jan'];
		for (const month of monthVariants) {
			nock('http://test/').get('/appeals/1?include=all').reply(200, finalCommentReviewData);
			nock('http://test/').patch('/appeals/1/appeal-timetables/1').reply(200, {
				finalCommentReviewDate: '2050-01-02T01:00:00.000Z'
			});
			const response = await request.post(`${baseUrl}/final-comments`).send({
				'due-date-day': '2',
				'due-date-month': month,
				'due-date-year': '2050'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		}
	});

	it('should render "Schedule LPA questionnaire Date" page', async () => {
		const appealData = {
			...baseAppealData,
			appealTimetable: {
				appealTimetableId: 1
			}
		};

		nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);

		const response = await request.get(`${baseUrl}/lpa-questionnaire`);
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Schedule LPA questionnaire due date</h1>');
		expect(element.innerHTML).toContain('name="due-date-day" type="text" inputmode="numeric">');
		expect(element.innerHTML).toContain('name="due-date-month" type="text" inputmode="numeric">');
		expect(element.innerHTML).toContain('name="due-date-year" type="text" inputmode="numeric">');
		expect(element.innerHTML).toContain('Confirm</button>');
	});

	it('should render "Change LPA questionnaire Date" page', async () => {
		const appealData = {
			...baseAppealData,
			appealTimetable: {
				appealTimetableId: 1,
				lpaQuestionnaireDueDate: '2023-08-09'
			}
		};

		nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);

		const response = await request.get(`${baseUrl}/lpa-questionnaire`);
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Change LPA questionnaire due date</h1>');
		expect(element.innerHTML).toContain(
			'name="due-date-day" type="text" value="9" inputmode="numeric">'
		);
		expect(element.innerHTML).toContain(
			'name="due-date-month" type="text" value="8" inputmode="numeric">'
		);
		expect(element.innerHTML).toContain(
			'name="due-date-year" type="text" value="2023" inputmode="numeric">'
		);
		expect(element.innerHTML).toContain('Confirm</button>');
	});

	it('should render "Schedule statement review Date" page', async () => {
		const appealData = {
			...baseAppealData,
			appealTimetable: {
				appealTimetableId: 1
			}
		};

		nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);

		const response = await request.get(`${baseUrl}/lpa-statement`);
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Schedule LPA statement due date</h1>');
		expect(element.innerHTML).toContain('name="due-date-day" type="text" inputmode="numeric">');
		expect(element.innerHTML).toContain('name="due-date-month" type="text" inputmode="numeric">');
		expect(element.innerHTML).toContain('name="due-date-year" type="text" inputmode="numeric">');
		expect(element.innerHTML).toContain('Confirm</button>');
	});

	it('should render "Change statement review Date" page', async () => {
		const appealData = {
			...baseAppealData,
			appealTimetable: {
				appealTimetableId: 1,
				lpaStatementDueDate: '2023-08-09'
			}
		};

		nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);

		const response = await request.get(`${baseUrl}/lpa-statement`);
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Change LPA statement due date</h1>');
		expect(element.innerHTML).toContain(
			'name="due-date-day" type="text" value="9" inputmode="numeric">'
		);
		expect(element.innerHTML).toContain(
			'name="due-date-month" type="text" value="8" inputmode="numeric">'
		);
		expect(element.innerHTML).toContain(
			'name="due-date-year" type="text" value="2023" inputmode="numeric">'
		);
		expect(element.innerHTML).toContain('Confirm</button>');
	});
});
