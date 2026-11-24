// @ts-nocheck
import { jest } from '@jest/globals';
import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE
} from '@planning-inspectorate/data-model';

const mockUpdateAppealStatus = jest.fn();
jest.unstable_mockModule('../change-status.service.js', () => ({
	updateAppealStatus: mockUpdateAppealStatus
}));

const { changeStatusPage } = await import('../change-status.mapper.js');
const { getChangeStatus, postChangeStatus } = await import('../change-status.controller.js');

describe('change-status', () => {
	const mockGenericAppeal = {
		appealId: 10,
		appealReference: 'APP/2026/10001',
		appealType: APPEAL_CASE_TYPE.TPO,
		appealStatus: APPEAL_CASE_STATUS.READY_TO_START,
		procedureType: APPEAL_CASE_PROCEDURE.WRITTEN
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('changeStatusPage mapper', () => {
		test('generates expected radio items for written procedure', () => {
			const page = changeStatusPage(mockGenericAppeal, '/back-url', undefined, undefined);

			expect(page.title).toBe('Change');
			expect(page.backLinkUrl).toBe('/back-url');

			const radiosComponent = page.pageComponents[0];
			expect(radiosComponent.type).toBe('radios');
			const radioValues = radiosComponent.parameters.items.map((i) => i.value);

			expect(radioValues).toContain(APPEAL_CASE_STATUS.READY_TO_START);
			expect(radioValues).toContain(APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE);
			expect(radioValues).toContain(APPEAL_CASE_STATUS.STATEMENTS);
			expect(radioValues).toContain(APPEAL_CASE_STATUS.FINAL_COMMENTS);
			expect(radioValues).toContain(APPEAL_CASE_STATUS.EVIDENCE);
			expect(radioValues).toContain(APPEAL_CASE_STATUS.EVENT);
			expect(radioValues).toContain(APPEAL_CASE_STATUS.AWAITING_EVENT);
			expect(radioValues).toContain(APPEAL_CASE_STATUS.ISSUE_DETERMINATION);
			expect(radioValues).toContain(APPEAL_CASE_STATUS.COMPLETE);

			const eventItem = radiosComponent.parameters.items.find(
				(i) => i.value === APPEAL_CASE_STATUS.EVENT
			);
			expect(eventItem.text).toBe('Site visit ready to set up');

			const awaitingEventItem = radiosComponent.parameters.items.find(
				(i) => i.value === APPEAL_CASE_STATUS.AWAITING_EVENT
			);
			expect(awaitingEventItem.text).toBe('Awaiting site visit');
		});

		test('generates hearing-specific labels when procedure is hearing', () => {
			const hearingAppeal = {
				...mockGenericAppeal,
				procedureType: APPEAL_CASE_PROCEDURE.HEARING
			};

			const page = changeStatusPage(hearingAppeal, '/back-url', undefined, undefined);
			const radiosComponent = page.pageComponents[0];

			const eventItem = radiosComponent.parameters.items.find(
				(i) => i.value === APPEAL_CASE_STATUS.EVENT
			);
			expect(eventItem.text).toBe('Hearing ready to set up');

			const awaitingEventItem = radiosComponent.parameters.items.find(
				(i) => i.value === APPEAL_CASE_STATUS.AWAITING_EVENT
			);
			expect(awaitingEventItem.text).toBe('Awaiting hearing');
		});

		test('generates inquiry-specific labels when procedure is inquiry', () => {
			const inquiryAppeal = {
				...mockGenericAppeal,
				procedureType: APPEAL_CASE_PROCEDURE.INQUIRY
			};

			const page = changeStatusPage(inquiryAppeal, '/back-url', undefined, undefined);
			const radiosComponent = page.pageComponents[0];

			const eventItem = radiosComponent.parameters.items.find(
				(i) => i.value === APPEAL_CASE_STATUS.EVENT
			);
			expect(eventItem.text).toBe('Inquiry ready to set up');

			const awaitingEventItem = radiosComponent.parameters.items.find(
				(i) => i.value === APPEAL_CASE_STATUS.AWAITING_EVENT
			);
			expect(awaitingEventItem.text).toBe('Awaiting inquiry');
		});

		test('pre-selects current status', () => {
			const page = changeStatusPage(
				{ ...mockGenericAppeal, appealStatus: APPEAL_CASE_STATUS.STATEMENTS },
				'/back-url',
				undefined,
				undefined
			);
			const radiosComponent = page.pageComponents[0];
			const statementsItem = radiosComponent.parameters.items.find(
				(i) => i.value === APPEAL_CASE_STATUS.STATEMENTS
			);
			expect(statementsItem.checked).toBe(true);
		});
	});

	describe('changeStatus controller', () => {
		test('getChangeStatus returns 404 for non-generic appeal', async () => {
			const req = {
				currentAppeal: { ...mockGenericAppeal, appealType: 'Householder' }
			};
			const res = {
				status: jest.fn().mockReturnThis(),
				render: jest.fn()
			};

			await getChangeStatus(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.render).toHaveBeenCalledWith('app/404.njk');
		});

		test('getChangeStatus renders change-page pattern for generic appeal', async () => {
			const req = {
				currentAppeal: mockGenericAppeal,
				errors: undefined
			};
			const res = {
				render: jest.fn()
			};

			await getChangeStatus(req, res);

			expect(res.render).toHaveBeenCalledWith(
				'patterns/change-page.pattern.njk',
				expect.objectContaining({
					pageContent: expect.objectContaining({
						title: 'Change'
					})
				})
			);
		});

		test('postChangeStatus calls updateAppealStatus, sets banner, and redirects on success', async () => {
			mockUpdateAppealStatus.mockResolvedValue({});

			const session = {};
			const req = {
				currentAppeal: mockGenericAppeal,
				body: { status: APPEAL_CASE_STATUS.STATEMENTS },
				errors: undefined,
				apiClient: {},
				session
			};
			const res = {
				redirect: jest.fn()
			};

			await postChangeStatus(req, res);

			expect(mockUpdateAppealStatus).toHaveBeenCalledWith(
				req.apiClient,
				10,
				APPEAL_CASE_STATUS.STATEMENTS
			);
			expect(session.notificationBanners).toBeDefined();
			expect(res.redirect).toHaveBeenCalledWith('/appeals-service/appeal-details/10');
		});

		test('postChangeStatus re-renders page when validation errors present', async () => {
			const req = {
				currentAppeal: mockGenericAppeal,
				body: {},
				errors: { status: { msg: 'Select an appeal status' } },
				apiClient: {},
				session: {}
			};
			const res = {
				render: jest.fn()
			};

			await postChangeStatus(req, res);

			expect(mockUpdateAppealStatus).not.toHaveBeenCalled();
			expect(res.render).toHaveBeenCalledWith(
				'patterns/change-page.pattern.njk',
				expect.objectContaining({
					errors: req.errors
				})
			);
		});
	});
});
