// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage.js';
import { FileUploader } from './shared.js';

const fileUploader = new FileUploader();

export class ReviewEvidenceSection extends CaseDetailsPage {
	// S E L E C T O R S

	selectors = {
		radio: '.govuk-radios__item'
	};

	// E L E M E N T S

	elements = {
		radioButton: () => cy.get(this.selectors.radio)
	};

	// A C T I O N S

	selectEvidenceReviewOption(option) {
		this.elements.radioButton().contains(option, { matchCase: false }).click();
	}
}
