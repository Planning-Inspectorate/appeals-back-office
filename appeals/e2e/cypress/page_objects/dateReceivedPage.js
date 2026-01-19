import { Page } from './basePage';

export class dateReceivedPage extends Page {
	selectors = {
		day: '#date-day',
		month: '#date-month',
		year: '#date-year'
	};
	static checkDateIsPrefilled() {
		cy.get('#date-day').invoke('val').should('not.be.empty');
		cy.get('#date-month').invoke('val').should('not.be.empty');
		cy.get('#date-year').invoke('val').should('not.be.empty');
	}
}
