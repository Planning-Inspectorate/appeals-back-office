// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';

export class OverviewSectionPage extends CaseDetailsPage {
	inquirySectionFields = {
		date: 'Date',
		time: 'Time',
		doKnowEstimatedDays:
			'Do you know the estimated number of days needed to carry out the inquiry?',
		expectedNumberOfDays: 'Estimated number of days needed to carry out inquiry',
		doKnowAddress: 'Do you know the address of where the inquiry will take place?',
		address: 'Address'
	};

	inquirySectionLinks = {
		date: 'date',
		time: 'time',
		whetherEstimatedDaysKnown: 'whether-the-estimated-number-of-days-is-known-or-not',
		estimatedDays: 'estimated-days',
		address: 'whether-the-address-is-known-or-not'
	};

	overviewSectionElements = {
		...this.elements, // Inherit parent elements
		applicationReference: () => cy.get('.aappeal-lpa-reference .govuk-summary-list__value'),
		appealProcedure: () => cy.get('.appeal-case-procedure .govuk-summary-list__value'),
		allocationLevel: () => cy.get('.appeals-allocation-details .govuk-summary-list__value'),
		linkedAppeals: () => cy.get('.appeal-linked-appeals .govuk-summary-list__value'),
		relatedAppeals: () => cy.get('.appeal-other-appeals .govuk-summary-list__value'),
		netGainResidential: () => cy.get('.appeal-net-residence-change .govuk-summary-list__value')
	};

	verifyCaseOverviewDetails = (expectedDetails) => {
		// verify adddress fields
		this.overviewSectionElements
			.appealType()
			.invoke('prop', 'text')
			.then((text) => {
				expect(text).to.equal(expectedValues.appealType);
			});
		this.overviewSectionElements
			.applicationReference()
			.invoke('prop', 'text')
			.then((text) => {
				expect(text).to.equal(expectedValues.applicationReference);
			});
		this.overviewSectionElements
			.appealProcedure()
			.invoke('prop', 'text')
			.then((text) => {
				expect(text).to.equal(expectedValues.appealProcedure);
			});
		this.overviewSectionElements
			.allocationLevel()
			.invoke('prop', 'text')
			.then((text) => {
				expect(text).to.equal(expectedValues.allocationLevel);
			});
		this.overviewSectionElements
			.linkedAppeals()
			.invoke('prop', 'text')
			.then((text) => {
				expect(text).to.equal(expectedValues.linkedAppeals);
			});
		this.overviewSectionElements
			.relatedAppeals()
			.invoke('prop', 'text')
			.then((text) => {
				expect(text).to.equal(expectedValues.relatedAppeals);
			});
		this.overviewSectionElements
			.netGainResidential()
			.invoke('prop', 'text')
			.then((text) => {
				expect(text).to.equal(expectedValues.netGainResidential);
			});
	};
}
