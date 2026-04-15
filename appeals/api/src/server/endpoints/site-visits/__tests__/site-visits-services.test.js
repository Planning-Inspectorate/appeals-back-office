// @ts-nocheck
import {
	fetchRescheduleTemplateIds,
	fetchSiteVisitScheduleTemplateIds
} from '../site-visits.service.js';

describe('fetchRescheduleTemplateIds', () => {
	test('returns an ID for unaccompanied To Access required with visit-type', () => {
		const result = fetchRescheduleTemplateIds('Access required', 'Unaccompanied', 'visit-type');
		expect(result).toEqual({
			appellant: 'site-visit-change-unaccompanied-to-access-required-appellant'
		});
	});

	test('returns an ID for Access required To Unaccompanied with visit-type', () => {
		const result = fetchRescheduleTemplateIds('Unaccompanied', 'Access required', 'visit-type');
		expect(result).toEqual({
			appellant: 'site-visit-change-access-required-to-unaccompanied-appellant'
		});
	});

	test('returns appellant and lpa IDs for Unaccompanied To Accompanied with visit-type', () => {
		const result = fetchRescheduleTemplateIds('Accompanied', 'Unaccompanied', 'visit-type');
		expect(result).toEqual({
			appellant: 'site-visit-change-unaccompanied-to-accompanied-appellant',
			lpa: 'site-visit-change-unaccompanied-to-accompanied-lpa'
		});
	});

	test('returns appellant and lpa IDs for Access required To Accompanied with visit-type', () => {
		const result = fetchRescheduleTemplateIds('Accompanied', 'Access required', 'visit-type');
		expect(result).toEqual({
			appellant: 'site-visit-change-access-required-to-accompanied-appellant',
			lpa: 'site-visit-change-access-required-to-accompanied-lpa'
		});
	});

	test('returns appellant and lpa IDs for Accompanied To Access required with visit-type', () => {
		const result = fetchRescheduleTemplateIds('Access required', 'Accompanied', 'visit-type');
		expect(result).toEqual({
			appellant: 'site-visit-change-accompanied-to-access-required-appellant',
			lpa: 'site-visit-change-accompanied-to-access-required-lpa'
		});
	});

	test('returns appellant and lpa IDs for Accompanied To Unaccompanied with visit-type', () => {
		const result = fetchRescheduleTemplateIds('Unaccompanied', 'Accompanied', 'visit-type');
		expect(result).toEqual({
			appellant: 'site-visit-change-accompanied-to-unaccompanied-appellant',
			lpa: 'site-visit-change-accompanied-to-unaccompanied-lpa'
		});
	});

	test('returns an empty object for an unknown transition with visit-type', () => {
		const result = fetchRescheduleTemplateIds('UnknownType', 'AnotherUnknownType', 'visit-type');
		expect(result).toEqual({});
	});

	test('returns an empty object for unchanged transition type', () => {
		const result = fetchRescheduleTemplateIds('Accompanied', 'Accompanied', 'unchanged');
		expect(result).toEqual({});
	});

	test('returns templates for all transition types with all', () => {
		const result = fetchRescheduleTemplateIds('Accompanied', 'Unaccompanied', 'all');
		expect(result).toEqual({
			appellant: 'site-visit-change-unaccompanied-to-accompanied-appellant',
			lpa: 'site-visit-change-unaccompanied-to-accompanied-lpa'
		});
	});

	test('returns appellant ID for Access required date-time change', () => {
		const result = fetchRescheduleTemplateIds('Access required', 'AnyType', 'date-time');
		expect(result).toEqual({
			appellant: 'site-visit-change-access-required-date-change-appellant'
		});
	});

	test('returns appellant and lpa IDs for Accompanied date-time change', () => {
		const result = fetchRescheduleTemplateIds('Accompanied', 'AnyType', 'date-time');
		expect(result).toEqual({
			appellant: 'site-visit-change-accompanied-date-change-appellant',
			lpa: 'site-visit-change-accompanied-date-change-lpa'
		});
	});
});

describe('fetchSiteVisitScheduleTemplateIds', () => {
	test('returns appellant ID for Access required', () => {
		const result = fetchSiteVisitScheduleTemplateIds('Access required');
		expect(result).toEqual({
			appellant: 'site-visit-schedule-access-required-appellant'
		});
	});

	test('returns appellant and lpa IDs for Accompanied', () => {
		const result = fetchSiteVisitScheduleTemplateIds('Accompanied');
		expect(result).toEqual({
			appellant: 'site-visit-schedule-accompanied-appellant',
			lpa: 'site-visit-schedule-accompanied-lpa'
		});
	});

	test('returns appellant ID for Unaccompanied', () => {
		const result = fetchSiteVisitScheduleTemplateIds('Unaccompanied');
		expect(result).toEqual({
			appellant: 'site-visit-schedule-unaccompanied-appellant'
		});
	});

	test('handles extra whitespace and case insensitivity for Accompanied', () => {
		const result = fetchSiteVisitScheduleTemplateIds('  aCComPAnied  ');
		expect(result).toEqual({
			appellant: 'site-visit-schedule-accompanied-appellant',
			lpa: 'site-visit-schedule-accompanied-lpa'
		});
	});

	test('returns empty object for unknown visit type', () => {
		const result = fetchSiteVisitScheduleTemplateIds('Virtual');
		expect(result).toEqual({});
	});
});
