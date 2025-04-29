import { formatCaseOfficerDetailsForCaseSummary } from '../format-case-officer-details-for-case-summary.js';

describe('format-case-officer-details-for-case-summary', () => {
	it('returns unmodified input if case officer not assigned', () => {
		const input = {
			key: { text: 'Case officer' },
			value: { html: '<p class="govuk-body">Not assigned</p>' },
			actions: { items: [['']] },
			classes: 'appeal-case-officer'
		};

		const result = formatCaseOfficerDetailsForCaseSummary(input);

		expect(result.key.text).toEqual(input.key.text);
		expect(result.value.html).toEqual(input.value.html);
		expect(result.actions.items).toEqual(input.actions.items);
		expect(result.classes).toEqual(input.classes);
		expect(result.key.text).toEqual(input.key.text);
	});
	it('returns modified input if case officer assigned', () => {
		const input = {
			key: { text: 'Case officer' },
			value: {
				html: '<ul class="govuk-list"><li>A Name</li><li>test@example.com</li></ul>'
			},
			actions: { items: [[Object]] },
			classes: 'appeal-case-officer'
		};

		const result = formatCaseOfficerDetailsForCaseSummary(input);

		expect(result.key.text).toEqual(input.key.text);
		expect(result.value.html).toEqual('A Name');
		expect(result.actions.items).toEqual(input.actions.items);
		expect(result.classes).toEqual(input.classes);
		expect(result.key.text).toEqual(input.key.text);
	});
});
