// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';

export class OverviewSectionPage extends CaseDetailsPage {

	overviewSectionElements = {
		...this.elements, // Inherit parent elements
		applicationReference: () => cy.get('.appeal-lpa-reference .govuk-summary-list__value'),
		appealProcedure: () => cy.get('.appeal-case-procedure .govuk-summary-list__value'),
		allocationLevel: () => cy.get('.appeal-allocation-details .govuk-summary-list__value'),
		linkedAppeals: () => cy.get('.appeal-linked-appeals .govuk-summary-list__value'),
		relatedAppeals: () => cy.get('.appeal-other-appeals .govuk-summary-list__value'),
		netGainResidential: () => cy.get('.appeal-net-residence-change .govuk-summary-list__value')
	};

	verifyCaseOverviewDetails = (expectedValues) => {
		// verify overview fields
		this.overviewSectionElements
			.appealType()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(expectedValues.appealType);
			});
		this.overviewSectionElements
			.applicationReference()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(expectedValues.applicationReference);
			});
		this.overviewSectionElements
			.appealProcedure()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(expectedValues.appealProcedure);
			});
		this.overviewSectionElements
			.allocationLevel()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(expectedValues.allocationLevel);
			});
		this.overviewSectionElements
			.linkedAppeals()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(expectedValues.linkedAppeals);
			});
		this.overviewSectionElements
			.relatedAppeals()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(expectedValues.relatedAppeals);
			});
		this.overviewSectionElements
			.netGainResidential()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(expectedValues.netGainResidential);
			});
	};
}
