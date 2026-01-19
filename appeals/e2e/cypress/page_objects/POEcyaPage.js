import { Page } from './basePage';

export class POEcyaPage extends Page {
	static elements = {
		addButton: (label) => cy.contains('button', `Add ${label} proof of evidence and witnesses`)
	};

	static clickAddButton(rule6Name) {
		this.elements.addButton(rule6Name).click();
	}
}
