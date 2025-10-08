// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage.js';
import { FileUploader } from './shared.js';

const fileUploader = new FileUploader();

export class EvidenceReasonsSection extends CaseDetailsPage {
	// S E L E C T O R S

	selectors = {
		otherReasonBox: '.pins-add-another__item-input'
	};

	// E L E M E N T S

	elements = {
		otherReasonBox: () => cy.get(this.selectors.otherReasonBox)
	};

	// A C T I O N S

	verifyNumberOfSelectedReasons(count) {
		this.validateNumberOfSelectedCheckboxes(count);
	}

	selectAndReturnEvidenceReasonOption() {
		return cy.selectReasonOption();
	}

	selectOtherReason(reason) {
		cy.selectReasonOption('Other reason');
		this.elements.otherReasonBox().clear().type(reason);
	}
}
