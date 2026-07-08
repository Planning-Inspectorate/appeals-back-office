// @ts-nocheck
import { APPEAL_APPEAL_UNDER_ACT_SECTION } from '@planning-inspectorate/data-model';
import { formatAppealUnderActSection } from '../appellant-case-mappers.js';

describe('appellant-case-mappers', () => {
	describe('formatAppealUnderActSection', () => {
		test('formatAppealUnderActSection should handle known values', () => {
			expect(Object.keys(APPEAL_APPEAL_UNDER_ACT_SECTION).length).toBe(3);
			expect(
				formatAppealUnderActSection(APPEAL_APPEAL_UNDER_ACT_SECTION.EXISTING_DEVELOPMENT)
			).toBe('Existing development or use of a site (section 191)');
			expect(
				formatAppealUnderActSection(
					APPEAL_APPEAL_UNDER_ACT_SECTION.PROPOSED_CHANGES_TO_A_LISTED_BUILDING
				)
			).toBe('Proposed changes to a listed building (section 26H)');
			expect(
				formatAppealUnderActSection(APPEAL_APPEAL_UNDER_ACT_SECTION.PROPOSED_USE_OF_A_DEVELOPMENT)
			).toBe('Proposed development or use of a site (section 192)');
		});

		test('formatAppealUnderActSection should handle unknown values', () => {
			expect(formatAppealUnderActSection('')).toBe(undefined);
			expect(formatAppealUnderActSection(null)).toBe(undefined);
			expect(formatAppealUnderActSection(undefined)).toBe(undefined);
			expect(formatAppealUnderActSection('random')).toBe(undefined);
			expect(formatAppealUnderActSection({})).toBe(undefined);
		});
	});
});
