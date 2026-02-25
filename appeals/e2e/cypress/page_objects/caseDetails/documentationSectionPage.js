// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';

export class DocumentationSectionPage extends CaseDetailsPage {
	selectAddDocument(type) {
		cy.getByData('add-' + type).click();
	}

	navigateToAddProofOfEvidenceReview(type) {
		cy.getByData('review-' + type).click();
	}

	verifyDocumentationSectionHeadingIsDisplayed() {
		this.elements.caseDetailsSections().should('contain.text', 'Documentation');
	}

	verifyExpectedFieldDocumentSection(expectedText) {
		cy.get('#case-documentation-table').find('th, td').contains(expectedText).should('be.visible');
	}

	verifyDocumentationSectionRule6PartiesIsDisplayed(rule6PartyName) {
		this.verifyExpectedFieldDocumentSection(`${rule6PartyName} statement`);
		this.verifyExpectedFieldDocumentSection(`${rule6PartyName} proof of evidence and witness`);
	}

	addDocumentFromRow(documentName) {
		cy.get('#case-documentation-table')
			.find('tr')
			.filter((_, tr) => tr.innerText.includes(documentName))
			.first()
			.within(() => {
				cy.contains('a', 'Add').click();
			});
	}
}
