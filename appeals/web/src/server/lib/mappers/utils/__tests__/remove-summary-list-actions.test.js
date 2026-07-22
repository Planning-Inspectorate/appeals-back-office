// @ts-nocheck
import { removeSummaryListActions } from '#lib/mappers/utils/remove-summary-list-actions.js';

describe('removeSummaryListActions', () => {
	it('returns undefined for nullish input', () => {
		expect(removeSummaryListActions()).toBeUndefined();
		expect(removeSummaryListActions(null)).toBeUndefined();
	});

	it('filters actions to only items that do not need permissions', () => {
		const value = {
			text: 'Example',
			actions: {
				items: [{ text: 'Manage', needsPermissions: false }, { text: 'Add' }]
			}
		};

		expect(removeSummaryListActions(value)).toEqual({
			text: 'Example',
			actions: {
				items: [{ text: 'Manage', needsPermissions: false }]
			}
		});
	});

	it('skips malformed action entries', () => {
		const value = {
			actions: {
				items: [undefined, { text: 'Manage', needsPermissions: false }, null, { text: 'Add' }]
			}
		};

		expect(removeSummaryListActions(value)).toEqual({
			actions: {
				items: [{ text: 'Manage', needsPermissions: false }]
			}
		});
	});

	it('does not throw when actions is missing or malformed', () => {
		expect(() => removeSummaryListActions({ text: 'Example' })).not.toThrow();
		expect(() => removeSummaryListActions({ actions: undefined })).not.toThrow();
		expect(removeSummaryListActions({ actions: undefined })).toEqual({ actions: undefined });
	});
});
