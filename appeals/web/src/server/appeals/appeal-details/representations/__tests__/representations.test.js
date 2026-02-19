import usersService from '#appeals/appeal-users/users-service.js';
import {
	activeDirectoryUsersData,
	appealData,
	appellantFinalCommentsAwaitingReview,
	caseNotes,
	lpaFinalCommentsAwaitingReview,
	shareRepsResponseFinalComment
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('representations', () => {
	afterEach(teardown);
	describe('GET /share', () => {
		const numIpComments = 1;
		it('should contain link to interested-party-comments#valid', async () => {
			const appealWithStatments = {
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
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealWithStatments);
			const response = await request.get(`${baseUrl}/1/share`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Share IP comments and statements</h1>');
			expect(element.innerHTML).toContain(
				`<a href="/appeals-service/appeal-details/1/interested-party-comments?backUrl=%2Fappeals-service%2Fappeal-details%2F1%2Fshare#valid"`
			);
		});

		it('should contain correct content if inquiry and proof of evidence and no ip comment or statement to share', async () => {
			const appealWithStatments = {
				...appealData,
				procedureType: 'inquiry',
				appealStatus: 'statements',
				documentationSummary: {}
			};
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealWithStatments);
			const response = await request.get(`${baseUrl}/1/share`);
			const snapshotResponse = parseHtml(response.text);
			const textResponse = parseHtml(response.text, {
				skipPrettyPrint: true
			});

			expect(snapshotResponse.innerHTML).toMatchSnapshot();
			expect(textResponse.innerHTML).toContain('Progress to proof of evidence and witnesses</h1>');
			expect(textResponse.innerHTML).toContain(
				`<div class="govuk-grid-column-two-thirds">There are no statements or interested party comments to share.`
			);
			expect(textResponse.innerHTML.toString()).toContain(
				`Warning</span> Do not progress to proof of evidence and witnesses if you are awaiting any late statements or interested party comments.</strong>`
			);
			expect(textResponse.innerHTML).toContain(
				`Progress to proof of evidence and witnesses</button>`
			);
		});

		it('should contain correct content if inquiry and proof of evidence and status is set to "EVIDENCE" and no proof of evidence to share', async () => {
			const appealWithStatments = {
				...appealData,
				procedureType: 'inquiry',
				appealStatus: 'evidence',
				documentationSummary: {},
				appealTimetable: {
					proofOfEvidenceAndWitnessesDueDate: '2024-12-04'
				}
			};
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealWithStatments);
			const response = await request.get(`${baseUrl}/1/share`);
			const snapshotResponse = parseHtml(response.text);
			const textResponse = parseHtml(response.text, {
				skipPrettyPrint: true
			});

			expect(snapshotResponse.innerHTML).toMatchSnapshot();
			expect(textResponse.innerHTML).toContain('Progress to inquiry</h1>');
			expect(textResponse.innerHTML).toContain(
				`<p class="govuk-body">There are no proof of evidence and witnesses to share`
			);
			expect(textResponse.innerHTML.toString()).toContain(
				`Warning</span> Do not progress to inquiry if you are awaiting any late proof of evidence and witnesses.</strong>`
			);
			expect(textResponse.innerHTML).toContain(`Progress to inquiry</button>`);
		});

		it('should contain correct content if inquiry and PoE and status is set to "EVIDENCE" and incomplete PoEs to share', async () => {
			const appealWithInvalidPoEs = {
				...appealData,
				procedureType: 'inquiry',
				appealStatus: 'evidence',
				documentationSummary: {
					appellantProofOfEvidence: {
						representationStatus: 'incomplete'
					},
					lpaProofOfEvidence: {
						representationStatus: 'incomplete'
					}
				},
				appealTimetable: {
					proofOfEvidenceAndWitnessesDueDate: '2024-12-04'
				}
			};
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealWithInvalidPoEs);
			const response = await request.get(`${baseUrl}/1/share`);
			const snapshotResponse = parseHtml(response.text);
			const textResponse = parseHtml(response.text, {
				skipPrettyPrint: true
			});

			expect(snapshotResponse.innerHTML).toMatchSnapshot();
			expect(textResponse.querySelector('h1')?.innerHTML?.trim()).toBe(
				'Confirm that you want to share proof of evidence'
			);
			expect(textResponse.querySelector('p.govuk-body')?.textContent).toContain(
				`We’ll share appellant proof of evidence and LPA proof of evidence with the relevant parties.`
			);
			expect(
				textResponse.querySelectorAll('p.govuk-body a.govuk-link')[0]?.getAttribute('href')
			).toBe(
				`/appeals-service/appeal-details/1/proof-of-evidence/appellant/manage-documents?backUrl=%2Fappeals-service%2Fappeal-details%2F1%2Fshare`
			);
			expect(
				textResponse.querySelectorAll('p.govuk-body a.govuk-link')[1]?.getAttribute('href')
			).toBe(
				`/appeals-service/appeal-details/1/proof-of-evidence/lpa/manage-documents?backUrl=%2Fappeals-service%2Fappeal-details%2F1%2Fshare`
			);
			expect(textResponse.innerHTML.toString()).toContain(
				`Warning</span> Do not share until you have reviewed all of the supporting documents and redacted any sensitive information.</strong>`
			);
			expect(textResponse.querySelector('form button.govuk-button')?.textContent?.trim()).toBe(
				'Share proof of evidence and witnesses'
			);
		});

		it('should show singular "party" text when there is 1 interested party comment to share', async () => {
			const numIpComments = 1;
			const appealWithStatements = {
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
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealWithStatements);

			const response = await request.get(`${baseUrl}/1/share`);
			const textResponse = parseHtml(response.text, { skipPrettyPrint: true });

			expect(textResponse.innerHTML).toContain('with the relevant party.');
			expect(textResponse.innerHTML).not.toContain('with the relevant parties.');
		});

		it('should show plural "parties" text when there are multiple interested party comments to share', async () => {
			const numIpComments = 3;
			const appealWithStatements = {
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
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealWithStatements);

			const response = await request.get(`${baseUrl}/1/share`);
			const textResponse = parseHtml(response.text, { skipPrettyPrint: true });

			expect(textResponse.innerHTML).toContain('with the relevant parties.');
			expect(textResponse.innerHTML).not.toContain('with the relevant party.');
		});

		it('should show plural "parties" text when there is at least one rule 6 comment', async () => {
			const appealWithStatements = {
				...appealData,
				appealStatus: 'statements',
				documentationSummary: {
					rule6PartyStatements: {
						'rep-id-1': {
							organisationName: 'Org One',
							representationStatus: 'valid',
							rule6PartyId: 1
						}
					}
				}
			};
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealWithStatements);

			const response = await request.get(`${baseUrl}/1/share`);
			const textResponse = parseHtml(response.text, { skipPrettyPrint: true });

			expect(textResponse.innerHTML).toContain('with the relevant parties.');
			expect(textResponse.innerHTML).not.toContain('with the relevant party.');
		});

		it('should contain links for Rule 6 statements if they exist and are valid', async () => {
			const appealWithRule6 = {
				...appealData,
				appealStatus: 'statements',
				documentationSummary: {
					rule6PartyStatements: {
						'rep-id-1': {
							organisationName: 'Org One',
							representationStatus: 'valid',
							rule6PartyId: 1
						},
						'rep-id-2': {
							organisationName: 'Org Two',
							representationStatus: 'valid',
							rule6PartyId: 2
						}
					}
				}
			};
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealWithRule6);
			const response = await request.get(`${baseUrl}/1/share`);
			const textResponse = parseHtml(response.text, { skipPrettyPrint: true });

			expect(textResponse.innerHTML).toContain('1 Org One statement');
			expect(textResponse.innerHTML).toContain('1 Org Two statement');
		});

		it('should display correctly when LPA, Appellant, and Rule 6 statements all exist', async () => {
			const appealWithAll = {
				...appealData,
				appealType: 'Enforcement notice appeal',
				appealStatus: 'statements',
				documentationSummary: {
					lpaStatement: {
						representationStatus: 'valid'
					},
					appellantStatement: {
						representationStatus: 'valid'
					},
					rule6PartyStatements: {
						'rep-id-1': {
							organisationName: 'Org One',
							representationStatus: 'valid',
							rule6PartyId: 1
						},
						'rep-id-2': {
							organisationName: 'Org Two',
							representationStatus: 'valid',
							rule6PartyId: 2
						}
					}
				}
			};
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealWithAll);
			const response = await request.get(`${baseUrl}/1/share`);
			const textResponse = parseHtml(response.text, { skipPrettyPrint: true });

			expect(textResponse.innerHTML).toContain('1 LPA statement</a>,');
			expect(textResponse.innerHTML).toContain('1 appellant statement</a>,');
			expect(textResponse.innerHTML).toContain('1 Org One statement</a>');
			expect(textResponse.innerHTML).toContain(
				'and <a href="/appeals-service/appeal-details/1/rule-6-party-statement/2?backUrl=%2Fappeals-service%2Fappeal-details%2F1%2Fshare" class="govuk-link">1 Org Two statement</a>'
			);
		});

		it('should display correctly when matching comments and statements exist', async () => {
			const appealWithAll = {
				...appealData,
				appealType: 'Enforcement notice appeal',
				appealStatus: 'statements',
				documentationSummary: {
					ipComments: {
						counts: {
							valid: 2
						}
					},
					lpaStatement: {
						representationStatus: 'valid'
					},
					appellantStatement: {
						representationStatus: 'valid'
					},
					rule6PartyStatements: {
						'rep-id-1': {
							organisationName: 'Org One',
							representationStatus: 'valid',
							rule6PartyId: 1
						}
					}
				}
			};
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealWithAll);
			const response = await request.get(`${baseUrl}/1/share`);
			const textResponse = parseHtml(response.text, { skipPrettyPrint: true });

			expect(textResponse.innerHTML).toContain('2 interested party comments</a>,');
			expect(textResponse.innerHTML).toContain('1 LPA statement</a>');
			expect(textResponse.innerHTML).toContain('1 appellant statement</a>');
			expect(textResponse.innerHTML).toContain(
				'and <a href="/appeals-service/appeal-details/1/rule-6-party-statement/1?backUrl=%2Fappeals-service%2Fappeal-details%2F1%2Fshare" class="govuk-link">1 Org One statement</a>'
			);
		});

		it('should not include appellant statement for unsupported appeal types', async () => {
			const unsupportedAppeal = {
				...appealData,
				appealType: 'Planning appeal',
				appealStatus: 'statements',
				documentationSummary: {
					lpaStatement: {
						representationStatus: 'valid'
					},
					appellantStatement: {
						representationStatus: 'valid'
					}
				}
			};
			nock('http://test/').get('/appeals/1?include=all').reply(200, unsupportedAppeal);
			const response = await request.get(`${baseUrl}/1/share`);
			const textResponse = parseHtml(response.text, { skipPrettyPrint: true });

			expect(textResponse.innerHTML).toContain('1 LPA statement');
			expect(textResponse.innerHTML).not.toContain('1 appellant statement');
		});

		it('should NOT display Rule 6 statements if they are not valid or incomplete', async () => {
			const appealWithInvalidRule6 = {
				...appealData,
				appealStatus: 'statements',
				documentationSummary: {
					rule6PartyStatements: {
						'rep-id-1': {
							organisationName: 'Org One',
							representationStatus: 'awaiting_review'
						},
						'rep-id-2': {
							organisationName: 'Org Two',
							representationStatus: 'invalid'
						},
						'rep-id-3': {
							organisationName: 'Org Three',
							representationStatus: 'valid'
						}
					}
				}
			};
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealWithInvalidRule6);
			const response = await request.get(`${baseUrl}/1/share`);
			const textResponse = parseHtml(response.text, { skipPrettyPrint: true });

			expect(textResponse.innerHTML).not.toContain('Org One statement');
			expect(textResponse.innerHTML).not.toContain('Org Two statement');
			expect(textResponse.innerHTML).toContain('1 Org Three statement');
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
					.get('/appeals/1/reps?type=appellant_final_comment,lpa_final_comment')
					.reply(200, {
						itemCount: 2,
						items: [
							...appellantFinalCommentsAwaitingReview.items,
							...lpaFinalCommentsAwaitingReview.items
						]
					})
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
						.get(`/appeals/${appealId}?include=all`)
						.reply(200, {
							...appealData,
							appealType: 'Planning appeal',
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
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, {
						...appealData,
						appealType: 'Planning appeal',
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
