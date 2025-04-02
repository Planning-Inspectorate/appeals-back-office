// @ts-nocheck
const { postGeneratePdf } = require('./pdf');
const generatePdf = require('../lib/generate-pdf');
const { mockReq, mockRes } = require('../../test/utils/mocks');

jest.mock('../lib/generate-pdf');

describe('controllers/pdf', () => {
	const res = mockRes();
	const html = '<html><body><p>A test pdf</p></body></html>';
	const pdfBuffer = Buffer.from(html);

	let req;

	beforeEach(() => {
		req = {
			...mockReq,
			body: {
				html
			}
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('postGeneratePdf', () => {
		it('should return a pdf when a pdf is generated successfully', async () => {
			generatePdf.mockReturnValue(pdfBuffer);

			await postGeneratePdf(req, res);

			expect(generatePdf).toHaveBeenCalledTimes(1);
			expect(generatePdf).toHaveBeenCalledWith(html);
			expect(res.contentType).toHaveBeenCalledTimes(1);
			expect(res.contentType).toHaveBeenCalledWith('application/pdf');
			expect(res.send).toHaveBeenCalledTimes(1);
			expect(res.send).toHaveBeenCalledWith(pdfBuffer);
		});

		it('should return an error when an error is thrown generating a pdf', async () => {
			generatePdf.mockImplementation(() => {
				throw new Error('Internal Server Error');
			});

			await postGeneratePdf(req, res);

			expect(res.status).toHaveBeenCalledTimes(1);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledTimes(1);
			expect(res.send).toHaveBeenCalledWith({
				message: 'Internal Server Error'
			});
		});
	});
});
