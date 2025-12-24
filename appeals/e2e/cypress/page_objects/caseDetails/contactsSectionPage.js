// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';

export class ContactsSectionPage extends CaseDetailsPage {
	selectAddContact(type) {
		cy.getByData('add-' + type).click();
	}

	manageContactDetails() {
		cy.getByData('manage-rule-6-party-contact-details').click();
	}
}
