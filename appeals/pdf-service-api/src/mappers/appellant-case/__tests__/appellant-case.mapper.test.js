import mockAppellantCaseData from '../../../mocks/mock-appellant-case-data.json';
import mapAppellantCaseData from '../appellant-case.mapper.js';

describe('mapAppellantCaseData', () => {
	describe('appellantCase', () => {
		it.each([
			['householder', mockAppellantCaseData.appellantCaseDataHouseholder],
			['s78', mockAppellantCaseData.appellantCaseDataS78],
			['s20', mockAppellantCaseData.appellantCaseDataS20],
			['cas advert', mockAppellantCaseData.appellantCaseDataCasAdvert],
			['advert', mockAppellantCaseData.appellantCaseDataAdvert],
			['ldc', mockAppellantCaseData.appellantCaseDataLdc]
		])('should map appellant case data for a %s appeal', (_, mockAppellantCaseData) => {
			const result = mapAppellantCaseData(mockAppellantCaseData);

			expect(result).toMatchSnapshot();
		});
	});
});
