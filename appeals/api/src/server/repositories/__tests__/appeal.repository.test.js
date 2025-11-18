// @ts-nocheck
import { appealDetailsInclude, buildAppealInclude } from '../appeal.repository.js';

describe('buildAppealInclude', () => {
	it('returns full appealDetailsInclude when selectedKeys is empty and includeDetails = true', () => {
		const result = buildAppealInclude([], true);
		expect(result).toBe(appealDetailsInclude);
	});

	it('returns null when selectedKeys is empty and includeDetails = false', () => {
		const result = buildAppealInclude([], false);
		expect(result).toBeNull();
	});

	it('returns object containing only the specified keys when multiple selectedKeys provided and includeDetails = true', () => {
		/** @type {Array<keyof typeof appealDetailsInclude>} */
		const selectedKeys = ['address', 'agent', 'appealStatus'];
		const result = buildAppealInclude(selectedKeys, true);

		expect(result).not.toBeNull();
		expect(Object.keys(result)).toEqual(selectedKeys);
		expect(result.address).toBe(true);
		expect(result.agent).toBe(true);
		expect(result.appealStatus).toBe(true);
	});

	it('returns the selected key with all children where the key has them', () => {
		const result = buildAppealInclude(['lpaQuestionnaire'], true);

		expect(result).not.toBeNull();
		expect(Object.keys(result)).toEqual(['lpaQuestionnaire']);
		expect(result.lpaQuestionnaire).toEqual(appealDetailsInclude.lpaQuestionnaire);
	});

	it('returns null when selectedKeys is not empty and includeDetails = false', () => {
		const result = buildAppealInclude(['lpaQuestionnaire'], false);
		expect(result).toBeNull();
	});

	it('returns appealType.key where includeDetails=true, selectAppealTypeKey=true and selectedKeys does not contain appealType', () => {
		const result = buildAppealInclude([], true, true);
		expect(result).not.toBeNull();
		expect(Object.keys(result)).toEqual(['appealType']);
		expect(result.appealType).toEqual({ select: { key: true } });
	});
});
