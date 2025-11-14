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

	it('should map s20 LPA questionnaire data correctly', () => {
		const result = mapLpaQuestionnaireData(mockLpaQuestionnaireData.s20lpaQuestionnaireData);
		expect(result).toMatchSnapshot();
	});

	it('should map cas advert LPA questionnaire data correctly', () => {
		const result = mapLpaQuestionnaireData(mockLpaQuestionnaireData.casAdvertLpaQuestionnaireData);
		expect(result).toMatchSnapshot();
	});

	it('should map advert LPA questionnaire data correctly', () => {
		const result = mapLpaQuestionnaireData(mockLpaQuestionnaireData.advertLpaQuestionnaireData);
		expect(result).toMatchSnapshot();
	});
});
