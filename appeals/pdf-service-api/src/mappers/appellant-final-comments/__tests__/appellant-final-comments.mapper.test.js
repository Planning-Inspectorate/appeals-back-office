import mockAppellantFinalCommentsData from '../../../mocks/mock-appellant-final-comments-data.json';
import { mapAppellantFinalComments } from '../appellant-final-comments.mapper.js';

describe('mapAppellantFinalCommentsData', () => {
	it('should map appellant final comments data correctly', () => {
		const result = mapAppellantFinalComments(
			mockAppellantFinalCommentsData.appellantFinalCommentsData
		);
		expect(result).toMatchSnapshot();
	});
});
