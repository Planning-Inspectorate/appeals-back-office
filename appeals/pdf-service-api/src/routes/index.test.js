// @ts-nocheck
const pdfRouter = require('./pdf.js');
const { mockUse } = require('../../test/utils/mocks.js');

describe('routes/index', () => {
	it('should define the expected routes', () => {
		// eslint-disable-next-line global-require
		require('./index');

		expect(mockUse).toHaveBeenCalledTimes(1);
		expect(mockUse).toHaveBeenCalledWith('/api/v1', pdfRouter);
	});
});
