// @ts-nocheck
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import {
	siteVisitData,
	appealData,
	activeDirectoryUsersData
} from '#testing/app/fixtures/referencedata.js';
import { getSiteVisitSuccessBannerTypeAndChangeType } from '../site-visit.mapper.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { jest } from '@jest/globals';

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
			expect(unprettifiedElement.innerHTML).toContain(
				'Address of the neighbour’s land or property</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Interested party and neighbour addresses</dt>'
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
			expect(errorSummaryHtml).toContain('Visit date must include a day');
			expect(errorSummaryHtml).toContain('Visit date must include a month');
			expect(errorSummaryHtml).toContain('Visit date must include a year');
			expect(errorSummaryHtml).toContain('Start time must include an hour</a>');
			expect(errorSummaryHtml).toContain('Start time must include a minute</a>');
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
			expect(errorSummaryHtml).toContain('Visit date must be a real date</a>');
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
			expect(errorSummaryHtml).toContain('The visit date must be in the future</a>');
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

		it('should redirect to the site appeal details page if all required fields are populated and valid', async () => {
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
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should redirect to the appeals details page if visit type is unaccompanied and start and end times are not populated but all other required fields are populated and valid', async () => {
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
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
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
			expect(errorSummaryHtml).toContain('Start time must include an hour</a>');
			expect(errorSummaryHtml).toContain('Start time must include a minute</a>');
		});

		it('should redirect to the appeal details page if visit type is accompanied and end time is not populated but all other required fields are populated and valid', async () => {
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
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
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
			expect(errorSummaryHtml).toContain('Start time must include an hour</a>');
			expect(errorSummaryHtml).toContain('Start time must include a minute</a>');
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
			expect(errorSummaryHtml).toContain('End time must include an hour</a>');
			expect(errorSummaryHtml).toContain('End time must include a minute</a>');
		});

		it('should update a site visit if all required fields are populated and valid', async () => {
			const siteVisitId = 2;
			const appealId = 3;
			const appealDataWithSiteVisit = structuredClone(appealData);
			const existingSiteVisit = structuredClone(siteVisitData);
			appealDataWithSiteVisit.siteVisit.siteVisitId = siteVisitId;
			appealDataWithSiteVisit.appealId = appealId;
			appealDataWithSiteVisit.inspector = activeDirectoryUsersData[0].id;
			existingSiteVisit.siteVisitId = siteVisitId;
			nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealDataWithSiteVisit);
			nock('http://test/')
				.patch(`/appeals/${appealId}/site-visits/${siteVisitId}`)
				.reply(200, existingSiteVisit);
			usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);

			const response = await request
				.post(`${baseUrl}/${appealId}${siteVisitPath}/schedule-visit`)
				.send({
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
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}`
			);
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
			expect(unprettifiedElement.innerHTML).toContain(
				'Address of the neighbour’s land or property</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Interested party and neighbour addresses</dt>'
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
			expect(errorSummaryHtml).toContain('Visit date must include a day</a>');
			expect(errorSummaryHtml).toContain('Visit date must include a month</a>');
			expect(errorSummaryHtml).toContain('Visit date must include a year</a>');
			expect(errorSummaryHtml).toContain('Start time must include an hour</a>');
			expect(errorSummaryHtml).toContain('Start time must include a minute</a>');
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
			expect(errorSummaryHtml).toContain('Visit date must be a real date</a>');
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
			expect(errorSummaryHtml).toContain('The visit date must be in the future</a>');
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

		it('should redirect to the appeal details page if all required fields are populated and valid', async () => {
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
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should redirect to the appeal details page if visit type is unaccompanied and start and end times are not populated but all other required fields are populated and valid', async () => {
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
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
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
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('getSiteVisitSuccessBannerTypeAndChangeType', () => {
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
				visitDate: '2023-05-20T00:00:00Z',
				visitStartTime: '10:00',
				visitEndTime: '11:00',
				previousVisitType: ''
			};
		});
		it('Should return "siteVisitTypeChanged" and "visit-type" if site visit type has changed', () => {
			updateOrCreateSiteVisitParameters.apiVisitType = 'accompanied';
			const result = getSiteVisitSuccessBannerTypeAndChangeType(
				appealDetails,
				updateOrCreateSiteVisitParameters
			);
			expect(result.bannerType).toBe('siteVisitTypeChanged');
			expect(result.changeType).toBe('visit-type');
		});
		it('Should return "siteVisitRescheduled" and date-time if site visit start time has changed', () => {
			updateOrCreateSiteVisitParameters.visitStartTime = '10:30';
			const result = getSiteVisitSuccessBannerTypeAndChangeType(
				appealDetails,
				updateOrCreateSiteVisitParameters
			);
			expect(result.bannerType).toBe('siteVisitRescheduled');
			expect(result.changeType).toBe('date-time');
		});
		it('Should return "siteVisitRescheduled" and date-time if site visit end time has changed', () => {
			updateOrCreateSiteVisitParameters.visitEndTime = '11:30';
			const result = getSiteVisitSuccessBannerTypeAndChangeType(
				appealDetails,
				updateOrCreateSiteVisitParameters
			);
			expect(result.bannerType).toBe('siteVisitRescheduled');
			expect(result.changeType).toBe('date-time');
		});
		it('Should return "siteVisitRescheduled" and "date-time" if site visit date has changed', () => {
			updateOrCreateSiteVisitParameters.visitDate = '2023-06-20T00:00:00Z';
			const result = getSiteVisitSuccessBannerTypeAndChangeType(
				appealDetails,
				updateOrCreateSiteVisitParameters
			);
			expect(result.bannerType).toBe('siteVisitRescheduled');
			expect(result.changeType).toBe('date-time');
		});
		it('Should return "siteVisitChangedDefault" and all if type site visit type and date or time has changed', () => {
			updateOrCreateSiteVisitParameters.visitDate = '2023-06-20T00:00:00Z';
			updateOrCreateSiteVisitParameters.apiVisitType = 'accompanied';
			const result = getSiteVisitSuccessBannerTypeAndChangeType(
				appealDetails,
				updateOrCreateSiteVisitParameters
			);
			expect(result.bannerType).toBe('siteVisitChangedDefault');
			expect(result.changeType).toBe('all');
		});
		it('Should return "siteVisitNoChanges" if type nothing has changed', () => {
			const result = getSiteVisitSuccessBannerTypeAndChangeType(
				appealDetails,
				updateOrCreateSiteVisitParameters
			);
			expect(result.bannerType).toBe('siteVisitNoChanges');
			expect(result.changeType).toBe('unchanged');
		});
	});
});
