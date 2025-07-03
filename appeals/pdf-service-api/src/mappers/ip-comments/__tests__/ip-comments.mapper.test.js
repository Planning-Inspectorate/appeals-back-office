import mapIpCommentsData from '../ip-comments.mapper.js';
import mockIpCommentsData from '../../../mocks/mock-ip-comments-data.json';

describe('mapIpCommentsData', () => {
	it('should map interested party comments data correctly', () => {
		const result = mapIpCommentsData(mockIpCommentsData.ipCommentsData);
		expect(result).toMatchSnapshot();
	});
});
