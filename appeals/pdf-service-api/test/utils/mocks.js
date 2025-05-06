/* eslint-disable no-undef */

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockDelete = jest.fn();
const mockUse = jest.fn();

const mockReq = {
	params: {},
	log: {
		debug: jest.fn(),
		info: jest.fn(),
		error: jest.fn(),
		warn: jest.fn()
	},
	body: {},
	query: {},
	session: {},
	apiClient: {}
};

const mockRes = () => {
	const res = {};
	res.status = jest.fn().mockReturnValue(res);
	res.send = jest.fn().mockReturnValue(res);
	res.set = jest.fn().mockReturnValue(res);
	res.setHeader = jest.fn().mockReturnValue(res);
	res.contentType = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	res.end = jest.fn().mockReturnValue(res);
	res.headersSent = false;
	return res;
};

const mockNext = jest.fn();

jest.doMock('express', () => ({
	Router: () => ({
		get: mockGet,
		post: mockPost,
		delete: mockDelete,
		use: mockUse
	})
}));

module.exports = {
	mockGet,
	mockPost,
	mockDelete,
	mockUse,
	mockReq,
	mockRes, // Export the function that creates the mock
	mockNext
};
