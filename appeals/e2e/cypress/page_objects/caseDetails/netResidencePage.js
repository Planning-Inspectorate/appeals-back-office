// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';

export class NetResidencePage extends CaseDetailsPage {
	_cyDataSelectors = {
		addNetResidence: 'add-residences-net-change'
	};
	netResidenceElements = {
		...this.elements, // Inherit parent elements
		netResidenceKey: () => cy.get('.appeal-net-residence-change > .govuk-summary-list__value'),
		netResidenceValue: () =>
			cy.get('.appeal-net-residence-gain-or-loss > .govuk-summary-list__value'),
		addNetResidence: () => cy.getByData(this._cyDataSelectors.addNetResidence)
	};

	clickAddNetResidence() {
		this.netResidenceElements.addNetResidence().click();
	}

	verifyNetResidenceValue(expectedText) {
		this.netResidenceElements.netResidenceKey().should('contain', expectedText);
	}

	verifyNetResidenceNumber(expectedNumber) {
		this.netResidenceElements.netResidenceValue().should('contain', expectedNumber);
	}
}
