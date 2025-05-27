import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { appealData as baseAppealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details/1/timetable';

describe('Appeal Timetables', () => {
	afterEach(teardown);

	it('should render "Timetable due dates" page for householder appeal type', async () => {
		const appealData = {
			...baseAppealData,
			appealTimetable: {
				appealTimetableId: 1
			}
		};

		nock('http://test/').get('/appeals/1').reply(200, appealData);

		const response = await request.get(`${baseUrl}/edit`);
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('LPA questionnaire due</legend>');
		expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-day');
		expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-month"');
		expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-year"');
		expect(element.innerHTML).toContain('Continue</button>');
	});

	it('should render correct "Timetable due dates" page for S78 appeal type and status lpa_questionnaire', async () => {
		const appealData = {
			...baseAppealData,
			appealTimetable: {
				appealTimetableId: 1
			}
		};
		appealData.appealType = 'Planning appeal';
		appealData.appealStatus = 'lpa_questionnaire';

		nock('http://test/').get('/appeals/1').reply(200, appealData);

		const response = await request.get(`${baseUrl}/edit`);
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Timetable due dates</h1>');
		expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-day');
		expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-month"');
		expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-year"');
		expect(element.innerHTML).toContain('name="lpa-statement-due-date-day');
		expect(element.innerHTML).toContain('name="lpa-statement-due-date-month"');
		expect(element.innerHTML).toContain('name="lpa-statement-due-date-year"');
		expect(element.innerHTML).toContain('name="ip-comments-due-date-day');
		expect(element.innerHTML).toContain('name="ip-comments-due-date-month"');
		expect(element.innerHTML).toContain('name="ip-comments-due-date-year"');
		expect(element.innerHTML).toContain('name="final-comments-due-date-day');
		expect(element.innerHTML).toContain('name="final-comments-due-date-month"');
		expect(element.innerHTML).toContain('name="final-comments-due-date-year"');
		expect(element.innerHTML).toContain('Continue</button>');
	});

	it('should render correct "Timetable due dates" page for S78 appeal type and status lpa_questionnaire and lpaq received', async () => {
		const appealData = {
			...baseAppealData,
			appealTimetable: {
				appealTimetableId: 1
			}
		};
		appealData.appealType = 'Planning appeal';
		appealData.appealStatus = 'lpa_questionnaire';
		appealData.documentationSummary = {
			lpaQuestionnaire: {
				status: 'received',
				dueDate: '2024-10-11T10:27:06.626Z',
				receivedAt: '2024-08-02T10:27:06.626Z',
				representationStatus: 'awaiting_review'
			}
		};

		nock('http://test/').get('/appeals/1').reply(200, appealData);

		const response = await request.get(`${baseUrl}/edit`);
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Timetable due dates</h1>');
		expect(element.innerHTML).toContain('name="lpa-statement-due-date-day');
		expect(element.innerHTML).toContain('name="lpa-statement-due-date-month"');
		expect(element.innerHTML).toContain('name="lpa-statement-due-date-year"');
		expect(element.innerHTML).toContain('name="ip-comments-due-date-day');
		expect(element.innerHTML).toContain('name="ip-comments-due-date-month"');
		expect(element.innerHTML).toContain('name="ip-comments-due-date-year"');
		expect(element.innerHTML).toContain('name="final-comments-due-date-day');
		expect(element.innerHTML).toContain('name="final-comments-due-date-month"');
		expect(element.innerHTML).toContain('name="final-comments-due-date-year"');
		expect(element.innerHTML).toContain('Continue</button>');
	});

	it('should render correct "Timetable due dates" page for S78 appeal type and status statements', async () => {
		const appealData = {
			...baseAppealData,
			appealTimetable: {
				appealTimetableId: 1
			}
		};
		appealData.appealType = 'Planning appeal';
		appealData.appealStatus = 'statements';

		nock('http://test/').get('/appeals/1').reply(200, appealData);

		const response = await request.get(`${baseUrl}/edit`);
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Timetable due dates</h1>');
		expect(element.innerHTML).toContain('name="lpa-statement-due-date-day');
		expect(element.innerHTML).toContain('name="lpa-statement-due-date-month"');
		expect(element.innerHTML).toContain('name="lpa-statement-due-date-year"');
		expect(element.innerHTML).toContain('name="ip-comments-due-date-day');
		expect(element.innerHTML).toContain('name="ip-comments-due-date-month"');
		expect(element.innerHTML).toContain('name="ip-comments-due-date-year"');
		expect(element.innerHTML).toContain('name="final-comments-due-date-day');
		expect(element.innerHTML).toContain('name="final-comments-due-date-month"');
		expect(element.innerHTML).toContain('name="final-comments-due-date-year"');
		expect(element.innerHTML).toContain('Continue</button>');
	});

	it('should render correct "Timetable due dates" page for S78 appeal type and status final_comments', async () => {
		const appealData = {
			...baseAppealData,
			appealTimetable: {
				appealTimetableId: 1
			}
		};
		appealData.appealType = 'Planning appeal';
		appealData.appealStatus = 'final_comments';

		nock('http://test/').get('/appeals/1').reply(200, appealData);

		const response = await request.get(`${baseUrl}/edit`);
		const element = parseHtml(response.text);

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('Final comments due</legend>');
		expect(element.innerHTML).toContain('name="final-comments-due-date-day');
		expect(element.innerHTML).toContain('name="final-comments-due-date-month"');
		expect(element.innerHTML).toContain('name="final-comments-due-date-year"');
		expect(element.innerHTML).toContain('Continue</button>');
	});
});
