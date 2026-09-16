// @ts-nocheck
import { enforcementNoticeAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { jest } from '@jest/globals';
import { AUDIT_TRAIL_HEARING_SET_UP } from '@pins/appeals/constants/support.js';
import { dateISOStringToDisplayDate } from '@pins/appeals/utils/date-formatter.js';

const mockCreateAuditTrail = jest.fn().mockResolvedValue(undefined);

jest.unstable_mockModule('#endpoints/audit-trails/audit-trails.service.js', () => ({
	createAuditTrail: mockCreateAuditTrail
}));

// Force the linked / enforcement-linked feature checks to be active so that
// isEnforcementChildAppeal resolves purely from the appeal shape under test.
jest.unstable_mockModule('#utils/feature-flags.js', () => ({
	isFeatureActive: jest.fn().mockReturnValue(true)
}));

/** @type {typeof import('#endpoints/appeal-timetables/appeal-timetables.service.js').createStartCaseAuditTrails} */
let createStartCaseAuditTrails;
/** @type {typeof import('#utils/is-linked-appeal.js').isEnforcementChildAppeal} */
let isEnforcementChildAppeal;

beforeAll(async () => {
	({ createStartCaseAuditTrails } =
		await import('#endpoints/appeal-timetables/appeal-timetables.service.js'));
	({ isEnforcementChildAppeal } = await import('#utils/is-linked-appeal.js'));
});

describe('createStartCaseAuditTrails', () => {
	// The lead case of a linked enforcement notice appeal is not itself a child.
	const leadEnforcementAppeal = {
		...enforcementNoticeAppeal,
		isChildAppeal: false
	};

	// A linked child case of an enforcement notice appeal.
	const childEnforcementAppeal = {
		...enforcementNoticeAppeal,
		id: 101,
		isChildAppeal: true
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	const hearingStartTime = '2024-07-10T13:45:00.000Z';
	const expectedHearingSetUpDetails = stringTokenReplacement(AUDIT_TRAIL_HEARING_SET_UP, [
		dateISOStringToDisplayDate(hearingStartTime)
	]);

	test('creates the hearing set up audit trail when the lead case of a linked enforcement notice appeal is passed in', async () => {
		const isEnforcementChild = isEnforcementChildAppeal(leadEnforcementAppeal);
		// Sanity check: the lead case must not be treated as an enforcement child.
		expect(isEnforcementChild).toBe(false);

		await createStartCaseAuditTrails({
			appealId: leadEnforcementAppeal.id,
			azureAdUserId,
			procedureType: leadEnforcementAppeal.procedureType?.key,
			hearingStartTime,
			isEnforcementChild
		});

		expect(mockCreateAuditTrail).toHaveBeenCalledWith(
			expect.objectContaining({
				appealId: leadEnforcementAppeal.id,
				azureAdUserId,
				details: expectedHearingSetUpDetails
			})
		);
	});

	test('does not create the hearing set up audit trail when a linked child case of an enforcement notice appeal is passed in', async () => {
		const isEnforcementChild = isEnforcementChildAppeal(childEnforcementAppeal);
		// Sanity check: the child case must be treated as an enforcement child.
		expect(isEnforcementChild).toBe(true);

		await createStartCaseAuditTrails({
			appealId: childEnforcementAppeal.id,
			azureAdUserId,
			procedureType: childEnforcementAppeal.procedureType?.key,
			hearingStartTime,
			isEnforcementChild
		});

		expect(mockCreateAuditTrail).not.toHaveBeenCalledWith(
			expect.objectContaining({
				details: expectedHearingSetUpDetails
			})
		);
	});
});
