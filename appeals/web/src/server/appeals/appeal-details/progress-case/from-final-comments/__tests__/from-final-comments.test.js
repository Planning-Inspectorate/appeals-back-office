import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import { appealData } from '#testing/appeals/appeals.js';

const { app } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('from-final-comments', () => {
	const appealId = 1;
	const testCases = [
		{
			conditionName: 'both Appellant and LPA Final Comments are valid',
			appealData: {
				...appealData,
				appealTimetable: {
					finalCommentsDueDate: '2024-09-24T22:59:00.000Z'
				},
				documentationSummary: {
					lpaFinalComments: {
						representationStatus: 'valid'
					},
					appellantFinalComments: {
						representationStatus: 'valid'
					}
				}
			},
			heading: 'Confirm that you want to share final comments',
			infoText: `We’ll share <a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/appellant">appellant final comments</a> and <a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/lpa">LPA final comments</a> with the relevant parties.`,
			warningText:
				'Do not share until you have reviewed all of the supporting documents and redacted any sensitive information.',
			submitButtonText: 'Share final comments'
		},
		{
			conditionName: 'Appellant Final Comments are valid (but not LPA)',
			appealData: {
				...appealData,
				appealTimetable: {
					finalCommentsDueDate: '2024-09-24T22:59:00.000Z'
				},
				documentationSummary: {
					lpaFinalComments: {
						representationStatus: null
					},
					appellantFinalComments: {
						representationStatus: 'valid'
					}
				}
			},
			heading: 'Confirm that you want to share final comments',
			infoText: `We’ll share <a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/appellant">appellant final comments</a> with the relevant parties.`,
			warningText:
				'Do not share until you have reviewed all of the supporting documents and redacted any sensitive information.',
			submitButtonText: 'Share final comments'
		},
		{
			conditionName: 'LPA Final Comments are valid (but not Appellant)',
			appealData: {
				...appealData,
				appealTimetable: {
					finalCommentsDueDate: '2024-09-24T22:59:00.000Z'
				},
				documentationSummary: {
					lpaFinalComments: {
						representationStatus: 'valid'
					},
					appellantFinalComments: {
						representationStatus: null
					}
				}
			},
			heading: 'Confirm that you want to share final comments',
			infoText: `We’ll share <a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/lpa">LPA final comments</a> with the relevant parties.`,
			warningText:
				'Do not share until you have reviewed all of the supporting documents and redacted any sensitive information.',
			submitButtonText: 'Share final comments'
		},
		{
			conditionName: 'both Appellant and LPA Final Comments are absent or invalid',
			appealData: {
				...appealData,
				appealTimetable: {
					finalCommentsDueDate: '2024-09-24T22:59:00.000Z'
				},
				documentationSummary: {
					lpaFinalComments: {
						representationStatus: null
					},
					appellantFinalComments: {
						representationStatus: null
					}
				}
			},
			heading: 'Progress case',
			infoText: `There are no final comments to share.`,
			warningText: 'Do not progress the case if you are awaiting any late final comments.',
			submitButtonText: 'Progress case'
		}
	];

	beforeEach(() => {
		nock.cleanAll();
	});

	for (const testCase of testCases) {
		it(`should render a progress case from final comments with the expected content when Final Comments Due Date has passed and ${testCase.conditionName}.`, async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...testCase.appealData
				})
				.persist();

			const response = await request.get(
				`${baseUrl}/${appealId}/progress-case/from-final-comments`
			);

			const unprettifiedElementHtml = parseHtml(response.text, {
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedElementHtml).toContain(`${testCase.heading}</h1>`);
			expect(unprettifiedElementHtml).toContain(`${testCase.infoText}</p>`);
			expect(unprettifiedElementHtml).toContain(`${testCase.warningText}</strong>`);
			expect(unprettifiedElementHtml).toContain(`${testCase.submitButtonText}</button>`);
		});
	}

	it('should render the 500 error page if Final Comments Due Date has not passed', async () => {
		nock('http://test/')
			.get(`/appeals/${appealId}`)
			.reply(200, {
				...appealData,
				appealTimetable: {
					finalCommentsDueDate: '3000-09-24T22:59:00.000Z'
				}
			})
			.persist();

		const response = await request.get(`${baseUrl}/${appealId}/progress-case/from-final-comments`);
		expect(response.statusCode).toBe(500);
		const element = parseHtml(response.text);
		expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
	});
});
