// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage.js';
import { FileUploader } from './shared.js';

const fileUploader = new FileUploader();

export class EvidenceReasonsSection extends CaseDetailsPage {
	// S E L E C T O R S

	selectors = {
		checkbox: '.govuk-checkboxes__input'
	};

	// E L E M E N T S

	elements = {
		checkbox: () => cy.get(this.selectors.checkbox).find('input')
	};

	// A C T I O N S

	verifyNumberOfSelectedReasons(count) {
		this.validateNumberOfSelectedCheckboxes(count);
	}

	selectEvidenceReasonOptions(options) {
		options.forEach((option) => {
			this.chooseCheckboxByText(option);
		});
	}
}
