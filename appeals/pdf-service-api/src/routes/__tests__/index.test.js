/* eslint-disable no-unused-vars */
// @ts-nocheck
import { jest } from '@jest/globals';
import { mockPost, mockGet } from '../../../test/utils/mocks';

// jest.mock('../../controllers/pdf.js', () => ({
// 	postGeneratePdfController: jest.fn()
// }));

// Mock other dependencies
jest.mock('../../config.js', () => ({
	/* mock config object */
}));
jest.mock('../../lib/logger.js', () => ({ info: jest.fn(), error: jest.fn() }));

describe('routes/index', () => {
	let routerIndex;

	beforeEach(async () => {
		jest.resetModules();
		jest.clearAllMocks();

		routerIndex = await import('../index.js');
	});

	it('should define POST /generate-pdf route', () => {
		expect(mockPost).toHaveBeenCalledWith('/generate-pdf', expect.any(Function));
	});

	it('should define GET /health route', () => {
		expect(mockGet).toHaveBeenCalledWith('/health', expect.any(Function));
	});

	it('should define GET / route', () => {
		expect(mockGet).toHaveBeenCalledWith('/', expect.any(Function));
	});
});
