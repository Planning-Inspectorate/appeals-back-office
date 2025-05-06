// @ts-nocheck

const generatePdfLib = require('./generate-pdf');
describe('lib/generatePdf (Optimized)', () => {
	const html = '<html><body><p>A test pdf</p></body></html>';
	const mockPdfBuffer = Buffer.from(html);

	let mockPage;
	let mockBrowser;

	beforeEach(() => {
		mockPage = {
			setContent: jest.fn().mockResolvedValue(undefined),
			pdf: jest.fn().mockResolvedValue(mockPdfBuffer),
			emulateMediaType: jest.fn().mockResolvedValue(undefined),
			screenshot: jest.fn().mockResolvedValue(undefined),
			close: jest.fn().mockResolvedValue(undefined),
			on: jest.fn()
		};
		mockBrowser = {
			newPage: jest.fn().mockResolvedValue(mockPage)
		};
	});

	it('should create a page, set content, generate PDF, and close the page', async () => {
		const result = await generatePdfLib(mockBrowser, html);

		expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
		expect(mockPage.setContent).toHaveBeenCalledTimes(1);
		expect(mockPage.setContent).toHaveBeenCalledWith(
			html,
			expect.objectContaining({ waitUntil: 'domcontentloaded' })
		);
		expect(mockPage.emulateMediaType).toHaveBeenCalledWith('screen');
		expect(mockPage.pdf).toHaveBeenCalledTimes(1);
		expect(mockPage.pdf).toHaveBeenCalledWith(expect.objectContaining({ format: 'A4' }));
		expect(mockPage.close).toHaveBeenCalledTimes(1);
		expect(result).toBeInstanceOf(Buffer);
		expect(result).toEqual(mockPdfBuffer);
	});

	it('should throw an error if browser instance is invalid', async () => {
		await expect(generatePdfLib(null, html)).rejects.toThrow(
			'Invalid browser instance provided for PDF generation.'
		);
		await expect(generatePdfLib({}, html)).rejects.toThrow(
			'Invalid browser instance provided for PDF generation.'
		);
	});

	it('should throw an error if html content is empty', async () => {
		await expect(generatePdfLib(mockBrowser, '')).rejects.toThrow(
			'Cannot generate PDF from empty or invalid HTML content.'
		);
		await expect(generatePdfLib(mockBrowser, null)).rejects.toThrow(
			'Cannot generate PDF from empty or invalid HTML content.'
		);
	});

	it('should throw an error if page.pdf fails', async () => {
		const pdfError = new Error('PDF Generation Failed');
		mockPage.pdf.mockRejectedValue(pdfError);

		await expect(generatePdfLib(mockBrowser, html)).rejects.toThrow('PDF Generation Failed');
		expect(mockPage.close).toHaveBeenCalledTimes(1);
	});

	it('should throw an error if browser.newPage fails', async () => {
		const pageError = new Error('Failed to create page');
		mockBrowser.newPage.mockRejectedValue(pageError);

		await expect(generatePdfLib(mockBrowser, html)).rejects.toThrow('Failed to create page');

		expect(mockPage.close).not.toHaveBeenCalled();
	});
});
