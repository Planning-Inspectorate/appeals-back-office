// @ts-nocheck
import { appealDataFullPlanning as appealData } from '#testing/app/fixtures/referencedata.js';
import {
	allocationCheckPage,
	allocationLevelPage,
	allocationSpecialismsPage
} from '../allocation.mapper.js';

describe('common allocation mapper', () => {
	const appealDetails = {
		...appealData,
		appealId: 1,
		appealReference: 'APP/Q9999/W/22/1234567',
		allocationDetails: {
			level: 'A',
			band: 1,
			specialisms: ['Specialism 1', 'Specialism 2']
		}
	};

	describe('allocationCheckPage', () => {
		it('should map data correctly', () => {
			const result = allocationCheckPage(appealDetails, {}, '/back-link');

			expect(result).toEqual({
				title: 'Allocation level',
				backLinkUrl: '/back-link',
				preHeading: 'Appeal 1234567',
				heading: 'Allocation level',
				submitButtonText: 'Continue',
				prePageComponents: [
					{
						type: 'inset-text',
						parameters: {
							html: `
        <p>Current status:</p>
        <ul>
          <li>Level A</li>
          <li>Specialism 1</li><li>Specialism 2</li>
        </ul>
      `
						}
					}
				],
				pageComponents: [
					{
						type: 'radios',
						parameters: {
							name: 'allocationLevelAndSpecialisms',
							idPrefix: 'allocationLevelAndSpecialisms',
							items: [
								{ text: 'Yes', value: 'yes', checked: false },
								{ text: 'No', value: 'no', checked: false }
							],
							fieldset: {
								legend: {
									text: 'Do you need to update the allocation level and specialisms?',
									isPageHeading: false,
									classes: 'govuk-fieldset__legend--m'
								}
							}
						}
					}
				]
			});
		});

		it('should pre-populate radio from sessionData', () => {
			const result = allocationCheckPage(appealDetails, { allocationLevelAndSpecialisms: 'yes' });
			expect(result.pageComponents[0].parameters.items[0].checked).toBe(true);
		});

		it('should not include currentStatus if appeal has no allocationDetails', () => {
			const result = allocationCheckPage({ ...appealDetails, allocationDetails: null });
			expect(result.prePageComponents).toEqual([]);
		});
	});

	describe('allocationLevelPage', () => {
		const levels = ['A', 'B', 'C'];

		it('should map data correctly', () => {
			const result = allocationLevelPage(appealDetails, levels, {}, '/back-link');

			expect(result).toEqual({
				title: 'Allocation level',
				backLinkUrl: '/back-link',
				preHeading: 'Appeal 1234567',
				heading: 'Allocation level',
				submitButtonText: 'Continue',
				pageComponents: [
					{
						type: 'radios',
						parameters: {
							name: 'allocationLevel',
							items: [
								{ text: 'A', value: 'A' },
								{ text: 'B', value: 'B' },
								{ text: 'C', value: 'C' }
							],
							value: 'A'
						}
					}
				]
			});
		});

		it('should pre-populate from sessionData', () => {
			const result = allocationLevelPage(appealDetails, levels, { allocationLevel: 'B' });
			expect(result.pageComponents[0].parameters.value).toBe('B');
		});
	});

	describe('allocationSpecialismsPage', () => {
		const specialisms = [
			{ id: 1, name: 'Specialism 1' },
			{ id: 2, name: 'Specialism 2' },
			{ id: 3, name: 'General allocation' }
		];

		it('should map data correctly and sort "General allocation" to top', () => {
			const result = allocationSpecialismsPage(appealDetails, specialisms, {}, '/back-link');

			expect(result).toEqual({
				title: 'Allocation specialisms',
				backLinkUrl: '/back-link',
				preHeading: 'Appeal 1234567',
				heading: 'Allocation specialisms',
				submitButtonText: 'Continue',
				pageComponents: [
					{
						type: 'checkboxes',
						parameters: {
							name: 'allocationSpecialisms',
							id: 'allocationSpecialisms',
							items: [
								{ text: 'General allocation', value: 3, checked: false },
								{ text: 'Specialism 1', value: 1, checked: true },
								{ text: 'Specialism 2', value: 2, checked: true }
							]
						}
					}
				]
			});
		});

		it('should pre-populate from sessionData', () => {
			const result = allocationSpecialismsPage(appealDetails, specialisms, {
				allocationSpecialisms: ['3']
			});
			expect(result.pageComponents[0].parameters.items[0].checked).toBe(true);
			expect(result.pageComponents[0].parameters.items[1].checked).toBe(false);
		});
	});
});
