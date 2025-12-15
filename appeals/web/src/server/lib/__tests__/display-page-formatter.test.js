import { formatPlanningObligationStatus } from '#lib/display-page-formatter.js';

describe('formatPlanningObligationStatus', () => {
	test('returns "Not yet started" for not_started status', () => {
		expect(formatPlanningObligationStatus('not_started')).toBe('Not yet started');
	});

	test('returns "Finalised" for finalised status', () => {
		expect(formatPlanningObligationStatus('finalised')).toBe('Finalised');
	});

	test('returns "Not answered" for null', () => {
		expect(formatPlanningObligationStatus(null)).toBe('Not answered');
	});

	test('returns "Not answered" for undefined', () => {
		expect(formatPlanningObligationStatus(undefined)).toBe('Not answered');
	});

	test('returns "Not answered" for unknown status', () => {
		expect(formatPlanningObligationStatus('unknown_status')).toBe('Not answered');
	});

	test('returns "Not answered" for empty string', () => {
		expect(formatPlanningObligationStatus('')).toBe('Not answered');
	});
});
