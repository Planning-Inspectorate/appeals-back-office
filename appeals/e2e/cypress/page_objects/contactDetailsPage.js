// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage.js';

export class ContactDetailsPage extends CaseDetailsPage {
	// S E L E C T O R S

	selectors = {};

	// E L E M E N T S

	contactElements = {
		getEmailAddress: () => cy.get('#email-address.govuk-input'),
		getLastName: () => cy.get('#last-name.govuk-input')
	};

	// A C T I O N S

	inputEmailAddress(text) {
		this.contactElements.getEmailAddress().click().clear().type(text);
	}

	inputLastName(text) {
		this.contactElements.getLastName().click().clear().type(text);
	}
}
