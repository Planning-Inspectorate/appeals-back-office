import { yesNoInput } from '#lib/mappers/index.js';

describe('radio', () => {
	describe('yesNoInput', () => {
		it('supports simple yes/no case', () => {
			const component = yesNoInput({ name: 'testNameHere' });
			expect(component.type).toBe('radios');
			expect(component.parameters.items.length).toBe(2);
			expect(component.parameters.items[0].checked).toBe(false);
			expect(component.parameters.items[1].checked).toBe(false);
		});

		it('supports passing in a value', () => {
			const component = yesNoInput({ name: 'test', value: true });
			expect(component.parameters.items[0].checked).toBe(true);
			expect(component.parameters.items[1].checked).toBe(false);
		});

		it('supports legend', () => {
			const component = yesNoInput({ name: 'test', legendText: 'My Legend Here' });
			expect(component.parameters.fieldset).toBeDefined();
			expect(component.parameters.fieldset.legend.text).toBe('My Legend Here');
		});

		it('supports conditional', () => {
			const component = yesNoInput({
				name: 'test',
				yesConditional: {
					id: 'conditional-field',
					name: 'conditional-field',
					hint: 'Some Hint Here'
				}
			});

			expect(component.parameters.items[0].conditional).toBeDefined();
			expect(component.parameters.items[0].conditional.html).toBeDefined();
			expect(
				component.parameters.items[0].conditional.html.includes('Some Hint Here')
			).toBeTruthy();
		});
	});
});
