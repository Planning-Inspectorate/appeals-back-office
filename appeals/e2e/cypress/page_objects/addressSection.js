// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage.js';

export class AddressSection extends CaseDetailsPage {
	// S E L E C T O R S

	selectors = {};

	// E L E M E N T S

	elements = {
		line1: () => cy.get('#address-line-1'),
		line2: () => cy.get('#address-line-2'),
		town: () => cy.get('#town'),
		county: () => cy.get('#county'),
		postcode: () => cy.get('#post-code')
	};

	// A C T I O N S

	enterAddress(address) {
		this.elements.line1().clear().type(address.line1);
		this.elements.line2().clear().type(address.line2);
		this.elements.town().clear().type(address.town);
		this.elements.county().clear().type(address.county);
		this.elements.postcode().clear().type(address.postcode);
	}

	verifyPrepopulatedValues(expectedValues) {
		// verify adddress fields
		this.elements
			.line1()
			.invoke('prop', 'value')
			.then((text) => {
				expect(text).to.equal(expectedValues.line1);
			});
		this.elements
			.line2()
			.invoke('prop', 'value')
			.then((text) => {
				expect(text).to.equal(expectedValues.line2);
			});
		this.elements
			.town()
			.invoke('prop', 'value')
			.then((text) => {
				expect(text).to.equal(expectedValues.town);
			});
		this.elements
			.county()
			.invoke('prop', 'value')
			.then((text) => {
				expect(text).to.equal(expectedValues.county);
			});
		this.elements
			.postcode()
			.invoke('prop', 'value')
			.then((text) => {
				expect(text).to.equal(expectedValues.postcode);
			});
	}
}
