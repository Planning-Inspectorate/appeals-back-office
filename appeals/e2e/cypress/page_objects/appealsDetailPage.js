// @ts-nocheck

import { Page } from './basePage';

export class AppealsDetailPage extends Page {
	// ELEMENTS

	// ACTIONS
	clickChangeVisitTypeHasCaseTimetable() {
		this.clickAccordionByText('Timetable');
		cy.get('.appeal-site-visit > .govuk-summary-list__actions > .govuk-link').click();
	}

	// ASSERTIONS
}
