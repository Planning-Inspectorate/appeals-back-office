// @ts-nocheck - Keep this at the top if JSDoc isn't enough, but try without first
import { jest } from '@jest/globals';
import { postGeneratePdfController } from '../pdf.js';

jest.mock('../../lib/generate-pdf.js');
jest.mock('../../browser-instance.js', () => ({
	getBrowserInstance: jest.fn()
}));
jest.mock('nunjucks', () => ({
	configure: jest.fn().mockReturnThis(),
	addFilter: jest.fn().mockReturnThis(),
	render: jest.fn()
}));

import generatePdfLib from '../../lib/generate-pdf.js';
import nunjucks from 'nunjucks';
import { mockReq, mockRes, mockNext } from '../../../test/utils/mocks.js';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('controllers/pdf', () => {
	let browserInstance;
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

	beforeEach(async () => {
		jest.clearAllMocks();
		browserInstance = await import('../../browser-instance.js');
		req = /** @type {any} */ ({
			...mockReq,
			body: { ...mockPayload }
		});
		res = mockRes();

		browserInstance.getBrowserInstance.mockReturnValue(mockBrowser);
		generatePdfLib.mockResolvedValue(mockPdfBuffer);
		nunjucks.render.mockReturnValue(mockHtml);
	});

	it('should get browser, render template, generate PDF, and send response', async () => {
		await postGeneratePdfController(/** @type {any} */ (req), res, mockNext);

		expect(browserInstance.getBrowserInstance).toHaveBeenCalledTimes(1);
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
		expect(browserInstance.getBrowserInstance).not.toHaveBeenCalled();
		expect(generatePdfLib).not.toHaveBeenCalled();
		expect(mockNext).not.toHaveBeenCalled();
	});

	it('should call next with error if getBrowserInstance fails', async () => {
		const browserError = new Error('Browser unavailable');

		browserInstance.getBrowserInstance.mockImplementation(() => {
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
