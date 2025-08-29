import mockAppellantCaseData from '../../../mocks/mock-appellant-case-data.json';
import mapAppellantCaseData from '../appellant-case.mapper.js';

describe('mapAppellantCaseData', () => {
	it('should map appellant case data', () => {
		const result = mapAppellantCaseData(mockAppellantCaseData.appellantCaseData);

		expect(result).toMatchSnapshot();
	});
});
