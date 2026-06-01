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

	it('should map s78 expedited LPA questionnaire with significant changes details correctly', () => {
		const result = mapLpaQuestionnaireData(
			mockLpaQuestionnaireData.s78ExpeditedLpaQuestionnaireData
		);
		const appealProcessSection = result.sections.find((s) => s.heading === 'Appeal process');
		const significantChangesRow = appealProcessSection.items.find(
			(item) =>
				item.key === 'Have there been any significant changes that would affect the application?'
		);
		expect(significantChangesRow).toBeDefined();
		expect(significantChangesRow.html).toContain('Yes');
		expect(significantChangesRow.html).toContain('Local plan: Details for local plan');
		expect(significantChangesRow.html).toContain('National policy: Details for national policy');
		expect(significantChangesRow.html).toContain('Court judgment: Details for court judgement');
		expect(significantChangesRow.html).toContain('Other: Details for other');
	});

	it('should normalize and map S78 appeal to expedited if isS78Expedited is true', () => {
		const input = {
			...mockLpaQuestionnaireData.s78ExpeditedLpaQuestionnaireData,
			appealType: 'Planning appeal',
			isS78Expedited: true
		};
		const expected = mapLpaQuestionnaireData({
			...mockLpaQuestionnaireData.s78ExpeditedLpaQuestionnaireData,
			isS78Expedited: true
		});
		const result = mapLpaQuestionnaireData(input);
		expect(result).toEqual(expected);
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
