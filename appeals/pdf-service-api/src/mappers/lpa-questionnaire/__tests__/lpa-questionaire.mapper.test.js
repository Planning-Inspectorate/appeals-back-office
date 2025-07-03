import mapLpaQuestionnaireData from '../lpa-questionnaire.mapper.js';
import mockLpaQuestionnaireData from '../../../mocks/mock-lpa-questionnaire-data.json';

describe('mapLpaQuestionnaireData', () => {
	it('should map LPA questionnaire data correctly', () => {
		const result = mapLpaQuestionnaireData(mockLpaQuestionnaireData.lpaQuestionnaireData);
		expect(result).toMatchSnapshot();
	});
});
