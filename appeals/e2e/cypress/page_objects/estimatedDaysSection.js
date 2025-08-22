// @ts-nocheck
import { Page } from './basePage';
import { formatDateAndTime } from '../support/utils/dateAndTime';
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
}
