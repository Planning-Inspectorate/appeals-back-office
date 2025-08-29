/* eslint-disable no-unused-vars */
// @ts-nocheck
import { jest } from '@jest/globals';
import { mockGet, mockPost } from '../../../test/utils/mocks';

describe('routes/index', () => {
	let routerIndex;

	const postGeneratePdfController = jest.fn();

	beforeEach(async () => {
		jest.resetModules();
		jest.clearAllMocks();

		jest.mock('../../controllers/pdf.js', () => ({
			postGeneratePdfController
		}));

		// Mock other dependencies
		jest.mock('../../config.js', () => ({
			/* mock config object */
		}));
		jest.mock('../../lib/logger.js', () => ({ info: jest.fn(), error: jest.fn() }));

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
