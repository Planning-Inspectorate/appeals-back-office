// @ts-nocheck
import { fileUploadInfo } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);

const genericAppealData = {
	appealId: 999,
	appealReference: 'APP/Q9999/W/generic/0000001',
	appealStatus: 'ready_to_start',
	appealType: 'Tree preservation order',
	createdAt: '2026-09-19T00:00:00.000Z',
	localPlanningDepartment: '',
	planningApplicationReference: null,
	appealSite: {
		addressId: 1,
		addressLine1: '',
		postCode: ''
	},
	appellant: null,
	agent: null,
	caseOfficer: null,
	inspector: null,
	assignedTeam: null,
	documentationSummary: {
		appellantCase: {
			status: 'received',
			receivedAt: '2026-09-19T00:00:00.000Z'
		}
	},
	appellantCaseFolder: {
		folderId: 101,
		path: 'appellant-case/appellantCase',
		documentCount: 0
	},
	lpaQuestionnaireFolder: {
		folderId: 102,
		path: 'lpa-questionnaire/lpaQuestionnaire',
		documentCount: 0
	},
	decision: {
		folderId: 1,
		path: 'appeal-decision/case-decision-letter'
	}
};

describe('generic appeal details', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	beforeEach(() => {
		nock('http://test/').get('/appeals/999/page-details').reply(200, genericAppealData).persist();

		nock('http://test/').get('/appeals/999').query(true).reply(200, genericAppealData).persist();

		nock('http://test/')
			.get('/appeals/999/exists')
			.reply(200, {
				id: 999,
				appealId: 999,
				appealReference: genericAppealData.appealReference
			})
			.persist();

		nock('http://test/').get('/appeals/999/case-notes').reply(200, []).persist();
	});

	it('should display the generated case reference at the top of the page (Scenario 2)', async () => {
		const response = await request.get('/appeals-service/appeal-details/999');
		expect(response.statusCode).toBe(200);

		expect(response.text).toContain('Case details - 0000001');
		const html = parseHtml(response.text);
		expect(html.querySelector('.govuk-caption-l')?.innerHTML).toContain('0000001');
		expect(html.querySelector('.appeal-linked-appeals')).toBeNull();
		expect(response.text).not.toContain('Linked appeals');
	});

	it('should display Case created banner above Start case banner after creating a case, and clear it on subsequent visit (Scenarios 7, 8, 9)', async () => {
		nock.cleanAll();

		nock('http://test/').post('/appeals').reply(200, {
			appealId: 999,
			reference: genericAppealData.appealReference,
			status: 'ready_to_start'
		});

		nock('http://test/').get('/appeals/999/page-details').reply(200, genericAppealData).persist();

		nock('http://test/').get('/appeals/999').query(true).reply(200, genericAppealData).persist();

		nock('http://test/')
			.get('/appeals/999/exists')
			.reply(200, {
				id: 999,
				appealId: 999,
				appealReference: genericAppealData.appealReference
			})
			.persist();

		nock('http://test/').get('/appeals/999/case-notes').reply(200, []).persist();

		await request.post('/appeals-service/create-a-case/select-case-type').send({
			caseType: 'Tree preservation order'
		});
		await request.post('/appeals-service/create-a-case/submission-date').send({
			'submission-date-day': '19',
			'submission-date-month': '9',
			'submission-date-year': '2026'
		});
		const createResponse = await request.post('/appeals-service/create-a-case/check-details');
		expect(createResponse.statusCode).toBe(302);
		expect(createResponse.headers.location).toBe('/appeals-service/appeal-details/999');

		const firstResponse = await request.get('/appeals-service/appeal-details/999');
		expect(firstResponse.statusCode).toBe(200);

		const firstHtml = parseHtml(firstResponse.text);
		const banners = firstHtml.querySelectorAll('.govuk-notification-banner');
		expect(banners.length).toBe(3);

		expect(banners[0].classList.contains('govuk-notification-banner--success')).toBe(true);
		expect(banners[0].innerHTML).toContain('Case created');
		expect(banners[1].querySelector('a[data-cy="ready-to-start"]')?.innerHTML.trim()).toBe(
			'Start case'
		);
		expect(banners[2].querySelector('a[data-cy="issue-determination"]')?.innerHTML.trim()).toBe(
			'Issue decision'
		);

		const secondResponse = await request.get('/appeals-service/appeal-details/999');
		expect(secondResponse.statusCode).toBe(200);

		const secondHtml = parseHtml(secondResponse.text);
		const remainingBanners = secondHtml.querySelectorAll('.govuk-notification-banner');
		expect(remainingBanners.length).toBe(2);
		expect(secondResponse.text).not.toContain('Case created');
		expect(remainingBanners[0].querySelector('a[data-cy="ready-to-start"]')?.innerHTML.trim()).toBe(
			'Start case'
		);
		expect(
			remainingBanners[1].querySelector('a[data-cy="issue-determination"]')?.innerHTML.trim()
		).toBe('Issue decision');
	});

	it('should display the Start case and Issue decision banners when appeal is ready_to_start (Scenario 9)', async () => {
		const response = await request.get('/appeals-service/appeal-details/999');
		expect(response.statusCode).toBe(200);

		const html = parseHtml(response.text);
		const startCaseLink = html.querySelector('a[data-cy="ready-to-start"]');
		expect(startCaseLink).not.toBeNull();
		expect(startCaseLink?.innerHTML.trim()).toBe('Start case');

		const issueDecisionLink = html.querySelector('a[data-cy="issue-determination"]');
		expect(issueDecisionLink).not.toBeNull();
		expect(issueDecisionLink?.innerHTML.trim()).toBe('Issue decision');
	});

	it('should display Appeal and LPA questionnaire rows in Documentation table without date column (Scenarios 1 and 2)', async () => {
		const response = await request.get('/appeals-service/appeal-details/999');
		const html = parseHtml(response.text);

		const docTable = html.querySelector('#case-documentation-table');
		expect(docTable).not.toBeNull();

		// Header should not contain Date column
		const headers = Array.from(
			docTable.querySelectorAll('.govuk-table__head .govuk-table__header')
		).map((th) => th.textContent.trim());
		expect(headers).toEqual(['Documentation', 'Status', 'Action']);

		const rows = docTable.querySelectorAll('.govuk-table__body .govuk-table__row');
		expect(rows.length).toBe(2);

		// Appeal row
		const appealRow = rows[0];
		expect(
			appealRow.querySelector('.appeal-appellant-case-documentation')?.textContent.trim()
		).toBe('Appeal');
		expect(appealRow.querySelector('.appeal-appellant-case-status')?.textContent.trim()).toBe(
			'No documents'
		);
		const appealAddLink = appealRow.querySelector('.appeal-appellant-case-actions a');
		expect(appealAddLink?.textContent.trim()).toContain('Add');
		expect(appealAddLink?.getAttribute('href')).toBe(
			'/appeals-service/appeal-details/999/appellant-case/add-documents/101'
		);

		// LPA questionnaire row
		const lpaqRow = rows[1];
		expect(
			lpaqRow.querySelector('.appeal-lpa-questionnaire-documentation')?.textContent.trim()
		).toBe('LPA questionnaire');
		expect(lpaqRow.querySelector('.appeal-lpa-questionnaire-status')?.textContent.trim()).toBe(
			'No documents'
		);
		const lpaqAddLink = lpaqRow.querySelector('.appeal-lpa-questionnaire-actions a');
		expect(lpaqAddLink?.textContent.trim()).toContain('Add');
		expect(lpaqAddLink?.getAttribute('href')).toBe(
			'/appeals-service/appeal-details/999/lpa-questionnaire/add-documents/102'
		);
	});

	it('should display document count and Manage/Add links when documents are added (Scenario 2)', async () => {
		const appealWithDocs = {
			...genericAppealData,
			appellantCaseFolder: {
				folderId: 101,
				path: 'appellant-case/appellantCase',
				documentCount: 2
			},
			lpaQuestionnaireFolder: {
				folderId: 102,
				path: 'lpa-questionnaire/lpaQuestionnaire',
				documentCount: 1
			}
		};

		nock.cleanAll();
		installMockApi();
		nock('http://test/').get('/appeals/999/page-details').reply(200, appealWithDocs).persist();
		nock('http://test/').get('/appeals/999').query(true).reply(200, appealWithDocs).persist();
		nock('http://test/')
			.get('/appeals/999/exists')
			.reply(200, { id: 999, appealId: 999, appealReference: appealWithDocs.appealReference })
			.persist();
		nock('http://test/').get('/appeals/999/case-notes').reply(200, []).persist();

		const response = await request.get('/appeals-service/appeal-details/999');
		const html = parseHtml(response.text);

		const docTable = html.querySelector('#case-documentation-table');
		const rows = docTable.querySelectorAll('.govuk-table__body .govuk-table__row');

		// Appeal row with 2 documents
		const appealRow = rows[0];
		expect(appealRow.querySelector('.appeal-appellant-case-status')?.textContent.trim()).toBe(
			'2 documents'
		);
		const appealActions = Array.from(
			appealRow.querySelectorAll('.appeal-appellant-case-actions a')
		).map((a) => a.textContent.trim());
		expect(appealActions.some((t) => t.includes('Manage'))).toBe(true);
		expect(appealActions.some((t) => t.includes('Add'))).toBe(true);
		expect(appealRow.querySelector('.appeal-appellant-case-actions a')?.getAttribute('href')).toBe(
			'/appeals-service/appeal-details/999/appellant-case/manage-documents/101'
		);

		// LPA questionnaire row with 1 document
		const lpaqRow = rows[1];
		expect(lpaqRow.querySelector('.appeal-lpa-questionnaire-status')?.textContent.trim()).toBe(
			'1 document'
		);
		const lpaqActions = Array.from(
			lpaqRow.querySelectorAll('.appeal-lpa-questionnaire-actions a')
		).map((a) => a.textContent.trim());
		expect(lpaqActions.some((t) => t.includes('Manage'))).toBe(true);
		expect(lpaqActions.some((t) => t.includes('Add'))).toBe(true);
		expect(lpaqRow.querySelector('.appeal-lpa-questionnaire-actions a')?.getAttribute('href')).toBe(
			'/appeals-service/appeal-details/999/lpa-questionnaire/manage-documents/102'
		);
	});

	it('should display Add links on all empty rows and Assign links on Team rows (Scenario 4)', async () => {
		const response = await request.get('/appeals-service/appeal-details/999');
		const html = parseHtml(response.text);

		const lpaRefAction = html.querySelector('.appeal-lpa-reference .govuk-summary-list__actions a');
		expect(lpaRefAction?.innerHTML.trim()).toContain('Add');

		const siteAddressRow = html.querySelector('.appeal-site-address');
		expect(siteAddressRow?.querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
			'No site address'
		);
		const siteAddressAction = siteAddressRow?.querySelector('.govuk-summary-list__actions a');
		expect(siteAddressAction?.innerHTML.trim()).toContain('Add');

		const lpaRow = html.querySelector('.appeal-local-planning-authority');
		expect(lpaRow?.querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
			'No local planning authority'
		);
		const lpaAction = lpaRow?.querySelector('.govuk-summary-list__actions a');
		expect(lpaAction?.innerHTML.trim()).toContain('Add');

		const appellantAction = html.querySelector('.appeal-appellant .govuk-summary-list__actions a');
		expect(appellantAction?.innerHTML.trim()).toContain('Add');

		const agentAction = html.querySelector('.appeal-agent .govuk-summary-list__actions a');
		expect(agentAction?.innerHTML.trim()).toContain('Add');

		const lpaContactAction = html.querySelector(
			'.appeal-lpa-contact-details .govuk-summary-list__actions a'
		);
		expect(lpaContactAction?.innerHTML.trim()).toContain('Add');

		const rule6Action = html.querySelector(
			'.appeal-rule-6-party-contact-details .govuk-summary-list__actions a[data-cy="add-rule-6-party-contact-details"]'
		);
		expect(rule6Action?.innerHTML.trim()).toContain('Add');

		const validDateAction = html.querySelector(
			'.appeal-valid-date .govuk-summary-list__actions a[data-cy="add-valid-date"]'
		);
		expect(validDateAction?.innerHTML.trim()).toContain('Add');
		expect(validDateAction?.getAttribute('href')).toContain('/appellant-case/valid/date');

		const caseTeamAction = html.querySelector('.appeal-case-team .govuk-summary-list__actions a');
		expect(caseTeamAction?.innerHTML.trim()).toContain('Assign');

		const caseOfficerAction = html.querySelector(
			'.appeal-case-officer .govuk-summary-list__actions a'
		);
		expect(caseOfficerAction?.innerHTML.trim()).toContain('Assign');

		const inspectorAction = html.querySelector('.appeal-inspector .govuk-summary-list__actions a');
		expect(inspectorAction?.innerHTML.trim()).toContain('Assign');
	});

	it('should display Change links when rows contain data (Scenario 5)', async () => {
		const populatedData = {
			...genericAppealData,
			planningApplicationReference: 'PLAN/2026/001',
			localPlanningDepartment: 'Wiltshire Council',
			appealSite: {
				addressId: 1,
				addressLine1: '1 High Street',
				town: 'Swindon',
				postCode: 'SN1 1AA'
			},
			appellant: {
				id: 10,
				firstName: 'John',
				lastName: 'Smith',
				email: 'john@smith.test'
			},
			assignedTeam: {
				name: 'Team Bravo',
				email: 'bravo@pins.test'
			}
		};

		nock.cleanAll();
		installMockApi();

		nock('http://test/').get('/appeals/999/page-details').reply(200, populatedData).persist();

		nock('http://test/').get('/appeals/999').query(true).reply(200, populatedData).persist();

		nock('http://test/')
			.get('/appeals/999/exists')
			.reply(200, { id: 999, appealId: 999, appealReference: populatedData.appealReference })
			.persist();

		nock('http://test/').get('/appeals/999/case-notes').reply(200, []).persist();

		const response = await request.get('/appeals-service/appeal-details/999');
		const html = parseHtml(response.text);

		const lpaRefAction = html.querySelector('.appeal-lpa-reference .govuk-summary-list__actions a');
		expect(lpaRefAction?.innerHTML.trim()).toContain('Change');

		const siteAddressAction = html.querySelector(
			'.appeal-site-address .govuk-summary-list__actions a'
		);
		expect(siteAddressAction?.innerHTML.trim()).toContain('Change');

		const lpaAction = html.querySelector(
			'.appeal-local-planning-authority .govuk-summary-list__actions a'
		);
		expect(lpaAction?.innerHTML.trim()).toContain('Change');

		const appellantAction = html.querySelector('.appeal-appellant .govuk-summary-list__actions a');
		expect(appellantAction?.innerHTML.trim()).toContain('Change');

		const validDateAction = html.querySelector(
			'.appeal-valid-date .govuk-summary-list__actions a[data-cy="add-valid-date"]'
		);
		expect(validDateAction?.innerHTML.trim()).toContain('Add');

		const caseTeamAction = html.querySelector('.appeal-case-team .govuk-summary-list__actions a');
		expect(caseTeamAction?.innerHTML.trim()).toContain('Change');
	});

	it('should allow adding an appellant to a generic appeal where no appellant exists', async () => {
		const getResponse = await request.get(
			'/appeals-service/appeal-details/999/service-user/add/appellant'
		);
		expect(getResponse.statusCode).toBe(200);

		const html = parseHtml(getResponse.text);
		expect(html.innerHTML).toContain('Appellant details</h1>');
		expect(html.querySelector('input[name="firstName"]')).not.toBeNull();
		expect(html.querySelector('input[name="lastName"]')).not.toBeNull();
		expect(html.querySelector('input[name="organisationName"]')).not.toBeNull();
		expect(html.querySelector('input[name="emailAddress"]')).not.toBeNull();
		expect(html.querySelector('input[name="phoneNumber"]')).not.toBeNull();

		const validAppellantData = {
			firstName: 'Jane',
			lastName: 'Smith',
			organisationName: 'Woodland Trust',
			emailAddress: 'jane.smith@example.com',
			phoneNumber: '07123456789'
		};

		let patchPayload;
		nock('http://test/')
			.patch('/appeals/999?include=childAppeals', (body) => {
				patchPayload = body;
				return true;
			})
			.reply(200, {
				appellant: validAppellantData
			});

		const postResponse = await request
			.post('/appeals-service/appeal-details/999/service-user/add/appellant')
			.send(validAppellantData);

		expect(postResponse.statusCode).toBe(302);
		expect(postResponse.headers.location).toBe('/appeals-service/appeal-details/999');
		expect(patchPayload).toEqual({
			appellant: {
				firstName: 'Jane',
				lastName: 'Smith',
				organisationName: 'Woodland Trust',
				email: 'jane.smith@example.com',
				phoneNumber: '07123456789'
			}
		});
	});
	it('should display the Timetable section with Appeal submitted date, Valid date with Add link, and Start date', async () => {
		const response = await request.get('/appeals-service/appeal-details/999');
		expect(response.statusCode).toBe(200);

		const html = parseHtml(response.text);
		const timetable = html.querySelector('.appeal-case-timetable');
		expect(timetable).not.toBeNull();

		const submittedRow = timetable?.querySelector('.appeal-submitted-date');
		expect(submittedRow?.querySelector('.govuk-summary-list__key')?.innerHTML.trim()).toBe(
			'Appeal submitted date'
		);
		expect(submittedRow?.querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
			'19 September 2026'
		);
		expect(submittedRow?.querySelector('.govuk-summary-list__actions a')).toBeNull();

		const validRow = timetable?.querySelector('.appeal-valid-date');
		expect(validRow?.querySelector('.govuk-summary-list__key')?.innerHTML.trim()).toBe(
			'Valid date'
		);
		expect(validRow?.querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
			'Not validated'
		);
		const validAction = validRow?.querySelector('.govuk-summary-list__actions a');
		expect(validAction?.innerHTML.trim()).toContain('Add');
		expect(validAction?.getAttribute('href')).toContain('/appellant-case/valid/date');

		const startRow = timetable?.querySelector('.appeal-start-date');
		expect(startRow?.querySelector('.govuk-summary-list__key')?.innerHTML.trim()).toBe(
			'Start date'
		);
		expect(startRow?.querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
			'Not started'
		);
		const startAction = startRow?.querySelector('.govuk-summary-list__actions a');
		expect(startAction?.innerHTML.trim()).toContain('Start');
		expect(startAction?.getAttribute('href')).toContain('/start-case/add?backUrl=');
	});

	it('should display formatted dates and Change link for valid date in the Timetable section when populated', async () => {
		const populatedData = {
			...genericAppealData,
			validAt: '2026-10-01T00:00:00.000Z',
			startedAt: '2026-10-05T00:00:00.000Z'
		};

		nock.cleanAll();
		installMockApi();

		nock('http://test/').get('/appeals/999/page-details').reply(200, populatedData).persist();
		nock('http://test/').get('/appeals/999').query(true).reply(200, populatedData).persist();
		nock('http://test/')
			.get('/appeals/999/exists')
			.reply(200, { id: 999, appealId: 999, appealReference: populatedData.appealReference })
			.persist();
		nock('http://test/').get('/appeals/999/case-notes').reply(200, []).persist();

		const response = await request.get('/appeals-service/appeal-details/999');
		expect(response.statusCode).toBe(200);

		const html = parseHtml(response.text);
		const timetable = html.querySelector('.appeal-case-timetable');

		const validRow = timetable?.querySelector('.appeal-valid-date');
		expect(validRow?.querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
			'1 October 2026'
		);
		const validAction = validRow?.querySelector('.govuk-summary-list__actions a');
		expect(validAction?.innerHTML.trim()).toContain('Change');
		expect(validAction?.getAttribute('href')).toContain('/appellant-case/valid/date');

		const startRow = timetable?.querySelector('.appeal-start-date');
		expect(startRow?.querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
			'5 October 2026'
		);
		const populatedStartAction = startRow?.querySelector('.govuk-summary-list__actions a');
		expect(populatedStartAction?.innerHTML.trim()).toContain('Change');
		expect(populatedStartAction?.getAttribute('href')).toContain('/start-case/change');
	});

	it('should display Rule 6 parties without email address cleanly in contacts section', async () => {
		const rule6Data = {
			...genericAppealData,
			appealRule6Parties: [
				{
					id: 1,
					serviceUserId: 10,
					serviceUser: {
						id: 10,
						organisationName: 'Woodland Trust Friends',
						email: null
					}
				}
			]
		};

		nock.cleanAll();
		installMockApi();

		nock('http://test/').get('/appeals/999/page-details').reply(200, rule6Data).persist();
		nock('http://test/').get('/appeals/999').query(true).reply(200, rule6Data).persist();
		nock('http://test/')
			.get('/appeals/999/exists')
			.reply(200, { id: 999, appealId: 999, appealReference: rule6Data.appealReference })
			.persist();
		nock('http://test/').get('/appeals/999/case-notes').reply(200, []).persist();

		const response = await request.get('/appeals-service/appeal-details/999');
		expect(response.statusCode).toBe(200);

		const html = parseHtml(response.text);

		const rule6Row = html.querySelector('.appeal-rule-6-party-contact-details');
		expect(rule6Row).not.toBeNull();
		const rule6Value = rule6Row.querySelector('.govuk-summary-list__value')?.innerHTML;
		expect(rule6Value).toContain('Woodland Trust Friends');
		expect(rule6Value).not.toContain('null');
		expect(rule6Value).not.toContain('undefined');
	});

	describe('Scenario 1: Non create-a-case appeals should not display Add links on case details rows', () => {
		const nonCreateACaseTypes = ['Planning appeal', 'Householder', 'Enforcement notice appeal'];

		for (const appealType of nonCreateACaseTypes) {
			it(`should not display Add link for: Case officer, Appeal site, Local planning authority, Application reference, Appeal procedure, Valid date, Start date, LPA questionnaire due, Appeal (documentation), LPA questionnaire, Appellant, or LPA for ${appealType}`, async () => {
				const nonGenericAppealData = {
					appealId: 888,
					appealReference: 'APP/Q9999/W/21/0000001',
					appealStatus: 'ready_to_start',
					appealType,
					createdAt: '2026-09-19T00:00:00.000Z',
					localPlanningDepartment: '',
					planningApplicationReference: null,
					appealSite: {
						addressId: 1,
						addressLine1: '',
						postCode: ''
					},
					appellant: null,
					agent: null,
					caseOfficer: null,
					inspector: null,
					assignedTeam: null,
					documentationSummary: {
						appellantCase: {
							status: 'received',
							receivedAt: '2026-09-19T00:00:00.000Z'
						},
						lpaQuestionnaire: {
							status: 'received',
							receivedAt: '2026-09-20T00:00:00.000Z'
						}
					}
				};

				nock.cleanAll();
				installMockApi();

				nock('http://test/')
					.get('/appeals/888/page-details')
					.reply(200, nonGenericAppealData)
					.persist();
				nock('http://test/')
					.get('/appeals/888')
					.query(true)
					.reply(200, nonGenericAppealData)
					.persist();
				nock('http://test/')
					.get('/appeals/888/exists')
					.reply(200, {
						id: 888,
						appealId: 888,
						appealReference: nonGenericAppealData.appealReference
					})
					.persist();
				nock('http://test/').get('/appeals/888/case-notes').reply(200, []).persist();

				const response = await request.get('/appeals-service/appeal-details/888');
				expect(response.statusCode).toBe(200);

				const html = parseHtml(response.text);

				// Case officer
				const caseOfficerAction = html.querySelector(
					'.appeal-case-officer .govuk-summary-list__actions a'
				);
				if (caseOfficerAction) {
					expect(caseOfficerAction.innerHTML.trim()).not.toMatch(/^Add(\s|<|$)/);
				}

				// Appeal site
				const siteAddressAction = html.querySelector(
					'.appeal-site-address .govuk-summary-list__actions a'
				);
				if (siteAddressAction) {
					expect(siteAddressAction.innerHTML.trim()).not.toMatch(/^Add(\s|<|$)/);
				}

				// Local planning authority (LPA in summary)
				const lpaAction = html.querySelector(
					'.appeal-local-planning-authority .govuk-summary-list__actions a'
				);
				if (lpaAction) {
					expect(lpaAction.innerHTML.trim()).not.toMatch(/^Add(\s|<|$)/);
				}

				// Application reference
				const lpaRefAction = html.querySelector(
					'.appeal-lpa-reference .govuk-summary-list__actions a'
				);
				if (lpaRefAction) {
					expect(lpaRefAction.innerHTML.trim()).not.toMatch(/^Add(\s|<|$)/);
				}

				// Appeal procedure
				const procedureAction = html.querySelector(
					'.appeal-case-procedure .govuk-summary-list__actions a'
				);
				if (procedureAction) {
					expect(procedureAction.innerHTML.trim()).not.toMatch(/^Add(\s|<|$)/);
				}

				// Valid date
				const validDateAction = html.querySelector(
					'.appeal-valid-date .govuk-summary-list__actions a'
				);
				if (validDateAction) {
					expect(validDateAction.innerHTML.trim()).not.toMatch(/^Add(\s|<|$)/);
				}

				// Start date
				const startDateAction = html.querySelector(
					'.appeal-start-date .govuk-summary-list__actions a'
				);
				if (startDateAction) {
					expect(startDateAction.innerHTML.trim()).not.toMatch(/^Add(\s|<|$)/);
				}

				// LPA questionnaire due
				const lpaqDueDateAction = html.querySelector(
					'.appeal-lpa-questionnaire-due-date .govuk-summary-list__actions a'
				);
				if (lpaqDueDateAction) {
					expect(lpaqDueDateAction.innerHTML.trim()).not.toMatch(/^Add(\s|<|$)/);
				}

				// Appeal (within documentation section)
				const docTable = html.querySelector('#case-documentation-table');
				if (docTable) {
					const rows = docTable.querySelectorAll('.govuk-table__body .govuk-table__row');
					for (const row of rows) {
						const headerText = row.querySelector('.govuk-table__header')?.innerHTML.trim();
						if (headerText === 'Appeal') {
							const actionCell = row.querySelectorAll('.govuk-table__cell')[2];
							const actionLink = actionCell?.querySelector('a');
							if (actionLink) {
								expect(actionLink.innerHTML.trim()).not.toMatch(/^Add(\s|<|$)/);
							}
						}
						// LPA questionnaire (within documentation section)
						if (headerText === 'LPA questionnaire') {
							const actionCell = row.querySelectorAll('.govuk-table__cell')[2];
							const actionLink = actionCell?.querySelector('a');
							if (actionLink) {
								expect(actionLink.innerHTML.trim()).not.toMatch(/^Add(\s|<|$)/);
							}
						}
					}
				}

				// Appellant
				const appellantAction = html.querySelector(
					'.appeal-appellant .govuk-summary-list__actions a'
				);
				if (appellantAction) {
					expect(appellantAction.innerHTML.trim()).not.toMatch(/^Add(\s|<|$)/);
				}

				// LPA (contact details)
				const lpaContactAction = html.querySelector(
					'.appeal-lpa-contact-details .govuk-summary-list__actions a'
				);
				if (lpaContactAction) {
					expect(lpaContactAction.innerHTML.trim()).not.toMatch(/^Add(\s|<|$)/);
				}
			});
		}
		it('should display all 8 timetable rows with Not provided dates and Add links when case is started without dates (Scenario 7)', async () => {
			const startedBlankData = {
				...genericAppealData,
				appealStatus: 'lpa_questionnaire',
				startedAt: '2026-10-05T00:00:00.000Z',
				procedureType: 'written',
				appealTimetable: {}
			};

			nock.cleanAll();
			installMockApi();

			nock('http://test/').get('/appeals/999/page-details').reply(200, startedBlankData).persist();
			nock('http://test/').get('/appeals/999').query(true).reply(200, startedBlankData).persist();
			nock('http://test/')
				.get('/appeals/999/exists')
				.reply(200, { id: 999, appealId: 999, appealReference: startedBlankData.appealReference })
				.persist();
			nock('http://test/').get('/appeals/999/case-notes').reply(200, []).persist();

			const response = await request.get('/appeals-service/appeal-details/999');
			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text);

			// Issue decision banner displayed
			const issueDecisionBanner = html.querySelector('a[data-cy="issue-determination"]');
			expect(issueDecisionBanner).not.toBeNull();
			expect(issueDecisionBanner?.innerHTML.trim()).toBe('Issue decision');

			// Timetable rows
			const timetableClasses = [
				'appeal-lpa-questionnaire-due-date',
				'appeal-lpa-statement-due-date',
				'appeal-ip-comments-due-date',
				'appeal-final-comments-due-date',
				'appeal-statement-of-common-ground-due-date',
				'appeal-planning-obligation-due-date',
				'appeal-proof-of-evidence-and-witnesses-due-date',
				'appeal-case-management-conference-due-date'
			];

			timetableClasses.forEach((cls) => {
				const row = html.querySelector(`.${cls}`);
				expect(row).not.toBeNull();
				expect(row?.querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
					'Not provided'
				);
				const action = row?.querySelector('.govuk-summary-list__actions a');
				expect(action).not.toBeNull();
				expect(action?.innerHTML.trim()).toContain('Add');
				expect(action?.getAttribute('href')).toContain('/timetable/edit');
			});
		});

		it('should display all 8 timetable rows with formatted dates and Change links when dates are populated (Scenario 7)', async () => {
			const startedPopulatedData = {
				...genericAppealData,
				appealStatus: 'lpa_questionnaire',
				startedAt: '2026-10-05T00:00:00.000Z',
				procedureType: 'inquiry',
				appealTimetable: {
					lpaQuestionnaireDueDate: '2026-10-12T23:00:00.000Z',
					lpaStatementDueDate: '2026-10-19T23:00:00.000Z',
					ipCommentsDueDate: '2026-10-26T23:00:00.000Z',
					finalCommentsDueDate: '2026-11-02T23:00:00.000Z',
					statementOfCommonGroundDueDate: '2026-11-09T23:00:00.000Z',
					planningObligationDueDate: '2026-11-16T23:00:00.000Z',
					proofOfEvidenceAndWitnessesDueDate: '2026-11-23T23:00:00.000Z',
					caseManagementConferenceDueDate: '2026-11-30T23:00:00.000Z'
				}
			};

			nock.cleanAll();
			installMockApi();

			nock('http://test/')
				.get('/appeals/999/page-details')
				.reply(200, startedPopulatedData)
				.persist();
			nock('http://test/')
				.get('/appeals/999')
				.query(true)
				.reply(200, startedPopulatedData)
				.persist();
			nock('http://test/')
				.get('/appeals/999/exists')
				.reply(200, {
					id: 999,
					appealId: 999,
					appealReference: startedPopulatedData.appealReference
				})
				.persist();
			nock('http://test/').get('/appeals/999/case-notes').reply(200, []).persist();

			const response = await request.get('/appeals-service/appeal-details/999');
			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text);

			const timetableClasses = [
				'appeal-lpa-questionnaire-due-date',
				'appeal-lpa-statement-due-date',
				'appeal-ip-comments-due-date',
				'appeal-final-comments-due-date',
				'appeal-statement-of-common-ground-due-date',
				'appeal-planning-obligation-due-date',
				'appeal-proof-of-evidence-and-witnesses-due-date',
				'appeal-case-management-conference-due-date'
			];

			timetableClasses.forEach((cls) => {
				const row = html.querySelector(`.${cls}`);
				expect(row).not.toBeNull();
				expect(row?.querySelector('.govuk-summary-list__value')?.innerHTML.trim()).not.toBe('');
				const action = row?.querySelector('.govuk-summary-list__actions a');
				expect(action).not.toBeNull();
				expect(action?.innerHTML.trim()).toContain('Change');
				expect(action?.getAttribute('href')).toContain('/timetable/edit');
			});
		});

		it('should display event setup component when procedure is hearing or inquiry', async () => {
			const hearingData = {
				...genericAppealData,
				appealStatus: 'lpa_questionnaire',
				startedAt: '2026-10-05T00:00:00.000Z',
				procedureType: 'hearing',
				hearing: null,
				hearingEstimate: null,
				appealTimetable: {}
			};

			nock.cleanAll();
			installMockApi();

			nock('http://test/').get('/appeals/999/page-details').reply(200, hearingData).persist();
			nock('http://test/').get('/appeals/999').query(true).reply(200, hearingData).persist();
			nock('http://test/')
				.get('/appeals/999/exists')
				.reply(200, { id: 999, appealId: 999, appealReference: hearingData.appealReference })
				.persist();
			nock('http://test/').get('/appeals/999/case-notes').reply(200, []).persist();

			const response = await request.get('/appeals-service/appeal-details/999');
			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text);
			expect(response.text).toContain('Hearing');
			const setUpEventButton = html.querySelector('a.govuk-button[href*="/hearing/setup"]');
			expect(setUpEventButton).not.toBeNull();
			expect(setUpEventButton?.innerHTML.trim()).toBe('Set up hearing');
		});
	});

	describe('Document upload, manage and delete flows (Scenarios 3, 4, 6, 7, 8)', () => {
		const docAppellantId = '15d19184-155b-4b6c-bba6-2bd2a61ca9a3';
		const docLpaqId = '47d8f073-c837-4f07-9161-c1a5626eba56';

		const appellantFolderInfo = {
			caseId: 999,
			folderId: 101,
			path: 'appellant-case/appellantCase',
			documents: [
				{
					id: docAppellantId,
					name: 'appeal-form.pdf',
					latestDocumentVersion: {
						documentId: docAppellantId,
						version: 1,
						fileName: 'appeal-form.pdf',
						redactionStatus: 'no_redaction_required',
						virusCheckStatus: 'scanned',
						safe: true,
						published: false
					}
				}
			]
		};

		const lpaqFolderInfo = {
			caseId: 999,
			folderId: 102,
			path: 'lpa-questionnaire/lpaQuestionnaire',
			documents: [
				{
					id: docLpaqId,
					name: 'questionnaire.pdf',
					latestDocumentVersion: {
						documentId: docLpaqId,
						version: 1,
						fileName: 'questionnaire.pdf',
						redactionStatus: 'no_redaction_required',
						virusCheckStatus: 'scanned',
						safe: true,
						published: false
					}
				}
			]
		};

		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/999/document-folders/101?pageNumber=1&pageSize=100')
				.reply(200, appellantFolderInfo)
				.persist();
			nock('http://test/')
				.get('/appeals/999/document-folders/102?pageNumber=1&pageSize=100')
				.reply(200, lpaqFolderInfo)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, [{ key: 'no_redaction_required', name: 'no_redaction_required', id: 10 }])
				.persist();
			nock('http://test/').post('/appeals/999/documents').reply(200).persist();
			nock('http://test/')
				.get(`/appeals/documents/${docAppellantId}`)
				.reply(200, appellantFolderInfo.documents[0])
				.persist();
			nock('http://test/')
				.get(`/appeals/documents/${docLpaqId}`)
				.reply(200, lpaqFolderInfo.documents[0])
				.persist();
		});

		it('Scenario 3 & 6: Appeal upload flow displays correct headings and success banner on completion', async () => {
			const session = supertest.agent(app);

			// 1. GET upload page
			const uploadGet = await session.get(
				'/appeals-service/appeal-details/999/appellant-case/add-documents/101'
			);
			expect(uploadGet.statusCode).toBe(200);
			expect(uploadGet.text).toContain('Upload appeal form and appeal documents');

			// 2. POST upload
			const uploadPost = await session
				.post('/appeals-service/appeal-details/999/appellant-case/add-documents/101')
				.send({ 'upload-info': fileUploadInfo });
			expect(uploadPost.statusCode).toBe(302);
			expect(uploadPost.headers.location).toContain(
				'/appeals-service/appeal-details/999/appellant-case/add-document-details/101'
			);

			// 3. GET add document details page
			const detailsGet = await session.get(
				'/appeals-service/appeal-details/999/appellant-case/add-document-details/101'
			);
			expect(detailsGet.statusCode).toBe(200);
			expect(detailsGet.text).toContain('Appeal form and appeal documents');

			// 4. POST add document details
			const detailsPost = await session
				.post('/appeals-service/appeal-details/999/appellant-case/add-document-details/101')
				.send({
					items: [
						{
							documentId: '1',
							receivedDate: {
								day: '1',
								month: '2',
								year: '2024'
							},
							redactionStatus: 'no_redaction_required'
						}
					]
				});
			expect(detailsPost.statusCode).toBe(302);
			expect(detailsPost.headers.location).toContain(
				'/appeals-service/appeal-details/999/appellant-case/add-documents/101/check-your-answers'
			);

			// 5. GET check your answers
			const cyaGet = await session.get(
				'/appeals-service/appeal-details/999/appellant-case/add-documents/101/check-your-answers'
			);
			expect(cyaGet.statusCode).toBe(200);
			expect(cyaGet.text).toContain('Check your answers');

			// 6. POST check your answers
			const cyaPost = await session
				.post(
					'/appeals-service/appeal-details/999/appellant-case/add-documents/101/check-your-answers'
				)
				.send({});
			expect(cyaPost.statusCode).toBe(302);
			expect(cyaPost.headers.location).toBe('/appeals-service/appeal-details/999');

			// 7. Verify success banner on case details page
			const caseDetailsResponse = await session.get('/appeals-service/appeal-details/999');
			expect(caseDetailsResponse.statusCode).toBe(200);
			expect(caseDetailsResponse.text).toContain('Appeal form and appeal documents added');
		});

		it('Scenario 4 & 6: LPA questionnaire upload flow displays correct headings and success banner on completion', async () => {
			const session = supertest.agent(app);

			// 1. GET upload page
			const uploadGet = await session.get(
				'/appeals-service/appeal-details/999/lpa-questionnaire/add-documents/102'
			);
			expect(uploadGet.statusCode).toBe(200);
			expect(uploadGet.text).toContain('Upload questionnaire and questionnaire documents');

			// 2. POST upload
			const uploadPost = await session
				.post('/appeals-service/appeal-details/999/lpa-questionnaire/add-documents/102')
				.send({ 'upload-info': fileUploadInfo });
			expect(uploadPost.statusCode).toBe(302);
			expect(uploadPost.headers.location).toContain(
				'/appeals-service/appeal-details/999/lpa-questionnaire/add-document-details/102'
			);

			// 3. GET add document details page
			const detailsGet = await session.get(
				'/appeals-service/appeal-details/999/lpa-questionnaire/add-document-details/102'
			);
			expect(detailsGet.statusCode).toBe(200);
			expect(detailsGet.text).toContain('Questionnaire and questionnaire documents');

			// 4. POST add document details
			const detailsPost = await session
				.post('/appeals-service/appeal-details/999/lpa-questionnaire/add-document-details/102')
				.send({
					items: [
						{
							documentId: '1',
							receivedDate: {
								day: '1',
								month: '2',
								year: '2024'
							},
							redactionStatus: 'no_redaction_required'
						}
					]
				});
			expect(detailsPost.statusCode).toBe(302);
			expect(detailsPost.headers.location).toContain(
				'/appeals-service/appeal-details/999/lpa-questionnaire/add-documents/102/check-your-answers'
			);

			// 5. GET check your answers
			const cyaGet = await session.get(
				'/appeals-service/appeal-details/999/lpa-questionnaire/add-documents/102/check-your-answers'
			);
			expect(cyaGet.statusCode).toBe(200);
			expect(cyaGet.text).toContain('Check your answers');

			// 6. POST check your answers
			const cyaPost = await session
				.post(
					'/appeals-service/appeal-details/999/lpa-questionnaire/add-documents/102/check-your-answers'
				)
				.send({});
			expect(cyaPost.statusCode).toBe(302);
			expect(cyaPost.headers.location).toBe('/appeals-service/appeal-details/999');

			// 7. Verify success banner on case details page
			const caseDetailsResponse = await session.get('/appeals-service/appeal-details/999');
			expect(caseDetailsResponse.statusCode).toBe(200);
			expect(caseDetailsResponse.text).toContain('Questionnaire and questionnaire documents added');
		});

		it('Scenario 7: Manage folder pages display correct headings and View and edit links', async () => {
			// Appeal manage folder
			const appealManageRes = await request.get(
				'/appeals-service/appeal-details/999/appellant-case/manage-documents/101'
			);
			expect(appealManageRes.statusCode).toBe(200);
			expect(appealManageRes.text).toContain('Appeal and appeal documents');
			expect(appealManageRes.text).toContain('View and edit');
			expect(appealManageRes.text).not.toContain('Manage and share');

			// LPA questionnaire manage folder
			const lpaqManageRes = await request.get(
				'/appeals-service/appeal-details/999/lpa-questionnaire/manage-documents/102'
			);
			expect(lpaqManageRes.statusCode).toBe(200);
			expect(lpaqManageRes.text).toContain('Questionnaire and questionnaire documents');
			expect(lpaqManageRes.text).toContain('View and edit');
			expect(lpaqManageRes.text).not.toContain('Manage and share');
		});

		it('Scenario 8: Removing document version displays correct success banners', async () => {
			nock('http://test/').delete(`/appeals/documents/${docAppellantId}/1`).reply(200);
			nock('http://test/').delete(`/appeals/documents/${docLpaqId}/1`).reply(200);

			// Delete version on appeal
			const appealDeleteRes = await request
				.post(
					`/appeals-service/appeal-details/999/appellant-case/manage-documents/101/${docAppellantId}/1/delete`
				)
				.send({ 'delete-file-answer': 'yes' });
			expect(appealDeleteRes.statusCode).toBe(302);
			expect(appealDeleteRes.headers.location).toBe('/appeals-service/appeal-details/999');

			const appealBannerCheck = await request.get('/appeals-service/appeal-details/999');
			expect(appealBannerCheck.statusCode).toBe(200);
			expect(appealBannerCheck.text).toContain('Appeal form and appeal documents removed');

			// Delete version on LPA questionnaire
			const lpaqDeleteRes = await request
				.post(
					`/appeals-service/appeal-details/999/lpa-questionnaire/manage-documents/102/${docLpaqId}/1/delete`
				)
				.send({ 'delete-file-answer': 'yes' });
			expect(lpaqDeleteRes.statusCode).toBe(302);
			expect(lpaqDeleteRes.headers.location).toBe('/appeals-service/appeal-details/999');

			const lpaqBannerCheck = await request.get('/appeals-service/appeal-details/999');
			expect(lpaqBannerCheck.statusCode).toBe(200);
			expect(lpaqBannerCheck.text).toContain('Questionnaire and questionnaire documents removed');
		});
	});
});
