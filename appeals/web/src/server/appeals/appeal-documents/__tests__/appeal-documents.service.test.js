// @ts-nocheck
import { jest } from '@jest/globals';

const mockGet = jest.fn();
const mockApiClient = {
	get: mockGet
};

describe('appeal.documents.service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getAllRepresentationAttachments', () => {
		it('fetches single page when pageCount is 1', async () => {
			const { getAllRepresentationAttachments } = await import('../appeal.documents.service.js');

			mockGet.mockReturnValueOnce({
				json: jest.fn().mockResolvedValue({
					pageCount: 1,
					items: [{ id: 1, name: 'rep1' }]
				})
			});

			const result = await getAllRepresentationAttachments(mockApiClient, '100');
			expect(mockGet).toHaveBeenCalledTimes(1);
			expect(mockGet).toHaveBeenCalledWith('appeals/100/reps?pageSize=100&pageNumber=1');
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('rep1');
		});

		it('fetches remaining pages in concurrency-limited batches when pageCount > 1', async () => {
			const { getAllRepresentationAttachments } = await import('../appeal.documents.service.js');
			mockGet
				.mockReturnValueOnce({
					json: jest.fn().mockResolvedValue({
						pageCount: 7,
						items: [{ id: 1 }]
					})
				})
				.mockReturnValueOnce({
					json: jest.fn().mockResolvedValue({ pageCount: 7, items: [{ id: 2 }] })
				})
				.mockReturnValueOnce({
					json: jest.fn().mockResolvedValue({ pageCount: 7, items: [{ id: 3 }] })
				})
				.mockReturnValueOnce({
					json: jest.fn().mockResolvedValue({ pageCount: 7, items: [{ id: 4 }] })
				})
				.mockReturnValueOnce({
					json: jest.fn().mockResolvedValue({ pageCount: 7, items: [{ id: 5 }] })
				})
				.mockReturnValueOnce({
					json: jest.fn().mockResolvedValue({ pageCount: 7, items: [{ id: 6 }] })
				})
				.mockReturnValueOnce({
					json: jest.fn().mockResolvedValue({ pageCount: 7, items: [{ id: 7 }] })
				});

			// Set concurrencyLimit = 2 to verify batching behavior across 7 pages
			const result = await getAllRepresentationAttachments(mockApiClient, '100', 200, 2);
			expect(mockGet).toHaveBeenCalledTimes(7);
			expect(result).toHaveLength(7);
			expect(result.map((r) => r.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
		});
	});
});
