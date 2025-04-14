const { postGeneratePdf } = require('../controllers/pdf');
const { mockPost } = require('../../test/utils/mocks');

jest.mock('multer', () =>
	jest.fn().mockReturnValue({
		single: jest.fn()
	})
);

describe('routes/pdf', () => {
	it('should define the expected routes', () => {
		// eslint-disable-next-line global-require
		require('./pdf');

		// @ts-ignore
		expect(mockPost).toHaveBeenCalledTimes(1);
		// @ts-ignore
		expect(mockPost).toHaveBeenCalledWith('/generate', postGeneratePdf);
	});
});
