// @ts-nocheck
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import {
	appealDataFullPlanning,
	interestedPartyCommentForReview
} from '#testing/app/fixtures/referencedata.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('edit-ip-comment', () => {
	beforeEach(() => {
		installMockApi();

		nock('http://test/')
			.get('/appeals/2')
			.reply(200, { ...appealDataFullPlanning, appealId: 2, appealStatus: 'statements' });

		nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
	});

	afterEach(teardown);

	const testPageRendering = (review, expectedBackLink) => {
		describe(`GET address (review=${review})`, () => {
			let response, pageHtml;

			beforeEach(async () => {
				response = await request.get(
					`${baseUrl}/2/interested-party-comments/5/edit/address?review=${review}`
				);
				pageHtml = parseHtml(response.text, { rootElement: 'body' });
			});

			it('should respond with status 200', () => {
				expect(response.statusCode).toBe(200);
			});

			it('should match the snapshot', () => {
				expect(pageHtml.innerHTML).toMatchSnapshot();
			});

			it('should render the correct heading', () => {
				const heading = pageHtml.querySelector('h1')?.innerHTML;
				expect(heading).toBe('Interested party&#39;s address');
			});

			it('should render the correct back link', () => {
				const backLink = pageHtml.querySelector('.govuk-back-link');
				expect(backLink).not.toBeNull();
				expect(backLink?.getAttribute('href')).toContain(expectedBackLink);
			});

			it('should render address line 1 input', () => {
				expect(pageHtml.querySelector('input#address-line-1')).not.toBeNull();
			});

			it('should render town input', () => {
				expect(pageHtml.querySelector('input#address-town')).not.toBeNull();
			});

			it('should render postcode input', () => {
				expect(pageHtml.querySelector('input#address-postcode')).not.toBeNull();
			});

			it('should render the submit button', () => {
				const submitButton = pageHtml.querySelector('button.govuk-button');
				expect(submitButton).not.toBeNull();
			});

			it('should have "Continue" text on the submit button', () => {
				const submitButton = pageHtml.querySelector('button.govuk-button');
				expect(submitButton?.textContent).toContain('Continue');
			});
		});
	};

	testPageRendering('false', '/view');
	testPageRendering('true', '/review');
});