// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage.js';

export class AddressSection extends CaseDetailsPage {
	// S E L E C T O R S

	selectors = {};

	// E L E M E N T S

	addressElements = {
		...this.elements,
		line1: () => cy.get('#address-line-1'),
		line2: () => cy.get('#address-line-2'),
		town: () => cy.get('#town'),
		county: () => cy.get('#county'),
		postcode: () => cy.get('#post-code'),
		radioButton: () => cy.get('.govuk-radios__item')
	};

	// A C T I O N S

	enterAddress(address) {
		this.addressElements.line1().clear().type(address.line1);
		this.addressElements.line2().clear().type(address.line2);
		this.addressElements.town().clear().type(address.town);
		this.addressElements.county().clear().type(address.county);
		this.addressElements.postcode().clear().type(address.postcode);
	}

	selectAddressOption(option) {
		this.addressElements.radioButton().contains(option, { matchCase: false }).click();
	}

	verifyPrepopulatedValues(expectedValues) {
		// verify adddress fields
		this.addressElements
			.line1()
			.invoke('prop', 'value')
			.then((text) => {
				expect(text).to.equal(expectedValues.line1);
			});
		this.addressElements
			.line2()
			.invoke('prop', 'value')
			.then((text) => {
				expect(text).to.equal(expectedValues.line2);
			});
		this.addressElements
			.town()
			.invoke('prop', 'value')
			.then((text) => {
				expect(text).to.equal(expectedValues.town);
			});
		this.addressElements
			.county()
			.invoke('prop', 'value')
			.then((text) => {
				expect(text).to.equal(expectedValues.county);
			});
		this.addressElements
			.postcode()
			.invoke('prop', 'value')
			.then((text) => {
				expect(text).to.equal(expectedValues.postcode);
			});
	}
}
