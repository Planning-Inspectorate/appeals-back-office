// @ts-nocheck
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('Change to  inquiry', () => {
	const appealId = 2;

	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}`)
			.reply(200, { ...appealData, appealId })
			.persist();

		nock('http://test/')
			.get(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
			.reply(200, {})
			.persist();
	});

	afterEach(teardown);

	describe('GET /change-appeal-procedure-type/inquiry/address', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealData, appealId });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/Inquiry/setup/address`).send({
				addressKnown: 'yes'
			});

			const response = await request.get(`${baseUrl}/${appealId}/Inquiry/setup/address`);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Do you know the address of where the inquiry will take place?'
			);
		});

		it('should render a radio button for address known', () => {
			expect(pageHtml.querySelector('input[name="addressKnown"]')).not.toBeNull();
		});

		it('should render a radio button for address unknown', () => {
			expect(pageHtml.querySelector('input[name="addressKnown"]')).not.toBeNull();
		});

		it('should check the submitted value', () => {
			expect(
				pageHtml.querySelector('input[name="addressKnown"][value="yes"]')?.getAttribute('checked')
			).toBeDefined();
		});
	});

	describe('POST /change-appeal-procedure-type/inquiry/address', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId, procedureType: 'inquiry' });
		});

		it('should redirect to /change-appeal-procedure-type/inquiry/change-timetable when answering no', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/Inquiry/setup/address`).send({
				addressKnown: 'no'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/timetable-due-dates`
			);
		});

		it('should redirect to /change-appeal-procedure-type/inquiry/address-details when answering yes', async () => {
			appealData.procedureType = 'inquiry';

			const response = await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/address-known`)
				.send({
					addressKnown: 'yes'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/address-details`
			);
		});

		it('should return 400 on missing addressKnown with appropriate error message', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/address-known`)
				.send({});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Select yes if you know the address of where the inquiry will take place'
			);
		});
	});
});
