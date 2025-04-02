// @ts-nocheck
const puppeteer = require('puppeteer-core');
const generatePdf = require('./generate-pdf');

const html = '<html><body><p>A test pdf</p></body></html>';
const mockPdfBuffer = Buffer.from(html);

jest.mock('puppeteer-core', () => ({
	launch: () => ({
		newPage: () => ({
			setContent: jest.fn(),
			pdf: jest.fn().mockReturnValue(mockPdfBuffer),
			emulateMediaType: jest.fn()
		}),
		close: jest.fn()
	})
}));

describe('lib/generatePdf', () => {
	it('should return a pdf buffer', async () => {
		const result = await generatePdf(html);
		expect(result).toEqual(mockPdfBuffer);
	});

	it('should throw an error', async () => {
		puppeteer.launch = jest.fn().mockImplementation(() => {
			throw new Error('Internal Server Error');
		});

		try {
			await generatePdf(html);
			throw new Error('Expected error not thrown');
		} catch (err) {
			// eslint-disable-next-line jest/no-conditional-expect
			expect(err.message).toEqual('Error: Internal Server Error');
		}
	});
});
