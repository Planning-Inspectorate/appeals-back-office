import mockLpaQuestionnaireData from '../../../mocks/mock-lpa-questionnaire-data.json';
import mapLpaQuestionnaireData from '../lpa-questionnaire.mapper.js';

describe('mapLpaQuestionnaireData', () => {
	it('should map householder LPA questionnaire data correctly', () => {
		const result = mapLpaQuestionnaireData(
			mockLpaQuestionnaireData.householderLpaQuestionnaireData
		);
		expect(result).toMatchSnapshot();
	});

	it('should map s78 LPA questionnaire data correctly', () => {
		const result = mapLpaQuestionnaireData(mockLpaQuestionnaireData.s78lpaQuestionnaireData);
		expect(result).toMatchSnapshot();
	});
});
