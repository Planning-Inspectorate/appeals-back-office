import mockAppellantCaseData from '../../../mocks/mock-appellant-case-data.json';
import mapAppellantCaseData from '../appellant-case.mapper.js';

describe('mapAppellantCaseData', () => {
	it('should map appellant case data for a householder appeal', () => {
		const result = mapAppellantCaseData(mockAppellantCaseData.appellantCaseDataHouseholder);

		expect(result).toMatchSnapshot();
	});

	it('should map appellant case data for a s78 appeal', () => {
		const result = mapAppellantCaseData(mockAppellantCaseData.appellantCaseDataS78);

		expect(result).toMatchSnapshot();
	});

	it('should map appellant case data for a s20 appeal', () => {
		const result = mapAppellantCaseData(mockAppellantCaseData.appellantCaseDataS20);

		expect(result).toMatchSnapshot();
	});

	it('should map cas advert LPA questionnaire data correctly', () => {
		const result = mapAppellantCaseData(mockAppellantCaseData.appellantCaseDataCasAdvert);
		expect(result).toMatchSnapshot();
	});

	it('should map advert LPA questionnaire data correctly', () => {
		const result = mapAppellantCaseData(mockAppellantCaseData.appellantCaseDataAdvert);
		expect(result).toMatchSnapshot();
	});
});
