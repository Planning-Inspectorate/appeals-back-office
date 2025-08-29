// @ts-nocheck
import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('owners-known', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the change owners known page with "No" radio option checked if knowsOtherLandowners is "No"', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					siteOwnership: {
						...appellantCaseDataNotValidated.siteOwnership,
						knowsOtherLandowners: 'No'
					}
				});

			const response = await request.get(`${baseUrl}/1/appellant-case/owners-known/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Does the appellant know who owns the land involved in the appeal?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="No" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="Yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="Some">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="not-applicable">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change owners known page with "Yes" radio option checked if knowsOtherLandowners is "Yes"', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					siteOwnership: {
						...appellantCaseDataNotValidated.siteOwnership,
						knowsOtherLandowners: 'Yes'
					}
				});

			const response = await request.get(`${baseUrl}/1/appellant-case/owners-known/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Does the appellant know who owns the land involved in the appeal?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="No">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="Yes" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="Some">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="not-applicable">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change owners known page with "Some" radio option checked if knowsOtherLandowners is "Some"', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					siteOwnership: {
						...appellantCaseDataNotValidated.siteOwnership,
						knowsOtherLandowners: 'Some'
					}
				});

			const response = await request.get(`${baseUrl}/1/appellant-case/owners-known/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Does the appellant know who owns the land involved in the appeal?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="No">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="Yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="Some" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="not-applicable">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change owners known page with "not applicable" radio option checked if knowsOtherLandowners is null', async () => {
			nock('http://test/')
				.get(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					siteOwnership: {
						...appellantCaseDataNotValidated.siteOwnership,
						knowsOtherLandowners: null
					}
				});

			const response = await request.get(`${baseUrl}/1/appellant-case/owners-known/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Does the appellant know who owns the land involved in the appeal?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="No">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="Yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="Some">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="ownersKnownRadio" type="radio" value="not-applicable" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		const validValues = ['No', 'Yes', 'Some', null];

		for (const validValue of validValues) {
			it(`should call appellant cases PATCH endpoint and redirect to the appellant case page if ${
				validValue === null ? validValue : `"${validValue}"`
			} is selected`, async () => {
				const mockAppellantCasesPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/appellant-cases/${appealData.appellantCaseId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/1/appellant-case/owners-known/change`)
					.send({
						knowsOtherOwners: validValue
					});

				expect(mockAppellantCasesPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
				);
			});
		}
	});
});
