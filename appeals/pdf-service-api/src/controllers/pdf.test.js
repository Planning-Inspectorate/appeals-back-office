// @ts-nocheck - Keep this at the top if JSDoc isn't enough, but try without first

const { postGeneratePdfController } = require('./pdf');

jest.mock('../lib/generate-pdf');
jest.mock('../browser-instance', () => ({
	getBrowserInstance: jest.fn()
}));
jest.mock('nunjucks', () => ({
	configure: jest.fn().mockReturnThis(),
	addFilter: jest.fn().mockReturnThis(),
	render: jest.fn()
}));

const generatePdfLib = require('../lib/generate-pdf');
const { getBrowserInstance } = require('../browser-instance');
const nunjucks = require('nunjucks');
const { mockReq, mockRes, mockNext } = require('../../test/utils/mocks');

describe('controllers/pdf', () => {
	/** @type {import('express').Request} */
	let req;
	/** @type {ReturnType<mockRes>} */
	let res;
	const mockPdfBuffer = Buffer.from('mock pdf content');
	const mockHtml = '<html>Rendered HTML</html>';
	const mockBrowser = {
		/* Simple mock object */
	};
	const mockPayload = {
		currentAppeal: { appealId: 123, status: 'Test' },
		appealCaseNotes: [{ id: 1, comment: 'Note 1', createdAt: new Date().toISOString() }]
	};

	beforeEach(() => {
		jest.clearAllMocks();
		req = /** @type {any} */ ({
			...mockReq,
			body: { ...mockPayload }
		});
		res = mockRes();

		getBrowserInstance.mockReturnValue(mockBrowser);
		generatePdfLib.mockResolvedValue(mockPdfBuffer);
		nunjucks.render.mockReturnValue(mockHtml);
	});

	it('should get browser, render template, generate PDF, and send response', async () => {
		await postGeneratePdfController(/** @type {any} */ (req), res, mockNext);

		expect(getBrowserInstance).toHaveBeenCalledTimes(1);
		expect(nunjucks.render).toHaveBeenCalledTimes(1);
		expect(generatePdfLib).toHaveBeenCalledTimes(1);
		expect(generatePdfLib).toHaveBeenCalledWith(mockBrowser, mockHtml);
		expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
		expect(res.setHeader).toHaveBeenCalledWith(
			'Content-Disposition',
			expect.stringContaining('appeal-details-123.pdf')
		);
		expect(res.send).toHaveBeenCalledTimes(1);
		expect(res.send).toHaveBeenCalledWith(mockPdfBuffer);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it('should return 400 if required data is missing', async () => {
		req.body = { currentAppeal: null, appealCaseNotes: [] };
		await postGeneratePdfController(/** @type {any} */ (req), res, mockNext);
		expect(res.status).toHaveBeenCalledWith(400);
		expect(getBrowserInstance).not.toHaveBeenCalled();
		expect(generatePdfLib).not.toHaveBeenCalled();
		expect(mockNext).not.toHaveBeenCalled();
	});

	it('should call next with error if getBrowserInstance fails', async () => {
		const browserError = new Error('Browser unavailable');

		getBrowserInstance.mockImplementation(() => {
			throw browserError;
		});
		await postGeneratePdfController(/** @type {any} */ (req), res, mockNext);
		expect(generatePdfLib).not.toHaveBeenCalled();
		expect(mockNext).toHaveBeenCalledWith(browserError);
	});

	it('should call next with error if nunjucks.render fails', async () => {
		const renderError = new Error('Template Error');
		nunjucks.render.mockImplementation(() => {
			throw renderError;
		});
		await postGeneratePdfController(/** @type {any} */ (req), res, mockNext);
		expect(generatePdfLib).not.toHaveBeenCalled();
		expect(mockNext).toHaveBeenCalledWith(renderError);
	});

	it('should call next with error if generatePdfLib fails', async () => {
		const pdfLibError = new Error('PDF Lib Failed');
		generatePdfLib.mockRejectedValue(pdfLibError);
		req.body = { ...mockPayload };
		await postGeneratePdfController(/** @type {any} */ (req), res, mockNext);
		expect(res.send).not.toHaveBeenCalled();
		expect(mockNext).toHaveBeenCalledWith(pdfLibError);
	});
});
