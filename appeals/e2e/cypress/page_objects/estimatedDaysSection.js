// @ts-nocheck
import { formatAsWholeNumber } from '../support/utils/format.js';
import { CaseDetailsPage } from './caseDetailsPage.js';

export class EstimatedDaysSection extends CaseDetailsPage {
	// S E L E C T O R S

	selectors = {
		inquiryEstimatedDaysInput: '#inquiry-estimation-days',
		hearingEstimatedDaysInput: '#hearing-estimation-days',
		estimatedDaysInput: '#estimation-days',
		radio: '.govuk-radios__item'
	};

	// E L E M E N T S

	elements = {
		inquiryEstimatedDaysInput: () => cy.get(this.selectors.inquiryEstimatedDaysInput),
		hearingEstimatedDaysInput: () => cy.get(this.selectors.hearingEstimatedDaysInput),
		estimatedDaysInput: () => cy.get(this.selectors.estimatedDaysInput),
		radioButton: () => cy.get(this.selectors.radio)
	};

	// A C T I O N S

	clearEstimatedDays(context = 'inquiry') {
		this.#getInputElement(context).clear();
	}

	enterEstimatedInquiryDays(estimatedInquiryDays) {
		this.elements.inquiryEstimatedDaysInput().clear().type(estimatedInquiryDays.toString());
	}

	enterEstimatedHearingDays(estimatedHearingDays) {
		this.elements.hearingEstimatedDaysInput().clear().type(estimatedHearingDays.toString());
	}

	// used when updating procedure type
	enterEstimatedDays(estimatedDays) {
		this.elements.estimatedDaysInput().clear().type(estimatedDays.toString());
	}

	selectEstimatedDaysOption(option) {
		this.elements.radioButton().contains(option, { matchCase: false }).click();
	}

	verifyPrepopulatedValue(expectedValue, context = 'inquiry') {
		// preserve existing boolean call-sites where true means procedure change flow
		const selector =
			typeof context === 'boolean'
				? context
					? this.selectors.estimatedDaysInput
					: this.selectors.inquiryEstimatedDaysInput
				: this.#getInputSelector(context);

		cy.get(selector)
			.invoke('prop', 'value')
			.then((text) => {
				expect(formatAsWholeNumber(text)).to.equal(expectedValue);
			});
	}

	#getInputSelector(context) {
		if (context === 'hearing') return this.selectors.hearingEstimatedDaysInput;
		if (context === 'procedure') return this.selectors.estimatedDaysInput;
		return this.selectors.inquiryEstimatedDaysInput;
	}

	#getInputElement(context) {
		if (context === 'hearing') return this.elements.hearingEstimatedDaysInput();
		if (context === 'procedure') return this.elements.estimatedDaysInput();
		return this.elements.inquiryEstimatedDaysInput();
	}
}
