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
		expect(element.innerHTML).toContain('Timetable due dates</h1>');
		expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-day');
		expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-month"');
		expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-year"');
		expect(element.innerHTML).toContain('Continue</button>');
	});
});
