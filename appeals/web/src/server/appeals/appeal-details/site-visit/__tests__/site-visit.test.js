// @ts-nocheck
import usersService from '#appeals/appeal-users/users-service.js';
import {
	activeDirectoryUsersData,
	appealData,
	siteVisitData
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { getSiteVisitSuccessBannerTypeAndChangeType } from '../site-visit.mapper.js';
const template = {
	renderedHtml: [
		'We have cancelled the site visit.',
		'',
		'# Appeal details',
		'',
		'^Appeal reference number: ABC45678',
		'Address: 10, Test Street',
		'Planning application reference: 12345XYZ',
		'',
		'# What happens next',
		'',
		'We will contact you when we set up a new site visit.',
		'',
		'The Planning Inspectorate',
		'caseofficers@planninginspectorate.gov.uk'
	].join('\n')
};
const appellantEmailTemplate = {
	renderedHtml: [
		`<div class="pins-notify-preview-border">`,
		`<h2>Appeal details</h2>`,
		`<div class="govuk-inset-text">`,
		`  Appeal reference number: 134526 <br>`,
		`  Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom<br>`,
		`  Planning application reference: 48269/APP/2021/1482<br>`,
		`</div>`,
		`<h2>Appeal withdrawn</h2>`,
		`We have withdrawn the appeal following your request on 01 January 2025.<br><br>`,
		`<h2>What happens next</h2>`,
		`We have closed the appeal and cancelled the site visit.<br><br>`,
		`<h2>Feedback</h2>`,
		`We welcome your feedback on our appeals process. Tell us on this short <a href="https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u" class="govuk-link">feedback form</a>.<br><br>`,
		`The Planning Inspectorate<br><br>`,
		`caseofficers@planninginspectorate.gov.uk<br><br>`,
		`</div>`
	].join('\n')
};
const lpaEmailTemplate = {
	renderedHtml: [
		`<div class="pins-notify-preview-border">`,
		`We have withdrawn the appeal after the appellant's request.<br><br>`,
		`<h2>Appeal details</h2>`,
		`<div class="govuk-inset-text">`,
		`  Appeal reference number: 234567 <br>`,
		`  Address: 98 The Avenue, Leftfield, Maidstone, Kent, MD21 5YY, United Kingdom<br>`,
		`  Planning application reference: 48269/APP/2021/1483<br>`,
		`</div>`,
		`<h2>What happens next</h2>`,
		`We have closed the appeal and cancelled the site visit.<br><br>`,
		`<h2>Feedback</h2>`,
		`We welcome your feedback on our appeals process. Tell us on this short <a href="https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u" class="govuk-link">feedback form</a>.<br><br>`,
		`The Planning Inspectorate<br><br>`,
		`caseofficers@planninginspectorate.gov.uk<br><br>`,
		`</div>`
	].join('\n')
};
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
			expect(unprettifiedElement.innerHTML).toContain('name="visit-start-time-hour" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-start-time-minute" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-end-time-hour" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-end-time-minute" type="text"');
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
			expect(errorSummaryHtml).toContain('Select visit type</a>');
			expect(errorSummaryHtml).toContain('Enter the site visit date');
			expect(errorSummaryHtml).toContain('Enter the start time</a>');
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
			expect(errorSummaryHtml).toContain('Site visit date day must be between 1 and 31</a>');

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
			expect(errorSummaryHtml).toContain('Site visit date day must be between 1 and 31</a>');
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
			expect(errorSummaryHtml).toContain('Site visit date month must be between 1 and 12</a>');

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
			expect(errorSummaryHtml).toContain('Site visit date month must be between 1 and 12</a>');
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
			expect(errorSummaryHtml).toContain('Site visit date year must be 4 digits</a>');

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
			expect(errorSummaryHtml).toContain('Site visit date year must be 4 digits</a>');
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
			expect(errorSummaryHtml).toContain('Site visit date must be a real date</a>');
		});

		it('should re-direct to the appeal-details page when site visit date is in the past and other data is valid', async () => {
			const monthVariants = ['2', 'February', 'Feb'];
			for (const month of monthVariants) {
				nock('http://test/').post('/appeals/1/site-visits').reply(200, siteVisitData);
				const response = await request.post(`${baseUrl}/1${siteVisitPath}/schedule-visit`).send({
					'visit-type': 'unaccompanied',
					'visit-date-day': '29',
					'visit-date-month': month,
					'visit-date-year': '2000',
					'visit-start-time-hour': '10',
					'visit-start-time-minute': '00',
					'visit-end-time-hour': '11',
					'visit-end-time-minute': '30'
				});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
			}
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
			expect(errorSummaryHtml).toContain('Start time hour must be 23 or less</a>');
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
			expect(errorSummaryHtml).toContain('Start time minute must be 59 or less</a>');
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
			expect(errorSummaryHtml).toContain('End time hour must be 23 or less</a>');
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
			expect(errorSummaryHtml).toContain('End time minute must be 59 or less</a>');
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
			expect(errorSummaryHtml).toContain('Start time must be before end time</a>');
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
			expect(errorSummaryHtml).toContain('Enter the start time</a>');
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
			expect(errorSummaryHtml).toContain('Enter the start time</a>');
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
			expect(errorSummaryHtml).toContain('Enter the end time</a>');
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
			expect(unprettifiedElement.innerHTML).toContain('name="visit-start-time-hour" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-start-time-minute" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-end-time-hour" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="visit-end-time-minute" type="text"');
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
			expect(errorSummaryHtml).toContain('Select visit type</a>');
			expect(errorSummaryHtml).toContain('Enter the site visit date</a>');
			expect(errorSummaryHtml).toContain('Enter the start time</a>');
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
			expect(errorSummaryHtml).toContain('Site visit date day must be between 1 and 31</a>');

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
			expect(errorSummaryHtml).toContain('Site visit date day must be between 1 and 31</a>');
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
			expect(errorSummaryHtml).toContain('Site visit date month must be between 1 and 12</a>');

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
			expect(errorSummaryHtml).toContain('Site visit date month must be between 1 and 12</a>');
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
			expect(errorSummaryHtml).toContain('Site visit date year must be 4 digits</a>');

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
			expect(errorSummaryHtml).toContain('Site visit date year must be 4 digits</a>');
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
			expect(errorSummaryHtml).toContain('Site visit date must be a real date</a>');
		});

		it('should redirect to the appead details page when the site visit date is in the past', async () => {
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

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
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
			expect(errorSummaryHtml).toContain('Start time hour must be 23 or less</a>');
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
			expect(errorSummaryHtml).toContain('Start time minute must be 59 or less</a>');
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
			expect(errorSummaryHtml).toContain('End time hour must be 23 or less</a>');
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
			expect(errorSummaryHtml).toContain('End time minute must be 59 or less</a>');
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
			expect(errorSummaryHtml).toContain('Start time must be before end time</a>');
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
	describe('GET /site-visit/delete', () => {
		it('should render the manage visit page', async () => {
			nock('http://test/')
				.post(`/appeals/notify-preview/site-visit-cancelled.content.md`)
				.reply(200, template);
			nock('http://test/').get('/appeals/1/case-team-email').reply(200, {
				id: 1,
				email: 'caseofficers@planninginspectorate.gov.uk',
				name: 'standard email'
			});
			const response = await request.get(`${baseUrl}/1${siteVisitPath}/delete`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Confirm that you want to cancel the site visit</h1>');
			expect(element.innerHTML).toContain('Preview email to appellant</span>');
			expect(element.innerHTML).toContain('Preview email to LPA</span>');
			expect(element.innerHTML).toContain('Cancel site visit</button>');
			expect(element.innerHTML).toContain(
				'href="/appeals-service/appeal-details/1">Keep site visit</a>'
			);
		});
	});
	describe('POST /site-visit/delete', () => {
		afterEach(() => {
			nock.cleanAll();
		});

		it('should delete site visit and redirect to appeal details screen', async () => {
			nock('http://test/').delete('/appeals/1/site-visits/0').reply(200, {
				siteVisitId: 1
			});

			let response = await request
				.post(`${baseUrl}/1${siteVisitPath}/delete`)
				.send({ siteVisitId: 1 });

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

	describe('GET /site-visit/missed', () => {
		it('should render the who missed the site visit page', async () => {
			const response = await request.get(`${baseUrl}/1${siteVisitPath}/missed`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('- record missed site visit');
			expect(element.innerHTML).toContain('Who missed the site visit?</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('id="who-missed-site-visit-radio"');
			expect(unprettifiedElement.innerHTML).toContain('Appellant</label>');
			expect(unprettifiedElement.innerHTML).toContain('id="who-missed-site-visit-radio-2"');
			expect(unprettifiedElement.innerHTML).toContain('LPA</label>');
			expect(unprettifiedElement.innerHTML).toContain('id="who-missed-site-visit-radio-3"');
			expect(unprettifiedElement.innerHTML).toContain('Inspector</label>');

			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /site-visit/missed', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the who missed the site visit page with the expected error messages if required field is not populated', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/missed`).send({
				whoMissedSiteVisitRadio: ''
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			expect(element.innerHTML).toContain('Who missed the site visit?</h1>');
			expect(element.innerHTML).toContain('who-missed-site-visit-radio-error');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Select who missed the site visit</a>');
		});

		it('should redirect to the who missed site visit CYA page if appellant radio button was selected', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/missed`).send({
				whoMissedSiteVisitRadio: 'appellant'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/site-visit/missed/check'
			);
		});

		it('should redirect to the who missed site visit CYA page if lpa radio button was selected', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/missed`).send({
				whoMissedSiteVisitRadio: 'lpa'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/site-visit/missed/check'
			);
		});

		it('should redirect to the who missed site visit CYA page if inspector radio button was selected', async () => {
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/missed`).send({
				whoMissedSiteVisitRadio: 'inspector'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/site-visit/missed/check'
			);
		});
	});

	describe('GET /site-visit/missed/check', () => {
		/**
		 * @type {import("superagent").Response}
		 */
		let whoMissedSiteVisitResponse;
		beforeEach(() => {
			nock('http://test/').get('/appeals/1/case-team-email').reply(200, {
				id: 1,
				email: 'caseofficers@planninginspectorate.gov.uk',
				name: 'standard email'
			});
			nock('http://test/')
				.post(`/appeals/notify-preview/record-missed-site-visit-appellant.content.md`)
				.reply(200, appellantEmailTemplate);
			nock('http://test/')
				.post(`/appeals/notify-preview/record-missed-site-visit-lpa.content.md`)
				.reply(200, lpaEmailTemplate);
		});
		afterEach(nock.cleanAll);
		it('should render the who missed the site visit page for inspector', async () => {
			const whoMissedSiteVisitRadio = 'inspector';
			whoMissedSiteVisitResponse = await request.post(`${baseUrl}/1${siteVisitPath}/missed`).send({
				whoMissedSiteVisitRadio
			});
			expect(whoMissedSiteVisitResponse.statusCode).toBe(302);
			const response = await request.get(`${baseUrl}/1${siteVisitPath}/missed/check`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and record missed site visit</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Inspector</dd>');
			expect(unprettifiedElement.innerHTML).toContain('Change who missed site visit</span></a>');
			expect(unprettifiedElement.innerHTML).toContain('Record missed site visit</button>');
		});

		it('should render the who missed the site visit page for appellant', async () => {
			const whoMissedSiteVisitRadio = 'appellant';
			whoMissedSiteVisitResponse = await request.post(`${baseUrl}/1${siteVisitPath}/missed`).send({
				whoMissedSiteVisitRadio
			});
			expect(whoMissedSiteVisitResponse.statusCode).toBe(302);

			const response = await request.get(`${baseUrl}/1${siteVisitPath}/missed/check`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and record missed site visit</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant</dd>');
			expect(unprettifiedElement.innerHTML).toContain('Change who missed site visit</span></a>');
			expect(unprettifiedElement.innerHTML).toContain('Record missed site visit</button>');
		});

		it('should render the who missed the site visit page for lpa', async () => {
			const whoMissedSiteVisitRadio = 'lpa';
			whoMissedSiteVisitResponse = await request.post(`${baseUrl}/1${siteVisitPath}/missed`).send({
				whoMissedSiteVisitRadio
			});
			expect(whoMissedSiteVisitResponse.statusCode).toBe(302);
			const response = await request.get(`${baseUrl}/1${siteVisitPath}/missed/check`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and record missed site visit</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('LPA</dd>');
			expect(unprettifiedElement.innerHTML).toContain('Change who missed site visit</span></a>');
			expect(unprettifiedElement.innerHTML).toContain('Record missed site visit</button>');
		});
	});

	describe('POST /site-visit/missed/check', () => {
		/**
		 * @type {import("superagent").Response}
		 */
		let whoMissedSiteVisitResponse;
		beforeEach(() => {
			nock('http://test/').get('/appeals/1/case-team-email').reply(200, {
				id: 1,
				email: 'caseofficers@planninginspectorate.gov.uk',
				name: 'standard email'
			});
			nock('http://test/')
				.post(`/appeals/notify-preview/record-missed-site-visit-appellant.content.md`)
				.reply(200, appellantEmailTemplate);
			nock('http://test/')
				.post(`/appeals/notify-preview/record-missed-site-visit-lpa.content.md`)
				.reply(200, lpaEmailTemplate);
		});
		afterEach(nock.cleanAll);
		it('should redirect to appeal details when record missed site visit successfully recorded', async () => {
			const whoMissedSiteVisitRadio = 'inspector';
			nock('http://test/').post(`/appeals/1/site-visits/0/missed`).reply(200, siteVisitData);

			whoMissedSiteVisitResponse = await request.post(`${baseUrl}/1${siteVisitPath}/missed`).send({
				whoMissedSiteVisitRadio
			});
			expect(whoMissedSiteVisitResponse.statusCode).toBe(302);
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/missed/check`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
		it('should error page when site visit fails to save', async () => {
			const whoMissedSiteVisitRadio = 'inspector';
			nock('http://test/').post(`/appeals/1/site-visits/0/missed`).reply(500, siteVisitData);

			whoMissedSiteVisitResponse = await request.post(`${baseUrl}/1${siteVisitPath}/missed`).send({
				whoMissedSiteVisitRadio
			});
			expect(whoMissedSiteVisitResponse.statusCode).toBe(302);
			const response = await request.post(`${baseUrl}/1${siteVisitPath}/missed/check`);

			expect(response.statusCode).toBe(500);
		});
	});
});
