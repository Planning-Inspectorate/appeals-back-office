import { mapLpaFinalComments } from '../lpa-final-comments.mapper.js';
import mockLpaFinalCommentsData from '../../../mocks/mock-lpa-final-comments-data.json';

describe('mapLpaFinalCommentsData', () => {
	it('should map LPA final comments data correctly', () => {
		const result = mapLpaFinalComments(mockLpaFinalCommentsData.lpaFinalCommentsData);
		expect(result).toMatchSnapshot();
	});
});
