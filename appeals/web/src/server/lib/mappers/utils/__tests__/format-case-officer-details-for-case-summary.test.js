import { formatCaseOfficerDetailsForCaseSummary } from '../format-case-officer-details-for-case-summary.js';

describe('format-case-officer-details-for-case-summary', () => {
	it('returns unmodified html and modified data-cy attribute if case officer not assigned', () => {
		const input = {
			key: { text: 'Case officer' },
			value: { html: '<p class="govuk-body">Not assigned</p>' },
			actions: { items: [{ attributes: { 'data-cy': 'assign-case-officer' } }] },
			classes: 'appeal-case-officer'
		};

		const result = formatCaseOfficerDetailsForCaseSummary(input);

		expect(result.key.text).toEqual(input.key.text);
		expect(result.value.html).toEqual(input.value.html);
		expect(result.classes).toEqual(input.classes);
		expect(result.key.text).toEqual(input.key.text);
		expect(result.actions.items[0].attributes['data-cy']).toEqual('assign-case-officer-name');
	});
	it('returns modified html and modified data-cy attribute if case officer assigned', () => {
		const input = {
			key: { text: 'Case officer' },
			value: {
				html: '<ul class="govuk-list"><li>A Name</li><li>test@example.com</li></ul>'
			},
			classes: 'appeal-case-officer',
			actions: { items: [{ attributes: { 'data-cy': 'change-case-officer' } }] }
		};

		const result = formatCaseOfficerDetailsForCaseSummary(input);

		expect(result.key.text).toEqual(input.key.text);
		expect(result.value.html).toEqual('A Name');
		expect(result.classes).toEqual(input.classes);
		expect(result.key.text).toEqual(input.key.text);
		expect(result.actions.items[0].attributes['data-cy']).toEqual('change-case-officer-name');
	});
});
