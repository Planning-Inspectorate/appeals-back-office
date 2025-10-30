// @ts-nocheck
import { formatAsWholeNumber } from '../support/utils/format.js';
import { CaseDetailsPage } from './caseDetailsPage.js';

export class EstimatedDaysSection extends CaseDetailsPage {
	// S E L E C T O R S

	selectors = {
		inquiryEstimatedDaysInput: '#inquiry-estimation-days',
		estimatedDaysInput: '#estimation-days',
		radio: '.govuk-radios__item'
	};

	// E L E M E N T S

	elements = {
		inquiryEstimatedDaysInput: () => cy.get(this.selectors.inquiryEstimatedDaysInput),
		estimatedDaysInput: () => cy.get(this.selectors.estimatedDaysInput),
		radioButton: () => cy.get(this.selectors.radio)
	};

	// A C T I O N S

	clearEstimatedDays() {
		// clear estimated day
		this.elements.inquiryEstimatedDaysInput().clear();
	}

	enterEstimatedInquiryDays(estimatedInquiryDays) {
		this.elements.inquiryEstimatedDaysInput().clear().type(estimatedInquiryDays.toString());
	}

	// used when updating procedure type
	enterEstimatedDays(estimatedDays) {
		this.elements.estimatedDaysInput().clear().type(estimatedDays.toString());
	}

	selectEstimatedDaysOption(option) {
		this.elements.radioButton().contains(option, { matchCase: false }).click();
	}

	verifyPrepopulatedValue(expectedValue, updatingProcedure = false) {
		// days selector is different depending on if setting up or updating procedure type
		const daysInputSelector = updatingProcedure
			? this.selectors.estimatedDaysInput
			: this.selectors.inquiryEstimatedDaysInput;

		// verify estimated days
		cy.get(daysInputSelector)
			.invoke('prop', 'value')
			.then((text) => {
				expect(formatAsWholeNumber(text)).to.equal(expectedValue);
			});
	}
}
