// @ts-nocheck
import { formatAsWholeNumber } from '../support/utils/format.js';
import { CaseDetailsPage } from './caseDetailsPage.js';

export class EstimatedDaysSection extends CaseDetailsPage {
	// S E L E C T O R S

	selectors = {
		inquiryEstimatedDaysInput: '#inquiry-estimation-days',
		radio: '.govuk-radios__item'
	};

	// E L E M E N T S

	elements = {
		inquiryEstimatedDaysInput: () => cy.get(this.selectors.inquiryEstimatedDaysInput),
		radioButton: () => cy.get(this.selectors.radio)
	};

	// A C T I O N S

	enterEstimatedInquiryDays(estimatedInquiryDays) {
		this.elements.inquiryEstimatedDaysInput().clear().type(estimatedInquiryDays.toString());
	}

	selectEstimatedDaysOption(option) {
		this.elements.radioButton().contains(option, { matchCase: false }).click();
	}

	verifyPrepopulatedValue(expectedValue) {
		// verify estimated days
		this.elements
			.inquiryEstimatedDaysInput()
			.invoke('prop', 'value')
			.then((text) => {
				expect(formatAsWholeNumber(text)).to.equal(expectedValue);
			});
	}
}
