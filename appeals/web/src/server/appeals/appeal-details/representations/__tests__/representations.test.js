import { parseHtml } from '@pins/platform';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import supertest from 'supertest';
import nock from 'nock';
import {
	appealData,
	shareRepsResponseFinalComment,
	appellantFinalCommentsAwaitingReview,
	lpaFinalCommentsAwaitingReview,
	caseNotes,
	activeDirectoryUsersData
} from '#testing/app/fixtures/referencedata.js';
import usersService from '#appeals/appeal-users/users-service.js';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('representations', () => {
	afterEach(teardown);
	describe('GET /share', () => {
		let appealWithStatments;
		const numIpComments = 1;
		beforeEach(() => {
			appealWithStatments = {
				...appealData,
				appealStatus: 'statements',
				documentationSummary: {
					ipComments: {
						counts: {
							valid: numIpComments
						}
					}
				}
			};
			nock('http://test/').get('/appeals/1').reply(200, appealWithStatments);
		});

		it('should contain link to interested-party-comments#valid', async () => {
			const response = await request.get(`${baseUrl}/1/share`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Share IP comments and statements</h1>');
			expect(element.innerHTML).toContain(
				`<a href="/appeals-service/appeal-details/1/interested-party-comments?backUrl=%2Fappeals-service%2Fappeal-details%2F1%2Fshare#valid"`
			);
		});
	});

	describe('POST /share', () => {
		const appealId = 1;

		// TODO: add test suites for ip comments and statements

		describe('final comments', () => {
			beforeEach(() => {
				nock.cleanAll();
				// @ts-ignore
				usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
				// @ts-ignore
				usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
				// @ts-ignore
				usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
				nock('http://test/')
					.get('/appeals/1/reps?type=appellant_final_comment')
					.reply(200, appellantFinalCommentsAwaitingReview)
					.persist();
				nock('http://test/')
					.get('/appeals/1/reps?type=lpa_final_comment')
					.reply(200, lpaFinalCommentsAwaitingReview)
					.persist();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, { planningObligation: { hasObligation: false } })
					.persist();
				nock('http://test/').get(`/appeals/${appealId}/case-notes`).reply(200, caseNotes);
			});

			const testCases = [
				{
					name: 'appellant',
					representationType: 'appellant_final_comment'
				},
				{
					name: 'lpa',
					representationType: 'lpa_final_comment'
				}
			];

			for (const testCase of testCases) {
				it(`should call the publish representations API endpoint, redirect to the case details page, and render a "Final comments shared" success banner, if ${testCase.name} final comments were shared`, async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}`)
						.reply(200, {
							...appealData,
							appealId,
							appealStatus: 'final_comments',
							documentationSummary: {
								appellantFinalComments: {
									receivedAt: '2025-01-29T10:19:47.259Z',
									representationStatus: 'valid',
									status: 'received'
								},
								lpaFinalComments: {
									receivedAt: '2025-01-29T10:19:47.259Z',
									representationStatus: 'valid',
									status: 'received'
								}
							}
						})
						.persist();
					const mockShareRepsEndpoint = nock('http://test/')
						.post(`/appeals/${appealId}/reps/publish`)
						.reply(200, [
							{
								...shareRepsResponseFinalComment,
								representationType: testCase.representationType
							}
						]);

					const sharePostResponse = await request.post(`${baseUrl}/${appealId}/share`).send({});

					expect(mockShareRepsEndpoint.isDone()).toBe(true);
					expect(sharePostResponse.statusCode).toBe(302);
					expect(sharePostResponse.text).toBe(
						`Found. Redirecting to /appeals-service/appeal-details/${appealId}`
					);

					const response = await request.get(`${baseUrl}/${appealId}`);

					expect(response.statusCode).toBe(200);

					const notificationBannerHtml = parseHtml(response.text, {
						rootElement: '.govuk-notification-banner--success',
						skipPrettyPrint: true
					}).innerHTML;

					expect(notificationBannerHtml).toContain('Success</h3>');
					expect(notificationBannerHtml).toContain('Final comments shared</p>');
				});
			}

			it('should call the publish representations API endpoint, redirect to the case details page, and render a "Case progressed" success banner, if no final comments were shared', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...appealData,
						appealId,
						appealStatus: 'final_comments',
						documentationSummary: {
							appellantFinalComments: {
								receivedAt: null,
								representationStatus: null,
								status: 'not_received'
							},
							lpaFinalComments: {
								receivedAt: null,
								representationStatus: null,
								status: 'not_received'
							}
						}
					})
					.persist();
				const mockShareRepsEndpoint = nock('http://test/')
					.post(`/appeals/${appealId}/reps/publish`)
					.reply(200, []);

				const sharePostResponse = await request.post(`${baseUrl}/${appealId}/share`).send({});

				expect(mockShareRepsEndpoint.isDone()).toBe(true);
				expect(sharePostResponse.statusCode).toBe(302);
				expect(sharePostResponse.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}`
				);

				const response = await request.get(`${baseUrl}/${appealId}`);

				expect(response.statusCode).toBe(200);

				const notificationBannerHtml = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner--success',
					skipPrettyPrint: true
				}).innerHTML;

				expect(notificationBannerHtml).toContain('Success</h3>');
				expect(notificationBannerHtml).toContain('Case progressed</p>');
			});
		});
	});
});
