// @ts-nocheck
import { mapApplicationReference } from '#lib/mappers/data/appellant-case/submappers/application-reference.js';

describe('application-reference-mapper', () => {
	let params;
	let expectedResult;

	beforeEach(() => {
		params = {
			appellantCaseData: {
				planningApplicationReference: 'APP/12345/REF',
				isEnforcementChild: false
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
								attributes: { 'data-cy': 'change-application-reference' },
								href: '/original-url/lpa-reference/change',
								text: 'Change',
								visuallyHiddenText: 'What is the application reference number?'
							}
						]
					},
					key: { text: 'What is the application reference number?' },
					value: { text: 'APP/12345/REF' }
				}
			},
			id: 'application-reference'
		};
	});

	it('should map the application reference with change link when user has permissions', () => {
		expect(mapApplicationReference(params)).toEqual(expectedResult);
	});

	it('should not show change link when user does not have update case permission', () => {
		params.userHasUpdateCase = false;
		expectedResult.display.summaryListItem.actions.items = [];
		expect(mapApplicationReference(params)).toEqual(expectedResult);
	});

	it('should not show change link for enforcement child appeals', () => {
		params.appellantCaseData.isEnforcementChild = true;
		expectedResult.display.summaryListItem.actions.items = [];
		expect(mapApplicationReference(params)).toEqual(expectedResult);
	});

	it('should not show change link for enforcement child appeals even with update permission', () => {
		params.userHasUpdateCase = true;
		params.appellantCaseData.isEnforcementChild = true;
		expectedResult.display.summaryListItem.actions.items = [];
		expect(mapApplicationReference(params)).toEqual(expectedResult);
	});

	it('should display null value when no planning application reference provided', () => {
		params.appellantCaseData.planningApplicationReference = null;
		expectedResult.display.summaryListItem.value.text = null;
		expect(mapApplicationReference(params)).toEqual(expectedResult);
	});
});
