// @ts-nocheck
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
		expect(banners.length).toBe(2);

		expect(banners[0].classList.contains('govuk-notification-banner--success')).toBe(true);
		expect(banners[0].innerHTML).toContain('Case created');
		expect(banners[1].querySelector('a[data-cy="ready-to-start"]')?.innerHTML.trim()).toBe(
			'Start case'
		);

		const secondResponse = await request.get('/appeals-service/appeal-details/999');
		expect(secondResponse.statusCode).toBe(200);

		const secondHtml = parseHtml(secondResponse.text);
		const remainingBanners = secondHtml.querySelectorAll('.govuk-notification-banner');
		expect(remainingBanners.length).toBe(1);
		expect(secondResponse.text).not.toContain('Case created');
		expect(remainingBanners[0].querySelector('a[data-cy="ready-to-start"]')?.innerHTML.trim()).toBe(
			'Start case'
		);
	});

	it('should display the Start case banner when appeal is ready_to_start (Scenario 9)', async () => {
		const response = await request.get('/appeals-service/appeal-details/999');
		expect(response.statusCode).toBe(200);

		const html = parseHtml(response.text);
		const startCaseLink = html.querySelector('a[data-cy="ready-to-start"]');
		expect(startCaseLink).not.toBeNull();
		expect(startCaseLink?.innerHTML.trim()).toBe('Start case');
	});

	it('should display only the Appeal row in the Documentation table with CaseSubmittedDate (Scenario 6)', async () => {
		const response = await request.get('/appeals-service/appeal-details/999');
		const html = parseHtml(response.text);

		const docTable = html.querySelector('#case-documentation-table');
		expect(docTable).not.toBeNull();

		const rows = docTable.querySelectorAll('.govuk-table__body .govuk-table__row');
		expect(rows.length).toBe(1);

		const appealRow = rows[0];
		expect(appealRow.querySelector('.govuk-table__header')?.innerHTML.trim()).toBe('Appeal');
		expect(appealRow.innerHTML).toContain('19 September 2026');
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
			'No Local planning authority'
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
});
