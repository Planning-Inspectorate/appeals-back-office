// @ts-nocheck
import {
	appealData,
	appealDataFullPlanning,
	appellantCaseDataNotValidated,
	documentRedactionStatuses
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import {
	APPEAL_APPLICATION_DECISION,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from '@planning-inspectorate/data-model';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appellantCasePagePath = '/appellant-case';

//@ts-ignore
const mapExistsFromAppeal = (appeal) => ({
	id: appeal.appealId,
	appealId: appeal.appealId,
	appealReference: appeal.appealReference
});

describe('appellant-case-expedited', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	it('should render the appellant case page with expedited fields when present (S78)', async () => {
		const expeditedAppellantCaseData = {
			...appellantCaseDataNotValidated,
			applicationDate: '2026-04-02T00:00:00.000Z',
			applicationDecision: APPEAL_APPLICATION_DECISION.REFUSED,
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

		const appeal = { ...appealDataFullPlanning, appealId: 2 };
		nock('http://test/').get('/appeals/2/exists').reply(200, mapExistsFromAppeal(appeal));
		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, documentRedactionStatuses);
		nock('http://test/')
			.get('/appeals/2/appellant-case')
			.reply(200, {
				...expeditedAppellantCaseData,
				appealType: appeal.appealType,
				documentationSummary: appeal.documentationSummary
			});

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

		expect(element.innerHTML).toContain('Draft statement of common ground');
	});

	it.each([
		{
			type: 'Householder',
			appealType: undefined,
			typeOfPlanningApplication: undefined,
			reason: 'My reason for Householder appeal'
		},
		{
			type: 'CAS planning',
			appealType: 'CAS planning',
			typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.MINOR_COMMERCIAL_DEVELOPMENT,
			reason: 'My reason for CAS planning appeal'
		},
		{
			type: 'CAS advert',
			appealType: 'CAS advert',
			typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.ADVERTISEMENT,
			reason: 'My reason for CAS advert appeal'
		}
	])(
		'should render the appellant case page with expedited fields when present ($type)',
		async ({ appealType, typeOfPlanningApplication, reason }) => {
			const expeditedAppellantCaseData = {
				...appellantCaseDataNotValidated,
				applicationDate: '2026-04-01T00:00:00.000Z',
				reasonForAppealAppellant: reason,
				...(typeOfPlanningApplication && { typeOfPlanningApplication })
			};

			const appeal = {
				...appealData,
				appealId: 1,
				...(appealType && { appealType })
			};
			nock('http://test/').get('/appeals/1/exists').reply(200, mapExistsFromAppeal(appeal));
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/appellant-case')
				.reply(200, {
					...expeditedAppellantCaseData,
					appealType: appeal.appealType,
					documentationSummary: appeal.documentationSummary
				});

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);
			const element = parseHtml(response.text, { skipPrettyPrint: true });

			expect(element.innerHTML).toContain('Why are you appealing?');
			expect(element.innerHTML).toContain(reason);
			expect(element.innerHTML).toContain('4. Appeal details</h2>');
			expect(element.innerHTML).toContain('5. Upload documents</h2>');
		}
	);

	it.each([
		{ decision: 'refused', applicationDecision: APPEAL_APPLICATION_DECISION.REFUSED },
		{ decision: 'granted', applicationDecision: APPEAL_APPLICATION_DECISION.GRANTED }
	])(
		'should render expedited fields for S78 + removal-or-variation-of-conditions + $decision',
		async ({ applicationDecision }) => {
			const expeditedAppellantCaseData = {
				...appellantCaseDataNotValidated,
				applicationDate: '2026-04-02T00:00:00.000Z',
				applicationDecision,
				typeOfPlanningApplication:
					APPEAL_TYPE_OF_PLANNING_APPLICATION.REMOVAL_OR_VARIATION_OF_CONDITIONS,
				reasonForAppealAppellant: 'My reason',
				anySignificantChanges: 'No',
				screeningOpinionIndicatesEiaRequired: false,
				ownershipCertificate: false
			};

			const appeal = { ...appealDataFullPlanning, appealId: 2 };
			nock('http://test/').get('/appeals/2/exists').reply(200, mapExistsFromAppeal(appeal));
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/2/appellant-case')
				.reply(200, {
					...expeditedAppellantCaseData,
					appealType: appeal.appealType,
					documentationSummary: appeal.documentationSummary
				});

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text, { skipPrettyPrint: true });

			expect(element.innerHTML).toContain('Why are you appealing?');
			expect(element.innerHTML).toContain('My reason</dd>');
			expect(element.innerHTML).toContain(
				'Have there been any significant changes that would affect the application?'
			);
			expect(element.innerHTML).toContain(
				'Did you submit an environmental statement with the application?'
			);
			expect(element.innerHTML).toContain('Draft statement of common ground');
		}
	);

	it.each([
		{ decision: 'refused', applicationDecision: APPEAL_APPLICATION_DECISION.REFUSED },
		{ decision: 'granted', applicationDecision: APPEAL_APPLICATION_DECISION.GRANTED }
	])(
		'should render expedited fields for S78 + permission-in-principle + $decision',
		async ({ applicationDecision }) => {
			const expeditedAppellantCaseData = {
				...appellantCaseDataNotValidated,
				applicationDate: '2026-04-02T00:00:00.000Z',
				applicationDecision,
				typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.PERMISSION_IN_PRINCIPLE,
				reasonForAppealAppellant: 'My reason',
				anySignificantChanges: 'No',
				screeningOpinionIndicatesEiaRequired: false,
				ownershipCertificate: false
			};

			const appeal = { ...appealDataFullPlanning, appealId: 2 };
			nock('http://test/').get('/appeals/2/exists').reply(200, mapExistsFromAppeal(appeal));
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/2/appellant-case')
				.reply(200, {
					...expeditedAppellantCaseData,
					appealType: appeal.appealType,
					documentationSummary: appeal.documentationSummary
				});

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text, { skipPrettyPrint: true });

			expect(element.innerHTML).toContain('Why are you appealing?');
			expect(element.innerHTML).toContain('My reason</dd>');
			expect(element.innerHTML).toContain(
				'Have there been any significant changes that would affect the application?'
			);
			expect(element.innerHTML).toContain(
				'Did you submit an environmental statement with the application?'
			);
			expect(element.innerHTML).toContain('Draft statement of common ground');
		}
	);

	it('should not render appeal statement when ownershipCertificate is null', async () => {
		const expeditedAppellantCaseData = {
			...appellantCaseDataNotValidated,
			applicationDate: '2026-04-02T00:00:00.000Z',
			applicationDecision: APPEAL_APPLICATION_DECISION.GRANTED,
			typeOfPlanningApplication:
				APPEAL_TYPE_OF_PLANNING_APPLICATION.REMOVAL_OR_VARIATION_OF_CONDITIONS,
			reasonForAppealAppellant: 'My reason',
			anySignificantChanges: 'No',
			screeningOpinionIndicatesEiaRequired: false,
			ownershipCertificate: null
		};

		const appeal = { ...appealDataFullPlanning, appealId: 2 };
		nock('http://test/').get('/appeals/2/exists').reply(200, mapExistsFromAppeal(appeal));
		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, documentRedactionStatuses);
		nock('http://test/')
			.get('/appeals/2/appellant-case')
			.reply(200, {
				...expeditedAppellantCaseData,
				appealType: appeal.appealType,
				documentationSummary: appeal.documentationSummary
			});

		const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
		const element = parseHtml(response.text, { skipPrettyPrint: true });

		expect(element.innerHTML).not.toContain('Appeal statement');
	});
});
