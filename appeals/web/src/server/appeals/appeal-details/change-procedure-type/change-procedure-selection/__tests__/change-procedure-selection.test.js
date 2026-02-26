import { appealData } from '#testing/appeals/appeals.js';
import { createTestEnvironment } from '#testing/index.js';
import config from '@pins/appeals.web/environment/config.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const appealDataWithoutStartDate = {
	...appealData,
	startedAt: null
};
const originalFeatureFlags = { ...config.featureFlags };
const appealTypes = [
	{ name: 'S78', appealType: APPEAL_TYPE.S78 },
	{ name: 'S20', appealType: APPEAL_TYPE.PLANNED_LISTED_BUILDING }
];

describe('Change procedure type', () => {
	beforeEach(() => {
		Object.assign(config.featureFlags, {
			featureFlagS78Written: true,
			featureFlagS78Inquiry: true,
			featureFlagS20Hearing: true,
			featureFlagS20Inquiry: true
		});
	});

	afterEach(() => {
		Object.assign(config.featureFlags, originalFeatureFlags);
		teardown();
	});

	describe.each(appealTypes)(
		'GET /change-appeal-procedure-type/change-selected-procedure-type - $name',
		({ appealType }) => {
			it('should render the select procedure page with the expected content', async () => {
				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, {
						...appealDataWithoutStartDate,
						appealType
					});

				const response = await request.get(
					'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
				);

				expect(response.statusCode).toBe(200);

				const html = parseHtml(response.text).innerHTML;

				expect(html).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, {
					rootElement: 'body',
					skipPrettyPrint: true
				});

				expect(unprettifiedElement.innerHTML).toContain(
					'href="/appeals-service/appeal-details/1" class="govuk-back-link">Back</a>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<span class="govuk-caption-l">Appeal 351062 - update appeal procedure</span>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Appeal procedure</h1>');
				expect(unprettifiedElement.innerHTML).toContain(
					`<label class="govuk-label govuk-radios__label" for="appeal-procedure"> Written representations</label>`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="appealProcedure" type="radio" value="hearing">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="appealProcedure" type="radio" value="inquiry">'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});

			it('should render the select procedure page with the expected back link URL, if the backLink query parameter was passed', async () => {
				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, {
						...appealDataWithoutStartDate,
						appealType
					});

				const response = await request.get(
					'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type?backUrl=/test/back/url'
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, {
					rootElement: 'body',
					skipPrettyPrint: true
				});

				expect(unprettifiedElement.innerHTML).toContain(
					'href="/test/back/url" class="govuk-back-link">Back</a>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<span class="govuk-caption-l">Appeal 351062 - update appeal procedure</span>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Appeal procedure</h1>');
				expect(unprettifiedElement.innerHTML).toContain(
					'for="appeal-procedure"> Written representations</label>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="appealProcedure" type="radio" value="hearing">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="appealProcedure" type="radio" value="inquiry">'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});

			it('should render the select procedure page with the expected radio option preselected if an appeal procedure is found in the session', async () => {
				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, {
						...appealDataWithoutStartDate,
						appealType,
						procedureType: 'written'
					});

				const selectProcedurePostResponse = await request
					.post(
						'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
					)
					.send({
						appealProcedure: 'written'
					});

				expect(selectProcedurePostResponse.statusCode).toBe(302);
				expect(selectProcedurePostResponse.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-procedure-type/written/change-timetable'
				);

				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, {
						...appealDataWithoutStartDate,
						appealType
					});

				const response = await request.get(
					'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHtml).toContain('Appeal procedure</h1>');
				expect(unprettifiedHtml).toContain(
					`<label class="govuk-label govuk-radios__label" for="appeal-procedure"> Written representations</label>`
				);
				expect(unprettifiedHtml).toContain(
					'name="appealProcedure" type="radio" value="written" checked>'
				);
				expect(unprettifiedHtml).toContain('name="appealProcedure" type="radio" value="inquiry">');
			});
		}
	);

	it('should show inquiry for S20 when S20 inquiry is enabled even if S78 inquiry is disabled', async () => {
		Object.assign(config.featureFlags, {
			featureFlagS78Inquiry: false,
			featureFlagS20Inquiry: true
		});

		nock('http://test/')
			.get('/appeals/1?include=all')
			.reply(200, {
				...appealDataWithoutStartDate,
				appealType: APPEAL_TYPE.PLANNED_LISTED_BUILDING
			});

		const response = await request.get(
			'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
		);

		expect(response.statusCode).toBe(200);
		const unprettifiedElement = parseHtml(response.text, {
			rootElement: 'body',
			skipPrettyPrint: true
		});

		expect(unprettifiedElement.innerHTML).toContain(
			'name="appealProcedure" type="radio" value="inquiry">'
		);
	});

	describe.each(appealTypes)(
		'POST /change-appeal-procedure-type/change-selected-procedure-type Written to Written - $name',
		({ appealType }) => {
			it('should re-render the select procedure page with the expected error message if no radio option was selected', async () => {
				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, {
						...appealDataWithoutStartDate,
						appealType
					});

				const response = await request
					.post(
						'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
					)
					.send({});

				expect(response.statusCode).toBe(200);

				const html = parseHtml(response.text).innerHTML;

				expect(html).toMatchSnapshot();

				const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHtml).toContain('Appeal procedure</h1>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: '.govuk-error-summary'
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain('Select the appeal procedure</a>');
			});

			it('should redirect to the timetable due page if a existing procedure is Written and change to Written', async () => {
				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, {
						...appealDataWithoutStartDate,
						appealType,
						procedureType: 'written'
					});

				const response = await request
					.post(
						'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
					)
					.send({
						appealProcedure: 'written'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-procedure-type/written/change-timetable'
				);
			});
		}
	);

	describe.each(appealTypes)(
		'POST /change-appeal-procedure-type/change-selected-procedure-type Written to Hearing - $name',
		({ appealType }) => {
			it('should re-render the select procedure page with the expected error message if no radio option was selected', async () => {
				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, {
						...appealDataWithoutStartDate,
						appealType,
						procedureType: 'written'
					});

				const response = await request
					.post(
						'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
					)
					.send({});

				expect(response.statusCode).toBe(200);

				const html = parseHtml(response.text).innerHTML;

				expect(html).toMatchSnapshot();

				const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHtml).toContain('Appeal procedure</h1>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: '.govuk-error-summary'
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain('Select the appeal procedure</a>');
			});
		}
	);
});
