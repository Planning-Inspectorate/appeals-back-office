import mapAppellantCaseData from '../appellant-case.mapper.js';
import mockAppellantCaseData from '../../../mocks/mock-appellant-case-data.json';

describe('mapAppellantCaseData', () => {
	it('should map appellant case data', () => {
		const result = mapAppellantCaseData(mockAppellantCaseData.appellantCaseData);

		expect(result).toMatchSnapshot();
	});
});
