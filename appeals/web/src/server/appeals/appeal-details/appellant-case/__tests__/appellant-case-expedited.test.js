// @ts-nocheck
import {
	appealDataFullPlanning,
	appellantCaseDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import { APPEAL_TYPE_OF_PLANNING_APPLICATION } from '@planning-inspectorate/data-model';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appellantCasePagePath = '/appellant-case';

describe('appellant-case-expedited', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	it('should render the appellant case page with expedited fields when present (S78)', async () => {
		const expeditedAppellantCaseData = {
			...appellantCaseDataNotValidated,
			typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL,
			reasonForAppealAppellant: 'My reason for appeal',
			anySignificantChanges: 'Yes',
			anySignificantChanges_localPlanSignificantChanges: 'Local plan changes',
			anySignificantChanges_nationalPolicySignificantChanges: 'National policy changes',
			anySignificantChanges_courtJudgementSignificantChanges: 'Court judgment changes',
			anySignificantChanges_otherSignificantChanges: 'Other changes',
			screeningOpinionIndicatesEiaRequired: true,
			ownershipCertificate: true
		};

		nock('http://test/')
			.get('/appeals/2?include=all')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2
			});
		nock('http://test/').get('/appeals/2/appellant-cases/0').reply(200, expeditedAppellantCaseData);

		const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
		const element = parseHtml(response.text, { skipPrettyPrint: true });

		expect(element.innerHTML).toContain('Why are you appealing?');
		expect(element.innerHTML).toContain('My reason for appeal</dd>');

		expect(element.innerHTML).toContain(
			'Have there been any significant changes that would affect the application?'
		);
		expect(element.innerHTML).toContain('Yes');
		expect(element.innerHTML).toContain('Local plan: Local plan changes');
		expect(element.innerHTML).toContain('National policy: National policy changes');
		expect(element.innerHTML).toContain('Court judgment: Court judgment changes');
		expect(element.innerHTML).toContain('Other: Other changes');

		expect(element.innerHTML).toContain(
			'Did you submit an environmental statement with the application?'
		);
		expect(element.innerHTML).toContain('Yes');

		expect(element.innerHTML).toContain(
			'Did you submit a separate ownership certificate and agricultural land declaration with your application?'
		);
		expect(element.innerHTML).toContain('Yes');
	});
});
