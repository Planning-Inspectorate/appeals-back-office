// @ts-nocheck
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealId = 2;

const appealWithInquiry = {
	...appealData,
	inquiry: {
		inquiryId: 1,
		inquiryStartTime: '3024-03-02T08:54:00.000Z'
	}
};

describe('cancel inquiry', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /inquiry/cancel', () => {
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/cancel`);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Confirm that you want to cancel the inquiry'
			);
		});

		it('should render the correct button text', () => {
			expect(pageHtml.querySelector('button#cancelInquiry')?.innerHTML.trim()).toBe(
				'Cancel inquiry'
			);
		});

		it('should render the keep inquiry link', () => {
			const keepInquiryLink = pageHtml.querySelector('a#keepInquiry');
			expect(keepInquiryLink?.attributes.href).toBe(`${baseUrl}/${appealId}`);
			expect(keepInquiryLink?.innerHTML.trim()).toBe('Keep inquiry');
		});
	});

	describe('POST /inquiry/cancel', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.times(4)
				.reply(200, { ...appealWithInquiry, appealId });
		});

		it('should redirect to appeal details page after submission', async () => {
			nock('http://test/')
				.delete(`/appeals/${appealId}/inquiry/${appealWithInquiry.inquiry.inquiryId}`)
				.reply(200, { inquiryId: 1 });

			const response = await request.post(`${baseUrl}/${appealId}/inquiry/cancel`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should show 500 page if error is thrown', async () => {
			nock('http://test/')
				.delete(`/appeals/${appealId}/inquiry/${appealWithInquiry.inquiry.inquiryId}`)
				.reply(500, { error: 'Internal Server Error' });

			const response = await request.post(`${baseUrl}/${appealId}/inquiry/cancel`);

			expect(response.status).toBe(500);
			expect(response.text).toContain('Sorry, there is a problem with the service');
		});
	});
});
