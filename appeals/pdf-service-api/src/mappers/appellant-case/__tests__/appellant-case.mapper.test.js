import mockAppellantCaseData from '../../../mocks/mock-appellant-case-data.json';
import mapAppellantCaseData from '../appellant-case.mapper.js';

describe('mapAppellantCaseData', () => {
	describe('appellantCase', () => {
		it.each([
			['householder', mockAppellantCaseData.appellantCaseDataHouseholder],
			[
				'householder submitted after cutoff',
				{
					...mockAppellantCaseData.appellantCaseDataHouseholder,
					applicationDate: '2026-04-01T00:00:00.000Z',
					reasonForAppealAppellant: 'My reason for appeal',
					anySignificantChanges: true,
					anySignificantChanges_otherSignificantChanges: 'Other changes'
				}
			],
			['s78', mockAppellantCaseData.appellantCaseDataS78],
			['s78 expedited', mockAppellantCaseData.appellantCaseDataS78Expedited],
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
