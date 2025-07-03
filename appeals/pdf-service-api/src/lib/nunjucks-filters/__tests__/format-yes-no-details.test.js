// @ts-nocheck

import { formatYesNoDetails } from '../format-yes-no-details.js';

describe('format-yes-no-details', () => {
	it('should format a No value', () => {
		const result = formatYesNoDetails(false);
		expect(result).toEqual('No');
	});

	it('should format a Yes value with details', () => {
		const result = formatYesNoDetails('Yes details');
		expect(result).toEqual('Yes<br>Yes details');
	});

	it('should format a Yes value with details as a bulleted list', () => {
		const result = formatYesNoDetails(['Detail 1', 'Detail 2']);
		expect(result).toEqual(
			'Yes<br><ul class="govuk-list govuk-list--bullet"><li>Detail 1</li><li>Detail 2</li></ul>'
		);
	});
});
