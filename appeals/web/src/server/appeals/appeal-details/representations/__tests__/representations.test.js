import { parseHtml } from '@pins/platform';
import { createTestEnvironment } from '#testing/index.js';
import supertest from 'supertest';
import nock from 'nock';
import { appealData } from '#testing/app/fixtures/referencedata.js';

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
				`<a href="/appeals-service/appeal-details/1/interested-party-comments#valid"`
			);
		});
	});
});
