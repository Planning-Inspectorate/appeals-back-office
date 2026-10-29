// @ts-nocheck
import { jest } from '@jest/globals';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { getRedetermineAppealSection } from '../redetermine-appeal-section.js';
import { getRedetermineConfirmationPage, postRedetermine } from '../redetermine.controller.js';
import { mapRedetermineConfirmationPage } from '../redetermine.mapper.js';

describe('redetermine appeal UI', () => {
	describe('getRedetermineAppealSection', () => {
		it('returns undefined if appeal status is not COMPLETE', () => {
			const appealDetails = {
				appealId: 1,
				appealStatus: APPEAL_CASE_STATUS.EVENT
			};
			const section = getRedetermineAppealSection(
				appealDetails,
				'/appeals-service/appeal-details/1'
			);
			expect(section).toBeUndefined();
		});

		it('returns section components if appeal status is COMPLETE', () => {
			const appealDetails = {
				appealId: 1,
				appealStatus: APPEAL_CASE_STATUS.COMPLETE
			};
			const section = getRedetermineAppealSection(
				appealDetails,
				'/appeals-service/appeal-details/1'
			);
			expect(section).toBeDefined();
			expect(section[0].wrapperHtml.opening).toContain('id="case-details-redetermine-section"');
			expect(section[0].parameters.pageComponents[1].parameters.html).toContain(
				'href="/appeals-service/appeal-details/1/redetermine"'
			);
		});
	});

	describe('mapRedetermineConfirmationPage', () => {
		it('generates check-and-confirm page content with warning and submit button', () => {
			const appealDetails = {
				appealId: 123,
				appealReference: 'APP/2026/00001'
			};
			const pageContent = mapRedetermineConfirmationPage(appealDetails);

			expect(pageContent.heading).toBe('Confirm redetermination');
			expect(pageContent.backLinkUrl).toBe('/appeals-service/appeal-details/123');
			expect(pageContent.submitButtonProperties.text).toBe('Confirm and reopen appeal');
			expect(pageContent.pageComponents[0].parameters.html).toContain('govuk-warning-text');
		});
	});

	describe('redetermine controller', () => {
		let mockRequest;
		let mockResponse;

		beforeEach(() => {
			mockRequest = {
				currentAppeal: {
					appealId: 123,
					appealReference: 'APP/2026/00001',
					appealStatus: APPEAL_CASE_STATUS.COMPLETE
				},
				session: {},
				apiClient: {
					post: jest.fn().mockReturnValue({
						json: jest.fn().mockResolvedValue({ id: 123, currentStatus: 'event' })
					})
				}
			};
			mockResponse = {
				status: jest.fn().mockReturnThis(),
				render: jest.fn().mockReturnThis(),
				redirect: jest.fn().mockReturnThis()
			};
		});

		describe('getRedetermineConfirmationPage', () => {
			it('renders 404 when currentAppeal is not found', async () => {
				mockRequest.currentAppeal = null;
				await getRedetermineConfirmationPage(mockRequest, mockResponse);
				expect(mockResponse.status).toHaveBeenCalledWith(404);
				expect(mockResponse.render).toHaveBeenCalledWith('app/404.njk');
			});

			it('redirects to appeal details when appeal status is not COMPLETE', async () => {
				mockRequest.currentAppeal.appealStatus = APPEAL_CASE_STATUS.EVENT;
				await getRedetermineConfirmationPage(mockRequest, mockResponse);
				expect(mockResponse.redirect).toHaveBeenCalledWith('/appeals-service/appeal-details/123');
			});

			it('renders confirmation page when appeal status is COMPLETE', async () => {
				await getRedetermineConfirmationPage(mockRequest, mockResponse);
				expect(mockResponse.render).toHaveBeenCalledWith(
					'patterns/check-and-confirm-page.pattern.njk',
					expect.objectContaining({
						pageContent: expect.objectContaining({
							heading: 'Confirm redetermination'
						})
					})
				);
			});
		});

		describe('postRedetermine', () => {
			it('calls postRedetermineAppeal, adds banner to session, and redirects to appeal details', async () => {
				await postRedetermine(mockRequest, mockResponse);
				expect(mockRequest.apiClient.post).toHaveBeenCalledWith('appeals/123/redetermine');
				expect(mockRequest.session.notificationBanners).toBeDefined();
				expect(mockResponse.redirect).toHaveBeenCalledWith('/appeals-service/appeal-details/123');
			});
		});
	});
});
