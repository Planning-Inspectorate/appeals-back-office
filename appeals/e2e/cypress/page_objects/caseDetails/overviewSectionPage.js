// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';

export class OverviewSectionPage extends CaseDetailsPage {
	overviewSectionSelectors = {
		...this.selectors, // inherit parent selectors
		applicationReference: '.appeal-lpa-reference .govuk-summary-list__value',
		appealProcedure: '.appeal-case-procedure .govuk-summary-list__value',
		allocationLevel: '.appeal-allocation-details .govuk-summary-list__value',
		linkedAppeals: '.appeal-linked-appeals .govuk-summary-list__value',
		relatedAppeals: '.appeal-other-appeals .govuk-summary-list__value',
		netGainResidential: '.appeal-net-residence-change .govuk-summary-list__value',
		changeProcedureType: 'case-procedure'
	};

	overviewSectionElements = {
		...this.elements, // Inherit parent elements
		applicationReference: () => cy.get(this.overviewSectionSelectors.applicationReference),
		appealProcedure: () => cy.get(this.overviewSectionSelectors.appealProcedure),
		allocationLevel: () => cy.get(this.overviewSectionSelectors.allocationLevel),
		linkedAppeals: () => cy.get(this.overviewSectionSelectors.linkedAppeals),
		relatedAppeals: () => cy.get(this.overviewSectionSelectors.relatedAppeals),
		netGainResidential: () => cy.get(this.overviewSectionSelectors.netGainResidential)
	};

	verifyCaseOverviewDetails = (expectedValues, checkNetResidence = true) => {
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

		// net residence is only displayed if case is passed lpaq status
		// for some scenarios (e.g. change procedure) this will not be the case
		if (checkNetResidence) {
			this.overviewSectionElements
				.netGainResidential()
				.invoke('prop', 'innerText')
				.then((text) => {
					expect(text).to.equal(expectedValues.netGainResidential);
				});
		}
	};
}
