// @ts-nocheck
import { mapContactAddress } from '#lib/mappers/data/appellant-case/submappers/contact-address.js';

describe('contact-address-mapper', () => {
	let params;
	let expectedResult;

	beforeEach(() => {
		params = {
			appellantCaseData: {
				enforcementNotice: {}
			},
			userHasUpdateCase: true,
			currentRoute: '/original-url'
		};

		expectedResult = {
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: { 'data-cy': 'add-contact-address' },
								href: '/original-url/contact-address/add',
								text: 'Add',
								visuallyHiddenText: 'What is your contact address?'
							}
						]
					},
					classes: 'appeal-contact-address',
					key: { text: 'What is your contact address?' },
					value: { text: 'Not answered' }
				}
			},
			id: 'contact-address'
		};
	});

	it('should map not answered when contact address not provided', () => {
		params.appellantCaseData.enforcementNotice.contactAddress = {};
		expectedResult.display.summaryListItem.value.text = 'Not answered';
		expect(mapContactAddress(params)).toEqual(expectedResult);
	});

	it('should map a formatted contact address when provided', () => {
		params.appellantCaseData.enforcementNotice.contactAddress = {
			addressId: 5,
			addressLine1: 'Flat 2',
			addressLine2: '123 Fake Street',
			addressTown: 'London',
			addressCounty: null,
			postCode: 'N1 1AA'
		};
		expectedResult.display.summaryListItem.value.text = 'Flat 2, 123 Fake Street, London, N1 1AA';
		expectedResult.display.summaryListItem.actions.items[0] = {
			attributes: {
				'data-cy': 'change-contact-address'
			},
			href: '/original-url/contact-address/change/5',
			text: 'Change',
			visuallyHiddenText: 'What is your contact address?'
		};
		expect(mapContactAddress(params)).toEqual(expectedResult);
	});
});
