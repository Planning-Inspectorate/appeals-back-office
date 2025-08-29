import mockLpaStatementData from '../../../mocks/mock-lpa-statement-data.json';
import { mapLpaStatement } from '../lpa-statement.mapper.js';

describe('mapLpaStatementData', () => {
	it('should map LPA statement data correctly', () => {
		const result = mapLpaStatement(mockLpaStatementData.lpaStatementData);
		expect(result).toMatchSnapshot();
	});
});
