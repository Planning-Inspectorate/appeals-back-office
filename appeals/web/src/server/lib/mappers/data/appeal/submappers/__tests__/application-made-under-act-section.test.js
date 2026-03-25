import { mapApplicationMadeUnderActSection } from '../application-made-under-act-section';

describe('mapApplicationMadeUnderActSection', () => {
	it.each([
		['existing-development', 'Existing development'],
		['proposed-changes-to-a-listed-building', 'Proposed changes to a listed building'],
		['proposed-use-of-a-development', 'Proposed use of a development']
	])(
		'should return a summary list item with the correct values when applicationMadeUnderActSection is valid',
		(value, expectedText) => {
			const appellantCase = {
				applicationMadeUnderActSection: value
			};
			// @ts-ignore-next-line
			const result = mapApplicationMadeUnderActSection({ appellantCase });
			expect(result).toEqual({
				id: 'application-made-under-act-section',
				display: {
					summaryListItem: {
						key: { text: 'What type of lawful development certificate is the appeal about?' },
						value: { text: expectedText },
						actions: { items: [] }
					}
				}
			});
		}
	);
	it.each([null, undefined])(
		'should return "Not answered" when applicationMadeUnderActSection is null or undefined',
		(value) => {
			const appellantCase = {
				applicationMadeUnderActSection: value
			};
			// @ts-ignore-next-line
			const result = mapApplicationMadeUnderActSection({ appellantCase });
			expect(result?.display?.summaryListItem?.value?.text).toBe('Not answered');
		}
	);
	it('should return the raw value when applicationMadeUnderActSection is not a valid enum value', () => {
		const appellantCase = {
			applicationMadeUnderActSection: 'invalid-value'
		};
		// @ts-ignore-next-line
		const result = mapApplicationMadeUnderActSection({ appellantCase });
		expect(result?.display?.summaryListItem?.value?.text).toBe('invalid-value');
	});
});
