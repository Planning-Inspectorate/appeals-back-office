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
	}
};
const mockRes = () => {
	const res = {};
	res.status = jest.fn().mockReturnValue(res);
	res.send = jest.fn().mockReturnValue(res);
	res.set = jest.fn().mockReturnValue(res);
	res.contentType = jest.fn().mockReturnValue(res);
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
	mockRes,
	mockNext
};
