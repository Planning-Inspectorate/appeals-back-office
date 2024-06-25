import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import { siteVisitData, appealData } from '#testing/app/fixtures/referencedata.js';
import { getSiteVisitChangeType } from '../site-visit.mapper.js';

/**
 * @typedef {import('../site-visit.mapper.js').ScheduleOrManageSiteVisitConfirmationPageType} ScheduleOrManageSiteVisitConfirmationPageType
 */

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

/**
 * @typedef {import('../site-visit.service.js').UpdateOrCreateSiteVisitParameters} UpdateOrCreateSiteVisitParameters
 */

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const siteVisitPath = '/site-visit';
const visitScheduledPath = '/visit-scheduled';
const setVisitTypePath = '/set-visit-type';

describe('site-visit', () => {
	beforeEach(() => {
		installMockApi();
	});
	afterEach(teardown);

	describe('GET /site-visit/schedule-visit', () => {
		it('should render the schedule visit page', async () => {
			const response = await request.get(`${baseUrl}/1${siteVisitPath}/schedule-visit`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Site information</span>');
			expect(unprettifiedElement.innerHTML).toContain('Site address</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Potential safety risks (LPA answer)</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Potential safety risks (appellant answer)</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Neighbouring sites (LPA)</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Neighbouring sites (inspector and/or third party request)</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="visit-type" type="radio" value="unaccompanied"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="visit-type" type="radio" value="accessRequired"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="visit-type" type="radio" value="accompanied"'
			);
			expect(unprettifiedElement.innerHTML).toContain('name="visit-date-day" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-date-month" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-date-year" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('Select time</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Optional for unaccompanied visits</p>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Use the 24-hour clock. For example 16:30</p>'
			);
			expect(unprettifiedElement.innerHTML).toContain('name="visit-start-time-hour" type="number"');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="visit-start-time-minute" type="number"'
			);
			expect(unprettifiedElement.innerHTML).toContain('name="visit-end-time-hour" type="number"');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-end-time-minute" type="number"');
			expect(unprettifiedElement.innerHTML).toContain(
				'Confirming will inform the relevant parties of the site visit </div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /site-visit/schedule-visit', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/').get('/appeals/1/site-visits/0').reply(200, siteVisitData);
			nock('http://test/').post('/appeals/1/site-visits').reply(200, siteVisitData);
			nock('http://test/').post('/appeals/1/site-visits/0').reply(200, siteVisitData);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the schedule visit page with the expected error messages if required fields are not populated', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-date-day': '',
				'visit-date-month': '',
				'visit-date-year': '',
				'visit-start-time-hour': '',
				'visit-start-time-minute': '',
				'visit-end-time-hour': '',
				'visit-end-time-minute': ''
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Please select a visit type</a>');
			expect(errorSummaryHtml).toContain('Visit date day cannot be empty</a>');
			expect(errorSummaryHtml).toContain('Visit date month cannot be empty</a>');
			expect(errorSummaryHtml).toContain('Visit date year cannot be empty</a>');
			expect(errorSummaryHtml).toContain('Visit date must be a valid date</a>');
			expect(errorSummaryHtml).toContain('Start time hour cannot be empty</a>');
			expect(errorSummaryHtml).toContain('Start time minute cannot be empty</a>');
		});

		it('should re-render the schedule visit page with the expected error message if visit date day is invalid', async () => {
			let response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '0',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			let errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date day must be between 1 and 31</a>');

			response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '32',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date day must be between 1 and 31</a>');
		});

		it('should re-render the schedule visit page with the expected error message if visit date month is invalid', async () => {
			let response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '1',
				'visit-date-month': '0',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			let errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date month must be between 1 and 12</a>');

			response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '1',
				'visit-date-month': '13',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date month must be between 1 and 12</a>');
		});

		it('should re-render the schedule visit page with the expected error message if visit date year is invalid', async () => {
			let response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '202',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			let errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date year must be 4 digits</a>');

			response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '30003',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date year must be 4 digits</a>');
		});

		it('should re-render the schedule visit page with the expected error message if an invalid visit date was provided', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '29',
				'visit-date-month': '2',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date must be a valid date</a>');
		});

		it('should re-render the schedule visit page with the expected error message if provided date is not in the future', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '29',
				'visit-date-month': '2',
				'visit-date-year': '2000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date must be in the future</a>');
		});

		it('should re-render the schedule visit page with the expected error message if visit start time hour is invalid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'accompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '24',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Start time hour cannot be less than 0 or greater than 23</a>'
			);
		});

		it('should re-render the schedule visit page with the expected error message if visit start time minute is invalid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'accompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '60',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Start time minute cannot be less than 0 or greater than 59</a>'
			);
		});

		it('should re-render the schedule visit page with the expected error message if visit end time hour is invalid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'accessRequired',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '24',
				'visit-end-time-minute': '30'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'End time hour cannot be less than 0 or greater than 23</a>'
			);
		});

		it('should re-render the schedule visit page with the expected error message if visit end time minute is invalid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'accessRequired',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '60'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'End time minute cannot be less than 0 or greater than 59</a>'
			);
		});

		it('should re-render the schedule visit page with the expected error message if visit start time is not before end time', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'accessRequired',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '10',
				'visit-end-time-minute': '00'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('start time must be before end time</a>');
		});

		it('should redirect to the site visit scheduled confirmation page if all required fields are populated and valid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'accessRequired',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/site-visit/visit-scheduled/new'
			);
		});

		it('should redirect to the site visit scheduled confirmation page if visit type is unaccompanied and start and end times are not populated but all other required fields are populated and valid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '',
				'visit-start-time-minute': '',
				'visit-end-time-hour': '',
				'visit-end-time-minute': ''
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/site-visit/visit-scheduled/new'
			);
		});

		it('should re-render the schedule visit page with the expected error message if visit type is accompanied and start time is not populated', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'accompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '',
				'visit-start-time-minute': '',
				'visit-end-time-hour': '',
				'visit-end-time-minute': ''
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Start time hour cannot be empty</a>');
			expect(errorSummaryHtml).toContain('Start time minute cannot be empty</a>');
		});

		it('should redirect to the site visit scheduled confirmation page if visit type is accompanied and end time is not populated but all other required fields are populated and valid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'accompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '11',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '',
				'visit-end-time-minute': ''
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/site-visit/visit-scheduled/new'
			);
		});

		it('should re-render the schedule visit page with the expected error message if visit type is accessRequired and start time is not populated but all other required fields are populated and valid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'accompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '',
				'visit-start-time-minute': '',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Start time hour cannot be empty</a>');
			expect(errorSummaryHtml).toContain('Start time minute cannot be empty</a>');
		});

		it('should re-render the schedule visit page with the expected error message if visit type is accessRequired and end time is not populated but all other required fields are populated and valid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
				'visit-type': 'accessRequired',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '11',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '',
				'visit-end-time-minute': ''
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Schedule site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('End time hour cannot be empty</a>');
			expect(errorSummaryHtml).toContain('End time minute cannot be empty</a>');
		});
	});

	describe('GET /site-visit/manage-visit', () => {
		it('should render the manage visit page', async () => {
			const response = await request.get(`${baseUrl}/1${siteVisitPath}/manage-visit`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Site information</span>');
			expect(unprettifiedElement.innerHTML).toContain('Site address</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Potential safety risks (LPA answer)</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Potential safety risks (appellant answer)</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Neighbouring sites (LPA)</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Neighbouring sites (inspector and/or third party request)</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="visit-type" type="radio" value="unaccompanied"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="visit-type" type="radio" value="accessRequired"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="visit-type" type="radio" value="accompanied"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Select date</legend>');
			expect(unprettifiedElement.innerHTML).toContain('For example, 27 3 2023</div>');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-date-day" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-date-month" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-date-year" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('Select time</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Optional for unaccompanied visits</p>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Use the 24-hour clock. For example 16:30</p>'
			);
			expect(unprettifiedElement.innerHTML).toContain('name="visit-start-time-hour" type="number"');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="visit-start-time-minute" type="number"'
			);
			expect(unprettifiedElement.innerHTML).toContain('name="visit-end-time-hour" type="number"');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-end-time-minute" type="number"');
			expect(unprettifiedElement.innerHTML).toContain(
				'Confirming will inform the relevant parties of the site visit </div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /site-visit/manage-visit', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/').get('/appeals/1/site-visits/0').reply(200, siteVisitData);
			nock('http://test/').post('/appeals/1/site-visits').reply(200, siteVisitData);
			nock('http://test/').post('/appeals/1/site-visits/0').reply(200, siteVisitData);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the manage visit page with the expected error messages if required fields are not populated', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-date-day': '',
				'visit-date-month': '',
				'visit-date-year': '',
				'visit-start-time-hour': '',
				'visit-start-time-minute': '',
				'visit-end-time-hour': '',
				'visit-end-time-minute': ''
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Please select a visit type</a>');
			expect(errorSummaryHtml).toContain('Visit date day cannot be empty</a>');
			expect(errorSummaryHtml).toContain('Visit date month cannot be empty</a>');
			expect(errorSummaryHtml).toContain('Visit date year cannot be empty</a>');
			expect(errorSummaryHtml).toContain('Visit date must be a valid date</a>');
			expect(errorSummaryHtml).toContain('Start time hour cannot be empty</a>');
			expect(errorSummaryHtml).toContain('Start time minute cannot be empty</a>');
		});

		it('should re-render the manage visit page with the expected error message if visit date day is invalid', async () => {
			let response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '0',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			let errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date day must be between 1 and 31</a>');

			response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '32',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date day must be between 1 and 31</a>');
		});

		it('should re-render the manage visit page with the expected error message if visit date month is invalid', async () => {
			let response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '1',
				'visit-date-month': '0',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			let errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date month must be between 1 and 12</a>');

			response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '1',
				'visit-date-month': '13',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date month must be between 1 and 12</a>');
		});

		it('should re-render the manage visit page with the expected error message if visit date year is invalid', async () => {
			let response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '202',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			let errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date year must be 4 digits</a>');

			response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '30003',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date year must be 4 digits</a>');
		});

		it('should re-render the manage visit page with the expected error message if an invalid visit date was provided', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '29',
				'visit-date-month': '2',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date must be a valid date</a>');
		});

		it('should re-render the manage visit page with the expected error message if provided date is not in the future', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '29',
				'visit-date-month': '2',
				'visit-date-year': '2000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Visit date must be in the future</a>');
		});

		it('should re-render the manage visit page with the expected error message if visit start time hour is invalid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'accompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '24',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Start time hour cannot be less than 0 or greater than 23</a>'
			);
		});

		it('should re-render the manage visit page with the expected error message if visit start time minute is invalid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'accompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '60',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Start time minute cannot be less than 0 or greater than 59</a>'
			);
		});

		it('should re-render the manage visit page with the expected error message if visit end time hour is invalid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'accessRequired',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '24',
				'visit-end-time-minute': '30'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'End time hour cannot be less than 0 or greater than 23</a>'
			);
		});

		it('should re-render the manage visit page with the expected error message if visit end time minute is invalid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'accessRequired',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '60'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'End time minute cannot be less than 0 or greater than 59</a>'
			);
		});

		it('should re-render the manage visit page with the expected error message if visit start time is not before end time', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'accessRequired',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '10',
				'visit-end-time-minute': '00'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage site visit</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('start time must be before end time</a>');
		});

		it('should redirect to the site visit scheduled confirmation page if all required fields are populated and valid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'accessRequired',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '10',
				'visit-start-time-minute': '00',
				'visit-end-time-hour': '11',
				'visit-end-time-minute': '30'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/site-visit/visit-scheduled/new'
			);
		});

		it('should redirect to the site visit scheduled confirmation page if visit type is unaccompanied and start and end times are not populated but all other required fields are populated and valid', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '',
				'visit-start-time-minute': '',
				'visit-end-time-hour': '',
				'visit-end-time-minute': ''
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/site-visit/visit-scheduled/new'
			);
		});
	});

	describe('GET /site-visit/visit-scheduled/:confirmationPageTypeToRender', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/').get('/appeals/1/site-visits/0').reply(200, siteVisitData);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the new visit scheduled confirmation page', async () => {
			const response = await request.get(`${baseUrl}/1${siteVisitPath}${visitScheduledPath}/new`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Site visit scheduled</h1>');
			expect(element.innerHTML).toContain(
				'The relevant parties have been informed. The case timetable has been updated.</p>'
			);
			expect(element.innerHTML).toContain('Go back to case details</a>');
		});

		it('should render the visit changed confirmation page with no updates to the site visit', async () => {
			const response = await request.get(
				`${baseUrl}/1${siteVisitPath}${visitScheduledPath}/unchanged`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('No changes made</h1>');
			expect(element.innerHTML).toContain('No emails have been sent.</p>');
			expect(element.innerHTML).toContain('Go back to case details</a>');
		});

		it('should render the visit changed confirmation page with updated visit type', async () => {
			const response = await request.get(
				`${baseUrl}/1${siteVisitPath}${visitScheduledPath}/visit-type`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Site visit type changed</h1>');
			expect(element.innerHTML).toContain(
				'The relevant parties have been informed. The case timetable has been updated.</p>'
			);
			expect(element.innerHTML).toContain('Go back to case details</a>');
		});

		it('should render the visit changed confirmation page with updated date and time', async () => {
			const response = await request.get(
				`${baseUrl}/1${siteVisitPath}${visitScheduledPath}/date-time`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Site visit rescheduled</h1>');
			expect(element.innerHTML).toContain(
				'The relevant parties have been informed. The case timetable has been updated.</p>'
			);
			expect(element.innerHTML).toContain('Go back to case details</a>');
		});
	});

	describe('GET /site-visit/set-visit-type', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the select site visit type page', async () => {
			const response = await request.get(`${baseUrl}/1${siteVisitPath}${setVisitTypePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Select site visit type</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="visit-type" type="radio" value="unaccompanied"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="visit-type" type="radio" value="accessRequired"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="visit-type" type="radio" value="accompanied"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /site-visit/set-visit-type', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/').get('/appeals/1/site-visits/0').reply(200, siteVisitData);
			nock('http://test/').post('/appeals/1/site-visits').reply(200, siteVisitData);
			nock('http://test/').patch('/appeals/1/site-visits/0').reply(200, siteVisitData);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the select site visit type page with the expected error message if the site visit type was not selected', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}${setVisitTypePath}`).send({
				'visit-type': ''
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Select site visit type</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Please select a visit type</a>');
		});

		it('should redirect to the case details page if the site visit type was selected', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}${setVisitTypePath}`).send({
				'visit-type': 'unaccompanied'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should allow rearranging a site visit to remove previously set times', async () => {
			nock('http://test/')
				.get('/appeals/1/site-visits/0')
				.reply(200, { ...siteVisitData, visitStartTime: '10:00', visitEndTime: '11:00' });

			nock('http://test/')
				.patch('/appeals/1/site-visits/0')
				.reply(200, {
					...siteVisitData,
					visitStartTime: '',
					visitEndTime: '',
					siteVisitChangeType: 'date-time'
				});

			let response = await request.post(`${baseUrl}/1${siteVisitPath}/manage-visit`).send({
				'visit-type': 'unaccompanied',
				'visit-date-day': '1',
				'visit-date-month': '1',
				'visit-date-year': '3000',
				'visit-start-time-hour': '',
				'visit-start-time-minute': '',
				'visit-end-time-hour': '',
				'visit-end-time-minute': ''
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/site-visit/visit-scheduled/new'
			);
		});
	});

	describe('getSiteVisitChangeType', () => {
		/** @type {WebAppeal} */
		let appealDetails;
		/** @type {UpdateOrCreateSiteVisitParameters} */
		let updateOrCreateSiteVisitParameters;

		beforeEach(() => {
			appealDetails = {
				...appealData,
				siteVisit: {
					siteVisitId: 1,
					visitDate: '2023-05-20T00:00:00Z',
					visitType: 'unaccompanied',
					visitStartTime: '10:00',
					visitEndTime: '11:00'
				}
			};

			updateOrCreateSiteVisitParameters = {
				appealIdNumber: 1,
				apiVisitType: 'unaccompanied',
				visitDate: '2023-05-20',
				visitStartTime: '10:00',
				visitEndTime: '11:00',
				previousVisitType: ''
			};
		});

		it('should return "visit-type" if visit type has changed but not date and time', () => {
			updateOrCreateSiteVisitParameters.apiVisitType = 'accompanied';

			const result = getSiteVisitChangeType(appealDetails, updateOrCreateSiteVisitParameters);

			expect(result).toBe('visit-type');
			expect(updateOrCreateSiteVisitParameters.previousVisitType).toBe('unaccompanied');
		});

		it('should return "date-time" if date and time have changed but not visit type', () => {
			updateOrCreateSiteVisitParameters.visitDate = '2023-05-21';

			const result = getSiteVisitChangeType(appealDetails, updateOrCreateSiteVisitParameters);

			expect(result).toBe('date-time');
			expect(updateOrCreateSiteVisitParameters.previousVisitType).toBe('');
		});

		it('should return "all" if both visit type and date/time have changed', () => {
			updateOrCreateSiteVisitParameters.apiVisitType = 'accompanied';
			updateOrCreateSiteVisitParameters.visitDate = '2023-05-21';

			const result = getSiteVisitChangeType(appealDetails, updateOrCreateSiteVisitParameters);

			expect(result).toBe('all');
			expect(updateOrCreateSiteVisitParameters.previousVisitType).toBe('unaccompanied');
		});

		it('should return "unchanged" if neither visit type nor date/time have changed', () => {
			const result = getSiteVisitChangeType(appealDetails, updateOrCreateSiteVisitParameters);

			expect(result).toBe('unchanged');
			expect(updateOrCreateSiteVisitParameters.previousVisitType).toBe('');
		});
	});
});
