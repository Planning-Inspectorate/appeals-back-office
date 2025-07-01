// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';
import { DateTimeSection } from '../dateTimeSection.js';
import { happyPathHelper } from '../../support/happyPathHelper';

const dateTimeSection = new DateTimeSection();
export class HearingSectionPage extends CaseDetailsPage {
	hearingSectionElements = {
		...this.elements, // Inherit parent elements
		estimatedPreparationTime: () => cy.get('#preparation-time'),
		estimatedSittingTime: () => cy.get('#sitting-time'),
		estimatedReportingTime: () => cy.get('#reporting-time'),

		address: {
			line1: () => cy.get('#address-line-1'),
			line2: () => cy.get('#address-line-2'),
			town: () => cy.get('#town'),
			county: () => cy.get('#county'),
			postcode: () => cy.get('#post-code')
		},

		hearingValues: () => cy.get('.govuk-summary-list__key'),
		changeHearing: () => cy.get('.govuk-summary-list__actions > .govuk-link').last(),
		hearingSectionHeader: () => cy.get('h1'),
		keepHearing: () => cy.get('#keepHearing'),
		cancelHearing: () => cy.get('#cancelHearing')
	};

	clickChangeHearing() {
		this.hearingSectionElements.changeHearing().click();
	}

	clickCancelHearing() {
		this.hearingSectionElements.cancelHearing().click();
	}

	clickKeepHearing() {
		this.hearingSectionElements.keepHearing().click();
	}

	setUpHearing(date, hour, minute) {
		dateTimeSection.enterHearingDate(date);
		dateTimeSection.enterHearingTime(hour, minute);
		this.clickButtonByText('Continue');
	}

	addHearingEstimates(preparationTime, sittingTime, reportingTime) {
		this.hearingSectionElements.estimatedPreparationTime().clear().type(preparationTime);
		this.hearingSectionElements.estimatedSittingTime().clear().type(sittingTime);
		this.hearingSectionElements.estimatedReportingTime().clear().type(reportingTime);
		this.clickButtonByText('Continue');
	}

	verifyHearingEstimatedValue(estimateField, value) {
		const daysCount = parseFloat(value);
		const daySuffix = daysCount === 1 ? 'day' : 'days';
		const expectedText = `${daysCount} ${daySuffix}`;

		this.hearingSectionElements
			.rowChangeLink(estimateField)
			.parent('dd')
			.siblings('dd')
			.should('be.visible')
			.and('contain.text', expectedText);
	}

	addHearingLocationAddress(address) {
		this.hearingSectionElements.address.line1().clear().type(address.line1);
		this.hearingSectionElements.address.line2().clear().type(address.line2);
		this.hearingSectionElements.address.town().clear().type(address.town);
		this.hearingSectionElements.address.county().clear().type(address.county);
		this.hearingSectionElements.address.postcode().clear().type(address.postcode);
		this.clickButtonByText('Continue');
	}

	verifyHearingValues(hearingField, expectedText, isAddressKnown = false, address = []) {
		const fieldElement = this.hearingSectionElements
			.rowChangeLink(hearingField)
			.parent('dd')
			.siblings('dd')
			.should('be.visible');

		if (isAddressKnown) {
			fieldElement.then(($el) => {
				address.forEach((addressLine) => {
					cy.wrap($el).should('contain.text', addressLine);
				});
			});
		} else {
			fieldElement.should('contain.text', expectedText);
		}
	}

	verifyHearingHeader(sectionHeader) {
		this.hearingSectionElements.hearingSectionHeader().should('contain.text', sectionHeader);
	}

	verifyYouCannotCheckTheseAnswersPage() {
		this.basePageElements.xlHeader().contains('You cannot check these answers');
		this.basePageElements.link().contains('appeal details');
	}

	verifyHearingReadyToSetupTagPersonalList(caseRef) {
		this.basePageElements.tableCell().contains(caseRef);
		this.basePageElements.tableCell().last().contains('Hearing ready to set up');
	}
	verifyAwaitingHearingTagPersonalList(caseRef) {
		this.basePageElements.tableCell().contains(caseRef);
		this.basePageElements.tableCell().last().contains('Awaiting hearing');
	}
}
