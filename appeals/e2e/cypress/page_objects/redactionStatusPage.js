import { Page } from './basePage';

export class RedactionStatusPage extends Page {
	selectors = {
		redacted: '#redactionStatus-2',
		unredacted: '#redactionStatus',
		noRedactionRequired: '#redactionStatus-3'
	};

	static selectOption(optionToSelect) {
		const page = new RedactionStatusPage();
		switch (optionToSelect) {
			case 'Redacted':
				cy.get(page.selectors.redacted).click();
				break;
			case 'Unredacted':
				cy.get(page.selectors.unredacted).click();
				break;
			case 'No redaction required':
				cy.get(page.selectors.noRedactionRequired).click();
				break;
		}
	}
}
