// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage.js';

export class ContactDetailsPage extends CaseDetailsPage {
	// S E L E C T O R S

	contactSelectors = {
		organisationName: '#organisation-name.govuk-input',
		organisationEmail: '#email.govuk-input'
	};

	// E L E M E N T S

	contactElements = {
		getEmailAddress: () => cy.get('#email-address.govuk-input'),
		getLastName: () => cy.get('#last-name.govuk-input'),
		getOrganisationName: () => cy.get('#organisation-name.govuk-input'),
		getOrganisationEmail: () => cy.get('#email.govuk-input')
	};

	// A C T I O N S

	inputEmailAddress(text) {
		this.contactElements.getEmailAddress().click().clear().type(text);
	}

	inputLastName(text) {
		this.contactElements.getLastName().click().clear().type(text);
	}

	inputOrganisationName(text) {
		this.contactElements.getOrganisationName().click().clear().type(text);
	}

	inputOrganisationEmail(text) {
		this.contactElements.getOrganisationEmail().click().clear().type(text);
	}

	verifyValuePrepopulated(selector, expectedValue) {
		// verify value of specified field
		cy.get(selector)
			.invoke('prop', 'value')
			.then((text) => {
				expect(text).to.equal(expectedValue);
			});
	}
}
