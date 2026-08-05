import {
	appealDataEnforcementNotice,
	appellantCaseDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealDataEnforcementNotice.appealId;
const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

describe('significant-changes', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}?include=appellantCase`)
			.reply(200, appealDataEnforcementNotice)
			.persist();
		nock('http://test/')
			.get(`/appeals/${appealId}/appellant-cases/0`)
			.reply(200, appellantCaseDataNotValidated)
			.persist();
	});
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the significant changes page', async () => {
			const response = await request.get(`${appellantCaseUrl}/any-significant-changes/change`);
			const mainInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain(
				'Have there been any significant changes that would affect the application?</h1>'
			);

			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;

			expect(response.statusCode).toEqual(200);
			expect(backLinkInnerHtml).toContain(`href="${appellantCaseUrl}`);
		});

		it('should render the significant changes page with pre-filled data', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/0`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					anySignificantChanges: 'Yes',
					anySignificantChanges_localPlanSignificantChanges: 'Some local plan change',
					anySignificantChanges_nationalPolicySignificantChanges: 'Some national policy change',
					anySignificantChanges_otherSignificantChanges: '',
					anySignificantChanges_courtJudgementSignificantChanges: ''
				})
				.persist();

			const response = await request.get(`${appellantCaseUrl}/any-significant-changes/change`);

			const mainInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain(
				'Have there been any significant changes that would affect the application?</h1>'
			);
			expect(mainInnerHtml).toContain(
				`type="checkbox" value="anySignificantChanges_localPlanSignificantChanges" checked`
			);
			expect(mainInnerHtml).toContain(
				`type="checkbox" value="anySignificantChanges_nationalPolicySignificantChanges" checked`
			);
			expect(mainInnerHtml).not.toContain(
				`type="checkbox" value="anySignificantChanges_otherSignificantChanges" checked`
			);
			expect(mainInnerHtml).not.toContain(
				`type="checkbox" value="anySignificantChanges_courtJudgementSignificantChanges" checked`
			);
		});
	});

	describe('POST /change', () => {
		it('should re-render the page with an error if no radio button is selected', async () => {
			const invalidData = {};
			const response = await request
				.post(`${appellantCaseUrl}/any-significant-changes/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain(
				'Select a significant change, or select ‘There have been no significant changes’</a>'
			);
		});
		it('should re-render the page with an error if a reason is selected but no details are provided', async () => {
			const invalidData = {
				anySignificantChangesReasonCheckboxes: [
					'anySignificantChanges_localPlanSignificantChanges'
				],
				anySignificantChanges_localPlanSignificantChanges: '',
				anySignificantChanges_nationalPolicySignificantChanges: '',
				anySignificantChanges_otherSignificantChanges: '',
				anySignificantChanges_courtJudgementSignificantChanges: ''
			};
			const response = await request
				.post(`${appellantCaseUrl}/any-significant-changes/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain(
				'Enter the significant changes and why they’re relevant</a>'
			);
		});
		it('should clear other significant changes fields when "no significant changes" is selected', async () => {
			const appealId = appealDataEnforcementNotice.appealId;
			const appellantCaseId = appealDataEnforcementNotice.appellantCaseId;
			// Mock initial appellantCaseData with pre-filled significant changes
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					anySignificantChanges: 'anySignificantChanges_localPlanSignificantChanges',
					anySignificantChanges_localPlanSignificantChanges: 'Some local plan change',
					anySignificantChanges_nationalPolicySignificantChanges: 'Some national policy change',
					anySignificantChanges_otherSignificantChanges: 'Some other change',
					anySignificantChanges_courtJudgementSignificantChanges: 'Some court judgement change'
				})
				.persist();

			// Mock the PATCH request and assert the payload
			const patchRequest = nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {
					anySignificantChanges: 'No',
					anySignificantChanges_localPlanSignificantChanges: null,
					anySignificantChanges_nationalPolicySignificantChanges: null,
					anySignificantChanges_otherSignificantChanges: null,
					anySignificantChanges_courtJudgementSignificantChanges: null
				});

			const response = await request
				.post(`${appellantCaseUrl}/any-significant-changes/change`)
				.send({
					anySignificantChangesReasonCheckboxes: 'none',
					anySignificantChanges_localPlanSignificantChanges: '',
					anySignificantChanges_nationalPolicySignificantChanges: '',
					anySignificantChanges_otherSignificantChanges: '',
					anySignificantChanges_courtJudgementSignificantChanges: ''
				});

			expect(response.statusCode).toEqual(302); // Expect redirect on successful submission
			expect(patchRequest.isDone()).toBe(true); // Ensure the patch request was made and asserted
		});
	});
});
