// @ts-nocheck
import { jest } from '@jest/globals';
import {
	APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1,
	APPEAL_CASE_STATUS_REDETERMINATION_STAGE_2
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { getRedetermineAppealSection } from '../redetermine-appeal-section.js';
import {
	getProgressConfirmationPage,
	getRedetermineConfirmationPage,
	postProgress,
	postRedetermine
} from '../redetermine.controller.js';
import {
	mapProgressConfirmationPage,
	mapRedetermineConfirmationPage
} from '../redetermine.mapper.js';

describe('redetermine appeal UI', () => {
	describe('getRedetermineAppealSection', () => {
		it('returns undefined if appeal status is not COMPLETE, STAGE_1, or STAGE_2', () => {
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

		it('returns reopen section if appeal status is COMPLETE', () => {
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

		it('returns progress button for stage 1', () => {
			const appealDetails = {
				appealId: 1,
				appealStatus: APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1
			};
			const section = getRedetermineAppealSection(
				appealDetails,
				'/appeals-service/appeal-details/1'
			);
			expect(section).toBeDefined();
			expect(section[0].wrapperHtml.opening).toContain('id="case-details-redetermine-section"');
			expect(section[0].parameters.pageComponents[1].parameters.html).toContain(
				'Progress to stage 2'
			);
		});

		it('returns progress button for stage 2', () => {
			const appealDetails = {
				appealId: 1,
				appealStatus: APPEAL_CASE_STATUS_REDETERMINATION_STAGE_2
			};
			const section = getRedetermineAppealSection(
				appealDetails,
				'/appeals-service/appeal-details/1'
			);
			expect(section).toBeDefined();
			expect(section[0].wrapperHtml.opening).toContain('id="case-details-redetermine-section"');
			expect(section[0].parameters.pageComponents[1].parameters.html).toContain(
				'Progress to event'
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

	describe('mapProgressConfirmationPage', () => {
		it('generates progress to stage 2 confirmation page content', () => {
			const appealDetails = {
				appealId: 123,
				appealReference: 'APP/2026/00001',
				appealStatus: APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1
			};
			const pageContent = mapProgressConfirmationPage(appealDetails);

			expect(pageContent.heading).toBe('Progress redetermination to stage 2');
			expect(pageContent.submitButtonProperties.text).toBe('Progress to stage 2');
		});

		it('generates progress to event confirmation page content', () => {
			const appealDetails = {
				appealId: 123,
				appealReference: 'APP/2026/00001',
				appealStatus: APPEAL_CASE_STATUS_REDETERMINATION_STAGE_2
			};
			const pageContent = mapProgressConfirmationPage(appealDetails);

			expect(pageContent.heading).toBe('Progress redetermination to event');
			expect(pageContent.submitButtonProperties.text).toBe('Progress to event');
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
						json: jest.fn().mockResolvedValue({ id: 123, currentStatus: 'redetermination_stage_1' })
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

		describe('getProgressConfirmationPage', () => {
			it('renders 404 when currentAppeal is not found', async () => {
				mockRequest.currentAppeal = null;
				await getProgressConfirmationPage(mockRequest, mockResponse);
				expect(mockResponse.status).toHaveBeenCalledWith(404);
				expect(mockResponse.render).toHaveBeenCalledWith('app/404.njk');
			});

			it('redirects to appeal details when appeal status is not stage 1 or stage 2', async () => {
				mockRequest.currentAppeal.appealStatus = APPEAL_CASE_STATUS.EVENT;
				await getProgressConfirmationPage(mockRequest, mockResponse);
				expect(mockResponse.redirect).toHaveBeenCalledWith('/appeals-service/appeal-details/123');
			});

			it('renders confirmation page when appeal status is stage 1', async () => {
				mockRequest.currentAppeal.appealStatus = APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1;
				await getProgressConfirmationPage(mockRequest, mockResponse);
				expect(mockResponse.render).toHaveBeenCalledWith(
					'patterns/check-and-confirm-page.pattern.njk',
					expect.objectContaining({
						pageContent: expect.objectContaining({
							heading: 'Progress redetermination to stage 2'
						})
					})
				);
			});
		});

		describe('postProgress', () => {
			it('progresses stage 1 with banner and redirects', async () => {
				mockRequest.currentAppeal.appealStatus = APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1;
				await postProgress(mockRequest, mockResponse);
				expect(mockRequest.apiClient.post).toHaveBeenCalledWith('appeals/123/redetermine/progress');
				expect(mockRequest.session.notificationBanners['123'][0].key).toBe(
					'redeterminationStage2Progressed'
				);
				expect(mockResponse.redirect).toHaveBeenCalledWith('/appeals-service/appeal-details/123');
			});

			it('progresses stage 2 with banner and redirects', async () => {
				mockRequest.currentAppeal.appealStatus = APPEAL_CASE_STATUS_REDETERMINATION_STAGE_2;
				await postProgress(mockRequest, mockResponse);
				expect(mockRequest.apiClient.post).toHaveBeenCalledWith('appeals/123/redetermine/progress');
				expect(mockRequest.session.notificationBanners['123'][0].key).toBe(
					'redeterminationEventProgressed'
				);
				expect(mockResponse.redirect).toHaveBeenCalledWith('/appeals-service/appeal-details/123');
			});
		});
	});
});
