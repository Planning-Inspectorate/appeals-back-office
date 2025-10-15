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
});
