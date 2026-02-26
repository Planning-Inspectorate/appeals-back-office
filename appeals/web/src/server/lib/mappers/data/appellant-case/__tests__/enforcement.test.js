// @ts-nocheck
import { submaps as enforcementListedSubmaps } from '../enforcement-listed.js';
import { submaps as enforcementSubmaps } from '../enforcement.js';
import { submaps as s78Submaps } from '../s78.js';

describe('Enforcement vs Enforcement Listed Building (ELB) Submap Architecture', () => {
	const enforcementSpecificKeys = [
		'otherAppellants',
		'writtenOrVerbalPermission',
		'retrospectiveApplication',
		'groundAFeeReceipt',
		'applicationDevelopmentAllOrPart',
		'appealDecisionDate'
	];

	const commonKeys = [
		'contactAddress',
		'interestInLand',
		'enforcementNotice',
		'descriptionOfAllegedBreach'
	];

	it('Standard Enforcement should include all enforcement-specific mappers', () => {
		enforcementSpecificKeys.forEach((key) => {
			expect(enforcementSubmaps[key]).toBeDefined();
		});
	});

	it('Enforcement Listed Building (ELB) should NOT include standard enforcement-specific mappers', () => {
		enforcementSpecificKeys.forEach((key) => {
			expect(enforcementListedSubmaps[key]).toBeUndefined();
		});
	});

	it('Both appeal types should share the common enforcement mappers', () => {
		commonKeys.forEach((key) => {
			expect(enforcementSubmaps[key]).toBeDefined();
			expect(enforcementListedSubmaps[key]).toBeDefined();

			expect(enforcementSubmaps[key]).toBe(enforcementListedSubmaps[key]);
		});
	});

	it('Standard Enforcement should be a strict superset of ELB', () => {
		const elbKeys = Object.keys(enforcementListedSubmaps);
		const enfKeys = Object.keys(enforcementSubmaps);
		elbKeys.forEach((key) => {
			expect(enfKeys).toContain(key);
		});

		expect(enfKeys.length).toBe(elbKeys.length + enforcementSpecificKeys.length);
	});

	it('Both appeal types should correctly inherit S78 base mappers', () => {
		const s78Keys = Object.keys(s78Submaps);
		s78Keys.forEach((key) => {
			expect(enforcementSubmaps[key]).toBeDefined();
			expect(enforcementListedSubmaps[key]).toBeDefined();
		});
	});

	it('Every value in the submaps should be a valid mapping function', () => {
		Object.values(enforcementSubmaps).forEach((mapper) => {
			expect(typeof mapper).toBe('function');
		});

		Object.values(enforcementListedSubmaps).forEach((mapper) => {
			expect(typeof mapper).toBe('function');
		});
	});
});
