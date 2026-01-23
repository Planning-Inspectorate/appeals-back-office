import { CaseDetailsPage } from './caseDetailsPage.js';

export class RedactionStatusPage extends CaseDetailsPage {
	redactionPageSelectors = {
		redacted: '#redactionStatus-2',
		unredacted: '#redactionStatus',
		noRedactionRequired: '#redactionStatus-3'
	};

	selectRedactionOption(optionToSelect) {
		cy.get(this.redactionPageSelectors[optionToSelect]).click();
	}
}
