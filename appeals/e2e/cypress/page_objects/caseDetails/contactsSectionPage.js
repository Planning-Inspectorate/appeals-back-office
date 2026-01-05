// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';

export class ContactsSectionPage extends CaseDetailsPage {
	selectAddContact(type) {
		cy.getByData('add-' + type).click();
	}

	manageRule6PartyContactDetails() {
		cy.getByData('manage-rule-6-party-contact-details').click();
	}

	removeRule6PartyContactDetails() {
		// Uses wildcard selector because the ending number varies
		cy.get('[data-cy^="remove-rule-6-party-"]').click();
	}

	changeRule6PartyContactDetails() {
		// Uses wildcard selector because the ending number varies
		cy.get('[data-cy^="change-rule-6-party-"]').click();
	}
}
