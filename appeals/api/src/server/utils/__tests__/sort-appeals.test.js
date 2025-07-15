// @ts-nocheck
import { sortAppeals } from '#utils/appeal-sorter.js';

describe('Sort appeals', () => {
	test('match results', () => {
		const appeals = [
			{ appealId: 1, dueDate: '2024-02-01' },
			{ appealId: 2, dueDate: '2023-12-31' },
			{ appealId: 3, dueDate: '2024-01-31' }
		];

		//@ts-ignore
		const data = sortAppeals(appeals);
		const result = data.map((a) => a?.appealId);

		expect(result).toEqual([2, 3, 1]);
	});

	test('handles undefined dueDate', () => {
		const appeals = [
			{ appealId: 1, dueDate: undefined },
			{ appealId: 2, dueDate: '2023-12-31' },
			{ appealId: 3, dueDate: undefined }
		];

		//@ts-ignore
		const data = sortAppeals(appeals);
		const result = data.map((a) => a?.appealId);

		expect(result).toEqual([2, 1, 3]);
	});

	test('handles linked appeals', () => {
		const appeals = [
			{ appealId: 1, dueDate: '2024-12-31', isParentAppeal: true },
			{ appealId: 2, dueDate: '2021-10-30', isChildAppeal: true },
			{ appealId: 3, dueDate: '2024-11-30', isChildAppeal: true },
			{ appealId: 4, dueDate: '2021-10-10' },
			{ appealId: 5, dueDate: '2023-12-30', isParentAppeal: true },
			{ appealId: 6, dueDate: undefined, isChildAppeal: true },
			{ appealId: 7, dueDate: '2022-12-30', isChildAppeal: true },
			{ appealId: 8, dueDate: '2025-12-30' }
		];

		//@ts-ignore
		const data = sortAppeals(appeals);
		const result = data.map((a) => a?.appealId);

		expect(result).toEqual([4, 5, 6, 7, 1, 2, 3, 8]);
	});
});
