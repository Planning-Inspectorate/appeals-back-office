import mockLpaQuestionnaireData from '../../../mocks/mock-lpa-questionnaire-data.json';
import mapLpaQuestionnaireData from '../lpa-questionnaire.mapper.js';

describe('mapLpaQuestionnaireData', () => {
	it('should map LPA questionnaire data correctly', () => {
		const result = mapLpaQuestionnaireData(mockLpaQuestionnaireData.lpaQuestionnaireData);
		expect(result).toMatchSnapshot();
	});
});
