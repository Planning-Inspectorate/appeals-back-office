/* eslint-disable no-unused-vars */
// @ts-nocheck
const { mockPost, mockGet, mockUse } = require('../../test/utils/mocks');
jest.mock('../controllers/pdf.js', () => ({
	postGeneratePdfController: jest.fn()
}));

// Mock other dependencies
jest.mock('../config', () => ({
	/* mock config object */
}));
jest.mock('../lib/logger', () => ({ info: jest.fn(), error: jest.fn() }));

describe('routes/index', () => {
	let routerIndex;
	const { postGeneratePdfController } = require('../controllers/pdf.js');

	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();

		routerIndex = require('./index');
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
